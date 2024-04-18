import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../../shared/services/firebase.service';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [NgIf, FormsModule, RouterLink, CommonModule],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss',
})
export class AddChannelComponent  {
  
  filteredUsers: User[] = [];
  showDropdown: boolean = false;
  firestore = inject(FirebaseService);
  router = inject(Router);
  users: User[] = [];



  overlayVisible: boolean = false;
  showInputField: boolean = false;

   constructor() {
    this.loadUsers();
  }

  
  loadUsers() {

    
    let users = this.firestore.getUsers();
    for (const user of users) {
      console.log('ID:', user.id);
      console.log('Avatar:', user.avatar);
      console.log('Email:', user.email);
      console.log('Display Name:', user.displayName);
      console.log('Is Online:', user.isOnline);
      console.log('Provider:', user.provider);
      console.log('-----------------------------------');
    }

    
  }


  filterUsers(event: any): void {
    
    const searchText: string = event.target.value;
    if (!searchText) {
      this.filteredUsers = [];
      return;
    }
    this.filteredUsers = this.users.filter(user =>
      user.displayName.toLowerCase().includes(searchText.toLowerCase())
    );
  }


  toggleOverlay() {
    this.overlayVisible = !this.overlayVisible;
  }

  toggleInputField(event: any) {
    this.showInputField =
      event.target.id === 'addSpecificMembers' && event.target.checked;
  }

  getInputValue(event: any): string {
    return event && event.target && event.target.value;
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  
}
