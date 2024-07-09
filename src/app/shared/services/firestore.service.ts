import { Injectable, inject } from "@angular/core";
import {
    Firestore,
    collection,
    collectionGroup,
    doc,
    onSnapshot,
    addDoc,
    Unsubscribe,
    setDoc,
    where,
    query,
    updateDoc,
    orderBy,
    getDocs,
    DocumentReference,
    DocumentData,
    increment,
    serverTimestamp,
    collectionData,
} from "@angular/fire/firestore";
import { User } from "../../../models/user.class";
import { Channel } from "../../../models/channel.class";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { ChannelMessage } from "../../../models/channel-message.class";
import { DirectMessage } from "../../../models/direct-message.class";
import { MatchMediaService } from "./match-media.service";
import { map } from "rxjs/operators";
import { Auth } from "@angular/fire/auth";

@Injectable({
    providedIn: "root",
})
export class FirestoreService {
    firestore: Firestore = inject(Firestore);
    router = inject(Router);
    firebaseAuth = inject(Auth);
    activeUser: any = [];
    user: User = new User();
    channel: Channel = new Channel();
    channelMessage: ChannelMessage = new ChannelMessage();
    userList: any = [];
    channelList: any = [];
    channelMessages: any = [];
    channelThreads: any = [];
    message: DirectMessage = new DirectMessage();
    conversation: string | undefined;
    channelMessagesCount: number = 0;
    matchMedia = inject(MatchMediaService);
    globalValuesArray: any = [];

    unsubUsers;
    unsubChannel;

    constructor() {
        this.unsubUsers = this.subUserList();
        this.unsubChannel = this.subChannelList();
    }

    /**
     * Returns a reference to the 'users' collection in Firestore.
     *
     * @returns {CollectionReference<DocumentData>} A reference to the 'users' collection.
     */
    getUsersRef() {
        return collection(this.firestore, "users");
    }

    /**
     * Returns a reference to the 'channels' collection in Firestore.
     * @returns {CollectionReference<DocumentData>} A reference to the 'channels' collection.
     */
    getChannelsRef() {
        return collection(this.firestore, "channels");
    }

    /**
     * Retrieves a reference to the 'messages' collection in Firestore.
     *
     * @returns {CollectionReference<DocumentData>} A reference to the 'messages' collection.
     */
    getDirectMessageRef() {
        return collection(this.firestore, "messages");
    }

    /**
     * Retrieves all users from Firestore.
     *
     * @returns A promise that resolves to an array of User objects.
     */
    async getAllUsers(): Promise<User[]> {
        const usersSnapshot = await getDocs(
            query(this.getUsersRef(), orderBy("displayName"))
        );
        return usersSnapshot.docs.map((doc) =>
            this.setUserObject(doc.data(), doc.id)
        );
    }

    /**
     * Retrieves all channels from Firestore.
     *
     * @returns A promise that resolves to an array of Channel objects.
     */
    async getAllChannels(): Promise<Channel[]> {
        const channelsSnapshot = await getDocs(
            query(this.getChannelsRef(), orderBy("name"))
        );
        return channelsSnapshot.docs.map((doc) =>
            this.setChannelObject(doc.data(), doc.id)
        );
    }

    /**
     * Retrieves all messages from the Firestore database.
     *
     * @returns A Promise that resolves to an array of ChannelMessage objects.
     */
    async getAllMessages(): Promise<ChannelMessage[]> {
        const messagesSnapshot = await getDocs(
            query(this.getDirectMessageRef(), orderBy("createdAt"))
        );
        return messagesSnapshot.docs.map((doc) =>
            this.setChannelMessageObject(doc.data(), doc.id)
        );
    }

    /**
     * Retrieves a reference to a single document in a Firestore collection.
     *
     * @param colId - The ID of the collection containing the document.
     * @param docId - The ID of the document to retrieve.
     * @returns A reference to the specified document.
     */
    getSingleDocRef(colId: string, docId: string) {
        return doc(collection(this.firestore, colId), docId);
    }

    /**
     * Subscribes to the user list in Firestore and updates the `userList` property.
     * The user list is ordered by the 'displayName' field.
     *
     * @returns A function to unsubscribe from the Firestore subscription.
     */
    subUserList() {
        return onSnapshot(
            query(this.getUsersRef(), orderBy("displayName")),
            (list) => {
                this.userList = [];
                list.forEach((element) => {
                    this.userList.push(
                        this.setUserObject(element.data(), element.id)
                    );
                });
            }
        );
    }

    /**
     * Retrieves a list of sub-channels from Firestore and updates the `channelList` property.
     * @returns A function that can be used to unsubscribe from the Firestore snapshot listener.
     */
    subChannelList() {
        return onSnapshot(
            query(this.getChannelsRef(), orderBy("name")),
            (list) => {
                this.channelList = [];
                list.forEach((element) => {
                    this.channelList.push(
                        this.setChannelObject(element.data(), element.id)
                    );
                });
            }
        );
    }

    /**
     * Sets the user object with the provided properties.
     *
     * @param obj - The object containing the user properties.
     * @param id - The ID of the user.
     * @returns The user object with the provided properties.
     */
    setUserObject(obj: any, id: string): any {
        return {
            id: id,
            avatar: obj.avatar,
            email: obj.email,
            displayName: obj.displayName,
            isOnline: obj.isOnline,
            provider: obj.provider,
        };
    }

    /**
     * Creates a channel object with the provided properties.
     *
     * @param obj - The object containing the properties of the channel.
     * @param id - The ID of the channel.
     * @returns The channel object with the specified properties.
     */
    setChannelObject(obj: any, id: string): any {
        return {
            creator: obj.creator,
            description: obj.description,
            member: obj.member,
            id: id,
            name: obj.name,
        };
    }

    /**
     * Creates a channel message object with the provided properties.
     * @param obj - The object containing the properties of the channel message.
     * @param id - The ID of the channel message.
     * @returns The channel message object.
     */
    setChannelMessageObject(obj: any, id: string): any {
        return {
            messageId: id,
            channelId: obj.channelId,
            creator: obj.creator,
            createdAt: obj.createdAt,
            text: obj.text,
            reactions: obj.reactions,
            attachment: obj.attachment,
            threads: obj.threads,
            recipient: obj.recipient,
        };
    }

    /**
     * Creates a message object with the given properties.
     *
     * @param obj - The object containing the message properties.
     * @param id - The ID of the message.
     * @returns The message object with the specified properties.
     */
    setMessageObject(obj: any, id: string): any {
        return {
            id: id,
            sender: obj.sender,
            recipient: obj.recipient,
        };
    }

    /**
     * Updates a user in the Firestore database.
     *
     * @param item - The updated user object.
     * @param id - The ID of the user to update.
     */
    async updateUser(item: User, id: string) {
        await setDoc(doc(this.getUsersRef(), id), item.toJSON());
        this.globalSearch();
    }

    /**
     * Updates a channel document in Firestore.
     *
     * @param docId - The ID of the document to update.
     * @param channelData - The updated channel data.
     */
    async updateChannel(docId: string, channelData: Channel) {
        if (docId) {
            let docRef = doc(this.getChannelsRef(), docId);
            await updateDoc(docRef, channelData.toJSON()).catch((err) => {
                console.log(err);
            });
            this.globalSearch();
        }
    }

    /**
     * Retrieves the list of channels from Firestore.
     * @returns An Observable that emits an array of Channel objects.
     */
    getChannels(): Observable<Channel[]> {
        return new Observable((observer) => {
            const unsubscribe = onSnapshot(
                this.getChannelsRef(),
                (snapshot) => {
                    let channels: Channel[] = [];
                    snapshot.forEach((doc) =>
                        channels.push(this.setChannelObject(doc.data(), doc.id))
                    );
                    observer.next(channels);
                },
                (err) => observer.error(err)
            );
            return { unsubscribe };
        });
    }

    /**
     * Retrieves a list of users from Firestore.
     * @returns An Observable that emits an array of User objects.
     */
    getUsers2(): Observable<User[]> {
        return new Observable((observer) => {
            const unsubscribe = onSnapshot(
                this.getUsersRef(),
                (snapshot) => {
                    let users: User[] = [];
                    snapshot.forEach((doc) =>
                        users.push(this.setUserObject(doc.data(), doc.id))
                    );
                    observer.next(users);
                },
                (err) => observer.error(err)
            );
            return { unsubscribe };
        });
    }

    /**
     * Retrieves the list of users.
     *
     * @returns An array of User objects.
     */
    getUsers(): User[] {
        return this.userList;
    }

    /**
     * Retrieves the channel list.
     * @returns An array of Channel objects representing the channel list.
     */
    getChannel(): Channel[] {
        return this.channelList;
    }

    /**
     * Retrieves the single user from the Firestore service.
     * @returns An array of User objects representing the single user.
     */
    getSingleUser(): User[] {
        return this.activeUser;
    }

    /**
     * Adds a channel to the Firestore database.
     *
     * @param item The channel to be added.
     */
    async addChannel(item: Channel) {
        if (typeof item.creator === "undefined") {
            console.error("Fehler: Creator ist undefined.");
            return;
        }

        await addDoc(this.getChannelsRef(), item.toJSON())
            .catch((err) => {
                console.error(err);
            })
            .then((docRef) => {
                console.log("Document written with ID: ", docRef?.id);
                this.globalSearch();
                this.router.navigate(["/channel/" + docRef?.id]);
            });
    }

    /**
     * Adds a channel message to the specified document reference in Firestore.
     *
     * @param message - The channel message to be added.
     * @param docRef - The document reference where the message will be added.
     * @param type - Optional. The type of the message.
     */
    async addChannelMessage(
        message: ChannelMessage,
        docRef: string,
        type?: string
    ) {
        await addDoc(collection(this.firestore, docRef), message.toJSON())
            .catch((err) => {
                console.error(err);
            })
            .then(async (docRef) => {
                console.log("Document written with ID: ", docRef?.id);
                this.matchMedia.scrollToBottom = true;
                if (type && type === "thread") {
                    this.matchMedia.scrollToBottomThread = true;
                    await this.updateThreadCounter();
                }
                this.globalSearch();
            });
    }

    private singleItemUnsubscribe: Unsubscribe | undefined;
    private singleMessageUnsubscribe: Unsubscribe | undefined;

    /**
     * Unsubscribes from the single user data.
     */
    unsubscribeSingleUserData() {
        if (this.singleItemUnsubscribe) {
            this.singleItemUnsubscribe();
        }
    }

    /**
     * Unsubscribes from the single message data.
     */
    unsubscribeSingleMessageData() {
        if (this.singleMessageUnsubscribe) {
            this.singleMessageUnsubscribe();
        }
    }

    /**
     * Retrieves data for a single item from Firestore.
     * @param colId - The ID of the collection to retrieve the item from.
     * @param docId - The ID of the document to retrieve.
     * @param callback - A callback function to be called after the data is retrieved.
     */
    getSingleItemData(colId: string, docId: string, callback: () => void) {
        let collection = colId === "channels" ? "channels" : "users";

        this.singleItemUnsubscribe = onSnapshot(
            this.getSingleDocRef(collection, docId),
            (element) => {
                if (collection === "users") {
                    this.user = new User(
                        this.setUserObject(element.data(), element.id)
                    );
                }
                if (collection === "channels") {
                    this.channel = new Channel(
                        this.setChannelObject(element.data(), element.id)
                    );
                }
                callback();
            }
        );
    }

    /**
     * Retrieves all channel messages from a specific subcollection in Firestore.
     *
     * @param channelId - The ID of the channel.
     * @param colID - The ID of the collection.
     * @param subcollection - The name of the subcollection.
     * @returns A Promise that resolves to an Unsubscribe function.
     */
    async getAllChannelMessages(
        channelId: string,
        colID: string,
        subcollection: string
    ): Promise<Unsubscribe> {
        const ref = collection(
            this.firestore,
            `${colID}/${channelId}/${subcollection}`
        );
        const querySnapshot = query(ref, orderBy("createdAt"));

        const unsubscribe = onSnapshot(
            querySnapshot,
            (snapshot) => {
                this.channelMessages = [];
                snapshot.forEach((doc) => {
                    this.channelMessages.push(
                        this.setChannelMessageObject(doc.data(), doc.id)
                    );
                });
            },
            (error) => {
                console.error("Error fetching snapshot: ", error);
            }
        );

        return unsubscribe;
    }

    /**
     * Retrieves all channel threads from Firestore.
     *
     * @param channelId - The ID of the channel.
     * @param colID - The ID of the collection.
     * @param subcollection - The name of the subcollection.
     * @returns A Promise that resolves to an Unsubscribe function.
     */
    async getAllChannelThreads(
        channelId: string,
        colID: string,
        subcollection: string
    ): Promise<Unsubscribe> {
        const ref = collection(
            this.firestore,
            `${colID}/${channelId}/${subcollection}`
        );
        const querySnapshot = query(ref, orderBy("createdAt"));

        const unsubscribe = onSnapshot(
            querySnapshot,
            (snapshot) => {
                this.channelThreads = [];
                snapshot.forEach((doc) => {
                    this.channelThreads.push(
                        this.setChannelMessageObject(doc.data(), doc.id)
                    );
                });
            },
            (error) => {
                console.error("Error fetching snapshot: ", error);
            }
        );

        return unsubscribe;
    }

    /**
     * Retrieves direct messages between two users.
     * If no direct messages exist, a new direct message is created.
     * @param sender - The sender of the direct messages.
     * @param recipient - The recipient of the direct messages.
     * @returns A Promise that resolves to void.
     */
    async getDirectMessages(sender: string, recipient: string): Promise<void> {
        try {
            const directMessageRef = this.getDirectMessageRef();

            const query1 = getDocs(
                query(
                    directMessageRef,
                    where("sender", "==", sender),
                    where("recipient", "==", recipient)
                )
            );

            const query2 = getDocs(
                query(
                    directMessageRef,
                    where("sender", "==", recipient),
                    where("recipient", "==", sender)
                )
            );

            const [querySnapshot1, querySnapshot2] = await Promise.all([
                query1,
                query2,
            ]);

            const combinedResults = [
                ...querySnapshot1.docs,
                ...querySnapshot2.docs,
            ];

            combinedResults.forEach((doc) => {
                this.conversation = doc.id;
            });

            if (combinedResults.length === 0) {
                await this.createDirectMessage(sender, recipient);
            }
        } catch (error) {
            console.error("Error getting direct messages:", error);
        }
    }

    /**
     * Creates a direct message between the sender and recipient.
     *
     * @param sender - The sender of the direct message.
     * @param recipient - The recipient of the direct message.
     * @returns A Promise that resolves with void when the direct message is created successfully.
     */
    async createDirectMessage(
        sender: string,
        recipient: string
    ): Promise<void> {
        try {
            const docRef: DocumentReference = await addDoc(
                this.getDirectMessageRef(),
                {
                    sender: sender,
                    recipient: recipient,
                }
            );
            this.conversation = docRef.id;
        } catch (err) {
            console.error("Error creating direct message:", err);
        }
    }

    /**
     * Cleans up resources and unsubscribes from observables when the component is destroyed.
     */
    ngonDestroyy() {
        this.unsubUsers();
        this.unsubChannel();
    }

    /**
     * Saves the message data to Firestore.
     *
     * @param colId - The ID of the collection.
     * @param docId - The ID of the document.
     * @param messageId - The ID of the message.
     * @param item - The data to be saved.
     */
    async saveMessageData(
        colId: string,
        docId: string,
        messageId: string,
        item: object
    ) {
        const messageDoc = docId + "/channelmessages/" + messageId;
        const docRef = this.getSingleDocRef(colId, messageDoc);
        await updateDoc(docRef, item).catch((err) => {
            console.log(err);
        });
        this.globalSearch();
    }

    /**
     * Updates the thread counter for a specific channel or direct message.
     * If the collection type is 'messages', it updates the thread counter for a direct message.
     * If the collection type is not 'messages', it updates the thread counter for a channel.
     */
    async updateThreadCounter() {
        let colID;
        if (this.matchMedia.collectionType === "messages") {
            colID = this.getDirectMessageRef();
        } else {
            colID = this.getChannelsRef();
        }

        const threadsRef = doc(
            colID,
            this.matchMedia.channelId +
                "/channelmessages/" +
                this.matchMedia.subID
        );

        await updateDoc(threadsRef, {
            threads: increment(1),
            timestampLastThread: serverTimestamp(),
        });
    }

    /**
     * Retrieves the data for a specific channel from Firestore.
     * @param channelId - The ID of the channel to retrieve data for.
     * @returns An Observable that emits the channel data whenever it changes.
     */
    getChannelData(channelId: string): Observable<DocumentData> {
        const docRef = this.getSingleDocRef("channels", channelId);

        return new Observable<DocumentData>((observer) => {
            const unsubscribe = onSnapshot(docRef, (snapshot) => {
                const data = snapshot.data();
                observer.next(data);
            });

            return () => unsubscribe();
        });
    }

    /**
     * Retrieves the data of a single message from Firestore.
     *
     * @param colId - The ID of the collection where the document is located.
     * @param docId - The ID of the document to retrieve.
     * @param callback - A callback function to be executed after the data is retrieved.
     */
    async getSingleMessageData(
        colId: string,
        docId: string,
        callback: () => void
    ) {
        this.singleMessageUnsubscribe = onSnapshot(
            this.getSingleDocRef(colId, docId),
            (element) => {
                const data = this.setChannelMessageObject(
                    element.data(),
                    element.id
                );
                this.channelMessage = new ChannelMessage(data);
                callback();
            }
        );
    }

    /**
     * Retrieves all channel names from Firestore.
     * @returns An Observable that emits an array of channel names.
     */
    getAllChannelNames() {
        const ref = this.getChannelsRef();
        return collectionData(query(ref), { idField: "id" }).pipe(
            map((channels) => channels.map((channel) => channel["name"]))
        );
    }

    /**
     * Performs a global search by adding channel messages, channels, and users to the global search array.
     * @returns {Promise<void>} A promise that resolves when the global search is complete.
     */
    async globalSearch() {
        this.globalValuesArray = [];
        await this.addChannelMessagesToGlobalSearch();
        await this.addChannelsToGlobalSearch();
        await this.addUsersToGlobalSearch();
    }

    /**
     * Adds channel messages to the global search.
     * Retrieves channel messages from Firestore and adds them to the global search array.
     */
    async addChannelMessagesToGlobalSearch() {
        const results = query(
            collectionGroup(this.firestore, "channelmessages"),
            where("creator", "==", this.firebaseAuth.currentUser!.uid),
            orderBy("createdAt")
        );

        const querySnapshot = await getDocs(results);
        querySnapshot.forEach((doc) => {
            let component = "";
            let type = "channelmessage";
            if (doc.ref.path.startsWith("channels")) {
                component = "channel";
            } else if (doc.ref.path.startsWith("messages")) {
                component = "direct-message";
            }

            const channelMessagesCount =
                doc.ref.path.split("channelmessages").length - 1;
            const thread = channelMessagesCount > 1;

            this.globalValuesArray.push({
                ref: doc.ref.path,
                type: type,
                component: component,
                data: doc.data(),
                thread: thread,
            });
        });
    }

    /**
     * Adds channels to the global search.
     */
    async addChannelsToGlobalSearch() {
        for (let i = 0; i < this.channelList.length; i++) {
            const element = this.channelList[i];
            this.globalValuesArray.push({
                ref: "channels/" + element.id,
                type: "channel",
                component: "channel",
                thread: false,
                data: element,
            });
        }
    }

    /**
     * Adds users to the global search.
     *
     * @remarks
     * This method iterates over the `userList` array and adds each user to the `globalValuesArray` with the specified properties.
     *
     * @returns void
     */
    async addUsersToGlobalSearch() {
        for (let i = 0; i < this.userList.length; i++) {
            const element = this.userList[i];
            this.globalValuesArray.push({
                ref: "users/" + element.id,
                type: "user",
                component: "direct-message",
                thread: false,
                data: element,
            });
        }
    }
}
