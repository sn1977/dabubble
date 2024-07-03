import {Component, EventEmitter, Input, OnInit, Output, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import { DataService } from '../../services/data.service';
import { MatchMediaService } from '../../services/match-media.service';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss'
})
export class SearchInputComponent implements OnInit{
  textData = { text: '' };
  inputHasValue = false;
  matchMedia = inject(MatchMediaService);
  isDesktop: boolean = false;
  showDropdown = false;
  filteredResults: any[] = [];
  firestore = inject(FirestoreService);
  placeholder: string = '';
  // dataService = inject(DataService);
  @Output() search = new EventEmitter<string>(); 

  constructor(){
    this.isDesktop = this.matchMedia.checkIsDesktop();
  }
  ngOnInit(): void {
    this.firestore.globalSearch();
    this.setPlaceholderText();
  }

  setPlaceholderText(){
    if(this.isDesktop){
      this.placeholder = 'Benutzer, Kanäle & Nachrichten durchsuchen';
    }
    else {
      this.placeholder = 'Gehe zu...'
    }
  }

  async onSearchChange(query: string) {
    if (query) {
      // await this.dataService.searchWorkspace(query);
      // this.filteredResults = [
      //   ...this.dataService.channelMatches,
      //   ...this.dataService.userMatches,
      //   ...this.dataService.messageMatches
      // ];
      // this.showDropdown = this.filteredResults.length > 0;
      this.showDropdown = true;
    } else {
      // this.filteredResults = [
      //   ...this.dataService.allChannels,
      //   ...this.dataService.allUsers,
      //   ...this.dataService.allMessages
      // ];
      //this.showDropdown = true;
      // this.filteredResults = [];
      this.showDropdown = false;
      // this.search.emit('');  // Emit an empty string to indicate the input was cleared
    }
  }

  // onResultClick(result: any) {
  //   this.textData.text = result.name || result.displayName || result.text;
  //   this.showDropdown = false;
  //   this.search.emit(this.textData.text);
  // }
}
