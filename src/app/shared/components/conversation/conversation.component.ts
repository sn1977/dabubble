import { CommonModule } from "@angular/common";
import {
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
    inject,
} from "@angular/core";
import { ChannelMessage } from "../../../../models/channel-message.class";
import { User } from "../../../../models/user.class";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { EmojiPickerComponent } from "../emoji-picker/emoji-picker.component";
import { AuthService } from "../../services/auth.service";
import { FormsModule } from "@angular/forms";
import { DateFormatService } from "../../services/date-format.service";
import { Router } from "@angular/router";
import { MatchMediaService } from "../../services/match-media.service";
import { Subscription } from "rxjs";
import { FirestoreService } from "../../services/firestore.service";
import { FilenamePipe } from "../../pipes/filename.pipe";

@Component({
    selector: "app-conversation",
    standalone: true,
    templateUrl: "./conversation.component.html",
    styleUrl: "./conversation.component.scss",
    imports: [
        CommonModule,
        MatDialogModule,
        EmojiPickerComponent,
        FormsModule,
        FilenamePipe,
    ],
})
export class ConversationComponent implements OnInit, AfterViewInit, OnDestroy {
    constructor(
        private dialog: MatDialog,
        public dateFormatService: DateFormatService
    ) {
        this.previousMessageDate = "";
    }

    firestore = inject(FirestoreService);
    router = inject(Router);
    matchMedia = inject(MatchMediaService);
    authService = inject(AuthService);
    @Input() channelMessage!: ChannelMessage;
    @Input() isChannel!: boolean;
    @Input() isThread!: boolean;
    @Input() isDirectMessage!: boolean;
    @Input() hideCompleteReactionBar: boolean = false;
    @Input() hideThreadInfos: boolean = false;
    @Input() index!: number;
    user: User = new User();
    edit: boolean = false;
    hovered: boolean = false;
    isMessageFromYou: boolean = false;
    messageDate: any;
    showReactionBar: boolean = false;
    showEditMessage: boolean = false;
    isMessageDisabled: boolean = true;
    showBubble: boolean[] = [];
    savedMessage: string = "";
    isDesktop: boolean = false;
    @ViewChild("messageToEdit") messageToEdit!: ElementRef<HTMLTextAreaElement>;
    previousMessageDate: string;
    mainCollection: Subscription | undefined;
    timestampLastThread: any;
    fileType: boolean = false;

    /**
     * Initializes the component after Angular has initialized all data-bound properties.
     * This method is called right after the component's data-bound properties have been checked for the first time.
     * It is commonly used for initialization tasks such as retrieving data from a server.
     *
     * @returns A promise that resolves when the initialization is complete.
     */
    async ngOnInit(): Promise<void> {
        await this.delay(200);
        this.initializeMessage();
        this.subscribeToChannelData();
    }

    /**
     * Initializes the message and sets the value of `isMessageFromYou`.
     */
    initializeMessage() {
        this.getItemValuesProfile("users", this.channelMessage.creator);
        this.isMessageFromYou =
            this.authService.activeUserAccount.uid ===
            this.channelMessage.creator;
    }

    /**
     * Subscribes to the channel data.
     * If the channel message has a messageId, it fetches the channel data from Firestore
     * and processes it using the `processChannelData` method.
     */
    subscribeToChannelData() {
        if (this.channelMessage.messageId) {
            const docRef = `${this.channelMessage.channelId}/channelmessages/${this.channelMessage.messageId}`;
            this.mainCollection = this.firestore
                .getChannelData(docRef)
                .subscribe((data) => this.processChannelData(data));
        }
    }

    /**
     * Processes the channel data and performs necessary actions.
     *
     * @param data - The channel data to be processed.
     */
    processChannelData(data: any) {
        if (data) {
            this.updateChannelMessage(data);
            this.adjustTextareaHeight(this.messageToEdit.nativeElement);
            this.fillEmojiReactions();
            this.matchMedia.scrollToBottom = true;
            this.matchMedia.scrollToBottomThread = true;
        }
    }

    /**
     * Updates the channel message with the provided data.
     *
     * @param data - The data to update the channel message with.
     */
    updateChannelMessage(data: any) {
        Object.assign(this.channelMessage, {
            creator: data["creator"],
            createdAt: data["createdAt"],
            text: data["text"],
            reactions: data["reactions"],
            attachment: data["attachment"],
            threads: data["threads"],
            timestampLastThread: data["timestampLastThread"],
            recipient: data["recipient"],
        });
        this.fileType =
            this.channelMessage.attachment?.[0].includes(".pdf?") || false;
    }

    /**
     * Lifecycle hook that is called after Angular has fully initialized the component's view.
     * It is called only once after the first `ngAfterContentChecked`.
     * Use this hook to perform any initialization logic that relies on the component's view.
     */
    async ngAfterViewInit() {
        await this.delay(200);
        this.adjustTextareaHeight(this.messageToEdit.nativeElement);
    }

    /**
     * Sets the visibility of a bubble at the specified index.
     * @param index - The index of the bubble.
     * @param show - A boolean value indicating whether to show or hide the bubble.
     */
    setShowBubble(index: number, show: boolean): void {
        this.showBubble[index] = show;
        if (show) {
            setTimeout(() => {
                this.showBubble[index] = false;
            }, 2000);
        }
    }

    /**
     * Handles the touch start event for a conversation bubble.
     * @param event - The touch event.
     * @param index - The index of the conversation bubble.
     */
    handleTouchStart(event: TouchEvent, index: number): void {
        if (!event.defaultPrevented) {
            this.setShowBubble(index, true);
        }
    }

    /**
     * Handles the touch end event for a conversation bubble.
     * @param event - The touch event object.
     * @param index - The index of the conversation bubble.
     */
    handleTouchEnd(event: TouchEvent, index: number): void {
        if (!event.defaultPrevented) {
            this.setShowBubble(index, false);
        }
    }

    /**
     * Retrieves the display name of a user by their ID.
     * @param id - The ID of the user.
     * @returns The display name of the user, or undefined if the user is not found.
     */
    getDisplayNameById(id: string): string | undefined {
        const user = this.firestore.userList.find(
            (user: { id: string }) => user.id === id
        );
        return user ? user.displayName : undefined;
    }

    /**
     * Retrieves the display names of users who reacted to a conversation, including the current user's display name.
     * If the current user's display name is included in the list, it is modified to indicate the current user.
     *
     * @param reactionUsers - An array of user IDs who reacted to the conversation.
     * @returns An array of display names, including the current user's display name if present.
     */
    getDisplayNamesWithCurrentUser(reactionUsers: string[]): string[] {
        const currentUserDisplayName =
            this.authService.activeUserAccount.displayName;
        const displayNames = reactionUsers
            .map((userId) => this.getDisplayNameById(userId))
            .filter((name): name is string => name !== undefined);

        const isCurrentUserIncluded = displayNames.includes(
            currentUserDisplayName
        );

        if (isCurrentUserIncluded) {
            if (displayNames.length === 1) {
                return ["Du hast"];
            } else {
                return [
                    ...displayNames.filter(
                        (name) => name !== currentUserDisplayName
                    ),
                    "und Du habt",
                ];
            }
        }
        return displayNames;
    }

    /**
     * Calculates the left position for a conversation item based on its index.
     * @param index - The index of the conversation item.
     * @returns The left position in pixels.
     */
    getLeftPosition(index: number): number {
        if (index === 0) {
            return 30;
        } else if (index === 1) {
            return 94;
        } else {
            return 94 + (index - 1) * 64;
        }
    }

    /**
     * Lifecycle hook that is called when the component is destroyed.
     * It is recommended to use this hook to perform any necessary cleanup tasks,
     * such as unsubscribing from observables or releasing resources.
     */
    ngOnDestroy() {
        if (this.mainCollection) {
            this.mainCollection.unsubscribe();
        }
    }

    /**
     * Filters the emoji reactions in the channel message to remove entries without any users.
     */
    fillEmojiReactions() {
        const filterEmojisWithUsers = (data: any[]) => {
            return data.filter((entry) => entry.users.length > 0);
        };

        const filteredData = filterEmojisWithUsers(
            this.channelMessage.reactions
        );
        this.channelMessage.reactions = filteredData;
    }

    /**
     * Retrieves the values of an item from a collection and assigns them to the component's user property.
     * @param collection - The name of the collection to retrieve the item from.
     * @param itemID - The ID of the item to retrieve.
     * @returns A Promise that resolves when the item values have been retrieved and assigned to the user property.
     */
    async getItemValuesProfile(collection: string, itemID: string) {
        await this.delay(200);
        this.firestore.getSingleItemData(collection, itemID, () => {
            this.user = new User(this.firestore.user);
        });
    }

    /**
     * Sets the `hovered` property to `false` if `edit` is `false`.
     */
    deleteHovered() {
        if (!this.edit) {
            this.hovered = false;
        }
    }

    /**
     * Opens the emoji picker dialog and handles the selected emoji.
     */
    openEmojiPicker(): void {
        const dialogRef = this.dialog.open(EmojiPickerComponent, {
            width: "400px",
            height: "300px",
        });

        dialogRef.componentInstance.emojiSelect.subscribe((selectedEmoji) => {
            this.addEmojiReaction(selectedEmoji);
            dialogRef.close();
        });
    }

    /**
     * Adds an emoji reaction to the channel message.
     * If the selected emoji already exists as a reaction, the user's ID is added to the existing reaction.
     * If the selected emoji does not exist as a reaction, a new reaction is created with the user's ID.
     */
    addEmojiReaction(selectedEmoji: string) {
        const existingEmoji = this.channelMessage.reactions.find(
            (e) => e.emoji === selectedEmoji
        );
        const userId = this.authService.activeUserAccount.uid;

        if (existingEmoji) {
            if (!existingEmoji.users.includes(userId)) {
                existingEmoji.users.push(userId);
            }
        } else {
            this.channelMessage.reactions.push({
                emoji: selectedEmoji,
                users: [userId],
            });
        }
        this.saveMessage();
    }

    /**
     * Returns the count of unique users who reacted with the specified emoji.
     * @param selectedEmoji - The emoji to count reactions for.
     * @returns The count of unique users who reacted with the specified emoji.
     */
    getUserReactionCount(selectedEmoji: string): number {
        const existingEmoji = this.channelMessage.reactions.find(
            (e) => e.emoji === selectedEmoji
        );
        if (existingEmoji && existingEmoji.users) {
            const uniqueUsers = new Set(existingEmoji.users);
            return uniqueUsers.size;
        } else {
            return 0;
        }
    }

    /**
     * Toggles the reaction for a given emoji in the conversation.
     * If the active user has already reacted with the emoji, it removes the reaction.
     * If the active user has not reacted with the emoji, it adds the reaction.
     * Finally, it saves the message.
     *
     * @param reaction - The reaction object containing the emoji and users who reacted.
     */
    toggleReaction(reaction: { emoji: string; users: string[] }): void {
        const userIndex = reaction.users.indexOf(
            this.authService.activeUserAccount.uid
        );
        if (userIndex === -1) {
            reaction.users.push(this.authService.activeUserAccount.uid);
        } else {
            reaction.users.splice(userIndex, 1);
        }
        this.saveMessage();
    }

    /**
     * Toggles the reaction bar visibility and performs additional actions based on the visibility state.
     * @param event - The event object triggered by the user action.
     */
    toggleReactionBar(event: any): void {
        event.preventDefault();
        this.showReactionBar = !this.showReactionBar;
        if (!this.showReactionBar) {
            const setFocusMessage = this.messageToEdit.nativeElement;
            setFocusMessage.classList.remove("edit-message");
            this.isMessageDisabled = true;
            this.showEditMessage = false;
        }
    }

    /**
     * Prevents the event from propagating further.
     *
     * @param event - The event object.
     */
    doNotClose(event: any): void {
        event.stopPropagation();
    }

    /**
     * Toggles the edit message mode.
     *
     * @param event - The event object.
     */
    toggleEditMessage(event: any): void {
        event.preventDefault();
        this.showEditMessage = !this.showEditMessage;
    }

    /**
     * Edits a message based on the provided ID.
     * @param id - The ID of the message to be edited.
     */
    editMessage(id?: string): void {
        if (id) {
            this.isMessageDisabled = false;
            const setFocusMessage = this.messageToEdit.nativeElement;
            setFocusMessage.classList.add("edit-message");

            if (setFocusMessage.value) {
                this.savedMessage = setFocusMessage.value;
                setTimeout(() => {
                    this.showEditMessage = false;
                    this.showReactionBar = false;
                    this.messageToEdit.nativeElement.focus();
                }, 200);
            }
        }
    }

    /**
     * Restores the original message and performs necessary cleanup after cancelling the edit operation.
     */
    noChanges() {
        const setFocusMessage = this.messageToEdit.nativeElement;
        setFocusMessage.value = this.savedMessage;

        setTimeout(() => {
            this.showEditMessage = false;
            this.showReactionBar = false;
            this.isMessageDisabled = true;
            setFocusMessage.classList.remove("edit-message");
        }, 200);
    }

    /**
     * Changes the message content and saves the updated message.
     * If a messageId is available, it updates the channelMessage text with the value of the messageToEdit element,
     * saves the message, and performs additional actions like removing CSS classes and updating flags.
     *
     * @returns {Promise<void>} A promise that resolves when the message has been successfully changed.
     */
    async changeMessage() {
        let messageId = this.channelMessage.messageId;

        if (messageId) {
            const setFocusMessage = this.messageToEdit.nativeElement;
            this.channelMessage.text = setFocusMessage.value;
            this.saveMessage();

            setTimeout(() => {
                setFocusMessage.classList.remove("edit-message");
                this.isMessageDisabled = true;
                this.showReactionBar = false;
            }, 200);
        }
    }

    /**
     * Saves the channel message data to the Firestore database.
     */
    saveMessage() {
        if (this.channelMessage.messageId !== undefined) {
            let colId = "channels";

            if (this.isThread) {
                this.channelMessage.messageId =
                    this.matchMedia.subID +
                    "/channelmessages/" +
                    this.channelMessage.messageId;
            }

            if (this.isDirectMessage) {
                colId = "messages";
            }

            this.firestore.saveMessageData(
                colId,
                this.channelMessage.channelId,
                this.channelMessage.messageId,
                this.channelMessage
            );
        }
    }

    /**
     * Adjusts the height of a textarea element based on its content.
     * @param textarea - The HTMLTextAreaElement to adjust the height of.
     * @returns A Promise that resolves after the height adjustment is complete.
     */
    async adjustTextareaHeight(textarea: HTMLTextAreaElement) {
        await this.delay(100);
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
    }

    /**
     * Opens the thread and performs necessary setup operations.
     * This method prepares the thread view, adds a delay of 200 milliseconds,
     * and sets up the thread navigation.
     */
    async openThread() {
        this.prepareThreadView();
        await this.delay(200);
        this.setupThreadNavigation();
    }

    /**
     * Prepares the thread view by setting the necessary properties.
     */
    prepareThreadView() {
        this.matchMedia.showSearchDropdown = false;
        this.matchMedia.showThread = false;
        this.matchMedia.hideReactionIcons = false;
    }

    /**
     * Sets up the thread navigation based on the channel message.
     * If a messageId is provided, it assigns the thread context and navigates based on the device.
     */
    setupThreadNavigation() {
        const { channelId, messageId } = this.channelMessage;
        this.isDesktop = this.matchMedia.checkIsDesktop();

        if (messageId) {
            this.assignThreadContext(channelId, messageId);
            this.navigateBasedOnDevice();
        }
    }

    /**
     * Assigns the thread context for the conversation.
     *
     * @param docId - The ID of the document.
     * @param messageId - The ID of the message.
     */
    assignThreadContext(docId: string, messageId: string) {
        this.matchMedia.channelId = docId;
        this.matchMedia.subID = messageId;
        this.matchMedia.collectionType = this.isDirectMessage
            ? "messages"
            : "channels";
    }

    /**
     * Navigates based on the device type.
     * If the device is desktop, it shows the thread.
     * If the device is not desktop, it hides the reaction icons and navigates to the '/thread' route.
     */
    navigateBasedOnDevice() {
        if (this.isDesktop) {
            this.matchMedia.showThread = true;
        } else {
            this.matchMedia.hideReactionIcons = true;
            this.router.navigate(["/thread"]);
        }
    }

    /**
     * Delays the execution for the specified number of milliseconds.
     * @param ms - The number of milliseconds to delay the execution.
     * @returns A promise that resolves after the specified delay.
     */
    delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Checks if the channel message has reactions with users.
     * @returns A boolean value indicating whether the channel message has reactions with users.
     */
    hasReactionsWithUsers(): boolean {
        return (
            this.channelMessage.reactions.some(
                (reaction) => reaction.users.length > 0
            ) && !this.hideCompleteReactionBar
        );
    }
}
