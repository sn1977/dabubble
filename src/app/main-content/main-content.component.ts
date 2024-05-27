import { Component, inject, Input, OnInit } from '@angular/core';
import { FirebaseService } from '../shared/services/firebase.service';
import { HeaderMobileComponent } from '../shared/components/header-mobile/header-mobile.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MatAccordion,
  MatExpansionModule,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { BottomSheetComponent } from '../shared/components/bottom-sheet/bottom-sheet.component';
import { MatFabButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { NavigationService } from '../shared/services/navigation.service';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { ItemStateService } from '../shared/services/item-state.service';
import { firstValueFrom, lastValueFrom, Observable } from 'rxjs';
import { Channel } from '../../models/channel.class';
import { User } from '../../models/user.class';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ChannelMessage } from '../../models/channel-message.class';
import {SearchInputComponent} from './search-input/search-input.component';
import { MatchMediaService } from '../shared/services/match-media.service';
import { DataService } from '../shared/services/data.service';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatExpansionModule,
    HeaderMobileComponent,
    BottomSheetComponent,
    MatFabButton,
    FormsModule,
    RouterLink,
    NgForOf,
    NgIf,
    CommonModule,
    SearchInputComponent
  ],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss',
})
export class MainContentComponent implements OnInit {
  firestore = inject(FirebaseService);
  router = inject(Router);
  authService = inject(AuthService);
  matchMedia = inject(MatchMediaService);
  dataService = inject(DataService);
  
  @Input() channelMessage!: ChannelMessage;
  @Input() isDesktop: boolean = false;

  panels = [
    {
      expanded: true,
      arrowImagePath: 'assets/img/icon/arrow_drop_down.png',
      iconPath: '',
      iconPathOpened: 'assets/img/icon/workspaces.png',
      iconPathClosed: 'assets/img/icon/workspaces_color.png',
      title: 'Channels',
      titleColor: '#000000', // Startfarbe beim Öffnen
    },
    {
      expanded: true,
      arrowImagePath: 'assets/img/icon/arrow_drop_down.png',
      iconPath: '',
      iconPathOpened: 'assets/img/icon/account_circle_big.png',
      iconPathClosed: 'assets/img/icon/account_circle_color.png',
      title: 'Direktnachrichten',
      titleColor: '#000000', // Startfarbe beim Öffnen
    },
  ];

  textData = { text: '' };

  inputHasValue = false;
  allChannels: Channel[] = [];
  allUsers: User[] = [];
  filteredResults: any[] = [];
  noChannelFound: boolean = false;
  noUserFound: boolean = false;

  constructor(
    public navigationService: NavigationService,
    private itemStateService: ItemStateService,
    private dialog: MatDialog
  ) {}
  
  async ngOnInit() {
    await this.listenForDataChanges();    
    this.dataService.searchWorkspace('');
  }
  
  async listenForDataChanges(): Promise<void> {
    const channelsPromise = firstValueFrom(this.firestore.getChannels());
    const usersPromise = firstValueFrom(this.firestore.getUsers2());

    const channels = await channelsPromise;
    const users = await usersPromise;

    this.dataService.allChannels = channels;
    // this.dataService.allUsers = this.sortUsers(users);
    this.dataService.allUsers = users;
  }

  sortUsers(users: User[]): User[] {
    return users.sort((a, b) => {
      if (a.id === this.authService.activeUserId) return -1;
      if (b.id === this.authService.activeUserId) return 1;
      return 0;
    });
  }

  onPanelOpened(index: number) {
    this.panels[index].expanded = true;
    this.panels[index].arrowImagePath = 'assets/img/icon/arrow_drop_down.png';
    this.panels[index].iconPath = this.panels[index].iconPathOpened;
    this.panels[index].titleColor = '#000000'; // Farbe, wenn geöffnet
  }

  onPanelClosed(index: number) {
    this.panels[index].expanded = false;
    this.panels[index].arrowImagePath =
      'assets/img/icon/arrow_drop_down_color.png';
    this.panels[index].iconPath = this.panels[index].iconPathClosed;
    this.panels[index].titleColor = '#535AF1'; // Farbe, wenn geschlossen
  }

  onAddClick(event: MouseEvent): void {
    event.stopPropagation(); // Verhindert, dass das Click-Event weiter zum mat-expansion-panel propagiert wird.
    this.navigateToAddChannel();
  }

  navigateToAddChannel() {
    this.matchMedia.showThread = false;
    this.navigationService.navigate(['/add-channel']);
  }

  openChannel(event: MouseEvent, path: string, name?: string) {

    if(name){      
      this.matchMedia.channelName = name;
    }
    this.matchMedia.showThread = false;
    const docRefId = (event.currentTarget as HTMLElement).id;
    this.itemStateService.setItemId(docRefId);
    this.router.navigate([path, docRefId]);
  }
}
