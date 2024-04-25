import {Component, inject, Input, OnInit} from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomSheetComponent } from '../../../main-content/bottom-sheet/bottom-sheet.component';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { User } from '../../../../models/user.class';
import {Location, NgIf} from '@angular/common';
import {HeaderStateService} from '../../services/header-state.service';

@Component({
  selector: 'app-header-mobile',
  standalone: true,
  imports: [BottomSheetComponent, NgIf],
  templateUrl: './header-mobile.component.html',
  styleUrl: './header-mobile.component.scss',
})
export class HeaderMobileComponent implements OnInit {
  firestore = inject(FirebaseService);
  authService = inject(AuthService);
  user: User = new User();
  // alternativeHeader: boolean | undefined;
  @Input() alternativeHeader: boolean = false;

  // @Input() mode: 'default' | 'custom' = 'default';
  // @Input() backButtonImage: string = 'assets/img/back-button.svg'; // Standardbild für den Zurück-Button
  hoverBack: any;


  constructor(private _bottomSheet: MatBottomSheet, private headerStateService: HeaderStateService, private _location: Location) {}

  async ngOnInit(): Promise<void> {
    await this.waitForUserData();
    this.test();

    this.headerStateService.alternativeHeader$.subscribe(value => {
      this.alternativeHeader = value;
    });
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

  onBack(): void {
    // this.router.navigate(['/previous-page']);
    console.log('ZURÜCK!!!!!!');
    this._location.back();
    this.headerStateService.setAlternativeHeader(false);
  }
}
