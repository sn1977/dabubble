import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../../shared/services/firebase.service';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user.class';
import { Channel } from '../../../models/channel.class';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [NgIf, FormsModule, RouterLink, CommonModule],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss',
})
export class AddChannelComponent {

  onSubmit() {
    const channel = new Channel({
      creator: this.authService.activeUserId,
      description: this.channelData.description,
      member: this.selectedUser,
      name: this.channelData.name,
    });

    this.firestore.addChannel(channel);
  }

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

  firestore = inject(FirebaseService);
  router = inject(Router);
  authService = inject(AuthService);


  channel: Channel = new Channel();


  channelData = {
    creator: '',
    description: '',
    member: this.selectedUser,
    name: '',
    user: '',
  };

  updateFormattedUserNames() {
    this.userNames = this.selectedUsers.map(user => user.displayName).join(', ');
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

  getInputValue(event: any): string {
    return event && event.target && event.target.value;
  }
}
