import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {BottomSheetComponent} from '../../../main-content/bottom-sheet/bottom-sheet.component';
import {Subscription} from 'rxjs';
import {AuthService} from '../../services/auth.service';
import {FirebaseService} from '../../services/firebase.service';
import {Auth} from '@angular/fire/auth';
import {User} from '../../../../models/user.class';
// import {collection, doc} from '@angular/fire/firestore';
// import {DataService} from '../../services/data.service';

@Component({
  selector: 'app-header-mobile',
  standalone: true,
  imports: [
    BottomSheetComponent
  ],
  templateUrl: './header-mobile.component.html',
  styleUrl: './header-mobile.component.scss'
})
// export class HeaderMobileComponent {
//   constructor(private _bottomSheet: MatBottomSheet) {}
//
//   openBottomSheet(): void {
//     this._bottomSheet.open(BottomSheetComponent);
//   }
// }

export class HeaderMobileComponent implements OnInit, OnDestroy {
  private authSubscription: Subscription | undefined;
  userAvatarUrl: string = 'assets/img/characters/character_FrederikBeck.svg'; // Standardavatar
  firestore = inject(FirebaseService);
  firebaseAuth = inject(Auth);
  loggedInUser = this.firebaseAuth.currentUser?.uid;
  user: User = new User();
  // message: string | undefined;

  constructor(private authService: AuthService, private _bottomSheet: MatBottomSheet) { //, private data: DataService
  }

  ngOnInit(): void {
    // console.log(this.authService.currentUserSig());
    console.log(this.firebaseAuth.currentUser?.displayName);
    console.log(this.firebaseAuth.currentUser?.uid);
    console.log(this.loggedInUser);

    // this.data.currentMessage.subscribe(message => this.message = message);

    if (this.loggedInUser) {
      this.getItemValues('users', this.loggedInUser);
    }

    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userAvatarUrl = this.user.avatar || this.userAvatarUrl; // Verwende den Benutzeravatar, wenn vorhanden
      }
    });

    this.firestore.subSingleUser();
    console.log(this.firestore.user);

    // this.authSubscription = this.authService.currentUser$.subscribe(user => {
    //   if (user && user.avatar) {
    //     this.userAvatarUrl = user.avatar; // Avatar des Benutzers aktualisieren
    //   } else {
    //     this.userAvatarUrl = 'assets/img/characters/character_FrederikBeck.svg'; // Standardavatar setzen
    //   }
    // });

  }


  ngOnDestroy(): void {
    this.authSubscription!.unsubscribe(); // Verhindere Memory Leaks
  }

  openBottomSheet(): void {
    this._bottomSheet.open(BottomSheetComponent);
  }

  getItemValues(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      // return
      // this.user = new User(this.firestore.user);
      // console.log('Avatar: ' + this.user.avatar);
    });
  }
}
