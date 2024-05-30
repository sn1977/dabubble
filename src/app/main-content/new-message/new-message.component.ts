import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { DirectMessageOverlayComponent } from '../direct-message-overlay/direct-message-overlay.component';
import { MatDialog } from '@angular/material/dialog';
import { NavigationService } from '../../shared/services/navigation.service';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { FirebaseService } from '../../shared/services/firebase.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../../models/user.class';
import { AuthService } from '../../shared/services/auth.service';
// import { Channel } from '../../../models/channel.class';
import { HeaderMobileComponent } from '../../shared/components/header-mobile/header-mobile.component';
import { HeaderStateService } from '../../shared/services/header-state.service';
import { TextBoxComponent } from '../../shared/components/text-box/text-box.component';
import { ConversationComponent } from '../../shared/components/conversation/conversation.component';
import { Channel } from '../../../models/channel.class';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [
    HeaderMobileComponent, 
    TextBoxComponent, 
    ConversationComponent,
    NgIf
  ],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent implements OnInit{
  @ViewChild('messageContent') messageContent!: ElementRef;
  firestore = inject(FirebaseService);
  router = inject(Router);
  itemID: any = '';
  user: User = new User();
  channel: Channel = new Channel();
  authService = inject(AuthService);
  newMessage: boolean = false;
  showInputField: boolean = false;
  showAddMember: boolean = false;

  textBoxData: any = {
    placeholder: 'Starte eine neue Nachricht ',
    channelName: '',
    messageText: '',
    channelId: '',
    collection: 'messages',
    subcollection: 'chat',
  };  

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

  constructor(
    public dialog: MatDialog,
    private navigationService: NavigationService,
    private _bottomSheet: MatBottomSheet,
    private route: ActivatedRoute,
    private headerStateService: HeaderStateService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.waitForUserData();
    this.test();
    this.newMessage = false;    

    this.route.paramMap.subscribe((paramMap) => {
      this.itemID = paramMap.get('id');
      this.getItemValues('users', this.itemID);
  
    });

    setTimeout(() => {
      this.addCountToChannelDocument(this.itemID);
   }, 1000)

    await this.firestore.getDirectMessages(
      this.authService.activeUserAccount.uid,
      this.itemID      
    );
        
    this.textBoxData.channelId = this.firestore.conversation;    
    this.headerStateService.setAlternativeHeader(true);
    this.firestore.getAllChannelMessages(this.textBoxData.channelId, this.textBoxData.collection, this.textBoxData.subcollection);
    this.scrollToBottom();
  }

  getItemValues(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.user = new User(this.firestore.user);
      this.setOldUserlValues();
    });
  }

  setOldUserlValues(){
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

  async waitForUserData(): Promise<void> {
    while (!this.authService.activeUserAccount) {
      await this.delay(100);
    }
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  test() {
    let id = this.authService.activeUserAccount.uid;
    this.getItemValues('users', id);
  }

  toggleOverlay(overlayId: string): void {
    const currentOverlay = document.querySelector(
      '.overlay[style="display: block;"]'
    ) as HTMLElement;
    const newOverlay = document.getElementById(overlayId);

    if (currentOverlay && currentOverlay.id !== overlayId) {
      currentOverlay.style.display = 'none';
    }

    if (newOverlay) {
      newOverlay.style.display =
        newOverlay.style.display === 'none' ? 'block' : 'none';
    }
  }

  closeOverlay(overlayId: string): void {
    const overlay = document.getElementById(overlayId) as HTMLElement;
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  openDirectMessageOverlay(): void {
    const dialogRef = this.dialog.open(DirectMessageOverlayComponent, {
      minWidth: '398px',
      minHeight: '600px',
      panelClass: 'custom-dialog-container',
      data: { user: this.user, itemId: this.itemID },
    });
  }

  scrollToBottom() {
    try {
      this.messageContent.nativeElement.scrollTo({
        top: this.messageContent.nativeElement.scrollHeight,
        behavior: 'smooth' // Hier wird smooth scrollen aktiviert
      });
    } catch(err) { }
}

  goBack(): void {
    this.navigationService.goBack();
  }

  openBottomSheet(): void {
    this._bottomSheet.open(BottomSheetComponent);
  }

  toggleInputField(inputId: string) {
 if (inputId === 'searchPeople') {
      if (this.showInputField) {
        this.showAddMember = !this.showAddMember;
      } else {
        this.showInputField = true;
        this.showAddMember = true;
      }
    }
  }

 

}
