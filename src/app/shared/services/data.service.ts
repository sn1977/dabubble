import { Injectable, inject } from "@angular/core";
import { Channel } from "../../../models/channel.class";
import { User } from "../../../models/user.class";
import { MatchMediaService } from "./match-media.service";
import { FirestoreService } from "./firestore.service";
import { AuthService } from "./auth.service";

@Injectable({
    providedIn: "root",
})
export class DataService {
    allChannels: Channel[] = [];
    channelMatches: any;
    allUsers: User[] = [];
    userMatches: any;
    allMessages: any[] = []; // Array to store all messages
    messageMatches: any;
    noUserFound: boolean = false;
    noChannelFound: boolean = false;
    noMessageFound: boolean = false;
    matchMedia = inject(MatchMediaService);
    firestore = inject(FirestoreService);
    authService = inject(AuthService);

    /**
     * Searches the workspace for the given query.
     * If the query is empty, it filters the data for an empty query.
     * Otherwise, it filters the channels, users, and messages based on the query.
     * Finally, it updates the flags indicating whether there are any search results.
     *
     * @param query - The search query.
     */
    async searchWorkspace(query: string) {
        if (query === "") {
            this.filterDataForEmptyQuery();
            return;
        }
        this.matchMedia.channelName = "";
        query = query.toLowerCase();
        this.filterChannels(query);
        this.filterUsers(query);
        this.filterMessages(query);
        this.updateNoResultsFlags();
    }

    /**
     * Filters the data for empty query.
     *
     * @remarks
     * This method filters the `channelList` based on the `activeUserId` from `authService`.
     * It assigns the filtered data to `channelMatches`, assigns `userList` to `userMatches`,
     * and assigns `allMessages` to `messageMatches`.
     */
    filterDataForEmptyQuery() {
        const filteredData = this.firestore.channelList.filter(
            (item: { member: string | string[] }) =>
                item.member.includes(this.authService.activeUserId)
        );
        this.channelMatches = filteredData;
        this.userMatches = this.firestore.userList;
        this.messageMatches = this.allMessages;
    }

    /**
     * Filters the channels based on the provided query.
     * @param query - The query string to filter the channels.
     */
    filterChannels(query: string) {
        this.channelMatches = this.allChannels
            .filter((channel) => channel.name.toLowerCase().includes(query))
            .map((channel) => ({ ...channel, type: "channel" }));
    }

    /**
     * Filters the users based on the given query.
     * @param query - The query string to filter the users.
     */
    filterUsers(query: string) {
        this.userMatches = this.allUsers
            .filter(
                (user) =>
                    user.displayName!.toLowerCase().includes(query) ||
                    user.email.toLowerCase().includes(query)
            )
            .map((user) => ({ ...user, type: "user" }));
    }

    filterMessages(query: string) {
        this.messageMatches = this.allMessages
            .filter((message) => message.text.toLowerCase().includes(query))
            .map((message) => ({ ...message, type: "message" }));
    }

    /**
     * Updates the flags indicating if there are no results found for users, channels, and messages.
     */
    updateNoResultsFlags() {
        this.noUserFound = this.userMatches.length === 0;
        this.noChannelFound = this.channelMatches.length === 0;
        this.noMessageFound = this.messageMatches.length === 0;
    }

    /**
     * Checks if the active user is a member of the channel.
     * @param members - An array of strings representing the channel members.
     * @returns A boolean value indicating whether the active user is a member of the channel.
     */
    isChannelMember(members: string[]): boolean {
        return members.includes(this.authService.activeUserAccount);
    }

    /**
     * Checks if the `searchValue` is partially contained in any of the channel names.
     * @param searchValue - The value to search for.
     * @returns `true` if the `searchValue` is partially contained in any channel name, `false` otherwise.
     */
    containsPartialChannelValue(searchValue: string) {
        if (this.channelMatches) {
            return this.channelMatches.some(
                (item: { name: string | string[] }) =>
                    item.name.includes(searchValue)
            );
        }
    }

    /**
     * Checks if the `searchValue` is partially contained in the `displayName` property of any user in `userMatches`.
     * @param searchValue - The value to search for.
     * @returns `true` if `searchValue` is partially contained in any user's `displayName`, `false` otherwise.
     */
    containsPartialUserValue(searchValue: string) {
        if (this.userMatches) {
            return this.userMatches.some(
                (item: { displayName: string | string[] }) =>
                    item.displayName.includes(searchValue)
            );
        }
    }

    /**
     * Checks if the `searchValue` is contained in any of the partial message texts.
     * @param searchValue - The value to search for.
     * @returns `true` if the `searchValue` is found in any of the partial message texts, `false` otherwise.
     */
    containsPartialMessageValue(searchValue: string) {
        if (this.messageMatches) {
            return this.messageMatches.some(
                (item: { text: string | string[] }) =>
                    item.text.includes(searchValue)
            );
        }
    }
}
