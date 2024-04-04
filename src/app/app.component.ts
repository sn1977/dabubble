import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LogInComponent } from './main-content/log-in/log-in.component';
// import {HeaderMobileComponent} from './shared/components/header-mobile/header-mobile.component';
import {MainContentComponent} from './main-content/main-content.component';
import { AuthService } from './shared/services/auth.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LogInComponent,
    // HeaderMobileComponent,
    MainContentComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  
  title = 'dabubble';  
  authService = inject(AuthService);
  
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
      console.log('Current User', this.authService.currentUserSig());      
    })
  }

  logout(): void{
    console.log('User logged out');
    this.authService.logout();  
  }

}
