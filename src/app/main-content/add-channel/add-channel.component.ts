import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../../shared/services/firebase.service';



@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [NgIf, FormsModule, RouterLink],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss'
})
export class AddChannelComponent {

    

    showDropdown: boolean = false;
    firestore = inject(FirebaseService);
    router = inject(Router);
  
    overlayVisible: boolean = false;
    showInputField: boolean = false;

    toggleOverlay() {
        this.overlayVisible = !this.overlayVisible;
    }

    toggleInputField(event: any) {
        // Überprüfen Sie, welche Checkbox ausgewählt ist und aktualisieren Sie entsprechend die Sichtbarkeit des Input-Felds
        this.showInputField = event.target.id === 'addSpecificMembers' && event.target.checked;
    }

    toggleDropdown() {
        this.showDropdown = !this.showDropdown;
      }




}
