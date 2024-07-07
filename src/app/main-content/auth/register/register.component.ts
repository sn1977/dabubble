import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ChooseAvatarComponent } from './choose-avatar/choose-avatar.component';
import { DesktopFooterComponent } from "../../../shared/components/desktop-footer/desktop-footer.component";
import { MatchMediaService } from '../../../shared/services/match-media.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-register',
    standalone: true,
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss',
    imports: [
        MatCardModule,
        MatDialogModule,
        MatDialogContent,
        MatDialogActions,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        FormsModule,
        MatIconModule,
        RouterLink,
        ChooseAvatarComponent,
        DesktopFooterComponent,
        CommonModule
    ]
})
export class RegisterComponent implements OnInit{
  
  /**
   * Indicates whether the avatar component should be shown or not.
   */
  showAvatarComponent:boolean = false;
  /**
   * Indicates whether the current device is a desktop or not.
   */
  isDesktop: boolean = false;
  /**
   * Service for matching media queries.
   */
  matchMedia = inject(MatchMediaService);

  /**
   * Represents the contact data for registration.
   */
  contactData = {
    name: '',
    email: '',
    password: '',
    photoURL: ''
  };
  
  /**
   * The router instance for navigating between routes.
   */
  router = inject(Router);
  /**
   * The error message displayed in the register component.
   * It can be either a string or null.
   */
  errorMessage: string | null = null;
  /**
   * Represents the contact data used for updating user information.
   */
  updateContactData: any;

  /**
   * Initializes the component.
   * This method is called after the component has been created and initialized.
   */
  ngOnInit(): void {
    this.isDesktop = this.matchMedia.checkIsDesktop();
  }

  /**
   * Handles the form submission event.
   * If all required fields are filled, it sets the `showAvatarComponent` property to true.
   */
  onSubmit(): void {    
    if (this.contactData.name && this.contactData.email && this.contactData.password) {      
      this.showAvatarComponent = true
    }
  }
}
