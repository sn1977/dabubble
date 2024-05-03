import { AfterViewChecked, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Channel } from '../../../models/channel.class';
import { FirebaseService } from '../../shared/services/firebase.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../../models/user.class';
import { NavigationService } from '../../shared/services/navigation.service';
import { AuthService } from '../../shared/services/auth.service';
import { Auth } from '@angular/fire/auth';
import { ConversationComponent } from '../../shared/components/conversation/conversation.component';
import { HeaderMobileComponent } from '../../shared/components/header-mobile/header-mobile.component';
import { HeaderStateService } from '../../shared/services/header-state.service';
import { TextBoxComponent } from '../../shared/components/text-box/text-box.component';
import { DialogServiceService} from '../../shared/services/dialog-service.service';
import { SearchUserComponent } from '../../shared/components/search-user/search-user.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-channel',
  standalone: true,
  templateUrl: './new-channel.component.html',
  styleUrl: './new-channel.component.scss',
  imports: [
    RouterLink,
    BottomSheetComponent,
    ConversationComponent,
    HeaderMobileComponent,
    TextBoxComponent,
    CommonModule,
    SearchUserComponent,
  ],
})
export class NewChannelComponent implements OnInit, AfterViewChecked {
  firestore = inject(FirebaseService);
  router = inject(Router);
  itemID: any = '';
  user: User = new User();
  channel: Channel = new Channel();
  channelList: any = [];
  firebaseAuth = inject(Auth);
  authService = inject(AuthService);
  textBoxData: any = {
    placeholder: 'Nachricht an: #',
    channelName: '',
    messageText: '',
    channelId: '',
    collection: 'channels',
    subcollection: 'channelmessages',
  };

  @ViewChild('messageContent') messageContent!: ElementRef;
  previousMessageCount: number = 0;

  constructor(
    private _bottomSheet: MatBottomSheet,
    private route: ActivatedRoute,
    public navigationService: NavigationService,
    private headerStateService: HeaderStateService,
    private dialogService: DialogServiceService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.waitForUserData();
    this.test();

    this.route.paramMap.subscribe((paramMap) => {
      this.itemID = paramMap.get('id');
      this.getItemValues('channels', this.itemID);      
      this.firestore.getAllChannelMessages(this.itemID, this.textBoxData.collection, this.textBoxData.subcollection);
    });

    this.headerStateService.setAlternativeHeader(true);
    this.scrollToBottom();
  }

  ngAfterViewInit() {
    this.previousMessageCount = this.getCurrentMessageCount();
  }
  ngAfterViewChecked() {
    const currentMessageCount = this.getCurrentMessageCount();
    if (currentMessageCount > this.previousMessageCount) {
      this.scrollToBottom();
      this.previousMessageCount = currentMessageCount;
    }
  }

  getCurrentMessageCount(): number {
    return this.messageContent.nativeElement.children.length;
  }

  scrollToBottom() {
    try {
      this.messageContent.nativeElement.scrollTo({
        top: this.messageContent.nativeElement.scrollHeight,
        behavior: 'smooth' // Hier wird smooth scrollen aktiviert
      });
    } catch(err) { }
}

  async waitForUserData(): Promise<void> {
    while (!this.authService.activeUserAccount) {
      await this.delay(100); // Wartezeit in Millisekunden, bevor erneut überprüft wird
    }
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  test() {
    let id = this.authService.activeUserAccount.uid;
    // console.log(id); // Stelle sicher, dass id definiert ist, bevor du darauf zugreifst
    this.getItemValuesProfile('users', id);
  }

  toggleOverlay(overlayId: string): void {
    // const currentOverlay = document.querySelector(
    //   '.overlay[style="display: block;"]'
    // ) as HTMLElement;
    const newOverlay = document.getElementById(overlayId);
    // n
    console.log(overlayId);

    // if (currentOverlay && currentOverlay.id !== overlayId) {
    //   // Schließe das aktuelle Overlay, wenn ein anderes Overlay geöffnet ist
    //   currentOverlay.style.display = 'none';
    // }

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

  openBottomSheet(): void {
    this._bottomSheet.open(BottomSheetComponent);
  }

  getItemValues(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.channel = new Channel(this.firestore.channel);
      this.textBoxData.channelName = this.channel.name;
      this.textBoxData.channelId = itemID;
    });
  }

  openChannel(event: MouseEvent, path: string) {
    const docRefId = (event.currentTarget as HTMLElement).id;
    this.router.navigate(['/' + path + '/' + docRefId]);
  }

  getItemValuesProfile(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.user = new User(this.firestore.user);
    });
  }

  // openDialog() {
  //   this.itemID = this.user.id;
  //   this.dialogService.openDirectMessageDialog({ user: this.user, itemId: this.itemID });
  // }

  openDialog(user: User, itemId: string) {
    this.dialogService.openDirectMessageDialog(user, itemId);
    this.closeOverlay('overlay1');
  }
}
