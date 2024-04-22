import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { FirestoreTimestampPipe } from '../../../pipes/firestore-timestamp.pipe';
import { ChannelMessage } from '../../../../models/channel-message.class';
import { User } from '../../../../models/user.class';
import { FirebaseService } from '../../../shared/services/firebase.service';

@Component({
  selector: 'app-channel-message',
  standalone: true,
  templateUrl: './channel-message.component.html',
  styleUrl: './channel-message.component.scss',
  imports: [CommonModule, FirestoreTimestampPipe],
})
export class ChannelMessageComponent implements OnInit {
  
  firestore = inject(FirebaseService);
  @Input() channelMessage!: ChannelMessage;
  @Input() index!: number;
  user: User = new User();
  edit = false;
  hovered = false;

  ngOnInit(): void {
    this.getItemValuesProfile('users', this.channelMessage.creator)
  }

  getItemValuesProfile(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.user = new User(this.firestore.user);      
    });
  }

  deleteHovered() {    
    if (!this.edit) {
      this.hovered = false;
    }
  }

}
