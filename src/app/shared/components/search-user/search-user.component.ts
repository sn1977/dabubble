import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { User } from '../../../../models/user.class';
import { Channel } from '../../../../models/channel.class';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-search-user',
  standalone: true,
  imports: [NgIf, FormsModule, RouterLink, CommonModule],
  templateUrl: './search-user.component.html',
  styleUrl: './search-user.component.scss'
})
export class SearchUserComponent {

  selectedUsers: User[] = [];
  userNames: string = '';
  selectedUser: any = [];
  users: User[] = [];
  filteredUsers: User[] = [];
  selected: boolean = false;
  showDropdown: boolean = false;
  overlayVisible: boolean = false;
  showInputField: boolean = false;
  showAddMember: boolean = false;
  isAddAllMembersChecked: boolean = false;
  isAddSpecificMembersChecked: boolean = false;
  firestore = inject(FirebaseService);
  router = inject(Router);
  authService = inject(AuthService);
  itemID: any = '';

  activeUser: any ='';


  channel: Channel = new Channel();

  channelData = {
    creator: this.channel.creator,
    description: this.channel.description,
    member: this.channel.member,
    name: this.channel.name,
    count: this.channel.count,
    newMessage: this.channel.newMessage
  };


  onSubmit() {
    const memberNames = this.selectedUsers.map(user => user.displayName);

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
      creator: this.authService.activeUserId,
      description: this.channelData.description,
      member: this.selectedUsers,
      name: this.channelData.name,
      count: this.channel.count,
      newMessage: this.channel.newMessage
    });
    this.firestore.updateChannel(this.itemID, channel);


  }

  constructor (private route: ActivatedRoute,) {
    
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      this.itemID = paramMap.get('id');
      this.getItemValues('channels', this.itemID);
    });
  }


  getItemValues(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.channel = new Channel(this.firestore.channel);
    });
    setTimeout(() => {
      this.setOldChannelValues();
    }, 1000)
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


  addmember(event: MouseEvent, user: User) {
    const index = this.selectedUsers.findIndex((selectedUser) => selectedUser.id === user.id);

    if (index === -1) {
      this.selectedUsers.push(user);

    } else {
      this.selectedUsers.splice(index, 1);
    }
    this.updateFormattedUserNames();
  }
  updateFormattedUserNames() {
    this.userNames = this.selectedUsers.map(user => user.displayName).join(', ');
  }
  removeUser(user: User) {
    const index = this.selectedUsers.findIndex(selectedUser => selectedUser.id === user.id);
    if (index !== -1) {
      this.selectedUsers.splice(index, 1);
      this.updateFormattedUserNames();
    }
  }
  searchQuery: string = '';
  onSearchInputChange(value: string) {
    this.searchQuery = value;
  }
  matchesSearch(user: any): boolean {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      return true;
    }
    return user.displayName
      .toLowerCase()
      .includes(this.searchQuery.toLowerCase());
  }
  toggleOverlay() {
    this.overlayVisible = !this.overlayVisible;
  }
  toggleInputField(inputId: string) {
    if (inputId === 'addSpecificMembers') {
      this.showInputField = !this.showInputField;
      this.showAddMember = false;
    } else if (inputId === 'searchPeople') {
      if (this.showInputField) {
        this.showAddMember = !this.showAddMember;
      } else {
        this.showInputField = true;
        this.showAddMember = true;
      }
    }
  }
  toggleCheckbox(checkboxId: string): void {
    if (checkboxId === 'addAllMembers') {
      this.isAddAllMembersChecked = true;
      this.isAddSpecificMembersChecked = false;
      this.showInputField = false; // Ensure input field is hidden when "Alle Mitglieder" selected
    } else if (checkboxId === 'addSpecificMembers') {
      this.isAddAllMembersChecked = false;
      this.isAddSpecificMembersChecked = true;
    }
  }
  getInputValue(event: any): string {
    return event && event.target && event.target.value;
  }
}



