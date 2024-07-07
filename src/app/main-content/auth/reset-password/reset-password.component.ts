import { HttpClient } from "@angular/common/http";
import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../shared/services/auth.service";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import {
    MatDialogActions,
    MatDialogContent,
    MatDialogModule,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { FormsModule } from "@angular/forms";
@Component({
    selector: "app-reset-password",
    standalone: true,
    imports: [
        MatCardModule,
        MatDialogModule,
        MatDialogContent,
        MatDialogActions,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        FormsModule,
        MatIconModule,
        RouterLink,
    ],
    templateUrl: "./reset-password.component.html",
    styleUrl: "./reset-password.component.scss",
})
export class ResetPasswordComponent implements OnInit {
    /**
     * Represents the contact data for resetting the password.
     */
    contactData = {
        password: "",
        confirm_password: "",
    };

    /**
     * The HttpClient instance used for making HTTP requests.
     */
    http = inject(HttpClient);
    /**
     * The authentication service used for resetting passwords.
     */
    authService = inject(AuthService);
    /**
     * The router object used for navigating between routes.
     */
    router = inject(Router);
    /**
     * The error message displayed in the reset password component.
     * It can be either a string or null.
     */
    errorMessage: string | null = null;
    /**
     * The oobCode used for resetting the password.
     */
    oobCode: string | undefined;
    /**
     * Indicates whether the reset password functionality is disabled.
     */
    isDisabled: boolean = true;
    /**
     * The minimum length required for a password.
     */
    passwordMinLength: number = 6;
    /**
     * Indicates whether the password reset is confirmed or not.
     */
    confirm: boolean = false;

    /**
     * Represents the ResetPasswordComponent class.
     * This component is responsible for handling the reset password functionality.
     */
    constructor(private route: ActivatedRoute) {}

    /**
     * Checks if the password and confirm password fields match and meet the minimum length requirement.
     * Updates the `isDisabled` property accordingly.
     */
    checkPasswords() {
        this.isDisabled =
            this.contactData.password.length >= this.passwordMinLength &&
            this.contactData.password === this.contactData.confirm_password
                ? false
                : true;
    }

    /**
     * Initializes the component.
     * Retrieves the 'oobCode' query parameter from the route.
     */
    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            this.oobCode = params["oobCode"];
        });
    }

    /**
     * Handles the form submission for resetting the password.
     */
    onSubmit(): void {
        this.confirm = true;
        setTimeout(() => {
            if (this.oobCode) {
                this.authService.resetPassword(
                    this.oobCode,
                    this.contactData.password
                );
            }
        }, 3500);
    }
}
