import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
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
  getDoc,
  limit,
  DocumentReference,
} from '@angular/fire/firestore';
import { User } from '../../../models/user.class';
import { Channel } from '../../../models/channel.class';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ChannelMessage } from '../../../models/channel-message.class';
import { DirectMessage } from '../../../models/direct-message.class';
import { MatchMediaService } from './match-media.service';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  firestore: Firestore = inject(Firestore);
  router = inject(Router);
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

  unsubUsers;
  unsubChannel;

  constructor() {
    this.unsubUsers = this.subUserList();
    this.unsubChannel = this.subChannelList();
  }

  getUsersRef() {
    return collection(this.firestore, 'users');
  }

  getChannelsRef() {
    return collection(this.firestore, 'channels');
  }

  getDirectMessageRef() {
    return collection(this.firestore, 'messages');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }

  subUserList() {
    return onSnapshot(
      query(this.getUsersRef(), orderBy('displayName')),
      (list) => {
        this.userList = [];
        list.forEach((element) => {
          this.userList.push(this.setUserObject(element.data(), element.id));
        });
      }
    );
  }

  subChannelList() {
    return onSnapshot(query(this.getChannelsRef(), orderBy('name')), (list) => {
      this.channelList = [];
      list.forEach((element) => {
        this.channelList.push(
          this.setChannelObject(element.data(), element.id)
        );
      });
    });
  }

  setUserObject(obj: any, id: string): any {
    return {
      id: id,
      avatar: obj.avatar,
      email: obj.email,
      displayName: obj.displayName,
      isOnline: obj.isOnline,
      provider: obj.provider,
      selected: obj.selected,
      count: obj.count,
      newMessage: obj.newMessage,
    };
  }

  setChannelObject(obj: any, id: string): any {
    return {
      creator: obj.creator,
      description: obj.description,
      member: obj.member,
      id: id,
      name: obj.name,
      count: obj.count,
      newMessage: obj.newMessage,
      allMembers: obj.allMembers,
    };
  }

  setChannelMessageObject(obj: any, id: string): any {
    return {
      messageId: id,
      channelId: obj.channelId,
      creator: obj.creator,
      createdAt: obj.createdAt,
      text: obj.text,
      reactions: obj.reactions,
      attachment: obj.attachment,
    };
  }

  setMessageObject(obj: any, id: string): any {
    return {
      id: id,
      sender: obj.sender,
      recipient: obj.recipient,
    };
  }

  async updateUser(item: User, id: string) {
    await setDoc(doc(this.getUsersRef(), id), item.toJSON());
  }

  async updateChannel(docId: string, channelData: Channel) {
    if (docId) {
      let docRef = doc(this.getChannelsRef(), docId);
      await updateDoc(docRef, channelData.toJSON()).catch((err) => {
        console.log(err);
      });
    }
  }

  async updateChannelMessage(
    docId: string,
    messageId: string,
    channelData: ChannelMessage
  ) {
    if (docId) {
      let docRef = doc(
        this.getChannelsRef(),
        `${docId}/channelmessages/${messageId}`
      );
      await updateDoc(docRef, channelData.toJSON()).catch((err) => {
        console.log(err);
      });
    }
  }

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

  getUsers(): User[] {
    return this.userList;
  }

  getChannel(): Channel[] {
    return this.channelList;
  }

  getSingleUser(): User[] {
    return this.activeUser;
  }

  async addChannel(item: Channel) {
    if (typeof item.creator === 'undefined') {
      console.error('Fehler: Creator ist undefined.');
      return;
    }

    await addDoc(this.getChannelsRef(), item.toJSON())
      .catch((err) => {
        console.error(err);
      })
      .then((docRef) => {
        console.log('Document written with ID: ', docRef?.id);
        this.router.navigate(['/new-channel/' + docRef?.id]);
      });
  }

  async addChannelMessage(message: ChannelMessage, docRef: string) {
    await addDoc(collection(this.firestore, docRef), message.toJSON())
      .catch((err) => {
        console.error(err);
      })
      .then((docRef) => {
        console.log('Document written with ID: ', docRef?.id);

        if (!this.matchMedia.showThread) {
          this.matchMedia.scrollToBottom = true;
        } else {
          this.matchMedia.scrollToBottomThread = true;
        }
      });
  }

  private singleItemUnsubscribe: Unsubscribe | undefined;
  private singleMessageUnsubscribe: Unsubscribe | undefined;

  unsubscribeSingleUserData() {
    if (this.singleItemUnsubscribe) {
      this.singleItemUnsubscribe();
    }
  }

  unsubscribeSingleMessageData() {
    if (this.singleMessageUnsubscribe) {
      this.singleMessageUnsubscribe();
    }
  }

  getSingleItemData(colId: string, docId: string, callback: () => void) {
    let collection = colId === 'channels' ? 'channels' : 'users';

    this.singleItemUnsubscribe = onSnapshot(
      this.getSingleDocRef(collection, docId),
      (element) => {
        if (collection === 'users') {
          this.user = new User(this.setUserObject(element.data(), element.id));
        }
        if (collection === 'channels') {
          this.channel = new Channel(
            this.setChannelObject(element.data(), element.id)
          );
        }

        callback();
      }
    );
  }

  async getSingleMessageData(
    colId: string,
    docId: string,
    callback: () => void
  ) {
    this.singleMessageUnsubscribe = onSnapshot(
      this.getSingleDocRef(colId, docId),
      (element) => {
        const data = this.setChannelMessageObject(element.data(), element.id);
        this.channelMessage = new ChannelMessage(data);
        callback();
      }
    );
  }

  getAllChannelMessages(
    channelId: string,
    colID: string,
    subcollection: string
  ): Unsubscribe {
    const ref = collection(
      this.firestore,
      `${colID}/${channelId}/${subcollection}`
    );
    const querySnapshot = query(ref, orderBy('createdAt'));

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
        console.error('Error fetching snapshot: ', error);
      }
    );

    return unsubscribe;
  }

  getAllChannelThreads(channelId: string, subcollection: string): Unsubscribe {
    const ref = collection(
      this.firestore,
      `channels/${channelId}/${subcollection}`
    );
    const querySnapshot = query(ref, orderBy('createdAt'));

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
        console.error('Error fetching snapshot: ', error);
      }
    );

    return unsubscribe;
  }

  async getDirectMessages(sender: string, recipient: string): Promise<void> {
    try {
      const directMessageRef = this.getDirectMessageRef();

      const query1 = getDocs(
        query(
          directMessageRef,
          where('sender', '==', sender),
          where('recipient', '==', recipient)
        )
      );

      const query2 = getDocs(
        query(
          directMessageRef,
          where('sender', '==', recipient),
          where('recipient', '==', sender)
        )
      );

      const [querySnapshot1, querySnapshot2] = await Promise.all([
        query1,
        query2,
      ]);

      const combinedResults = [...querySnapshot1.docs, ...querySnapshot2.docs];

      combinedResults.forEach((doc) => {
        this.conversation = doc.id;
      });

      if (combinedResults.length === 0) {
        await this.createDirectMessage(sender, recipient);
      }
    } catch (error) {
      console.error('Error getting direct messages:', error);
    }
  }

  async createDirectMessage(sender: string, recipient: string): Promise<void> {
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
      console.error('Error creating direct message:', err);
    }
  }

  ngonDestroyy() {
    this.unsubUsers();
    this.unsubChannel();
  }

  async getEmojiReactions(
    channelId: string,
    messageId: string | undefined
  ): Promise<any> {
    if (!messageId) {
      console.log('messageId is undefined');
      return [];
    }

    const docRef = doc(
      this.firestore,
      `channels/${channelId}/messages`,
      messageId
    );
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists() || !docSnap.data()) {
      console.log('No such document!');
      return [];
    }

    return docSnap.data()['reactions'];
  }

  async updateEmojiReactions(
    channelId: string,
    messageId: string,
    user: string,
    emoji: string
  ) {
    const messageRef = doc(
      this.firestore,
      `channels/${channelId}/messages`,
      messageId
    );
    console.log(messageRef);
  }

  async getThreadData(
    channelId: string,
    messageId: string | undefined
  ): Promise<{ threadCount: number; newestCreatedAt: any }> {
    return new Promise((resolve, reject) => {
      const threadsRef = collection(
        this.getChannelsRef(),
        `${channelId}/channelmessages/${messageId}/threads`
      );

      onSnapshot(
        threadsRef,
        (snapshot) => {
          const threadCount = snapshot.size;
          const newestThreadQuery = query(
            threadsRef,
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          onSnapshot(
            newestThreadQuery,
            (newestSnapshot) => {
              let newestCreatedAt = null;
              if (!newestSnapshot.empty) {
                const newestThreadDoc = newestSnapshot.docs[0];
                newestCreatedAt = newestThreadDoc.data()['createdAt'];
              }
              resolve({ threadCount, newestCreatedAt });
            },
            reject
          );
        },
        reject
      );
    });
  }

  async updateMessage(
    colId: string,
    docId: string,
    id: string,
    updateMessage: string,
    isThread: boolean
  ) {
    let documentRef;

    if (isThread) {
      documentRef = doc(this.getSingleDocRef(colId, docId), id);
    } else {
      const collection = colId === 'channels' ? 'channels' : 'messages';
      const subcollection =
        collection === 'channels' ? 'channelmessages' : 'chat';

      documentRef = doc(
        this.getSingleDocRef(collection, docId),
        subcollection,
        id
      );
    }
  }
}
