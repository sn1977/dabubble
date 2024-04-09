import {Component} from '@angular/core';
import {DirectMessageOverlayComponent} from '../direct-message-overlay/direct-message-overlay.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-direct-message',
  standalone: true,
  imports: [],
  templateUrl: './direct-message.component.html',
  styleUrl: './direct-message.component.scss'
})
export class DirectMessageComponent {

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
  
  constructor(public dialog: MatDialog) {
  }

  openDirectMessageOverlay(): void {
    const dialogRef = this.dialog.open(DirectMessageOverlayComponent, {
      minWidth: '398px',
      minHeight: '600px',
      panelClass: 'custom-dialog-container',
    });
  }
}
