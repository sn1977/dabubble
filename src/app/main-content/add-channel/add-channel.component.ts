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
  };


  addmember(event: MouseEvent, user: User) {
    const docRefId = (event.currentTarget as HTMLElement).id;

    // Überprüfen, ob der Benutzer bereits ausgewählt ist
    const index = this.selectedUser.findIndex((selected: { id: string | undefined; }) => selected.id === user.id);

    if (index === -1) {
      // Wenn nicht ausgewählt, Benutzer hinzufügen
      this.selectedUser.push(user.id);
      user.selected = true;
    } else {
      // Wenn bereits ausgewählt, Benutzer entfernen
      this.selectedUser.splice(index, 1);
      user.selected = false;
    }

    // Den Namen des ausgewählten Benutzers in channelData.name speichern
    this.channelData.name = this.selectedUser.map((u: { displayName: any; }) => u.displayName).join(', ');
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
