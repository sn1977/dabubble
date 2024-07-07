import { Component, Input, OnInit, inject } from "@angular/core";
import { AuthService } from "../../../shared/services/auth.service";
import { ProgressSpinnerComponent } from "../../../shared/components/progress-spinner/progress-spinner.component";

@Component({
    selector: "app-verify-and-change-email",
    standalone: true,
    templateUrl: "./verify-and-change-email.component.html",
    styleUrl: "./verify-and-change-email.component.scss",
    imports: [ProgressSpinnerComponent],
})
export class VerifyAndChangeEmailComponent implements OnInit {
    /**
     * The authentication service used for verifying and changing email.
     */
    authService = inject(AuthService);
    /**
     * The verification code used for email verification and change.
     */
    @Input() oobCode!: string;

    /**
     * Initializes the component.
     * This method is called after the component has been created and initialized.
     */
    ngOnInit(): void {
        this.authService.handleVerifyEmail(this.oobCode);
    }
}
