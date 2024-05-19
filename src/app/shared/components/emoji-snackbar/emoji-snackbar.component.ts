import {Component, Inject} from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-emoji-snackbar',
  standalone: true,
  imports: [],
  templateUrl: './emoji-snackbar.component.html',
  styleUrl: './emoji-snackbar.component.scss'
})
export class EmojiSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }
}
