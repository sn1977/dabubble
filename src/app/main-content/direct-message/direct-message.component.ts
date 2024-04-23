import {Component, inject, OnInit} from '@angular/core';
import {DirectMessageOverlayComponent} from '../direct-message-overlay/direct-message-overlay.component';
import {MatDialog} from '@angular/material/dialog';
import {NavigationService} from '../../shared/services/navigation.service';
import {BottomSheetComponent} from '../bottom-sheet/bottom-sheet.component';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {FirebaseService} from '../../shared/services/firebase.service';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from '../../../models/user.class';
import { AuthService } from '../../shared/services/auth.service';
import { Channel } from '../../../models/channel.class';

@Component({
  selector: 'app-direct-message',
  standalone: true,
  imports: [],
  templateUrl: './direct-message.component.html',
  styleUrl: './direct-message.component.scss'
})
export class DirectMessageComponent implements OnInit {
  firestore = inject(FirebaseService);
  router = inject(Router);
  itemID: any = '';
  user: User = new User();
  channel: Channel = new Channel();
  authService = inject(AuthService);

  constructor(
    public dialog: MatDialog,
    private navigationService: NavigationService,
    private _bottomSheet: MatBottomSheet,
    private route: ActivatedRoute) {
  }

  async ngOnInit(): Promise<void> {
    await this.waitForUserData();
    this.test();

    this.route.paramMap.subscribe((paramMap) => {
      this.itemID = paramMap.get('id');
      this.getItemValues('users', this.itemID);
    });

    this.route.paramMap.subscribe((paramMap) => {
      this.itemID = paramMap.get('id');
      this.getItemValues('channels', this.itemID);
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
    console.log(id); // Stelle sicher, dass id definiert ist, bevor du darauf zugreifst
    this.getItemValuesProfile('users', id);
  }

  toggleOverlay(overlayId: string): void {
    const currentOverlay = document.querySelector('.overlay[style="display: block;"]') as HTMLElement;
    const newOverlay = document.getElementById(overlayId);

    if (currentOverlay && currentOverlay.id !== overlayId) {
      // Schließe das aktuelle Overlay, wenn ein anderes Overlay geöffnet ist
      currentOverlay.style.display = "none";
    }

    if (newOverlay) {
      newOverlay.style.display = newOverlay.style.display === "none" ? "block" : "none";
    }
  }

  closeOverlay(overlayId: string): void {
    const overlay = document.getElementById(overlayId) as HTMLElement;
    if (overlay) {
      overlay.style.display = "none";
    }
  }

  openDirectMessageOverlay(): void {
    const dialogRef = this.dialog.open(DirectMessageOverlayComponent, {
      minWidth: '398px',
      minHeight: '600px',
      panelClass: 'custom-dialog-container',
      data: { user: this.user,
        itemId: this.itemID } // Übergeben des User-Objekts an den Dialog
    });
  }

  goBack(): void {
    this.navigationService.goBack();
  }

  openBottomSheet(): void {
    this._bottomSheet.open(BottomSheetComponent);
  }

  getItemValues(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.user = new User(this.firestore.user);
    });
  }

  getItemValuesChannel(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.channel = new Channel(this.firestore.channel);
    });
  }

  getItemValuesProfile(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.user = new User(this.firestore.user);
      console.log('Avatar: ' + this.user.avatar);
      console.log(this.user.displayName);
      
    });
  }
}
