import { Component, inject, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomSheetComponent } from '../../../main-content/bottom-sheet/bottom-sheet.component';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { Auth } from '@angular/fire/auth';
import { User } from '../../../../models/user.class';

@Component({
  selector: 'app-header-mobile',
  standalone: true,
  imports: [BottomSheetComponent],
  templateUrl: './header-mobile.component.html',
  styleUrl: './header-mobile.component.scss',
})
export class HeaderMobileComponent implements OnInit {
  userAvatarUrl: string = 'assets/img/characters/character_FrederikBeck.svg';
  firestore = inject(FirebaseService);
  firebaseAuth = inject(Auth);
  authService = inject(AuthService);
  user: User = new User();

  constructor(private _bottomSheet: MatBottomSheet) {}

  ngOnInit(): void {
    console.log(this.authService.user.email);
    this.test();
  }
  
   test() {
   

    setInterval(() => {

      if(this.authService.activeUserAccount){
        let id = this.authService.activeUserAccount.uid;
      console.log(id); // Stelle sicher, dass id definiert ist, bevor du darauf zugreifst
      this.getItemValues('users', id);
        
      } else {
        console.log('no active user');        
      }

    }, 2000);

  }

  openBottomSheet(): void {
    this._bottomSheet.open(BottomSheetComponent);
  }

  getItemValues(collection: string, itemID: string) {
    console.log('1');

    this.firestore.getSingleItemData(collection, itemID, () => {
      // return
      console.log('2');
      this.user = new User(this.firestore.user);
      console.log('Avatar: ' + this.user.avatar);
    });
  }
}