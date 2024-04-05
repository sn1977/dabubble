import { Component } from '@angular/core';

@Component({
  selector: 'app-new-channel',
  standalone: true,
  imports: [],
  templateUrl: './new-channel.component.html',
  styleUrl: './new-channel.component.scss'
})
export class NewChannelComponent {

 openOverlay() {
    const overlay = document.getElementById("overlay");
    if (overlay) {
      overlay.style.display = "block";
    }
  }

  closeOverlay() {
    const overlay = document.getElementById("overlay");
    if (overlay && overlay.style.display === "block") {
        overlay.style.display = "none";
    }
}
}

