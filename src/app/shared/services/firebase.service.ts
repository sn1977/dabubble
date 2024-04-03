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
} from '@angular/fire/firestore';
import { User } from '../../../models/user.class';

@Injectable({
  providedIn: 'root'
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
      badPasswordCount: obj.badPasswordCount,
      email: obj.email,
      isActive: obj.isActive,
      isBlocked: obj.isBlocked,
      isOnline: obj.isOnline,
      name: obj.name,
      password: obj.password
    };
  }

  ngonDestroyy() {
    this.unsubUsers();
  }

}
