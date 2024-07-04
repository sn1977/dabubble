import {Component, EventEmitter, Input, OnInit, Output, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import { DataService } from '../../services/data.service';
import { MatchMediaService } from '../../services/match-media.service';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../services/firestore.service';
import { query } from 'firebase/firestore';

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
  firestore = inject(FirestoreService);
  placeholder: string = '';
  resultList: any [] = [];
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
  
  findeEintraegeMitWert(array: any, gesuchterText: any) {
    const gesuchterTextKlein = gesuchterText.toLowerCase();
  return array.filter((eintrag: { data: { text: any; displayName: any; email: any; description: any; name: any; }; }) => {
    const text = (eintrag.data?.text || "").toLowerCase();
    const displayName = (eintrag.data?.displayName || "").toLowerCase();
    const email = (eintrag.data?.email || "").toLowerCase();
    const description = (eintrag.data?.description || "").toLowerCase();
    const name = (eintrag.data?.name || "").toLowerCase();
    return text.includes(gesuchterTextKlein) || displayName.includes(gesuchterTextKlein) ||email.includes(gesuchterTextKlein) ||
           description.includes(gesuchterTextKlein) || name.includes(gesuchterTextKlein);
  });
  }
  
  startSearching(query: string){
    this.resultList = this.findeEintraegeMitWert(this.firestore.globalValuesArray, query);      
    console.log('Suchwert: ', query);    
    console.log(this.resultList);
    if(query){
      this.showDropdown = true;
    } else{
      this.showDropdown = false;
    }

  }
}
