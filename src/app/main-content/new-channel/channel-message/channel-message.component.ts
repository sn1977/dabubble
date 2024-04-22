import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FirestoreTimestampPipe } from "../../../pipes/firestore-timestamp.pipe";

@Component({
    selector: 'app-channel-message',
    standalone: true,
    templateUrl: './channel-message.component.html',
    styleUrl: './channel-message.component.scss',
    imports: [CommonModule, FirestoreTimestampPipe]
})
export class ChannelMessageComponent {
  @Input() channelMessage!: any;



}
