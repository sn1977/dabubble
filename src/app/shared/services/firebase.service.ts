import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  onSnapshot,
  addDoc,
  getDoc,
  Unsubscribe,
  updateDoc,
  setDoc,
} from '@angular/fire/firestore';
import { User } from '../../../models/user.class';
import { Channel } from '../../../models/channel.class';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  firestore: Firestore = inject(Firestore);
  user: User = new User();
  userList: any = [];

  unsubUsers;

  constructor() {
    this.unsubUsers = this.subUserList();
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
        this.userList.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  setNoteObject(obj: any, id: string): any {
    return {
      id: id,
      avatar: obj.avatar,
      email: obj.email,
      name: obj.name,
    };
  }
  
  async addUser(item: User, id: string) {
    await setDoc(doc(this.getUsersRef(), id), item.toJSON());
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

  ngonDestroyy() {
    this.unsubUsers();
  }
}
