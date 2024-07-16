import { Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FirestoreService } from "../../../shared/services/firestore.service";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Channel } from "../../../../models/channel.class";
import { User } from "../../../../models/user.class";
import { AuthService } from "../../../shared/services/auth.service";
import { CommonModule } from "@angular/common";
import { SearchUserComponent } from "../../../shared/components/search-user/search-user.component";
import { Subscription } from "rxjs";

@Component({
    selector: "app-channel-edition",
    standalone: true,
    imports: [FormsModule, RouterLink, CommonModule, SearchUserComponent],
    templateUrl: "./channel-edition.component.html",
    styleUrl: "./channel-edition.component.scss",
})
export class ChannelEditionComponent implements OnInit {
    selectedUser: any = [];
    router = inject(Router);
    itemID: any = "";
    user: User = new User();
    firestore = inject(FirestoreService);
    authService = inject(AuthService);
    channel: Channel = new Channel();
    isEditingChannelName: boolean = false;
    isEditingDescription: boolean = false;
    channelNames: string[] = [];
    channelNameExists: boolean = false;
    private subscription?: Subscription;

    channelData = {
        creator: this.channel.creator,
        description: this.channel.description,
        member: this.channel.member,
        name: this.channel.name,
    };

    constructor(
        private route: ActivatedRoute,
    ) {}

    /**
     * Handles the form submission based on the provided toggle value.
     * If the toggle is "channelName", it calls the handleChannelNameChange method.
     * If the toggle is "channelDescription", it calls the handleChannelDescriptionChange method.
     * @param toggle - The toggle value indicating which action to perform.
     */
    onSubmit(toggle: string) {        
        if (toggle === "channelName") {
            this.handleChannelNameChange();
        } else if (toggle === "channelDescription") {
            this.handleChannelDescriptionChange();
        }
    }

    /**
     * Handles the change event for the channel name.
     */
    handleChannelNameChange() {
        const nameChanged =
            this.channel.name.toLowerCase() !==
            this.channelData.name.toLowerCase();
        const nameNotEmpty = this.channelData.name !== "";
        if (nameChanged) {
            this.channelNameExists = this.checkChannelName(
                this.channelData.name
            );
            if (!this.channelNameExists && nameNotEmpty) {
                this.updateAndToggle("channelName");
            }
        } else {
            this.toggleEdit("channelName");
        }
    }

    /**
     * Handles the change event for the channel description.
     * If the channel description has changed, it updates and toggles the "channelDescription" property.
     * Otherwise, it toggles the "channelDescription" property without updating.
     */
    handleChannelDescriptionChange() {
        if (this.channel.description !== this.channelData.description) {
            this.updateAndToggle("channelDescription");
        } else {
            this.toggleEdit("channelDescription");
        }
    }

    /**
     * Updates the channel data and toggles the edit mode.
     *
     * @param toggle - The toggle value.
     */
    updateAndToggle(toggle: string) {
        this.updateChannelData();
        this.toggleEdit(toggle);
    }

    /**
     * Updates the channel data with the provided values.
     */
    updateChannelData() {
        this.channelData.description =
            this.channelData.description || this.channel.description;
        this.channelData.member = this.channelData.member.length
            ? this.channelData.member
            : this.channel.member;
        
        const channel = new Channel({
            creator: this.channel.creator,
            description: this.channelData.description,
            member: this.channelData.member,
            name: this.channelData.name,
        });
        this.firestore.updateChannel(this.itemID, channel);
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
     * Toggles the edit mode for the specified field.
     *
     * @param field - The field to toggle edit mode for. Possible values are "channelName" and "channelDescription".
     */
    toggleEdit(field: string) {
        if (field === "channelName") {
            this.isEditingChannelName = !this.isEditingChannelName;
        } else if (field === "channelDescription") {
            this.isEditingDescription = !this.isEditingDescription;
        }
    }

    /**
     * Toggles the display of an overlay element based on its ID.
     * If another overlay is already open, it will be closed before opening the new overlay.
     *
     * @param overlayId - The ID of the overlay element to toggle.
     */
    toggleOverlay(overlayId: string): void {
        const currentOverlay = document.querySelector(
            '.overlay1[style="display: block;"]'
        ) as HTMLElement;
        const newOverlay = document.getElementById(overlayId);

        if (currentOverlay && currentOverlay.id !== overlayId) {
            // Schließe das aktuelle Overlay, wenn ein anderes Overlay geöffnet ist
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
    ycloseOverlay(overlayId: string): void {
        const overlay = document.getElementById(overlayId) as HTMLElement;
        if (overlay) {
            overlay.style.display = "none";
        }
    }

    /**
   * Closes the overlay.
   * @param event - The optional mouse event that triggered the close action.
   */
  closeOverlay(event?: MouseEvent): void {
    if (event) {
      const overlayContent = document.querySelector('.overlay-content');
      if (overlayContent && overlayContent.contains(event.target as Node)) {
        return;
      }
    }    
    const overlay = document.getElementById('overlay');    
    if (overlay) {       
      overlay.style.display = 'none';      
    }
    
  }

    /**
     * Initializes the component and performs necessary setup tasks.
     * This method is automatically called by Angular when the component is created.
     * @returns A Promise that resolves when the initialization is complete.
     */
    async ngOnInit(): Promise<void> {
        this.route.paramMap.subscribe(async (paramMap) => {
            this.itemID = paramMap.get("id");
            this.getItemValues("channels", this.itemID);
            await this.waitForUserData();
        });
    }

    /**
     * Lifecycle hook that is called when the component is destroyed.
     * It is used to perform any necessary cleanup before the component is removed from the DOM.
     */
    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
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
     * Delays the execution of code for the specified number of milliseconds.
     * @param ms - The number of milliseconds to delay.
     * @returns A promise that resolves after the specified delay.
     */
    delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Retrieves the values of an item from a collection and initializes the `channel` and `user` properties.
     *
     * @param collection - The name of the collection to retrieve the item from.
     * @param itemID - The ID of the item to retrieve.
     */
    getItemValues(collection: string, itemID: string) {
        this.firestore.getSingleItemData(collection, itemID, () => {
            this.channel = new Channel(this.firestore.channel);            
            this.user = new User(this.firestore.user);
        });
        setTimeout(() => {
            this.setOldChannelValues();
        }, 1000);
    }

    /**
     * Sets the old channel values.
     * Copies the values from the current channel to the `channelData` object.
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
     * Opens a channel based on the provided path and document reference ID.
     * @param event - The mouse event that triggered the channel opening.
     * @param path - The path of the channel.
     */
    openChannel(event: MouseEvent, path: string) {
        const docRefId = (event.currentTarget as HTMLElement).id;
        this.router.navigate(["/" + path + "/" + docRefId]);
    }

    /**
     * Removes a member from the channel and updates the channel in the Firestore database.
     */
    removeMember() {
        const index = this.channel.member.indexOf(
            this.authService.activeUserId
        );
        if (index !== -1) {
            this.channel.member.splice(index, 1);
        }

        const channel = new Channel({
            creator: this.channel.creator,
            description: this.channelData.description,
            member: this.channel.member,
            name: this.channelData.name,
        });
        
        this.firestore.updateChannel(this.itemID, channel);
        this.router.navigate(["/main"]);
    }

    /**
     * Filters the users based on the provided member ID.
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
     * @param usersArray - The array of users to filter.
     * @param idsArray - The array of IDs to filter by.
     * @returns An array of users whose IDs are included in the `idsArray`.
     */
    filterUsersById(usersArray: any[], idsArray: string | any[]) {
        return usersArray.filter((user) => idsArray.includes(user.id));
    }
}
