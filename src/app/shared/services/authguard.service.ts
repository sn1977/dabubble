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
  ): boolean {    
    if (this.authService.currentUserSig()?.username != null) {
      console.log(this.authService.currentUserSig()?.username);      
      return true;
    } else {      
      console.log(this.authService.currentUserSig()?.username);
      this.router.navigateByUrl('/login');
      return false;
    }
  }
}
export const IsAdminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {
  return inject(AuthGuardService).canActivate(route, state);
};
