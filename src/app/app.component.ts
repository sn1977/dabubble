import {Component, OnInit, inject, ViewEncapsulation} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LogInComponent } from './main-content/auth/log-in/log-in.component';
import {HeaderMobileComponent} from './shared/components/header-mobile/header-mobile.component';
import {MainContentComponent} from './main-content/main-content.component';
import { AuthService } from './shared/services/auth.service';
import { FirebaseService } from './shared/services/firebase.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LogInComponent,
    HeaderMobileComponent,
    MainContentComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit{

  title = 'dabubble';
  authService = inject(AuthService);
  firestore = inject(FirebaseService);

  constructor(){
    this.showInfos();
  }
  
  showInfos(){

    setInterval(() => {

      if(this.authService.activeUserAccount){
        console.log(this.authService.activeUserAccount);
      } else {
        console.log('no active user');        
      }

    }, 20000);

  }

  ngOnInit(): void {

    this.authService.user$.subscribe(user => {
      if(user){
        this.authService.currentUserSig.set({
          email: user.email!,
          username: user.displayName!,
        });
      } else {
        this.authService.currentUserSig.set(null);
      }
    })
  }
}
