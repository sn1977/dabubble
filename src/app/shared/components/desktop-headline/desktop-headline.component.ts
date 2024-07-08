import { Component, EventEmitter, Output } from "@angular/core";
import { HeaderMobileComponent } from "../header-mobile/header-mobile.component";
import { SearchInputComponent } from "../search-input/search-input.component";
import { RouterModule } from "@angular/router";

@Component({
    selector: "app-desktop-headline",
    standalone: true,
    templateUrl: "./desktop-headline.component.html",
    styleUrl: "./desktop-headline.component.scss",
    imports: [HeaderMobileComponent, SearchInputComponent, RouterModule],
})
export class DesktopHeadlineComponent {
    textData = { text: "" };
    inputHasValue = false;

    @Output() search = new EventEmitter<string>();

    /**
     * Searches the workspace based on the provided query.
     * @param query - The search query.
     */
    searchWorkspace(query: string) {
        this.inputHasValue = !!query;
        this.search.emit(query);
    }
}
