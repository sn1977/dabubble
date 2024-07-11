import { Component, inject, Input, OnInit } from "@angular/core";
import { FirestoreService } from "../shared/services/firestore.service";
import { HeaderMobileComponent } from "../shared/components/header-mobile/header-mobile.component";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import {
    MatAccordion,
    MatExpansionModule,
    MatExpansionPanel,
    MatExpansionPanelDescription,
    MatExpansionPanelTitle,
} from "@angular/material/expansion";
import { BottomSheetComponent } from "../shared/components/bottom-sheet/bottom-sheet.component";
import { MatFabButton } from "@angular/material/button";
import { FormsModule } from "@angular/forms";
import { NavigationService } from "../shared/services/navigation.service";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../shared/services/auth.service";
import { ItemStateService } from "../shared/services/item-state.service";
import { User } from "../../models/user.class";
import { CommonModule, NgForOf, NgIf } from "@angular/common";
import { ChannelMessage } from "../../models/channel-message.class";
import { SearchInputComponent } from "../shared/components/search-input/search-input.component";
import { MatchMediaService } from "../shared/services/match-media.service";
import { timeout } from "rxjs";

@Component({
    selector: "app-main-content",
    standalone: true,
    imports: [
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatAccordion,
        MatExpansionPanel,
        MatExpansionPanelTitle,
        MatExpansionPanelDescription,
        MatExpansionModule,
        HeaderMobileComponent,
        BottomSheetComponent,
        MatFabButton,
        FormsModule,
        RouterLink,
        NgForOf,
        NgIf,
        CommonModule,
        SearchInputComponent,
    ],
    templateUrl: "./main-content.component.html",
    styleUrl: "./main-content.component.scss",
})
export class MainContentComponent implements OnInit {
    firestore = inject(FirestoreService);
    router = inject(Router);
    authService = inject(AuthService);
    matchMedia = inject(MatchMediaService);

    @Input() channelMessage!: ChannelMessage;
    @Input() isDesktop: boolean = false;

    /**
     * Represents an array of panels.
     */
    panels = [
        {
            expanded: true,
            arrowImagePath: "assets/img/icon/arrow_drop_down.png",
            iconPath: "",
            iconPathOpened: "assets/img/icon/workspaces.png",
            iconPathClosed: "assets/img/icon/workspaces_color.png",
            title: "Kanäle",
            titleColor: "#000000",
        },
        {
            expanded: true,
            arrowImagePath: "assets/img/icon/arrow_drop_down.png",
            iconPath: "",
            iconPathOpened: "assets/img/icon/account_circle_big.png",
            iconPathClosed: "assets/img/icon/account_circle_color.png",
            title: "Direktnachrichten",
            titleColor: "#000000",
        },
    ];

    user: User = new User();
    constructor(
        public navigationService: NavigationService,
        private itemStateService: ItemStateService
    ) {}

    /**
     * Initializes the component.
     * This method is called after the component has been created and initialized.
     * It is a lifecycle hook that is called by Angular.
     */
    async ngOnInit() {
        this.getItemValues("users", this.authService.activeUserId);
    }

    /**
     * Retrieves the values of a specific item from a collection in Firestore.
     * @param collection - The name of the collection in Firestore.
     * @param itemID - The ID of the item to retrieve.
     */
    getItemValues(collection: string, itemID: string) {
        this.firestore.getSingleItemData(collection, itemID, () => {
            this.user = new User(this.firestore.user);
        });
    }

    /**
     * Checks if the current user is a member of the channel.
     * @param members - An array of member IDs.
     * @returns A boolean indicating whether the current user is a member of the channel.
     */
    isChannelMember(members: string[]): boolean {
        return members.includes(this.authService.activeUserId);
    }

    /**
     * Handles the event when a panel is opened.
     * @param panel - The MatExpansionPanel that was opened.
     * @param index - The index of the panel in the panels array.
     */
    onPanelOpened(panel: MatExpansionPanel, index: number) {
        this.matchMedia.showSearchDropdown = false;
        this.panels[index].expanded = true;
        this.panels[index].arrowImagePath =
            "assets/img/icon/arrow_drop_down.png";
        this.panels[index].iconPath = this.panels[index].iconPathOpened;
        this.panels[index].titleColor = "#000000";
    }

    /**
     * Handles the event when a panel is closed.
     * @param panel - The MatExpansionPanel that was closed.
     * @param index - The index of the panel in the panels array.
     */
    onPanelClosed(panel: MatExpansionPanel, index: number) {
        this.matchMedia.showSearchDropdown = false;
        this.panels[index].expanded = false;
        this.panels[index].arrowImagePath =
            "assets/img/icon/arrow_drop_down_color.png";
        this.panels[index].iconPath = this.panels[index].iconPathClosed;
        this.panels[index].titleColor = "#535AF1";
    }

    /**
     * Handles the click event when the "Add" button is clicked.
     * Hides the search dropdown, stops the event propagation, and navigates to the add channel page.
     *
     * @param event - The click event.
     */
    onAddClick(event: MouseEvent): void {
        this.matchMedia.showSearchDropdown = false;
        event.stopPropagation();
        this.navigateToAddChannel();
    }

    /**
     * Navigates to the add channel page.
     * Hides the search dropdown, clears the channel name, and hides the thread.
     */
    navigateToAddChannel() {
        this.matchMedia.showSearchDropdown = false;
        this.matchMedia.channelName = "";
        this.matchMedia.showThread = false;
        this.navigationService.navigate(["/add-channel"]);
    }

    /**
     * Opens a channel and navigates to the specified path.
     *
     * @param event - The mouse event that triggered the channel opening.
     * @param path - The path to navigate to.
     * @param name - The name of the channel.
     */
    openChannel(event: MouseEvent, path: string, name: string) {
        name = name.replace(/^[#@]/, '');        
        this.matchMedia.loading = true;
        this.matchMedia.channelName = name;
        this.matchMedia.showThread = false;
        this.matchMedia.showSearchDropdown = false;
        this.firestore.conversation = "";
        const docRefId = (event.currentTarget as HTMLElement).id;
        this.itemStateService.setItemId(docRefId);
        this.router.navigate([path, docRefId]);
    }

    /**
     * Opens the new message page.
     */
    openNewMessage() {
        this.matchMedia.loading = true;
        this.router.navigateByUrl("/new-message");
    }
}
