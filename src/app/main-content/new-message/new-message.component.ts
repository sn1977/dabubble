import {
    Component,
    ElementRef,
    inject,
    OnDestroy,
    OnInit,
    ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { NavigationService } from "../../shared/services/navigation.service";
import { BottomSheetComponent } from "../../shared/components/bottom-sheet/bottom-sheet.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { FirestoreService } from "../../shared/services/firestore.service";
import { ActivatedRoute, Router } from "@angular/router";
import { User } from "../../../models/user.class";
import { AuthService } from "../../shared/services/auth.service";
import { HeaderMobileComponent } from "../../shared/components/header-mobile/header-mobile.component";
import { HeaderStateService } from "../../shared/services/header-state.service";
import { TextBoxComponent } from "../../shared/components/text-box/text-box.component";
import { ConversationComponent } from "../../shared/components/conversation/conversation.component";
import { Channel } from "../../../models/channel.class";
import { FormsModule } from "@angular/forms";
import { ProgressSpinnerComponent } from "../../shared/components/progress-spinner/progress-spinner.component";
import { MatchMediaService } from "../../shared/services/match-media.service";

@Component({
    selector: "app-new-message",
    standalone: true,
    imports: [
        HeaderMobileComponent,
        TextBoxComponent,
        ConversationComponent,
        FormsModule,
        ProgressSpinnerComponent,
    ],
    templateUrl: "./new-message.component.html",
    styleUrl: "./new-message.component.scss",
})
export class NewMessageComponent implements OnInit, OnDestroy {
    @ViewChild("messageContent") messageContent!: ElementRef;
    firestore = inject(FirestoreService);
    router = inject(Router);
    itemID: any = "";
    user: User = new User();
    channel: Channel = new Channel();
    authService = inject(AuthService);
    newMessage: boolean = false;
    showInputField: boolean = false;
    showAddMember: boolean = false;
    showChannels = false;
    showUsers = false;
    selectedUserOrChannel: string = "";
    isDesktop: boolean = false;
    selectedId: string | undefined = "";
    matchMedia = inject(MatchMediaService);
    private intervalId: any;
    inputResult: string = "";

    textBoxData: any = {
        placeholder: "Starte eine neue Nachricht ",
        channelName: "",
        messageText: "",
        channelId: "",
        collection: "",
        subcollection: "channelmessages",
    };

    constructor(
        public dialog: MatDialog,
        private navigationService: NavigationService,
        private _bottomSheet: MatBottomSheet,
        private route: ActivatedRoute,
        private headerStateService: HeaderStateService
    ) {}

    /**
     * Lifecycle hook that is called when the component is destroyed.
     * Use this hook to perform any necessary cleanup tasks before the component is removed from the DOM.
     */
    ngOnDestroy(): void {
        this.matchMedia.newMessage = false;
        this.matchMedia.scrollToBottom = true;
        this.matchMedia.inputValid = false;
        this.clearInterval();
    }

    async ngOnInit(): Promise<void> {
        this.isDesktop = this.matchMedia.checkIsDesktop();
        this.matchMedia.newMessage = false;
        this.matchMedia.inputValid = false;
        await this.waitForUserData();
        this.test();
        this.textBoxData.channelId = this.firestore.conversation;
        this.headerStateService.setAlternativeHeader(true);

        setInterval(() => {
            this.matchMedia.loading = false;
        }, 1000);
    }

    /**
     * Retrieves the values of an item from a collection in Firestore.
     *
     * @param collection - The name of the collection in Firestore.
     * @param itemID - The ID of the item to retrieve.
     */
    getItemValues(collection: string, itemID: string) {
        this.firestore.getSingleItemData(collection, itemID, () => {
            this.user = new User(this.firestore.user);
        });
    }

    /**
     * Waits for the user data to be available.
     * @returns A Promise that resolves when the user data is available.
     */
    async waitForUserData(): Promise<void> {
        while (!this.authService.activeUserAccount) {
            await this.delay(100);
        }
    }

    /**
     * Delays the execution for the specified number of milliseconds.
     * @param ms - The number of milliseconds to delay the execution.
     * @returns A promise that resolves after the specified delay.
     */
    delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    test() {
        let id = this.authService.activeUserAccount.uid;
        this.getItemValues("users", id);
    }

    /**
     * Navigates back to the previous page.
     */
    goBack(): void {
        this.navigationService.goBack();
    }

    /**
     * Opens the bottom sheet.
     */
    openBottomSheet(): void {
        this._bottomSheet.open(BottomSheetComponent);
    }

    /**
     * Handles the input change event.
     *
     * @param event - The input change event object.
     */
    onInputChange(event: any) {
        const inputValue = event.target.value;
        this.matchMedia.inputValid = false;
        const startsWithHash = inputValue.startsWith("#");
        const startsWithAt = inputValue.startsWith("@");

        this.showAddMember = startsWithHash || startsWithAt;
        this.showChannels = startsWithHash;
        this.showUsers = startsWithAt;

        if (this.showAddMember) this.filterInput(inputValue);
    }

    /**
     * Filters the input value and assigns the filtered result to the `inputResult` property.
     * @param inputValue - The input value to be filtered.
     */
    filterInput(inputValue: string) {
        if (inputValue.length > 1) {
            this.inputResult = inputValue.toLocaleLowerCase().slice(1);
        } else {
            this.inputResult = "";
        }
    }

    /**
     * Filters the channel list based on the input result.
     * If the input result is empty, returns the entire channel list.
     * Otherwise, returns the channels whose names start with the input result (case-insensitive).
     *
     * @returns An array of channels that match the filter criteria.
     */
    filteredChannelList() {
        return this.firestore.channelList.filter(
            (channel: { name: string }) =>
                !this.inputResult ||
                channel.name.toLocaleLowerCase().startsWith(this.inputResult)
        );
    }

    /**
     * Filters the user list based on the input result.
     *
     * @returns An array of users whose display names start with the input result.
     */
    filteredUserList() {
        return this.firestore.userList.filter(
            (user: { displayName: string }) =>
                !this.inputResult ||
                user.displayName
                    .toLocaleLowerCase()
                    .startsWith(this.inputResult)
        );
    }

    /**
     * Handles the click event when a user is clicked.
     *
     * @param user - The user object representing the clicked user.
     */
    onUserClick(user: User) {
        this.selectedUserOrChannel = `@${user.displayName}`;
        this.selectedId = user.id;
        if (this.selectedId) {
            this.selectedRecipient(
                "messages",
                this.selectedId,
                "direct-message/"
            );
        }
    }

    onChannelClick(channel: Channel) {
        this.selectedUserOrChannel = `#${channel.name}`;
        this.selectedId = channel.id;
        if (this.selectedId) {
            this.selectedRecipient("channels", this.selectedId, "channel/");
        }
    }

    /**
     * Sets up the recipient state, updates the textBoxData, and handles direct messages if the collection is 'messages'.
     * @param {string} collection - The collection name.
     * @param {string} selection - The selection value.
     * @param {string} target - The target value.
     * @returns {Promise<void>} - A promise that resolves when the method completes.
     */
    async selectedRecipient(
        collection: string,
        selection: string,
        target: string
    ) {
        this.setupRecipientState();
        let nextUrl = `${target}${selection}`;
        this.textBoxData = {
            ...this.textBoxData,
            collection,
            channelId: selection,
        };

        if (collection === "messages") {
            await this.handleDirectMessages(selection);
        }

        this.waitForNewMessageInterval(nextUrl);
    }

    /**
     * Sets up the recipient state.
     * Clears the interval, hides the add member option, and sets the input validity to true.
     */
    setupRecipientState() {
        this.clearInterval();
        this.showAddMember = false;
        this.matchMedia.inputValid = true;
    }

    /**
     * Handles direct messages for the new message component.
     * Retrieves direct messages from the Firestore database and updates the textBoxData channel ID.
     * @param selection - The selection parameter for retrieving direct messages.
     */
    async handleDirectMessages(selection: string) {
        await this.firestore.getDirectMessages(
            this.authService.activeUserAccount.uid,
            selection
        );
        this.textBoxData.channelId = this.firestore.conversation;
    }

    /**
     * Redirects to the specified URL after a delay of 1 second.
     * @param url - The URL to navigate to.
     */
    redirectToNextUrl(url: string) {
        this.matchMedia.loading = true;
        setTimeout(() => {
            this.router.navigateByUrl(url);
        }, 1000);
    }

    /**
     * Waits for a new message interval.
     * @param nextUrl - The URL to redirect to after the new message is received.
     */
    waitForNewMessageInterval(nextUrl: string) {
        this.intervalId = setInterval(() => {
            if (this.matchMedia.newMessage) {
                this.clearInterval();
                this.matchMedia.scrollToBottom = true;
                this.redirectToNextUrl(nextUrl);
            }
        }, 500);
    }

    /**
     * Clears the interval timer if it is currently running.
     */
    clearInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Returns the index of an item in an array.
     * This method is used as a trackBy function in Angular's ngFor directive.
     *
     * @param index - The index of the item in the array.
     * @param item - The item in the array.
     * @returns The index of the item.
     */
    trackByIndex(index: number, item: any): any {
        return index;
    }
}
