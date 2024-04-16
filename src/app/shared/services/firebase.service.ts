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
} from '@angular/fire/firestore';
import { User } from '../../../models/user.class';
import { Channel } from '../../../models/channel.class';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  firestore: Firestore = inject(Firestore);
  activeUser: any = [];
  user: User = new User();
  channel: Channel = new Channel();
  userList: any = [];
  channelList: any = [];

  unsubUsers;  
  unsubChannel;
  unsubSingleUser;

  constructor() {
    this.unsubUsers = this.subUserList();
    this.unsubChannel = this.subChannelList();
    this.unsubSingleUser = this.subSingleUser();
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
        this.channelList.push(this.setChannelObject(element.data(), element.id));
      });
    });
  }

  subSingleUser(){
    // ID muss noch aus dem localeStorage übergeben werden
    const docId = '9MacQRd4i2TX9J42mVLBGgVCsPp1'; // Die gewünschte Dokumenten-ID
    const docRef = doc(this.getUsersRef(), docId);
    this.activeUser = [];
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        this.activeUser = [];    
        const userData = doc.data();
        this.activeUser.push(userData);        
      } else {
        // Das Dokument existiert nicht
        console.log("Das Dokument mit der ID", docId, "existiert nicht.");
      }
    });
  }

  setUserObject(obj: any, id: string): any {
    return {
      id: id,
      avatar: obj.avatar,
      email: obj.email,
      name: obj.name,
      isOnline: obj.isOnline,
      provider: obj.provider,
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

  async updateUser(item: User, id: string, process: string) {
    
    //this.activeUser = [];
    //this.activeUser.push(this.setUserObject(item, id));        

    // TODO
    // - write uid to localeStorage
    // - get avatar-img from database and write into item.avatar

    await setDoc(doc(this.getUsersRef(), id), item.toJSON());
  } 

  getUsers(): User[]{
    return this.userList;
  }

  getChannel(): Channel[]{
    return this.channelList;
  }

  getSingleUser(): User[]{
    return this.activeUser;
  }

  async addChannel(item: Channel) {
    await addDoc(this.getChannelsRef(), item)
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

        if(collection === 'users'){
          this.user = new User(this.setUserObject(element.data(), element.id));
        }
        if(collection === 'channels'){
          this.channel = new Channel(this.setChannelObject(element.data(), element.id));
        }

        callback();
      }
    );
  }

  ngonDestroyy() {
    this.unsubUsers();
    this.unsubChannel();
    this.unsubSingleUser();
  }
}