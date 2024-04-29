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
  getDoc,
  updateDoc,
  getDocs,
  orderBy,
  serverTimestamp,
} from '@angular/fire/firestore';
import { User } from '../../../models/user.class';
import { Channel } from '../../../models/channel.class';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ChannelMessage } from '../../../models/channel-message.class';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  firestore: Firestore = inject(Firestore);
  router = inject(Router);
  activeUser: any = [];
  user: User = new User();
  channel: Channel = new Channel();
  userList: any = [];
  channelList: any = [];
  channelMessages: any = [];

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

  // subSingleUser(){
  //   // ID muss noch aus dem localeStorage übergeben werden
  //   const docId = '9MacQRd4i2TX9J42mVLBGgVCsPp1'; // Die gewünschte Dokumenten-ID
  //   const docRef = doc(this.getUsersRef(), docId);
  //   this.activeUser = [];
  //   return onSnapshot(docRef, (doc) => {
  //     if (doc.exists()) {
  //       this.activeUser = [];
  //       const userData = doc.data();
  //       this.activeUser.push(userData);
  //     } else {
  //       // Das Dokument existiert nicht
  //       console.log("Das Dokument mit der ID", docId, "existiert nicht.");
  //     }
  //   });
  // }

  setUserObject(obj: any, id: string): any {
    return {
      id: id,
      avatar: obj.avatar,
      email: obj.email,
      displayName: obj.displayName,
      isOnline: obj.isOnline,
      provider: obj.provider,
      selected:obj.selected,
    };
  }

  setChannelObject(obj: any, id: string): any {
    return {
      creator: obj.creator,
      description: obj.description,
      member: obj.member,
      id: id,
      name: obj.name,
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
    };
  }

  async updateUser(item: User, id: string) {
    await setDoc(doc(this.getUsersRef(), id), item.toJSON());
  }

  async updateChannel(docId: string, channelData: Channel){
    // console.log('ChannelId: ', docId);
    // stefan
    // console.log('ChannelData: ', channelData);
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

  async getAllChannelMessages(channelId: string) {
    const ref = collection(
      this.firestore,
      `channels/${channelId}/channelmessages`
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

  ngonDestroyy() {
    this.unsubUsers();
    this.unsubChannel();
  }
}
