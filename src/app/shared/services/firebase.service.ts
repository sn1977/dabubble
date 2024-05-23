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
  or,
  getDocs,
  and,
  increment,
  getDoc,
  limit,
} from '@angular/fire/firestore';
import { User } from '../../../models/user.class';
import { Channel } from '../../../models/channel.class';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ChannelMessage } from '../../../models/channel-message.class';
import { DirectMessage } from '../../../models/direct-message.class';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  collection(arg0: string) {
    throw new Error('Method not implemented.');
  }
  firestore: Firestore = inject(Firestore);
  router = inject(Router);
  activeUser: any = [];
  user: User = new User();
  channel: Channel = new Channel();
  userList: any = [];
  channelList: any = [];
  channelMessages: any = [];
  channelThreads: any = [];
  message: DirectMessage = new DirectMessage();
  conversation: string | undefined;
  channelMessagesCount: number = 0;

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
    return onSnapshot(this.getUsersRef(), (list) => {
      this.userList = [];
      list.forEach((element) => {
        this.userList.push(this.setUserObject(element.data(), element.id));
      });
    });
  }

  subChannelList() {
    return onSnapshot(this.getChannelsRef(), (list) => {
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
    console.log(`${docId}/channelmessages/${messageId}`);

    if (docId) {
      let docRef = doc(
        this.getChannelsRef(),
        `${docId}/channelmessages/${messageId}`
      );
      await updateDoc(docRef, channelData.toJSON()).catch((err) => {
        console.log(err);
      });
    }
    // console.log(docId, channelData);
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

      // Cleanup on unsubscribe
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

      // Cleanup on unsubscribe
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
      return; // Beendet die Funktion vorzeitig, wenn 'creator' undefined ist
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
      });
  }

  private singleItemUnsubscribe: Unsubscribe | undefined;

  unsubscribeSingleUserData() {
    if (this.singleItemUnsubscribe) {
      this.singleItemUnsubscribe();
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

  getSingleMessageData(colId: string, docId: string, callback: () => void) {
    
  console.log(colId, docId);
  
    // this.singleItemUnsubscribe = onSnapshot(
    //   this.getSingleDocRef(colId, docId),
    //   (element) => {
    //     if (collection === 'users') {
    //       this.user = new User(this.setUserObject(element.data(), element.id));
    //     }
    //     if (collection === 'channels') {
    //       this.channel = new Channel(
    //         this.setMessageObject(element.data(), element.id)
    //       );
    //     }

    //     callback();
    //   }
    // );
  }

  async getAllChannelMessages(
    channelId: string,
    colID: string,
    subcollection: string,    
  ) {
    
    const ref = collection(
        this.firestore,
        `${colID}/${channelId}/${subcollection}`
      );

    //console.log('Stefan: ', channelId, colID, subcollection, subID);
    //Stefan:  aqZmyWrJ9h8G3R2anLOj channels channelmessages


    const querySnapshot = query(ref, orderBy('createdAt'));

    const unsubscribe = onSnapshot(querySnapshot, (snapshot) => {
      this.channelMessages = [];
      snapshot.forEach((doc) => {
        this.channelMessages.push(
          this.setChannelMessageObject(doc.data(), doc.id)
        );
        // console.log(doc.data(), doc.id);
      });
    });
    return unsubscribe;
  }

  async getAllChannelThreads(channelId: string, subcollection: string) {
    const ref = collection(
      this.firestore,
      `channels/${channelId}/${subcollection}`
    );

    console.log(channelId);

    ///channels/aqZmyWrJ9h8G3R2anLOj/channelmessages/crCd8RlYYuAzQ92CnUjb/threads/S68akZjwGXCbQ0UwO77k

    // const querySnapshot = query(ref, orderBy('createdAt'));
    // const unsubscribe = onSnapshot(querySnapshot, (snapshot) => {
    //   this.channelThreads = [];
    //   snapshot.forEach((doc) => {
    //     this.channelThreads.push(
    //       this.setChannelMessageObject(doc.data(), doc.id)
    //     );
    //     // console.log(doc.data(), doc.id);
    //   });
    // });

    // console.log('Threads', this.channelThreads);

    // return unsubscribe;
  }

  async getDirectMessages(sender: string, recipient: string) {
    const querySnapshot = query(
      this.getDirectMessageRef(),
      where('sender', 'in', [sender, recipient]),
      where('recipient', 'in', [sender, recipient])
    );

    const querySnapshot1 = await getDocs(
      query(
        this.getDirectMessageRef(),
        where('sender', '==', sender),
        where('recipient', '==', recipient)
      )
    );

    const querySnapshot2 = await getDocs(
      query(
        this.getDirectMessageRef(),
        where('sender', '==', recipient),
        where('recipient', '==', sender)
      )
    );

    const combinedResults = querySnapshot1.docs.concat(querySnapshot2.docs);

    combinedResults.forEach((doc) => {
      this.conversation = doc.id;
    });

    if (combinedResults.length === 0) {
      await this.createDirectMessage(sender, recipient);
    }
  }

  async createDirectMessage(sender: string, recipient: string) {
    await addDoc(this.getDirectMessageRef(), {
      sender: sender,
      recipient: recipient,
    })
      .catch((err) => {
        console.error(err);
      })
      .then((docRef) => {
        // console.log('MessageChat written with ID: ', docRef?.id);
        this.conversation = docRef?.id;
      });
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
  //   const reactionKey = `reactions.${emoji}`; // Pfad zum spezifischen Emoji
  //
  //   // Verwendung von increment, um die Anzahl der Emojis zu erhöhen
  //   await updateDoc(messageRef, {
  //     [reactionKey]: increment(1)
  //   }).catch((error) => {
  //     console.error('Fehler beim Aktualisieren der Emoji-Reaktionen:', error);
  //   });
  //   console.log(channelId, messageId, user, emoji);
  // }

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

  async updateSingleMessageText(
    colId: string,
    docId: string,
    id: string,
    updateMessage: string
  ) {
    const collection = colId === 'channels' ? 'channels' : 'messages';
    const subcollection =
      collection === 'channels' ? 'channelmessages' : 'chat';

    const documentRef = doc(
      this.getSingleDocRef(collection, docId),
      subcollection,
      id
    );
    await updateDoc(documentRef, {
      text: updateMessage,
    });
  }
}
