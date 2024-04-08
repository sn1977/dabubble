import { Component } from '@angular/core';

@Component({
  selector: 'app-new-channel',
  standalone: true,
  imports: [],
  templateUrl: './new-channel.component.html',
  styleUrl: './new-channel.component.scss'
})
export class NewChannelComponent {

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
}

