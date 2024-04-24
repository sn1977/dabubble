import { Component, inject, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomSheetComponent } from '../../../main-content/bottom-sheet/bottom-sheet.component';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { User } from '../../../../models/user.class';

@Component({
  selector: 'app-header-mobile',
  standalone: true,
  imports: [BottomSheetComponent],
  templateUrl: './header-mobile.component.html',
  styleUrl: './header-mobile.component.scss',
})
export class HeaderMobileComponent implements OnInit {
  firestore = inject(FirebaseService);
  authService = inject(AuthService);
  user: User = new User();

  constructor(private _bottomSheet: MatBottomSheet) {}

  async ngOnInit(): Promise<void> {
    await this.waitForUserData();
    this.test();
  }

  async waitForUserData(): Promise<void> {
    while (!this.authService.activeUserAccount) {
      await this.delay(100); // Wartezeit in Millisekunden, bevor erneut überprüft wird
    }
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  test() {
    let id = this.authService.activeUserAccount.uid;
    // console.log(id); // Stelle sicher, dass id definiert ist, bevor du darauf zugreifst
    this.getItemValues('users', id);
  }


  openBottomSheet(): void {
    const bottomSheetRef = this._bottomSheet.open(BottomSheetComponent, {
      data: { user: this.user } // Übergabe des Benutzerobjekts an die BottomSheet
    });

    bottomSheetRef.afterDismissed().subscribe(result => {
      console.log('Bottom Sheet closed', result);
      // Hier kannst du weitere Aktionen ausführen, nachdem die Bottom Sheet geschlossen wurde
    });
  }

  getItemValues(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.user = new User(this.firestore.user);
    });
  }
}
