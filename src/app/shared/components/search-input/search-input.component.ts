import { Component, EventEmitter, OnInit, Output, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatchMediaService } from "../../services/match-media.service";
import { CommonModule } from "@angular/common";
import { FirestoreService } from "../../services/firestore.service";
import { Router } from "@angular/router";

@Component({
    selector: "app-search-input",
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: "./search-input.component.html",
    styleUrl: "./search-input.component.scss",
})
export class SearchInputComponent implements OnInit {
    textData = { text: "" };
    inputHasValue = false;
    matchMedia = inject(MatchMediaService);
    isDesktop: boolean = false;
    firestore = inject(FirestoreService);
    placeholder: string = "";
    resultList: any[] = [];
    groupedData: { [key: string]: any[] } = {};
    router = inject(Router);
    @Output() search = new EventEmitter<string>();

    constructor() {
        this.isDesktop = this.matchMedia.checkIsDesktop();
    }

    /**
     * Initializes the component.
     * This method is called after the component has been created and initialized.
     * It is used to perform any initialization logic that relies on input properties being set.
     * @returns A promise that resolves when the initialization is complete.
     */
    async ngOnInit(): Promise<void> {
        this.firestore.globalSearch();
        this.setPlaceholderText();
    }

    /**
     * Sets the placeholder text based on the device type.
     * If the device is desktop, sets the placeholder to 'Benutzer, Kanäle & Nachrichten durchsuchen'.
     * Otherwise, sets the placeholder to 'Gehe zu...'.
     */
    setPlaceholderText() {
        if (this.isDesktop) {
            this.placeholder = "Benutzer, Kanäle & Nachrichten durchsuchen";
        } else {
            this.placeholder = "Gehe zu...";
        }
    }

    /**
     * Filters an array of entries based on a search input value.
     * @param array - The array of entries to filter.
     * @param searchInputValue - The search input value to match against the entries.
     * @returns An array of entries that match the search input value.
     */
    findeEintraegeMitWert(array: any[], searchInputValue: string) {
        const searchInputValueSmall = searchInputValue.toLowerCase();
        return array.filter((entry) =>
            this.matchEntry(entry.data, searchInputValueSmall)
        );
    }

    /**
     * Checks if the given data matches the search input value.
     * @param data - The data to be checked.
     * @param searchInputValueSmall - The search input value to match against.
     * @returns True if any of the fields in the data contain the search input value (case-insensitive), false otherwise.
     */
    matchEntry(data: any, searchInputValueSmall: string): boolean {
        const fields = ["text", "displayName", "email", "description", "name"];
        return fields.some((field) =>
            (data[field] || "").toLowerCase().includes(searchInputValueSmall)
        );
    }

    /**
     * Starts the search process with the given query.
     * @param query - The search query.
     * @returns A Promise that resolves when the search process is complete.
     */
    async startSearching(query: string) {
        this.groupedData = {};
        this.resultList = this.findeEintraegeMitWert(
            this.firestore.globalValuesArray,
            query
        );
        if (query) {
            this.matchMedia.showSearchDropdown = true;
        } else {
            this.matchMedia.showSearchDropdown = false;
        }
        await this.groupDataByType();
    }

    /**
     * Groups the data in the `resultList` array by type.
     */
    async groupDataByType() {
        this.resultList.forEach((item) => {
            const type = item.type;
            if (!this.groupedData[type]) {
                this.groupedData[type] = [];
            }
            this.groupedData[type].push(item);
        });
    }

    /**
     * Opens the selected result.
     *
     * @param type - The type of the selected result.
     * @param id - The ID of the selected result.
     * @param name - The name of the selected result.
     * @param thread - A boolean indicating whether the selected result is a thread.
     * @param ref - An optional reference to additional data.
     */
    openSelectedResult(
        type: string,
        id: string,
        name: string,
        thread: boolean,
        ref?: any
    ) {
        this.resetSearchState(name, thread);
        this.handleNavigation(type, id, thread, ref);
    }

    /**
     * Resets the search state.
     * @param name - The channel name.
     * @param thread - A boolean indicating whether to show the thread.
     */
    resetSearchState(name: string, thread: boolean) {
        this.matchMedia.showSearchDropdown = false;
        this.textData.text = "";
        this.matchMedia.loading = true;
        this.matchMedia.channelName = name;
        this.matchMedia.showThread = thread;
        this.firestore.conversation = "";
    }

    /**
     * Handles the navigation based on the provided parameters.
     * If `thread` is true and the device is not desktop, it prepares for thread view and navigates to '/thread'.
     * Otherwise, it navigates to the specified route based on the `type` and `id` parameters.
     * @param type - The type of the route.
     * @param id - The ID of the route.
     * @param thread - A boolean indicating whether to navigate to thread view.
     * @param ref - An optional reference parameter.
     */
    handleNavigation(type: string, id: string, thread: boolean, ref?: any) {
        if (!this.isDesktop && thread) {
            this.prepareForThreadView(id, ref);
            this.router.navigate(["/thread"]);
        } else {
            this.router.navigate([type, id]);
        }
    }

    /**
     * Prepares the component for displaying a thread view.
     *
     * @param id - The ID of the channel.
     * @param ref - The reference string.
     */
    prepareForThreadView(id: string, ref: string) {
        this.matchMedia.showThread = false;
        this.matchMedia.hideReactionIcons = true;
        this.matchMedia.channelId = id;
        const messageId = ref.split("channelmessages/")[1].split("/")[0];
        this.matchMedia.subID = messageId;
        this.matchMedia.collectionType = ref.includes("direct-message")
            ? "messages"
            : "channels";
    }

    /**
     * Retrieves the channel name by its ID.
     * @param id - The ID of the channel.
     * @returns The name of the channel if found, otherwise undefined.
     */
    getChannelNameById(id: string): string | undefined {
        const channel = this.firestore.channelList.find(
            (channel: { id: string }) => channel.id === id
        );
        return channel ? channel.name : undefined;
    }

    /**
     * Retrieves the username by the given user ID.
     * @param id - The ID of the user.
     * @returns The username associated with the given ID, or undefined if no user is found.
     */
    getUserNameById(id: string): string | undefined {
        const user = this.firestore.userList.find(
            (user: { id: string }) => user.id === id
        );
        return user ? user.displayName : undefined;
    }
}
