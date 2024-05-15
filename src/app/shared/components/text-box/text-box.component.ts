import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelMessage } from '../../../../models/channel-message.class';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { ActivatedRoute } from '@angular/router';
import { UploadService } from '../../services/upload.service';
import { serverTimestamp } from '@angular/fire/firestore';
@Component({
  selector: 'app-text-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './text-box.component.html',
  styleUrl: './text-box.component.scss',
})
export class TextBoxComponent {
  authService = inject(AuthService);
  firestore = inject(FirebaseService);
  reactions = ['wave', 'rocket'];
  selectedFiles: FileList | undefined;
  filedate: number | undefined;
  errorMessage: string | null = null;

  @Input() textBoxData: any;

  add_hovered: boolean = false;
  smile_hovered: boolean = false;
  email_hovered: boolean = false;
  send_hovered: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private uploadService: UploadService
  ) {}

  deleteHovered() {
    this.add_hovered = false;
    this.smile_hovered = false;
    this.email_hovered = false;
    this.send_hovered = false;
  }

  onSubmit() {
    if (this.textBoxData.messageText != '') {
      this.textBoxData.subcollection;

      const message = new ChannelMessage({
        creator: this.authService.activeUserId,
        text: this.textBoxData.messageText,
        channelId: this.textBoxData.channelId,
        createdAt: serverTimestamp(),
        reactions: (this.textBoxData.reactions = this.reactions),
        collection: this.textBoxData.collection,
        subcollection: this.textBoxData.subcollection,
        attachment: [`${this.textBoxData.inputField}`],
      });

      this.firestore.addChannelMessage(
        message,
        `${this.textBoxData.collection}/${message.channelId}/${this.textBoxData.subcollection}`
      );

      this.textBoxData.inputField = '';
      this.selectedFiles = undefined;
      this.textBoxData.messageText = '';
    }
  }

  submitForm(event: any) {
    event.preventDefault();
    if (this.textBoxData.messageText.trim() !== '') {
      this.onSubmit();
    }
  }

  async detectFile(event: any) {
    this.selectedFiles = event.target.files;
    this.uploadSingleFile();
  }

  uploadSingleFile() {
    if (this.selectedFiles) {
      let file = this.selectedFiles.item(0);
      if (file) {
        this.filedate = new Date().getTime();
        this.uploadService
          .uploadFile(file, this.filedate, 'attachments')
          .then((url: string) => {
            this.textBoxData.inputField = url;
          })
          .catch((error) => {
            this.errorMessage = error.code;
          });
      }
    }
  }
}

/*import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelMessage } from '../../../../models/channel-message.class';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { User } from '../../../../models/user.class';
import { ActivatedRoute } from '@angular/router';
import { Channel } from '../../../../models/channel.class';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-text-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './text-box.component.html',
  styleUrl: './text-box.component.scss',
})
export class TextBoxComponent implements OnInit {
  authService = inject(AuthService);
  firestore = inject(FirebaseService);
  reactions = ['wave', 'rocket'];
  newMessage: boolean = false;
  user: User = new User();
  channel: Channel = new Channel();
  itemID: any = '';
  selectedFiles: FileList | undefined;
  filedate: number | undefined;
  errorMessage: string | null = null;

  @Input() textBoxData: any;

  add_hovered: boolean = false;
  smile_hovered: boolean = false;
  email_hovered: boolean = false;
  send_hovered: boolean = false;

  /*userData = {
    avatar: this.user.avatar,
    email: this.user.email,
    displayName: this.user.displayName,
    isOnline: this.user.isOnline,
    provider: this.user.provider,
    selected: this.user.selected,
    count: this.user.count,
    newMessage: this.user.newMessage


  }; 


  channelData = {
    creator: this.channel.creator,
    description: this.channel.description,
    member: this.channel.member,
    name: this.channel.name,
    count: this.channel.count,
    newMessage: this.channel.newMessage,
    allMembers: this.channel.allMembers
  };

  constructor(
    private route: ActivatedRoute,
    private uploadService: UploadService
  ) {}

  addCountToChannelDocument(toggle: string) {
    const channel = new Channel({
      creator: this.channel.creator,
      description: this.channel.description,
      member: this.channel.member,
      name: this.channel.name,
      count: this.channel.count,
      newMessage: this.newMessage,
      allMembers: this.channel.allMembers
    });

    /*const user = new User({
      avatar: this.user.avatar,
      email: this.user.email,
      displayName: this.user.displayName,
      isOnline: this.user.isOnline,
      provider: this.user.provider,
      selected: this.user.selected,
      count: this.user.count,
      newMessage: this.newMessage
    });

    this.firestore.updateChannel(this.itemID, channel);
    //this.firestore.updateUser(user, this.itemID, );
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap) => {
      this.itemID = paramMap.get('id');
      this.getItemValues('channels', this.itemID);
      //this.getItemValuesTwo('users', this.itemID);
    });
  }

  getItemValues(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.channel = new Channel(this.firestore.channel);
      this.setOldChannelValues();
    });
  }

  setOldChannelValues() {
    this.channelData = {
      creator: this.channel.creator,
      description: this.channel.description,
      member: this.channel.member,
      name: this.channel.name,
      count: this.channel.count,
      newMessage: this.channel.newMessage,
      allMembers: this.channel.allMembers
    };
  }

  /*getItemValuesTwo(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.user = new User(this.firestore.user);
      this.setOldChannelValuesTwo();
    });
  }

  setOldChannelValuesTwo(){
    this.userData = {
      avatar: this.user.avatar,
      email: this.user.email,
      displayName: this.user.displayName,
      isOnline: this.user.isOnline,
      provider: this.user.provider,
      selected: this.user.selected,
      count: this.user.count,
      newMessage: this.user.newMessage

    };
  }

  deleteHovered() {
    this.add_hovered = false;
    this.smile_hovered = false;
    this.email_hovered = false;
    this.send_hovered = false;
  }

  onSubmit() {
    this.newMessage = true;

    if (this.textBoxData.messageText != '') {
      
      this.textBoxData.subcollection;

      const message = new ChannelMessage({
        creator: this.authService.activeUserId,
        text: this.textBoxData.messageText,
        channelId: this.textBoxData.channelId,
        createdAt: this.textBoxData.createdAt,
        reactions: (this.textBoxData.reactions = this.reactions),
        collection: this.textBoxData.collection,
        subcollection: this.textBoxData.subcollection,
        attachment: [ `${this.textBoxData.inputField}`, ],
      });

      this.firestore.addChannelMessage(
        message,
        `${this.textBoxData.collection}/${message.channelId}/${this.textBoxData.subcollection}`
      );
      this.textBoxData.inputField = '';
      this.selectedFiles = undefined;
      this.textBoxData.messageText = '';
      this.addCountToChannelDocument(this.itemID);
    }
  }

  submitForm(event: any) {
    event.preventDefault();
    if (this.textBoxData.messageText.trim() !== '') {      
      this.onSubmit();
    }
  }

  detectFile(event: any) {
    this.selectedFiles = event.target.files;
    this.uploadSingleFile();
  }

  uploadSingleFile() {
    if (this.selectedFiles) {
      let file = this.selectedFiles.item(0);
      if (file) {
        this.filedate = new Date().getTime();
        this.uploadService
          .uploadFile(file, this.filedate, 'attachments')
          .then((url: string) => {            
            this.textBoxData.inputField = url;
          })
          .catch((error) => {
            this.errorMessage = error.code;
          });
      }
    }
  }
}*/
