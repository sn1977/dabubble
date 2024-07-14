import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Channel } from '../../../models/channel.class';
import { FirestoreService } from '../../shared/services/firestore.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../../models/user.class';
import { NavigationService } from '../../shared/services/navigation.service';
import { AuthService } from '../../shared/services/auth.service';
import { Auth } from '@angular/fire/auth';
import { ConversationComponent } from '../../shared/components/conversation/conversation.component';
import { HeaderMobileComponent } from '../../shared/components/header-mobile/header-mobile.component';
import { HeaderStateService } from '../../shared/services/header-state.service';
import { TextBoxComponent } from '../../shared/components/text-box/text-box.component';
import { DialogServiceService } from '../../shared/services/dialog-service.service';
import { SearchUserComponent } from '../../shared/components/search-user/search-user.component';
import { CommonModule } from '@angular/common';
import { DateFormatService } from '../../shared/services/date-format.service';
import { TimeSeperatorComponent } from '../../shared/components/time-seperator/time-seperator.component';
import { MatchMediaService } from '../../shared/services/match-media.service';
import { DataService } from '../../shared/services/data.service';
import { ChannelMessage } from '../../../models/channel-message.class';
import { ProgressSpinnerComponent } from '../../shared/components/progress-spinner/progress-spinner.component';

@Component({
  selector: 'app-channel',
  standalone: true,
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss',
  imports: [
    RouterLink,
    BottomSheetComponent,
    ConversationComponent,
    HeaderMobileComponent,
    TextBoxComponent,
    CommonModule,
    SearchUserComponent,
    TimeSeperatorComponent,
    ProgressSpinnerComponent,
  ],
})
export class ChannelComponent implements OnInit {
  /**
   * The Firestore service used for interacting with the Firebase Firestore database.
   */
  firestore = inject(FirestoreService);
  /**
   * The router object for navigating between routes.
   */
  router = inject(Router);
  /**
   * The ID of the item.
   */
  itemID: any = '';
  /**
   * Represents a user in the channel component.
   */
  user: User = new User();
  /**
   * Represents a channel.
   */
  channel: Channel = new Channel();
  /**
   * Represents the channel messages.
   */
  channelMessages: ChannelMessage = new ChannelMessage();
  /**
   * Represents a list of channels.
   */
  channelList: any[] = [];
  /**
   * The Firebase authentication instance.
   */
  firebaseAuth = inject(Auth);
  authService = inject(AuthService);
  isDesktop: boolean = false;
  matchMedia = inject(MatchMediaService);
  /**
   * The data service used in the channel component.
   */
  dataService = inject(DataService);
  /**
   * Represents the data for the text box in the channel component.
   */
  textBoxData: any = {
    placeholder: 'Nachricht an #',
    channelName: '',
    messageText: '',
    channelId: '',
    collection: 'channels',
    subcollection: 'channelmessages',
    recipient: '',
  };
  hovering = false;

  /**
   * The reference to the message content element.
   */
  @ViewChild('messageContent') messageContent!: ElementRef;

  constructor(
    private _bottomSheet: MatBottomSheet,
    private route: ActivatedRoute,
    public navigationService: NavigationService,
    private headerStateService: HeaderStateService,
    private dialogService: DialogServiceService,
    public dateFormatService: DateFormatService
  ) {}

  /**
   * Represents the channel data.
   */
  channelData = {
    creator: this.channel.creator,
    description: this.channel.description,
    member: this.channel.member,
    name: this.channel.name,
  };

  /**
   * Initializes the component and sets up necessary configurations.
   * This method is called after the component has been created and initialized.
   * It is used to perform any initialization logic required by the component.
   */
  async ngOnInit(): Promise<void> {
    await this.setInitialData();
    await this.waitForUserData();
    await this.getActiveUser();

    this.route.paramMap.subscribe((paramMap) => {      
      this.itemID = paramMap.get('id');
      this.textBoxData.messageText = '';
      this.textBoxData.inputField = '';
      this.textBoxData.recipient = this.itemID;

      this.firestore.getSingleItemData('channels', this.itemID, () => {
        this.setChannelData();
      });
    });
  }

  /**
   * Sets necessary configurations like collectionType,
   * empty search and check if view is desktop or mobile
   */
  async setInitialData() {
    this.dataService.searchWorkspace('');
    this.isDesktop = this.matchMedia.checkIsDesktop();
    this.matchMedia.collectionType = 'channels';
  }

  /**
   * Sets necessary channelData
   */
  setChannelData() {
    this.channel = new Channel(this.firestore.channel);
    this.firestore.channelMessages = [];
    this.setTextBoxData();
    this.setLoadingState();
  }

  /**
   * Sets necessary textBoxData
   */
  setTextBoxData() {
    this.textBoxData.channelName = this.channel.name;
    this.firestore.getAllChannelMessages(
      this.itemID,
      this.textBoxData.collection,
      this.textBoxData.subcollection
    );
    this.textBoxData.channelName = this.channel.name;
    this.textBoxData.channelId = this.itemID;
  }

  /**
   * Sets loading States (scroll on new content)
   */
  setLoadingState() {
    this.headerStateService.setAlternativeHeader(true);
    this.matchMedia.scrollToBottom = true;
    setInterval(() => {
      this.scrollToBottom();
      this.matchMedia.loading = false;
    }, 1000);
  }

  /**
   * Filters the users based on the provided member ID.
   *
   * @returns An array of filtered users.
   */
  filterUsers() {
    return this.filterUsersById(this.firestore.getUsers(), this.channel.member);
  }

  /**
   * Filters an array of users based on their IDs.
   *
   * @param usersArray - The array of users to filter.
   * @param idsArray - The array of IDs to filter by.
   * @returns An array of users whose IDs are included in the `idsArray`.
   */
  filterUsersById(usersArray: any[], idsArray: string | any[]) {
    return usersArray.filter((user) => idsArray.includes(user.id));
  }

  /**
   * Retrieves the values of an item from a collection asynchronously.
   * @param collection - The name of the collection to retrieve the item from.
   * @param itemID - The ID of the item to retrieve.
   */
  async getItemValues(collection: string, itemID: string) {
    await this.delay(200);
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.channel = new Channel(this.firestore.channel);
      this.textBoxData.channelName = this.channel.name;
      this.textBoxData.channelId = itemID;
    });
  }

  /**
   * Scrolls the message content to the bottom.
   * If `scrollToBottom` is set to `true` in `matchMedia`, it scrolls the content smoothly to the bottom.
   */
  async scrollToBottom() {
    await this.delay(200);

    if (this.matchMedia.scrollToBottom === true) {
      try {
        this.messageContent.nativeElement.scrollTo({
          top: this.messageContent.nativeElement.scrollHeight,
          behavior: 'smooth',
        });
      } catch (err) {}
    }
    this.matchMedia.scrollToBottom = false;
  }

  /**
   * Waits for the user data to be available.
   * @returns A Promise that resolves when the user data is available.
   */
  async waitForUserData(): Promise<void> {
    while (!this.authService.activeUserAccount) {
      await this.delay(100);
    }
  }

  /**
   * Delays the execution of code for the specified number of milliseconds.
   * @param ms - The number of milliseconds to delay.
   * @returns A Promise that resolves after the specified delay.
   */
  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getActiveUser() {
    let id = this.authService.activeUserAccount.uid;
    this.getItemValuesProfile('users', id);
  }

  /**
   * Toggles the display of an overlay element based on its ID.
   * If the overlay is currently hidden, it will be shown. If it is currently shown, it will be hidden.
   *
   * @param overlayId - The ID of the overlay element to toggle.
   */
  toggleOverlay(overlayId: string): void {
    const newOverlay = document.getElementById(overlayId);
    if (newOverlay) {
      newOverlay.style.display =
        newOverlay.style.display === 'none' ? 'block' : 'none';
    }
  }

  /**
   * Closes the overlay.
   * @param event - The optional mouse event that triggered the close action.
   */
  closeOverlay(event?: MouseEvent): void {
    if (event) {
      const overlayContent = document.querySelector('.overlay-content');
      if (overlayContent && overlayContent.contains(event.target as Node)) {
        return;
      }
    }
    const overlay = document.getElementById('overlay1');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  /**
   * Opens the bottom sheet.
   */
  openBottomSheet(): void {
    this._bottomSheet.open(BottomSheetComponent);
  }

  /**
   * Opens a channel based on the provided path and document reference ID.
   * Navigates to the specified path with the document reference ID as a parameter.
   *
   * @param event - The mouse event that triggered the channel opening.
   * @param path - The path of the channel to open.
   */
  openChannel(event: MouseEvent, path: string) {
    const docRefId = (event.currentTarget as HTMLElement).id;
    this.router.navigate(['/' + path + '/' + docRefId]);
  }

  /**
   * Retrieves the values of an item from a specified collection and assigns them to the component's user property.
   *
   * @param collection - The name of the collection to retrieve the item from.
   * @param itemID - The ID of the item to retrieve.
   */
  getItemValuesProfile(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.user = new User(this.firestore.user);
    });
  }

  /**
   * Opens a dialog for direct messaging with a user.
   * @param user - The user to open the dialog with.
   * @param itemId - The ID of the item associated with the dialog.
   */
  openDialog(user: User, itemId: string) {
    this.dialogService.openDirectMessageDialog(user, itemId);
    this.closeOverlay();
  }

  /**
   * Gets the number of members in the channel.
   * @returns The number of members in the channel.
   */
  get memberCount(): number {
    return this.channel.member.length;
  }
}
