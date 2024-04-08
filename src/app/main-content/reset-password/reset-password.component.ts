import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
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
@Component({
  selector: 'app-reset-password',
  standalone: true,
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
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit{
  contactData = {
    password: '',
    confirm_password: '',
  };

  http = inject(HttpClient);
  authService = inject(AuthService);
  router = inject(Router);
  errorMessage: string | null = null;
  oobCode: string | undefined;
  isDisabled: boolean = true;

  constructor(private route: ActivatedRoute){ }

  checkPasswords() {
    this.isDisabled =
      this.contactData.password.length >= 6 &&
      this.contactData.password === this.contactData.confirm_password
        ? false
        : true;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.oobCode = params['oobCode'];
      console.log('oobCode:', this.oobCode);
    });
  }
  // ngOnInit() : void {



  //   this.id = this.route.snapshot.paramMap.get('oobCode');


  //   console.log(this.id);    
    

  //   // this.route.paramMap.subscribe((paramMap) => {
  //   //   console.log('hey');      
  //   //   const actionCode = paramMap.get('oobCode');
  //   //   console.log(paramMap.get('mode'));      

  //   //   console.log(actionCode);
      

  //   //   // this.userService.getSingleUserData(this.userID, () => {
  //   //   //   this.user = new User(this.userService.user);
  //   //   // });
  //   // });
  // }


  onSubmit(): void {
    



    // const actionCode = getParameterByName('oobCode');
    // verifyPasswordResetCode(this.authService.firebaseAuth, this.actionCode
    //   actionCode).then((email) => {
    //   const accountEmail = email;
    // this.authService.resetPassword(actionCode, this.contactData.password);
  }
}
