import { Component, inject, Input, OnInit } from '@angular/core';
import { FirestoreService } from '../shared/services/firestore.service';
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
import { User } from '../../models/user.class';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { ChannelMessage } from '../../models/channel-message.class';
import {SearchInputComponent} from '../shared/components/search-input/search-input.component';
import { MatchMediaService } from '../shared/services/match-media.service';
import { timeout } from 'rxjs';

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
  firestore = inject(FirestoreService);
  router = inject(Router);
  authService = inject(AuthService);
  matchMedia = inject(MatchMediaService);
  
  @Input() channelMessage!: ChannelMessage;
  @Input() isDesktop: boolean = false;

  panels = [
    {
      expanded: true,
      arrowImagePath: 'assets/img/icon/arrow_drop_down.png',
      iconPath: '',
      iconPathOpened: 'assets/img/icon/workspaces.png',
      iconPathClosed: 'assets/img/icon/workspaces_color.png',
      title: 'Kanäle',
      titleColor: '#000000',
    },
    {
      expanded: true,
      arrowImagePath: 'assets/img/icon/arrow_drop_down.png',
      iconPath: '',
      iconPathOpened: 'assets/img/icon/account_circle_big.png',
      iconPathClosed: 'assets/img/icon/account_circle_color.png',
      title: 'Direktnachrichten',
      titleColor: '#000000',
    },
  ];

  user: User = new User();
  constructor(
    public navigationService: NavigationService,
    private itemStateService: ItemStateService,
  ) {}
  
  async ngOnInit() {    
    this.getItemValues('users', this.authService.activeUserId);
  }
  
  getItemValues(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.user = new User(this.firestore.user);
    });
  }

  isChannelMember(members: string[]): boolean {
    return members.includes(this.authService.activeUserId);
  }

  onPanelOpened(panel: MatExpansionPanel, index: number) {
    this.matchMedia.showSearchDropdown = false;
    this.panels[index].expanded = true;
    this.panels[index].arrowImagePath = 'assets/img/icon/arrow_drop_down.png';
    this.panels[index].iconPath = this.panels[index].iconPathOpened;
    this.panels[index].titleColor = '#000000';
  }
  
  onPanelClosed(panel: MatExpansionPanel, index: number) {
    this.matchMedia.showSearchDropdown = false;
    this.panels[index].expanded = false;
    this.panels[index].arrowImagePath =
      'assets/img/icon/arrow_drop_down_color.png';
    this.panels[index].iconPath = this.panels[index].iconPathClosed;
    this.panels[index].titleColor = '#535AF1';
  }  

  onAddClick(event: MouseEvent): void {
    this.matchMedia.showSearchDropdown = false;
    event.stopPropagation();
    this.navigateToAddChannel();
  }
  
  navigateToAddChannel() {
    this.matchMedia.showSearchDropdown = false;
    this.matchMedia.channelName = '';
    this.matchMedia.showThread = false;
    this.navigationService.navigate(['/add-channel']);
  }

  openChannel(event: MouseEvent, path: string, name: string) {
    this.matchMedia.loading = true;
    this.matchMedia.channelName = name;
    this.matchMedia.showThread = false;    
    this.matchMedia.showSearchDropdown = false;
    this.firestore.conversation = '';
    const docRefId = (event.currentTarget as HTMLElement).id;
    this.itemStateService.setItemId(docRefId);
    this.router.navigate([path, docRefId]);
  }

  openNewMessage() {
    this.matchMedia.loading = true;
    this.router.navigateByUrl('/new-message');
  }
}
