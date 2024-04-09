import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss'
})
export class AddChannelComponent {
  
    overlayVisible: boolean = false;
    showInputField: boolean = false;

    toggleOverlay() {
        this.overlayVisible = !this.overlayVisible;
    }

    toggleInputField(event: any) {
        // Überprüfen Sie, welche Checkbox ausgewählt ist und aktualisieren Sie entsprechend die Sichtbarkeit des Input-Felds
        this.showInputField = event.target.id === 'addSpecificMembers' && event.target.checked;
    }




}
