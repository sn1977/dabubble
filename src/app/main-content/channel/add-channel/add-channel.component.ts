import { Component, OnInit, inject } from "@angular/core";
import { NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { FirestoreService } from "../../../shared/services/firestore.service";
import { CommonModule } from "@angular/common";
import { User } from "../../../../models/user.class";
import { Channel } from "../../../../models/channel.class";
import { AuthService } from "../../../shared/services/auth.service";
import { MatchMediaService } from "../../../shared/services/match-media.service";
@Component({
    selector: "app-add-channel",
    standalone: true,
    imports: [NgIf, FormsModule, RouterLink, CommonModule],
    templateUrl: "./add-channel.component.html",
    styleUrl: "./add-channel.component.scss",
})
export class AddChannelComponent implements OnInit {
    selectedUsers: User[] = [];
    selectedUser: any = [];
    users: User[] = [];
    selected: boolean = false;
    showDropdown: boolean = false;
    overlayVisible: boolean = false;
    showInputField: boolean = false;
    showAddMember: boolean = false;
    isAddAllMembersChecked: boolean = false;
    isAddSpecificMembersChecked: boolean = false;
    firestore = inject(FirestoreService);
    router = inject(Router);
    matchMedia = inject(MatchMediaService);
    authService = inject(AuthService);
    isDesktop: boolean = false;
    activeUser: any = "";
    channelNameExists: boolean = false;
    channelNameEmpty: boolean = false;
    channel: Channel = new Channel();
    searchQuery: string = "";

    channelData = {
        creator: "",
        description: "",
        member: [],
        name: "",
        user: "",
        count: "",
        newMessage: "",
    };

    /**
     * Handles the form submission when creating a new channel.
     * If the "Add All Members" checkbox is checked, it retrieves all user IDs.
     * Otherwise, it retrieves the selected user IDs.
     * Then, it creates a new channel using the retrieved user IDs and adds it.
     */
    onSubmit() {
        const userIds = this.isAddAllMembersChecked
            ? this.getAllUserIds()
            : this.getSelectedUserIds();
        const channel = this.createChannel(userIds);
        this.addChannel(channel);
    }

    /**
     * Retrieves all user IDs from the Firestore database.
     *
     * @returns An array of user IDs.
     */
    getAllUserIds() {
        return this.getUserIds(this.firestore.getUsers());
    }

    /**
     * Retrieves the selected user IDs.
     *
     * @returns An array of user IDs.
     */
    getSelectedUserIds() {
        let userIds = this.getUserIds(this.selectedUsers);
        this.ensureActiveUserIncluded(userIds);
        return userIds;
    }

    /**
     * Ensures that the active user is included in the given array of user IDs.
     * If the active user ID is not already included, it will be added to the array.
     *
     * @param userIds - An array of user IDs.
     */
    ensureActiveUserIncluded(userIds: string[]) {
        const activeUserId = this.authService.activeUserId;
        if (!userIds.includes(activeUserId)) {
            userIds.push(activeUserId);
        }
    }

    /**
     * Creates a new channel with the provided user IDs.
     *
     * @param userIds - An array of user IDs to add as members of the channel.
     * @returns A new Channel instance with the specified properties.
     */
    createChannel(userIds: string[]) {
        return new Channel({
            creator: this.authService.activeUserId,
            description: this.channelData.description,
            member: userIds,
            name: this.channelData.name,
            count: this.channelData.count,
            newMessage: this.channelData.newMessage,
        });
    }

    /**
     * Adds a channel to the Firestore database and updates the matchMedia channel name.
     *
     * @param channel - The channel to be added.
     */
    addChannel(channel: Channel) {
        this.firestore.addChannel(channel);
        this.matchMedia.channelName = channel.name;
    }

    /**
     * Checks if a channel name already exists in the channel list.
     * @param name - The name of the channel to check.
     * @returns True if the channel name does not exist, false otherwise.
     */
    checkChannelName(name: string) {
        const nameNotExists = this.firestore.channelList.some(
            (channel: { name: string }) =>
                channel.name.toLowerCase() === name.toLowerCase()
        );
        if (nameNotExists) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Returns an array of user IDs from the given users array.
     * @param usersArray - The array of users.
     * @returns An array of user IDs.
     */
    getUserIds(usersArray: any[]) {
        return usersArray.map((user) => user.id);
    }

    /**
     * Initializes the component.
     * This method is called after the component has been created and initialized.
     */
    ngOnInit(): void {
        this.isDesktop = this.matchMedia.checkIsDesktop();
    }

    /**
     * Adds or removes a user from the selectedUsers array based on whether the user is already selected or not.
     * @param event - The MouseEvent that triggered the addmember method.
     * @param user - The User object to be added or removed from the selectedUsers array.
     */
    addmember(event: MouseEvent, user: User) {
        const index = this.selectedUsers.findIndex(
            (selectedUser) => selectedUser.id === user.id
        );

        if (index === -1) {
            this.selectedUsers.push(user);
        } else {
            this.selectedUsers.splice(index, 1);
        }
    }

    /**
     * Removes a user from the selected users list.
     * @param user - The user to be removed.
     */
    removeUser(user: User) {
        const index = this.selectedUsers.findIndex(
            (selectedUser) => selectedUser.id === user.id
        );
        if (index !== -1) {
            this.selectedUsers.splice(index, 1);
        }
    }

    /**
     * Handles the change event of the search input.
     * Updates the searchQuery property with the new value.
     *
     * @param value - The new value of the search input.
     */
    onSearchInputChange(value: string) {
        this.searchQuery = value;
    }

    /**
     * Checks if the given user matches the search query.
     * If no search query is provided or if it is empty, the method returns true.
     * Otherwise, it checks if the user's display name contains the search query (case-insensitive).
     *
     * @param user - The user object to be checked.
     * @returns A boolean indicating whether the user matches the search query.
     */
    matchesSearch(user: any): boolean {
        if (!this.searchQuery || this.searchQuery.trim() === "") {
            return true;
        }
        return user.displayName
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase());
    }

    /**
     * Toggles the overlay visibility based on the channel name.
     * If the channel name is not empty and does not exist, the overlay will be toggled.
     * If the channel name is empty, the `channelNameEmpty` flag will be set to true.
     */
    toggleOverlay() {
        if (this.channelData.name !== "") {
            this.channelNameEmpty = false;
            this.channelNameExists = this.checkChannelName(
                this.channelData.name
            );
            if (this.channelNameExists == false) {
                this.overlayVisible = !this.overlayVisible;
            }
        } else {
            this.channelNameEmpty = true;
        }
    }

    /**
     * Toggles the input field based on the provided inputId.
     * If the inputId is 'addSpecificMembers', it toggles the showInputField property and sets showAddMember to false.
     * If the inputId is 'searchPeople', it toggles the showAddMember property based on the current state of showInputField.
     * If showInputField is false, it sets showInputField and showAddMember to true.
     * @param inputId - The ID of the input field to toggle.
     */
    toggleInputField(inputId: string) {
        if (inputId === "addSpecificMembers") {
            this.showInputField = !this.showInputField;
            this.showAddMember = false;
        } else if (inputId === "searchPeople") {
            if (this.showInputField) {
                this.showAddMember = !this.showAddMember;
            } else {
                this.showInputField = true;
                this.showAddMember = true;
            }
        }
    }

    /**
     * Toggles the checkbox based on the provided checkbox ID.
     * If the checkbox ID is 'addAllMembers', it sets the 'isAddAllMembersChecked' to true,
     * 'isAddSpecificMembersChecked' to false, and 'showInputField' to false.
     * If the checkbox ID is 'addSpecificMembers', it sets the 'selectedUsers' to an empty array,
     * 'isAddAllMembersChecked' to false, and 'isAddSpecificMembersChecked' to true.
     *
     * @param checkboxId - The ID of the checkbox to toggle.
     */
    toggleCheckbox(checkboxId: string): void {
        if (checkboxId === "addAllMembers") {
            this.isAddAllMembersChecked = true;
            this.isAddSpecificMembersChecked = false;
            this.showInputField = false;
        } else if (checkboxId === "addSpecificMembers") {
            this.selectedUsers = [];
            this.isAddAllMembersChecked = false;
            this.isAddSpecificMembersChecked = true;
        }
    }
    /**
     * Retrieves the value from the input event.
     *
     * @param event - The input event object.
     * @returns The value of the input event target.
     */
    getInputValue(event: any): string {
        return event && event.target && event.target.value;
    }
}
