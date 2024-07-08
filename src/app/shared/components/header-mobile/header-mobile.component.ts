import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    inject,
    Input,
    OnInit,
    ViewChild,
} from "@angular/core";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { BottomSheetComponent } from "../bottom-sheet/bottom-sheet.component";
import { AuthService } from "../../services/auth.service";
import { FirestoreService } from "../../services/firestore.service";
import { User } from "../../../../models/user.class";
import { CommonModule, Location } from "@angular/common";
import { HeaderStateService } from "../../services/header-state.service";
import { Router } from "@angular/router";
import { DesktopOverlayComponent } from "../desktop-overlay/desktop-overlay.component";
import { MatchMediaService } from "../../services/match-media.service";

@Component({
    selector: "app-header-mobile",
    standalone: true,
    imports: [BottomSheetComponent, CommonModule, DesktopOverlayComponent],
    templateUrl: "./header-mobile.component.html",
    styleUrl: "./header-mobile.component.scss",
})
export class HeaderMobileComponent implements OnInit {
    firestore = inject(FirestoreService);
    authService = inject(AuthService);
    matchMedia = inject(MatchMediaService);
    user: User = new User();
    @Input() alternativeHeader: boolean = false;
    @Input() isDesktop: boolean = false;
    hoverBack: boolean = false;
    overlayVisible = false;
    defaultImage: string = "assets/img/icon/keyboard_arrow_down.svg";
    hoverImage: string = "assets/img/icon/keyboard_arrow_down_color.svg";
    currentImage: string = this.defaultImage;

    constructor(
        private _bottomSheet: MatBottomSheet,
        private headerStateService: HeaderStateService,
        private _location: Location,
        private router: Router,
        private cd: ChangeDetectorRef
    ) {}

    /**
     * Initializes the component.
     * This method is called after the component's data-bound properties have been initialized.
     * It waits for user data, performs some tests, and subscribes to the alternativeHeader observable.
     * @returns A promise that resolves when the initialization is complete.
     */
    async ngOnInit(): Promise<void> {
        await this.waitForUserData();
        this.test();

        this.headerStateService.alternativeHeader$.subscribe((value) => {
            this.alternativeHeader = value;
        });
    }

    /**
     * Waits for the user data to be available.
     * @returns A Promise that resolves when the user data is available.
     */
    async waitForUserData(): Promise<void> {
        while (!this.authService.activeUserAccount) {
            await this.delay(100); // Wartezeit in Millisekunden, bevor erneut überprüft wird
        }
    }

    delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Performs a test operation.
     */
    test() {
        let id = this.authService.activeUserAccount.uid;
        this.getItemValues("users", id);
    }

    /**
     * Opens the bottom sheet component if the device is not a desktop.
     * @returns void
     */
    openBottomSheet(): void {
        if (!this.isDesktop) {
            const bottomSheetRef = this._bottomSheet.open(
                BottomSheetComponent,
                {
                    data: { user: this.user }, // Übergabe des Benutzerobjekts an die BottomSheet
                }
            );

            bottomSheetRef.afterDismissed().subscribe((result) => {
                // Hier kannst du weitere Aktionen ausführen, nachdem die Bottom Sheet geschlossen wurde
            });
        }
    }

    /**
     * Retrieves the values of a specific item from a collection in Firestore.
     * @param collection - The name of the collection in Firestore.
     * @param itemID - The ID of the item to retrieve.
     */
    getItemValues(collection: string, itemID: string) {
        this.firestore.getSingleItemData(collection, itemID, () => {
            this.user = new User(this.firestore.user);
        });
    }

    /**
     * Navigates back to the main page and updates the header state.
     */
    onBack(): void {
        this.matchMedia.scrollToBottom = true;
        this.matchMedia.scrollToBottomThread = true;
        this.router.navigate(["/main"]);
        this.headerStateService.setAlternativeHeader(false);
    }

    /**
     * Opens the overlay.
     * If the device is desktop, toggles the visibility of the overlay.
     */
    openOverlay(): void {
        this.matchMedia.showSearchDropdown = false;
        if (this.isDesktop) {
            this.overlayVisible = !this.overlayVisible;
        }
    }

    /**
     * Closes the overlay.
     * This method sets the `overlayVisible` property to `false` and manually triggers change detection.
     */
    closeOverlay(): void {
        this.overlayVisible = false; // Hier definieren wir die closeOverlay Methode
        this.cd.detectChanges(); // Manually trigger change detection
    }
}
