import { Component, OnInit, inject } from "@angular/core";
import { MainContentComponent } from "../../../main-content/main-content.component";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { RouterModule, RouterOutlet } from "@angular/router";
import { ThreadComponent } from "../thread/thread.component";
import { MatchMediaService } from "../../services/match-media.service";
import { Router, RouterLink } from "@angular/router";
@Component({
    selector: "app-desktop-content",
    standalone: true,
    templateUrl: "./desktop-content.component.html",
    styleUrl: "./desktop-content.component.scss",
    imports: [
        MainContentComponent,
        CommonModule,
        MatCardModule,
        RouterOutlet,
        RouterLink,
        RouterModule,
        ThreadComponent,
    ],
})
export class DesktopContentComponent implements OnInit {
    matchMedia = inject(MatchMediaService);
    router = inject(Router);
    isDesktop: boolean = false;
    isCollapsed: boolean = false;
    hovered: boolean = false;

    /**
     * Initializes the component.
     * This method is called after the component has been created and initialized.
     */
    ngOnInit(): void {
        this.isDesktop = this.matchMedia.checkIsDesktop();
    }

    /**
     * Toggles the visibility of a div element.
     */
    toggleDiv() {
        this.matchMedia.showSearchDropdown = false;
        this.isCollapsed = !this.isCollapsed;
    }

    /**
     * Sets the `hovered` property to `false`.
     */
    deleteHovered() {
        this.hovered = false;
    }

    /**
     * Opens the new message page.
     * Hides the search dropdown and sets the loading state to true.
     * Navigates to the '/new-message' route.
     */
    openNewMessage() {
        this.matchMedia.showSearchDropdown = false;
        this.matchMedia.loading = true;
        this.router.navigateByUrl("/new-message");
    }
}
