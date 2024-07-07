import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatchMediaService } from '../../services/match-media.service';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../services/firestore.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
})
export class SearchInputComponent implements OnInit {
  textData = { text: '' };
  inputHasValue = false;
  matchMedia = inject(MatchMediaService);
  isDesktop: boolean = false;  
  firestore = inject(FirestoreService);
  placeholder: string = '';
  resultList: any[] = [];
  groupedData: { [key: string]: any[] } = {};
  router = inject(Router);
  @Output() search = new EventEmitter<string>();

  constructor() {
    this.isDesktop = this.matchMedia.checkIsDesktop();
  }
  
  async ngOnInit(): Promise<void> {
    this.firestore.globalSearch();
    this.setPlaceholderText();
  }

  setPlaceholderText() {
    if (this.isDesktop) {
      this.placeholder = 'Benutzer, Kanäle & Nachrichten durchsuchen';
    } else {
      this.placeholder = 'Gehe zu...';
    }
  }

  findeEintraegeMitWert(array: any, searchInputValue: any) {
    const searchInputValueSmall = searchInputValue.toLowerCase();
    return array.filter(
      (entry: {
        data: {
          text: any;
          displayName: any;
          email: any;
          description: any;
          name: any;
        };
      }) => {
        const text = (entry.data?.text || '').toLowerCase();
        const displayName = (entry.data?.displayName || '').toLowerCase();
        const email = (entry.data?.email || '').toLowerCase();
        const description = (entry.data?.description || '').toLowerCase();
        const name = (entry.data?.name || '').toLowerCase();
        return (
          text.includes(searchInputValueSmall) ||
          displayName.includes(searchInputValueSmall) ||
          email.includes(searchInputValueSmall) ||
          description.includes(searchInputValueSmall) ||
          name.includes(searchInputValueSmall)
        );
      }
    );
  }

  async startSearching(query: string) {
    this.groupedData = {};
    this.resultList = this.findeEintraegeMitWert(
      this.firestore.globalValuesArray,
      query
    );    
    if (query) {
      this.matchMedia.showSearchDropdown = true;
    } else {
      this.matchMedia.showSearchDropdown = false;
    }
    await this.groupDataByType();
    console.log(this.groupedData);    
  }    

  async groupDataByType() {
    this.resultList.forEach((item) => {
      const type = item.type;
      if (!this.groupedData[type]) {
        this.groupedData[type] = [];
      }
      this.groupedData[type].push(item);
    });
  }

  openSelectedResult(type: string, id: string, name: string, thread: boolean){
    this.matchMedia.showSearchDropdown = false;
    this.textData.text = '';
    this.matchMedia.loading = true;
    this.matchMedia.channelName = name;
    this.matchMedia.showThread = thread;
    this.firestore.conversation = '';
    this.router.navigate([type, id]);
  }

  getDisplayNameById(id: string): string | undefined {
    const user = this.firestore.userList.find((user: { id: string; }) => user.id === id);
    return user ? user.displayName : undefined;
  }
}
