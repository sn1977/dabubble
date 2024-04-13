import {Component, inject, OnInit} from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../shared/services/firebase.service';
import { User } from '../../../models/user.class';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Channel} from '../../../models/channel.class';


@Component({
  selector: 'app-channel-edition',
  standalone: true,
  imports: [NgIf, FormsModule, RouterLink],
  templateUrl: './channel-edition.component.html',
  styleUrl: './channel-edition.component.scss'
})
export class ChannelEditionComponent implements OnInit {

  firestore = inject(FirebaseService);
  router = inject(Router);
  itemID: any = '';
  channel: Channel = new Channel();

  isEditingChannelName: boolean = false;
  isEditingDescription: boolean = false;
  channelNameDescriptionText: string = "# Entwicklerteam";
  descriptionDescriptionText: string = "Dieser Channel ist für alles rund um #dfsdf vorgesehen. Hier kannst du zusammen mit deinem Team Meetings abhalten, Dokumente teilen und Entscheidungen treffen";

  editedChannelName: string = "";
  editedDescriptionDescription: string = "";

  constructor(private route: ActivatedRoute) {}

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

  toggleOverlay(overlayId: string): void {
    const currentOverlay = document.querySelector('.overlay[style="display: block;"]') as HTMLElement;
    const newOverlay = document.getElementById(overlayId);

    if (currentOverlay && currentOverlay.id !== overlayId) {
      // Schließe das aktuelle Overlay, wenn ein anderes Overlay geöffnet ist
      currentOverlay.style.display = "none";
    }

    if (newOverlay) {
      newOverlay.style.display = newOverlay.style.display === "none" ? "block" : "none";
    }
  }

  closeOverlay(overlayId: string): void {
    const overlay = document.getElementById(overlayId) as HTMLElement;
    if (overlay) {
      overlay.style.display = "none";
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      this.itemID = paramMap.get('id');
      this.getItemValues('users', this.itemID);
    });
  }

  getItemValues(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.channel = new Channel(this.firestore.channel);
    });
  }

}
