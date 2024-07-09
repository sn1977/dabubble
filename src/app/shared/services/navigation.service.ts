import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
@Injectable({
    providedIn: "root",
})
export class NavigationService {
    constructor(private location: Location, private router: Router) {}

    /**
     * Navigates back to the previous location in the browser history.
     */
    goBack(): void {
        this.location.back();
    }

    /**
     * Navigates to the specified path.
     *
     * @param path - The path to navigate to. It can be a string or an array of strings.
     */
    navigate(path: string | string[]): void {
        this.router.navigate(Array.isArray(path) ? path : [path]);
    }
}
