import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogContent} from '@angular/material/dialog';
import {Channel} from '../../models/channel.class';
import {User} from '../../models/user.class';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-search-results-dialog',
  standalone: true,
  imports: [
    MatDialogContent,
    NgForOf,
    NgIf
  ],
  templateUrl: './search-results-dialog.component.html',
  styleUrl: './search-results-dialog.component.scss'
})
export class SearchResultsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {results: any[]}) { }

  // protected readonly Channel = Channel;
  // protected readonly User = User;

  // isChannel(item: any): boolean {
  //   return item instanceof Channel;
  // }
  //
  // isUser(item: any): boolean {
  //   return item instanceof User;
  // }

}
