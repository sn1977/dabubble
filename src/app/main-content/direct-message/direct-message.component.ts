import {Component, inject, OnInit} from '@angular/core';
import {DirectMessageOverlayComponent} from '../direct-message-overlay/direct-message-overlay.component';
import {MatDialog} from '@angular/material/dialog';
import {NavigationService} from '../../shared/services/navigation.service';
import {BottomSheetComponent} from '../bottom-sheet/bottom-sheet.component';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {FirebaseService} from '../../shared/services/firebase.service';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from '../../../models/user.class';

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

  constructor(
    public dialog: MatDialog,
    private navigationService: NavigationService,
    private _bottomSheet: MatBottomSheet,
    private route: ActivatedRoute) {
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
      data: { user: this.user } // Übergeben des User-Objekts an den Dialog
    });
  }

  goBack(): void {
    this.navigationService.goBack();
  }

  openBottomSheet(): void {
    this._bottomSheet.open(BottomSheetComponent);
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      this.itemID = paramMap.get('id');
      this.getItemValues('users', this.itemID);
    });
  }

  getItemValues(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {      
      this.user = new User(this.firestore.user);
    });
  }
}
