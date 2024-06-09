import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
// import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Channel } from '../../../models/channel.class';
import { FirestoreService } from '../../shared/services/firestore.service';
import { User } from '../../../models/user.class';
import { NavigationService } from '../../shared/services/navigation.service';
import { AuthService } from '../../shared/services/auth.service';
import { Auth } from '@angular/fire/auth';
import { ConversationComponent } from '../../shared/components/conversation/conversation.component';
import { HeaderMobileComponent } from '../../shared/components/header-mobile/header-mobile.component';
import { HeaderStateService } from '../../shared/services/header-state.service';
import { TextBoxComponent } from '../../shared/components/text-box/text-box.component';
// import { DialogServiceService } from '../../shared/services/dialog-service.service';
import { SearchUserComponent } from '../../shared/components/search-user/search-user.component';
import { CommonModule } from '@angular/common';
import { MatchMediaService } from '../../shared/services/match-media.service';
import { ChannelMessage } from '../../../models/channel-message.class';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [
    RouterLink,
    BottomSheetComponent,
    ConversationComponent,
    HeaderMobileComponent,
    TextBoxComponent,
    CommonModule,
    SearchUserComponent,
  ],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent implements OnInit, OnDestroy {
  firestore = inject(FirestoreService);
  matchMedia = inject(MatchMediaService);
  router = inject(Router);
  itemID: any = '';
  user: User = new User();
  channel: Channel = new Channel();
  channelMessage: ChannelMessage = new ChannelMessage();
  channelList: any = [];
  newMessage: boolean = false;
  firebaseAuth = inject(Auth);
  authService = inject(AuthService);
  textBoxData: any = {
    placeholder: 'Antworten...',
    channelName: '',
    messageText: '',
    channelId: '',
    collection: 'channels',
    subcollection: 'channelmessages',
  };

  @ViewChild('threadContent') threadContent!: ElementRef;
  previousMessageCount: number = 0;
  isDesktop: boolean = false;

  constructor(
    // private _bottomSheet: MatBottomSheet,    
    public navigationService: NavigationService,
    private headerStateService: HeaderStateService,
    // private dialogService: DialogServiceService
  ) {}
  
  ngOnDestroy(): void {
    this.matchMedia.hideReactionIcons = false;
  }

  channelData = {
    creator: this.channel.creator,
    description: this.channel.description,
    member: this.channel.member,
    name: this.channel.name,
    count: this.channel.count,
    newMessage: this.channel.newMessage,
  };

  async ngOnInit(): Promise<void> {
    await this.waitForUserData();
    this.test();
    this.newMessage = false;    
    this.headerStateService.setAlternativeHeader(true);
    this.scrollToBottom();
    // this.firestore.getSingleMessageData('channels', this.matchMedia.channelId + '/channelmessages/' + this.matchMedia.subID, () => {});
    this.firestore.getAllChannelThreads(this.matchMedia.channelId, 'channels', 'channelmessages/' + this.matchMedia.subID + '/threads');
    this.textBoxData.channelId = this.matchMedia.channelId;
    this.textBoxData.subcollection = 'channelmessages/' + this.matchMedia.subID + '/threads';
    
    this.matchMedia.scrollToBottomThread = true;
    setInterval(() => {
      this.scrollToBottom();
    }, 1000);
  }

  // async ngAfterViewInit() {
  //   this.previousMessageCount = this.getCurrentMessageCount();    
  // }

  // ngAfterViewChecked() {
  //   const currentMessageCount = this.getCurrentMessageCount();
  //   if (currentMessageCount > this.previousMessageCount) {      
  //     this.previousMessageCount = currentMessageCount;
  //   }
  // }

  // getCurrentMessageCount(): number {
  //   return this.threadContent.nativeElement.children.length;
  // }

  async scrollToBottom() {
    await this.delay(200);

    if (this.matchMedia.scrollToBottomThread === true) {
      try {
        this.threadContent.nativeElement.scrollTo({
          top: this.threadContent.nativeElement.scrollHeight,
          behavior: 'smooth',
        });
      } catch (err) {}
    }
    this.matchMedia.scrollToBottomThread = false;
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
    this.getItemValuesProfile('users', id);
  }

  // toggleOverlay(overlayId: string): void {
  //   const newOverlay = document.getElementById(overlayId);
  //   if (newOverlay) {
  //     newOverlay.style.display =
  //       newOverlay.style.display === 'none' ? 'block' : 'none';
  //   }
  // }

  // closeOverlay(overlayId: string): void {
  //   const overlay = document.getElementById(overlayId) as HTMLElement;
  //   if (overlay) {
  //     overlay.style.display = 'none';
  //   }
  // }

  // openBottomSheet(): void {
  //   this._bottomSheet.open(BottomSheetComponent);
  // }

  // openChannel(event: MouseEvent, path: string) {
  //   const docRefId = (event.currentTarget as HTMLElement).id;
  //   this.router.navigate(['/' + path + '/' + docRefId]);
  // }

  getItemValuesProfile(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.user = new User(this.firestore.user);
    });
  }

  // openDialog(user: User, itemId: string) {
  //   this.dialogService.openDirectMessageDialog(user, itemId);
  //   this.closeOverlay('overlay1');
  // }

  closeThread() {
    this.isDesktop = this.matchMedia.checkIsDesktop();
    if (this.isDesktop === true) {
      this.matchMedia.showThread = false;
    } else {
      history.back();
    }
  }
}
