import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelMessage } from '../../../../models/channel-message.class';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-text-box',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './text-box.component.html',
  styleUrl: './text-box.component.scss'
})
export class TextBoxComponent {

  authService = inject(AuthService);
  firestore = inject(FirebaseService);
  
  @Input() textBoxData: any;

  add_hovered: boolean = false;
  smile_hovered: boolean = false;
  email_hovered: boolean = false;
  send_hovered: boolean = false;

  deleteHovered() {
    this.add_hovered = false;
    this.smile_hovered = false;
    this.email_hovered = false;
    this.send_hovered = false;
  }

  onSubmit(){    
    const message = new ChannelMessage({
      creator: this.authService.activeUserId,
      text: this.textBoxData.messageText,
      channelId: this.textBoxData.channelId,
      createdAt: this.textBoxData.createdAt,
      reactions: this.textBoxData.reactions,
    });
    
    // console.log(message);

    // 2. Funktion im Firestore aufrufen (1. textBoxData, 2. collection)
    this.firestore.addChannelMessage(message, 'channels/9KJYLfxx07Wn5rbEupdA/channelmessages');

    // 3. inhalte aktualisieren und nach unten scrollen
    // muss aber in 
    
  }

}
