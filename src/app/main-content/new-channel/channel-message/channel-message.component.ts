import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { ChannelMessage } from '../../../../models/channel-message.class';
import { User } from '../../../../models/user.class';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EmojiPickerComponent } from '../../../shared/components/emoji-picker/emoji-picker.component';
import { AuthService } from '../../../shared/services/auth.service';
import { FormsModule } from '@angular/forms';
import { DateFormatService } from '../../../shared/services/date-format.service';

@Component({
  selector: 'app-channel-message',
  standalone: true,
  templateUrl: './channel-message.component.html',
  styleUrl: './channel-message.component.scss',
  imports: [CommonModule, MatDialogModule, EmojiPickerComponent, FormsModule],
})
export class ChannelMessageComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    public dateFormatService: DateFormatService
  ) {
    this.getCurrentDay();
  }

  firestore = inject(FirebaseService);
  authService = inject(AuthService);
  @Input() channelMessage!: ChannelMessage;
  @Input() index!: number;
  user: User = new User();
  edit: boolean = false;
  hovered: boolean = false;
  isMessageFromYou: boolean = false;
  previousDate?: any;
  currentDate: any;
  messageDate: any;
  isToday: boolean = false;

  getCurrentDay() {
    const date = new Date();
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let year = date.getFullYear().toString();
    this.currentDate = year + month + day;
  }

  ngOnInit(): void {
    this.getItemValuesProfile('users', this.channelMessage.creator);
    this.messageDate = this.channelMessage.createdAt;
    this.isMessageFromYou =
      this.authService.activeUserAccount.uid !== this.channelMessage.creator
        ? false
        : true;
  }

  getItemValuesProfile(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.user = new User(this.firestore.user);
    });
  }  
  
  formatDate(timestamp: any) {
    const date = new Date(timestamp.seconds * 1000);
    const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, '');
    return formattedDate;
  }  
  
  deleteHovered() {
    if (!this.edit) {
      this.hovered = false;
    }
  }

  openEmojiPicker(): void {
    const dialogRef = this.dialog.open(EmojiPickerComponent, {
      width: '300px',
      height: '300px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Emoji ausgewählt:', result);
        // Führe hier Aktionen mit dem ausgewählten Emoji aus, z.B. Anzeigen in der UI
      }
    });
  } 
}
