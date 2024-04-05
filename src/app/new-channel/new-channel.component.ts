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
    const overlay = document.getElementById(overlayId);
    if (overlay) {
        if (overlay.style.display === "block") {
            overlay.style.display = "none";
        } else {
            overlay.style.display = "block";
        }
    }
}

closeOverlay(overlayId: string): void {
    const overlay = document.getElementById(overlayId);
    if (overlay && overlay.style.display === "block") {
        overlay.style.display = "none";
    }
}
}

