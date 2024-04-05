import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  CanActivate,
  UrlTree,
  CanActivateFn,
} from '@angular/router';
import { Observable, catchError, map } from 'rxjs';
import { AuthService } from './auth.service';

export
@Injectable({
  providedIn: 'root',
})
class AuthGuardService {
  //authService = inject(AuthService);
  //router = inject(Router);
  
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): any {    
    
    //https://stackoverflow.com/questions/77844746/angular-how-to-resolve-canactivate-deprecated-in-angular-15-using-auth-guard

    this.authService.user$.subscribe((user) => {
      if (user) {
        return true;
      } else {
        return false;
      }
      //console.log('Current User', this.authService.currentUserSig());
    })
    
    // if (this.authService.currentUserSig()?.username != null) {
    //   console.log(this.authService.currentUserSig()?.username);      
    //   return true;
    // } else {      
    //   console.log(this.authService.currentUserSig()?.username);
    //   this.router.navigateByUrl('/login');
    //   return false;
    // }
  }
}
export const IsAdminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {
  return inject(AuthGuardService).canActivate(route, state);
};
