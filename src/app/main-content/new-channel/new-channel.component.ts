import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Channel } from '../../../models/channel.class';
import { FirebaseService } from '../../shared/services/firebase.service';


@Component({
  selector: 'app-new-channel',
  standalone: true,
  imports: [RouterLink, BottomSheetComponent],
  templateUrl: './new-channel.component.html',
  styleUrl: './new-channel.component.scss'
})
export class NewChannelComponent {

  constructor(private _bottomSheet: MatBottomSheet){
    
  }

  firestore = inject(FirebaseService);
  router = inject(Router);
  itemID: any = '';
  channel: Channel = new Channel();

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

      openBottomSheet(): void {
        this._bottomSheet.open(BottomSheetComponent);
      }
}

