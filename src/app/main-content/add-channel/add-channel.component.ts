import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../../shared/services/firebase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [NgIf, FormsModule, RouterLink, CommonModule],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss',
})
export class AddChannelComponent  {
  users: string[] = ['Max', 'Peter', 'Anna', 'Lisa'];
  filteredUsers: string[] = [];
  showDropdown: boolean = false;
  firestore = inject(FirebaseService);
  router = inject(Router);

  overlayVisible: boolean = false;
  showInputField: boolean = false;

  filterUsers(event: any): void {
    const searchText: string = event.target.value;
    if (!searchText) {
      this.filteredUsers = [];
      return;
    }
    this.filteredUsers = this.users.filter((user) =>
      user.toLowerCase().includes(searchText.toLowerCase())
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
