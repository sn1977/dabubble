import {CommonModule} from '@angular/common';
import {Component, Input, OnInit, inject} from '@angular/core';
import {ChannelMessage} from '../../../../models/channel-message.class';
import {User} from '../../../../models/user.class';
import {FirebaseService} from '../../services/firebase.service';
import {MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {EmojiPickerComponent} from '../emoji-picker/emoji-picker.component';
import {AuthService} from '../../services/auth.service';
import {FormsModule} from '@angular/forms';
import {DateFormatService} from '../../services/date-format.service';
import {Channel} from '../../../../models/channel.class';
import { Router, RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { addDoc, collection } from '@angular/fire/firestore';

@Component({
  selector: 'app-conversation',
  standalone: true,
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.scss',
  imports: [CommonModule, MatDialogModule, EmojiPickerComponent, FormsModule, RouterLink],
})
export class ConversationComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    public dateFormatService: DateFormatService,
    private route: ActivatedRoute,
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
  emojiCharacter: string = '';
  isEmojiSelected: boolean = false;
  emojiReactions: { emoji: string, count: number }[] = [];
  contentCount: number = 0;
  channel: Channel = new Channel();
  itemID: any = '';

  channelData = {
    creator: this.channel.creator,
    description: this.channel.description,
    member: this.channel.member,
    name: this.channel.name,
    count: this.channel.count
    
  };

  addCountToChannelDocument(toggle: string) {
   
    if(this.channelData.name === ''){
      this.channelData.name = this.channel.name;
    }
    
    if(this.channelData.description === ''){
      this.channelData.description = this.channel.description;
    }

    if(this.channelData.member === ''){
      this.channelData.member = this.channel.member;
    }    

    const channel = new Channel({
      creator: this.channel.creator,
      description: this.channelData.description,
      member: this.channel.member,
      name: this.channelData.name,
      count: this.contentCount
    });
 
    this.firestore.updateChannel(this.itemID, channel);
    console.log('funkt', channel);
    
  }



  countContentElements(): void {
    const contentDivs = document.querySelectorAll('.content');
    this.contentCount = contentDivs.length;
    this.contentCount--;
    console.log('Anzahl der "content"-Elemente:', this.contentCount);
  }


  getCurrentDay() {
    const date = new Date();
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let year = date.getFullYear().toString();
    this.currentDate = year + month + day;
  }

  ngOnInit(): void {
    this.getItemValuesProfile('users', this.channelMessage.creator);
    this.countContentElements();
    
    this.messageDate = this.channelMessage.createdAt;
    this.isMessageFromYou =
      this.authService.activeUserAccount.uid === this.channelMessage.creator;

    

    this.route.paramMap.subscribe((paramMap) => {
      this.itemID = paramMap.get('id');
      console.log(this.itemID);
      
      this.getItemValues('channels', this.itemID);

      setTimeout(() => {
         this.addCountToChannelDocument(this.itemID);
      
      }, 1000)

     
      
     
    });
  }

  getItemValues(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.channel = new Channel(this.firestore.channel);
      console.log(this.channel);
      
      this.setOldChannelValues();
    });
    
  }

  setOldChannelValues(){
    this.channelData = {
      creator: this.channel.creator,
      description: this.channel.description,
      member: this.channel.member,
      name: this.channel.name,
      count: this.channel.count
    };
    console.log(this.channelData);
    
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

  openEmojiPicker(): void {
    const dialogRef = this.dialog.open(EmojiPickerComponent, {
      width: '400px',
      height: '300px',
    });

    dialogRef.componentInstance.emojiSelect.subscribe(selectedEmoji => {
      console.log('Empfangenes Emoji:', selectedEmoji);
      this.updateEmoji(selectedEmoji);
      this.addEmojiReaction(selectedEmoji);
      dialogRef.close();
    });
  }

  updateEmoji(selectedEmoji: string) {
    console.log('Update Emoji auf:', selectedEmoji);
    this.emojiCharacter = selectedEmoji;
  }

  addEmojiReaction(selectedEmoji: string) {
    const existingEmoji = this.emojiReactions.find(e => e.emoji === selectedEmoji);
    if (existingEmoji) {
      existingEmoji.count++;
    } else {
      this.emojiReactions.push({emoji: selectedEmoji, count: 1});
    }
    console.log('Emoji-Reaktionen:', this.emojiReactions);
  }
}
