import {Component, EventEmitter, Input, Output, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import { DataService } from '../../shared/services/data.service';
import { MatchMediaService } from '../../shared/services/match-media.service';
import { CommonModule } from '@angular/common';

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
export class SearchInputComponent {
  textData = { text: '' };
  inputHasValue = false;
  matchMedia = inject(MatchMediaService);
  isDesktop: boolean = false;

  dataService = inject(DataService);
  @Output() search = new EventEmitter<string>(); 

  constructor(){
    this.isDesktop = this.matchMedia.checkIsDesktop();
  }

}
