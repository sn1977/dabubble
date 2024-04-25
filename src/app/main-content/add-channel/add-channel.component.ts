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

  filteredUsers: User[] = [];
  showDropdown: boolean = false;
  firestore = inject(FirebaseService);
  router = inject(Router);
  authService = inject(AuthService);
  users: User[] = [];
  selected: boolean = false;
  channel: Channel = new Channel();
  selectedUser: any = [];

  channelData = {
    creator: '',
    description: '',
    member: this.selectedUser,
    name: '',
  };

  

  addmember(event: MouseEvent, user: User) {
  
    const docRefId = (event.currentTarget as HTMLElement).id;

    // Überprüfe, ob die docRefId bereits in this.selectedUser vorhanden ist
    const index = this.selectedUser.indexOf(docRefId);
    if (index === -1) {
        // Wenn nicht, füge sie hinzu
        this.selectedUser.push(docRefId);
        this.selected = true; // Markiere den Benutzer als ausgewählt
        console.log(this.selectedUser);
    } else {
        // Wenn vorhanden, entferne sie aus dem Array
        this.selectedUser.splice(index, 1);
        this.selected = false; // Markiere den Benutzer als nicht ausgewählt
        console.log('Diese docRefId wurde entfernt:', docRefId);
        console.log(this.selectedUser);
    }
}


searchQuery: string = '';

onSearchInputChange(value: string) {
    this.searchQuery = value;
}



 

  matchesSearch(user: any): boolean {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      return true; // Wenn keine Suchabfrage vorhanden ist, zeige den Benutzer
    }
    return user.displayName
      .toLowerCase()
      .includes(this.searchQuery.toLowerCase());
  }

  overlayVisible: boolean = false;
  showInputField: boolean = false;
  showAddMember: boolean = false;

  toggleOverlay() {
    this.overlayVisible = !this.overlayVisible;
  }

  toggleInputField(inputId: string) {
    if (inputId === 'addSpecificMembers') {
      this.showInputField = !this.showInputField; // Toggle für Checkbox
      this.showAddMember = false; // Schließe das Div, wenn das Input-Feld geschlossen wird
    } else if (inputId === 'searchPeople') {
      if (this.showInputField) {
        this.showAddMember = !this.showAddMember; // Toggle für showAddMember, nur wenn showInputField aktiv ist
      } else {
        this.showInputField = true; // Öffne das Div, wenn das Input-Feld geöffnet wird
        this.showAddMember = true; // Öffne das Div, wenn das Input-Feld geöffnet wird
      }
    }
  }

  getInputValue(event: any): string {
    return event && event.target && event.target.value;
  }
}
