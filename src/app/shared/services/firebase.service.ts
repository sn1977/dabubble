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
  
  constructor() { }

  //
  getUsersRef() {
    return collection(this.firestore, 'users');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }


}
