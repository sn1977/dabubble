import { Injectable, inject } from "@angular/core";
import {
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
    CanActivateFn,
} from "@angular/router";
import { AuthService } from "./auth.service";

export
@Injectable({
    providedIn: "root",
})
class AuthGuardService {
    authService = inject(AuthService);

    constructor(private router: Router) {}

    /**
     * Determines if a route can be activated.
     * @param route - The activated route snapshot.
     * @param state - The router state snapshot.
     * @returns A boolean indicating whether the route can be activated.
     */
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {
        if (this.authService.activeUserAccount) {
            return true;
        } else {
            this.router.navigateByUrl("/login");
            return false;
        }
    }
}

/**
 * A guard that checks if the user is an admin before allowing access to a route.
 * @param route - The activated route snapshot.
 * @param state - The router state snapshot.
 * @returns A boolean indicating whether the user is an admin.
 */
export const IsAdminGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
): boolean => {
    return inject(AuthGuardService).canActivate(route, state);
};
