import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelMessage } from '../../../../models/channel-message.class';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { User } from '../../../../models/user.class';
import { ActivatedRoute } from '@angular/router';
import { Channel } from '../../../../models/channel.class';

@Component({
  selector: 'app-text-box',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './text-box.component.html',
  styleUrl: './text-box.component.scss'
})
export class TextBoxComponent implements OnInit {

  authService = inject(AuthService);
  firestore = inject(FirebaseService);
  reactions = ['wave', 'rocket'];
  newMessage: boolean = false;
  user: User = new User();
  channel: Channel = new Channel();
  itemID: any = '';
 
  
  @Input() textBoxData: any;

  add_hovered: boolean = false;
  smile_hovered: boolean = false;
  email_hovered: boolean = false;
  send_hovered: boolean = false;

  userData = {
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
    newMessage: this.channel.newMessage
    
  };

  
    constructor(private route: ActivatedRoute,) {
    }
    

  addCountToChannelDocument(toggle: string) {


    if(this.channelData.name === ''){
      this.channelData.name = this.channel.name;
    }
    
    if(this.channelData.description === ''){
      this.channelData.description = this.channel.description;
    }

    if (this.channelData.member.length === 0 && Array.isArray(this.channel.member)) {
      this.channelData.member = this.channel.member;
    }

    const channel = new Channel({
      creator: this.channel.creator,
      description: this.channelData.description,
      member: this.channel.member,
      name: this.channelData.name,
      count: this.channel.count,
      newMessage: this.newMessage

    });
    
   
    const user = new User({
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
    this.firestore.updateUser(user, this.itemID, );
  }

  ngOnInit(): void {  

    this.route.paramMap.subscribe((paramMap) => {
      this.itemID = paramMap.get('id');
      this.getItemValues('channels', this.itemID);
      this.getItemValuesTwo('users', this.itemID);

  
    });
  }

  getItemValues(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.channel = new Channel(this.firestore.channel);
      this.setOldChannelValues();
    });
  }

  setOldChannelValues(){
    this.channelData = {
      creator: this.channel.creator,
      description: this.channel.description,
      member: this.channel.member,
      name: this.channel.name,
      count: this.channel.count,
      newMessage: this.channel.newMessage
    };
  }

  getItemValuesTwo(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.user = new User(this.firestore.user);
      console.log(this.user);
      
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
      newMessage: this.newMessage

    };
  }





  deleteHovered() {
    this.add_hovered = false;
    this.smile_hovered = false;
    this.email_hovered = false;
    this.send_hovered = false;
  }

  onSubmit(){
    this.newMessage = true;  
    



    if(this.textBoxData.messageText != ''){
      const message = new ChannelMessage({
        creator: this.authService.activeUserId,
        text: this.textBoxData.messageText,
        channelId: this.textBoxData.channelId,
        createdAt: this.textBoxData.createdAt,
        reactions: this.textBoxData.reactions = this.reactions,
        collection: this.textBoxData.collection,
        subcollection: this.textBoxData.subcollection,
        attachment: 'Anhang',
      });
      
      this.firestore.addChannelMessage(message, `${this.textBoxData.collection}/${message.channelId}/${this.textBoxData.subcollection}`);
      this.textBoxData.messageText = '';  
      this.addCountToChannelDocument(this.itemID);

    

      

      
    }

    
  }
}
