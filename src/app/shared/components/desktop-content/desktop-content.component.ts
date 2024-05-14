import {Component, Input} from '@angular/core';
import { MainContentComponent } from "../../../main-content/main-content.component";
import { CommonModule } from '@angular/common';
import {MatCardModule} from '@angular/material/card';
// import {ConversationComponent} from '../conversation/conversation.component';
// import {NewChannelComponent} from '../../../main-content/new-channel/new-channel.component';
// import {NewMessageComponent} from '../../../main-content/new-message/new-message.component';
import { RouterOutlet } from '@angular/router';
@Component({
    selector: 'app-desktop-content',
    standalone: true,
    templateUrl: './desktop-content.component.html',
    styleUrl: './desktop-content.component.scss',
  imports: [
    MainContentComponent, 
    CommonModule, 
    MatCardModule,
    RouterOutlet ]
})
export class DesktopContentComponent {

}
