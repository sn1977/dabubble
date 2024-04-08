import {Component, Inject} from '@angular/core';
import {DirectMessageOverlayComponent} from '../direct-message-overlay/direct-message-overlay.component';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-direct-message',
  standalone: true,
  imports: [],
  templateUrl: './direct-message.component.html',
  styleUrl: './direct-message.component.scss'
})
export class DirectMessageComponent {
  // constructor(public dialogRef: MatDialogRef<DirectMessageOverlayComponent>, public dialog: MatDialog) {}
  //
  // @Inject(MAT_DIALOG_DATA) public data: any
  //
  // onNoClick(): void {
  //   this.dialogRef.close();
  // }
  //
  // openDirectMessageOverlay(): void {
  //   const dialogRef = this.dialog.open(DirectMessageOverlayComponent, {
  //     minWidth: '398px',
  //     minHeight: '600px',
  //     panelClass: 'custom-dialog-container',
  //     // Weitere Konfigurationen nach Bedarf
  //   });
  //   // this.closeProfilCard();
  // }

  constructor(public dialog: MatDialog) {}

  openDirectMessageOverlay(): void {
    const dialogRef = this.dialog.open(DirectMessageOverlayComponent, {
      minWidth: '398px',
      minHeight: '600px',
      panelClass: 'custom-dialog-container',
      // Weitere Konfigurationen nach Bedarf
    });
    // this.closeProfilCard();
  }
}
