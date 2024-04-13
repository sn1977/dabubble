import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {BottomSheetComponent} from '../../../main-content/bottom-sheet/bottom-sheet.component';
import {Subscription} from 'rxjs';
import {AuthService} from '../../services/auth.service';

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

  constructor(private authService: AuthService, private _bottomSheet: MatBottomSheet) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userAvatarUrl = user.avatar || this.userAvatarUrl; // Verwende den Benutzeravatar, wenn vorhanden
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscription!.unsubscribe(); // Verhindere Memory Leaks
  }

  openBottomSheet(): void {
    this._bottomSheet.open(BottomSheetComponent);
  }
}
