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
  and, increment,
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
      newMessage: obj.newMessage
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
      return {unsubscribe};
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
      return {unsubscribe};
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
    // Überprüfen, ob das Feld 'creator' einen gültigen Wert enthält
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

  async getAllChannelMessages(
    channelId: string,
    colID: string,
    subcollection: string
  ) {

    const ref = collection(
      this.firestore,
      `${colID}/${channelId}/${subcollection}`
    );

    const querySnapshot = query(ref, orderBy('createdAt'));
    const unsubscribe = onSnapshot(querySnapshot, (snapshot) => {
      this.channelMessages = [];
      snapshot.forEach((doc) => {
        this.channelMessages.push(
          this.setChannelMessageObject(doc.data(), doc.id)
        );
      });
    });
    return unsubscribe;
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




  async updateEmojiReactions(channelId: string, messageId: string, emoji: string) {
    const messageRef = doc(this.firestore, `channels/${channelId}/messages`, messageId);
    const reactionKey = `reactions.${emoji}`; // Pfad zum spezifischen Emoji

    // Verwendung von increment, um die Anzahl der Emojis zu erhöhen
    await updateDoc(messageRef, {
      [reactionKey]: increment(1)
    }).catch((error) => {
      console.error('Fehler beim Aktualisieren der Emoji-Reaktionen:', error);
    });
  }

}
