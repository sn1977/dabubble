import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationService } from '../../shared/services/navigation.service';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { FirestoreService } from '../../shared/services/firestore.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../../models/user.class';
import { AuthService } from '../../shared/services/auth.service';
import { HeaderMobileComponent } from '../../shared/components/header-mobile/header-mobile.component';
import { HeaderStateService } from '../../shared/services/header-state.service';
import { TextBoxComponent } from '../../shared/components/text-box/text-box.component';
import { ConversationComponent } from '../../shared/components/conversation/conversation.component';
import { Channel } from '../../../models/channel.class';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgressSpinnerComponent } from '../../shared/components/progress-spinner/progress-spinner.component';
import { MatchMediaService } from '../../shared/services/match-media.service';

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [
    HeaderMobileComponent, 
    TextBoxComponent, 
    ConversationComponent,
    NgIf,
    FormsModule,
    ProgressSpinnerComponent
  ],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent implements OnInit{
  @ViewChild('messageContent') messageContent!: ElementRef;
  firestore = inject(FirestoreService);
  router = inject(Router);
  itemID: any = '';
  user: User = new User();
  channel: Channel = new Channel();
  authService = inject(AuthService);
  newMessage: boolean = false;
  showInputField: boolean = false;
  showAddMember: boolean = false;
  showChannels = false;
  showUsers = false;
  selectedUserOrChannel: string = '';
  isDesktop: boolean = false;
  matchMedia = inject(MatchMediaService);

  textBoxData: any = {
    placeholder: 'Starte eine neue Nachricht ',
    channelName: '',
    messageText: '',
    channelId: '',
    collection: 'messages',
    subcollection: 'chat',
  };  

  // userData = {
  //   avatar: this.user.avatar,
  //   email: this.user.email,
  //   displayName: this.user.displayName,
  //   isOnline: this.user.isOnline,
  //   provider: this.user.provider,
  // };

  constructor(
    public dialog: MatDialog,
    private navigationService: NavigationService,
    private _bottomSheet: MatBottomSheet,
    private route: ActivatedRoute,
    private headerStateService: HeaderStateService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.isDesktop = this.matchMedia.checkIsDesktop();
    await this.waitForUserData();
    this.test();
    this.textBoxData.channelId = this.firestore.conversation;
    this.headerStateService.setAlternativeHeader(true);

    setInterval(() => {      
      this.matchMedia.loading = false;
    }, 1000);
  }

  getItemValues(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.user = new User(this.firestore.user);
    });
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

  goBack(): void {
    this.navigationService.goBack();
  }

  openBottomSheet(): void {
    this._bottomSheet.open(BottomSheetComponent);
  }

  onInputChange(event: any) {
    const inputValue = event.target.value;
    if (inputValue.startsWith('#')) {
      this.showAddMember = true;
      this.showChannels = true;
      this.showUsers = false;
    } else if (inputValue.startsWith('@')) {
      this.showAddMember = true;
      this.showChannels = false;
      this.showUsers = true;
    } else {
      this.showAddMember = false;
      this.showChannels = false;
      this.showUsers = false;
    }
  }

  onUserClick(user: User) {
    this.selectedUserOrChannel = `@${user.displayName}`;
    this.showAddMember = false;
  }

  onChannelClick(channel: Channel) {
    this.selectedUserOrChannel = `#${channel.name}`;
    this.showAddMember = false;
  }

  trackByIndex(index: number, item: any): any {
    return index;
  }
}
