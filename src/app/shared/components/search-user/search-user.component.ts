import { Component, OnInit, inject } from "@angular/core";
import { NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { FirestoreService } from "../../services/firestore.service";
import { CommonModule } from "@angular/common";
import { User } from "../../../../models/user.class";
import { Channel } from "../../../../models/channel.class";
import { AuthService } from "../../services/auth.service";
//NOTE - Not working yet
import { ClickOutsideDirective } from "../../directives/clickoutside.directive";

@Component({
    selector: "app-search-user",
    standalone: true,
    imports: [NgIf, FormsModule, RouterLink, CommonModule],
    templateUrl: "./search-user.component.html",
    styleUrl: "./search-user.component.scss",
})
export class SearchUserComponent implements OnInit {
    users: User[] = [];
    showDropdown: boolean = false;
    overlayVisible: boolean = false;
    showInputField: boolean = false;
    showAddMember: boolean = false;
    showGeneralInputField: boolean = false;
    isAddAllMembersChecked: boolean = false;
    isAddSpecificMembersChecked: boolean = false;
    firestore = inject(FirestoreService);
    router = inject(Router);
    authService = inject(AuthService);
    itemID: any = "";
    activeUser: any = "";
    channel: Channel = new Channel();
    searchQuery: string = "";

    channelData = {
        creator: this.channel.creator,
        description: this.channel.description,
        member: this.channel.member,
        name: this.channel.name,
    };

    constructor(private route: ActivatedRoute) {}

    /**
     * Handles the form submission event.
     * If neither the "Add All Members" nor the "Add Specific Members" checkboxes are checked,
     * it closes the overlay. Otherwise, it processes the channel update.
     */
    onSubmit() {
        if (!this.isAddAllMembersChecked && !this.isAddSpecificMembersChecked) {
            this.closeOverlay("overlay");
        } else {
            this.processChannelUpdate();
        }
    }

    /**
     * Processes the channel update by retrieving the user IDs and creating/updating the channel.
     * Resets the selections and closes the overlay afterwards.
     */
    processChannelUpdate() {
        const userIds = this.isAddAllMembersChecked
            ? this.getUserIds(this.firestore.getUsers())
            : this.channel.member;
        const channel = this.createChannel(userIds);
        this.firestore.updateChannel(this.itemID, channel);
        this.resetSelections();
        this.closeOverlay("overlay");
    }

    /**
     * Creates a new channel with the given user IDs.
     *
     * @param userIds - An array of user IDs to add as members of the channel.
     * @returns A new Channel instance.
     */
    createChannel(userIds: string[]): Channel {
        return new Channel({
            creator: this.authService.activeUserId,
            description: this.channelData.description,
            member: userIds,
            name: this.channelData.name,
        });
    }

    /**
     * Resets the selections for adding members.
     * Sets the 'isAddAllMembersChecked' and 'isAddSpecificMembersChecked' properties to false.
     */
    resetSelections() {
        this.isAddAllMembersChecked = false;
        this.isAddSpecificMembersChecked = false;
    }

    /**
     * Returns an array of user IDs from the given users array.
     *
     * @param usersArray - The array of users.
     * @returns An array of user IDs.
     */
    getUserIds(usersArray: any[]) {
        return usersArray.map((user) => user.id);
    }

    /**
     * Initializes the component.
     * Subscribes to the route paramMap to get the 'id' parameter and calls the getItemValues method.
     */
    ngOnInit() {
        this.route.paramMap.subscribe((paramMap) => {
            this.itemID = paramMap.get("id");
            this.getItemValues("channels", this.itemID);
        });
    }

    /**
     * Retrieves the values of an item from a collection and sets the channel property.
     * @param collection - The name of the collection to retrieve the item from.
     * @param itemID - The ID of the item to retrieve.
     */
    getItemValues(collection: string, itemID: string) {
        this.firestore.getSingleItemData(collection, itemID, () => {
            this.channel = new Channel(this.firestore.channel);
        });

        setTimeout(() => {
            this.setOldChannelValues();
        }, 1000);
    }

    /**
     * Sets the old channel values based on the current channel.
     */
    setOldChannelValues() {
        this.channelData = {
            creator: this.channel.creator,
            description: this.channel.description,
            member: this.channel.member,
            name: this.channel.name,
        };
    }

    /**
     * Toggles the membership status of a user in the channel.
     * If the user is already a member, they will be removed from the channel.
     * If the user is not a member, they will be added to the channel.
     *
     * @param user - The user to toggle membership for.
     */
    toggleMember(user: User) {
        const index = this.channel.member.indexOf(user.id);
        if (index !== -1) {
            this.channel.member.splice(index, 1);
        } else {
            this.channel.member.push(user.id);
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
     * If the search query is empty or whitespace, all users are considered a match.
     * @param user - The user object to check.
     * @returns True if the user matches the search query, false otherwise.
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
     * Toggles the visibility of the overlay.
     */
    toggleOverlay() {
        this.overlayVisible = !this.overlayVisible;
    }

    /**
     * Toggles the input field based on the provided inputId.
     * If the inputId is 'addSpecificMembers', it toggles the showInputField property and sets showAddMember to false.
     * If the inputId is 'searchPeople', it toggles the showAddMember property if showInputField is true,
     * otherwise it sets showInputField and showAddMember to true.
     *
     * @param inputId - The ID of the input field.
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
     * Toggles the checkbox based on the provided checkboxId.
     * If checkboxId is 'addAllMembers', sets isAddAllMembersChecked to true and other flags to false.
     * If checkboxId is 'addSpecificMembers', sets isAddSpecificMembersChecked to true.
     * @param checkboxId - The ID of the checkbox to toggle.
     */
    toggleCheckbox(checkboxId: string): void {
        if (checkboxId === "addAllMembers") {
            this.isAddAllMembersChecked = true;
            this.isAddSpecificMembersChecked = false;
            this.showInputField = false;
        } else if (checkboxId === "addSpecificMembers") {
            this.isAddAllMembersChecked = false;
            this.isAddSpecificMembersChecked = true;
        }
    }

    /**
     * Retrieves the value of the input element from the provided event object.
     *
     * @param event - The event object containing the input element.
     * @returns The value of the input element, or undefined if the event or target is not defined.
     */
    getInputValue(event: any): string {
        return event && event.target && event.target.value;
    }

    /**
     * Closes the overlay with the specified ID and resets the component's properties.
     * @param overlayId - The ID of the overlay element to close.
     */
    closeOverlay(overlayId: string): void {
        const overlay = document.getElementById(overlayId) as HTMLElement;
        if (overlay) {
            overlay.style.display = "none";
        }

        this.showAddMember = false;
        this.showInputField = false;
        this.isAddAllMembersChecked = false;
        this.isAddSpecificMembersChecked = false;
    }

    /**
     * Filters the users based on the provided criteria.
     *
     * @returns An array of filtered users.
     */
    filterUsers() {
        return this.filterUsersById(
            this.firestore.getUsers(),
            this.channel.member
        );
    }

    /**
     * Filters an array of users based on their IDs.
     * @param {any[]} usersArray - The array of users to filter.
     * @param {string | any[]} idsArray - The array of IDs to filter by.
     * @returns {any[]} - The filtered array of users.
     */
    filterUsersById(usersArray: any[], idsArray: string | any[]) {
        return usersArray.filter((user) => idsArray.includes(user.id));
    }
}
