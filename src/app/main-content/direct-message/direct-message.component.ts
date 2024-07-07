import {
    Component,
    ElementRef,
    inject,
    Input,
    OnInit,
    ViewChild,
} from "@angular/core";
import { DirectMessageOverlayComponent } from "./direct-message-overlay/direct-message-overlay.component";
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
import { DateFormatService } from "../../shared/services/date-format.service";
import { TimeSeperatorComponent } from "../../shared/components/time-seperator/time-seperator.component";
import { MatchMediaService } from "../../shared/services/match-media.service";
import { Subscription } from "rxjs";
import { ProgressSpinnerComponent } from "../../shared/components/progress-spinner/progress-spinner.component";

@Component({
    selector: "app-direct-message",
    standalone: true,
    templateUrl: "./direct-message.component.html",
    styleUrl: "./direct-message.component.scss",
    imports: [
        HeaderMobileComponent,
        TextBoxComponent,
        ConversationComponent,
        TimeSeperatorComponent,
        ProgressSpinnerComponent,
    ],
})
export class DirectMessageComponent implements OnInit {
    @ViewChild("messageContent") messageContent!: ElementRef;
    firestore = inject(FirestoreService);
    router = inject(Router);
    itemID: any = "";
    user: User = new User();
    channel: Channel = new Channel();
    authService = inject(AuthService);
    matchMedia = inject(MatchMediaService);
    routeSubscription: Subscription | undefined;
    @Input() isDesktop: boolean = false;

    /**
     * Data object for the text box.
     */
    textBoxData: any = {
        placeholder: "Nachricht an ",
        channelName: "",
        messageText: "",
        channelId: "",
        collection: "messages",
        subcollection: "channelmessages",
    };

    /**
     * Represents the user data.
     */
    userData = {
        avatar: this.user.avatar,
        email: this.user.email,
        displayName: this.user.displayName,
        isOnline: this.user.isOnline,
        provider: this.user.provider,
    };

    /**
     * Represents the DirectMessageComponent class.
     * This component is responsible for handling direct messages.
     */
    constructor(
        public dialog: MatDialog,
        private navigationService: NavigationService,
        private _bottomSheet: MatBottomSheet,
        private route: ActivatedRoute,
        private headerStateService: HeaderStateService,
        public dateFormatService: DateFormatService
    ) {}

    /**
     * Initializes the component and sets up necessary configurations.
     * This method is called after the component has been created and initialized.
     * It is used to perform any initialization logic required by the component.
     * @returns A promise that resolves when the initialization is complete.
     */
    async ngOnInit(): Promise<void> {
        this.setupComponent();
        this.routeSubscription = this.route.paramMap.subscribe(
            async (paramMap) => {
                this.resetTextBox();
                this.itemID = paramMap.get("id");
                this.getItemValues("users", this.itemID);
                await this.handleDirectMessages();
                this.setupHeaderAndMessages();
                this.setupAutoScroll();
            }
        );
    }

    /**
     * Sets up the component by waiting for user data, checking the device type, and setting the collection type.
     */
    setupComponent() {
        this.waitForUserData();
        this.isDesktop = this.matchMedia.checkIsDesktop();
        this.matchMedia.collectionType = "messages";
    }

    /**
     * Resets the text box by clearing the message text and input field.
     */
    resetTextBox() {
        this.textBoxData.messageText = "";
        this.textBoxData.inputField = "";
    }

    /**
     * Handles the retrieval of direct messages for the active user account.
     * If there is an active user account, it calls the `getDirectMessages` method of the `firestore` service
     * to fetch the direct messages for the specified user and item.
     */
    async handleDirectMessages() {
        if (this.authService.activeUserAccount) {
            await this.firestore.getDirectMessages(
                this.authService.activeUserAccount.uid,
                this.itemID
            );
        }
    }

    /**
     * Sets up the header and messages for the direct message component.
     * It sets the alternative header, updates the text box placeholder,
     * and loads the messages after a delay.
     */
    setupHeaderAndMessages() {
        this.headerStateService.setAlternativeHeader(true);
        this.textBoxData.placeholder =
            "Nachricht an " + this.matchMedia.channelName;
        this.delayAndLoadMessages();
    }

    /**
     * Delays for a specified time and then loads the messages.
     */
    async delayAndLoadMessages() {
        await this.delay(700);
        if (this.firestore.conversation) {
            this.textBoxData.channelId = this.firestore.conversation;
            await this.firestore.getAllChannelMessages(
                this.firestore.conversation,
                this.textBoxData.collection,
                this.textBoxData.subcollection
            );
        }
        this.matchMedia.loading = false;
    }

    /**
     * Sets up automatic scrolling to the bottom of the container at regular intervals.
     */
    setupAutoScroll() {
        setInterval(() => this.scrollToBottom(), 1000);
    }

    /**
     * Retrieves the values of an item from a collection asynchronously.
     * @param collection - The name of the collection to retrieve the item from.
     * @param itemID - The ID of the item to retrieve.
     */
    async getItemValues(collection: string, itemID: string) {
        await this.delay(200);
        this.firestore.getSingleItemData(collection, itemID, () => {
            this.user = new User(this.firestore.user);
            this.textBoxData.channelName = this.channel.name;
            this.textBoxData.channelId = itemID;
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
     * @param ms - The number of milliseconds to delay.
     * @returns A promise that resolves after the specified delay.
     */
    delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    test() {
        if (this.authService.activeUserAccount) {
            let id = this.authService.activeUserAccount.uid;
            this.getItemValues("users", id);
        }
    }

    /**
     * Toggles the display of an overlay element based on its ID.
     * If the overlay is currently displayed, it will be hidden. If it is hidden, it will be displayed.
     * @param overlayId - The ID of the overlay element to toggle.
     */
    toggleOverlay(overlayId: string): void {
        const currentOverlay = document.querySelector(
            '.overlay[style="display: block;"]'
        ) as HTMLElement;
        const newOverlay = document.getElementById(overlayId);

        if (currentOverlay && currentOverlay.id !== overlayId) {
            currentOverlay.style.display = "none";
        }

        if (newOverlay) {
            newOverlay.style.display =
                newOverlay.style.display === "none" ? "block" : "none";
        }
    }

    /**
     * Closes the overlay with the specified ID.
     * @param overlayId - The ID of the overlay to close.
     */
    closeOverlay(overlayId: string): void {
        const overlay = document.getElementById(overlayId) as HTMLElement;
        if (overlay) {
            overlay.style.display = "none";
        }
    }

    /**
     * Opens the direct message overlay.
     */
    openDirectMessageOverlay(): void {
        const dialogRef = this.dialog.open(DirectMessageOverlayComponent, {
            minWidth: "398px",
            minHeight: "600px",
            panelClass: "custom-dialog-container",
            data: { user: this.user, itemId: this.itemID },
        });
    }

    /**
     * Scrolls the message content to the bottom.
     * If `scrollToBottom` is set to `true` in `matchMedia`, it scrolls the content smoothly to the bottom.
     * This method is asynchronous and waits for a delay of 200 milliseconds before scrolling.
     */
    async scrollToBottom() {
        await this.delay(200);

        if (this.matchMedia.scrollToBottom === true) {
            try {
                this.messageContent.nativeElement.scrollTo({
                    top: this.messageContent.nativeElement.scrollHeight,
                    behavior: "smooth",
                });
            } catch (err) {}
        }
        this.matchMedia.scrollToBottom = false;
    }

    /**
     * Navigates back to the previous page.
     */
    goBack(): void {
        this.navigationService.goBack();
    }

    /**
     * Opens the bottom sheet component.
     */
    openBottomSheet(): void {
        this._bottomSheet.open(BottomSheetComponent);
    }
}
