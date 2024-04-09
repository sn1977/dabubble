import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-channel-edition',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './channel-edition.component.html',
  styleUrl: './channel-edition.component.scss'
})
export class ChannelEditionComponent {

  isEditingChannelName: boolean = false;
  isEditingDescription: boolean = false;
  channelNameDescriptionText: string = "# Entwicklerteam";
  descriptionDescriptionText: string = "Dieser Channel ist für alles rund um #dfsdf vorgesehen. Hier kannst du zusammen mit deinem Team Meetings abhalten, Dokumente teilen und Entscheidungen treffen";

  editedChannelName: string = "";
  editedDescriptionDescription: string = "";

  toggleEdit(field: string) {
    if (field === 'channelName') {
      this.isEditingChannelName = !this.isEditingChannelName;
      if (!this.isEditingChannelName) {
        // Hier können Sie die spezifische Logik für das Abschließen der Bearbeitung des Channel-Namens implementieren
        this.channelNameDescriptionText = this.editedChannelName;
      }
    } else if (field === 'description') {
      this.isEditingDescription = !this.isEditingDescription;
      if (!this.isEditingDescription) {
        // Hier können Sie die spezifische Logik für das Abschließen der Bearbeitung der Beschreibung implementieren
        this.descriptionDescriptionText = this.editedDescriptionDescription;
      }
    }
  }



  

}
