import { Component, inject } from "@angular/core";
import { AuthService } from "../../../shared/services/auth.service";
import { DialogRef } from "@angular/cdk/dialog";

@Component({
    selector: "app-verification-email-dialog",
    standalone: true,
    imports: [],
    templateUrl: "./verification-email-dialog.component.html",
    styleUrl: "./verification-email-dialog.component.scss",
})
export class VerificationEmailDialogComponent {
    /**
     * The authentication service used for verifying email addresses.
     */
    authService = inject(AuthService);

    /**
     * Represents the VerificationEmailDialogComponent class.
     * This component is responsible for handling the verification email dialog.
     */
    constructor(private dialog: DialogRef) {
        setTimeout(() => {
            this.authService.logout();
            this.dialog.close(VerificationEmailDialogComponent);
        }, 2500);
    }
}
