import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelMessage } from '../../../../models/channel-message.class';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { User } from '../../../../models/user.class';
import { ActivatedRoute } from '@angular/router';

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
    newMessage: this.newMessage

    
  };

  
    constructor(private route: ActivatedRoute,) {
    }
    

  addCountToChannelDocument(toggle: string) {
    
   
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

    
    
    
    this.firestore.updateUser(user, this.itemID, );
  }

  ngOnInit(): void {  

    this.route.paramMap.subscribe((paramMap) => {
      this.itemID = paramMap.get('id');
      this.newMessage = false; 
      
      this.getItemValuesTwo('users', this.itemID);

      setTimeout(() => {
        this.newMessage = false;  
         
      }, 1000)
    });
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
