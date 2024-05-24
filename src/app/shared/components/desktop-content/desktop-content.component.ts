import { Component, Input, inject } from '@angular/core';
import { MainContentComponent } from '../../../main-content/main-content.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterOutlet } from '@angular/router';
import { ThreadComponent } from "../../../main-content/thread/thread.component";
import { MatchMediaService } from '../../services/match-media.service';
@Component({
    selector: 'app-desktop-content',
    standalone: true,
    templateUrl: './desktop-content.component.html',
    styleUrl: './desktop-content.component.scss',
    imports: [
      MainContentComponent, 
      CommonModule, 
      MatCardModule, 
      RouterOutlet, 
      ThreadComponent
    ]
})
export class DesktopContentComponent {
  matchMedia = inject(MatchMediaService);

  isCollapsed = false;

  toggleDiv() {
    this.isCollapsed = !this.isCollapsed;
  }
}
