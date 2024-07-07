import { HttpClient } from "@angular/common/http";
import { Component, OnInit, inject } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
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
import { DesktopFooterComponent } from "../../../shared/components/desktop-footer/desktop-footer.component";
import { MatchMediaService } from "../../../shared/services/match-media.service";

@Component({
    selector: "app-send-email",
    standalone: true,
    templateUrl: "./send-email.component.html",
    styleUrl: "./send-email.component.scss",
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
        DesktopFooterComponent,
    ],
})
/**
 * Represents the component responsible for sending an email.
 */
export class SendEmailComponent implements OnInit {
    /**
     * Represents the contact data for sending an email.
     */
    contactData = {
        email: "",
    };

    /**
     * The HttpClient instance used for making HTTP requests.
     */
    http = inject(HttpClient);

    /**
     * The authentication service used for sending emails.
     */
    authService = inject(AuthService);

    /**
     * The router object used for navigating between routes.
     */
    router = inject(Router);

    /**
     * Indicates whether the email has been confirmed.
     */
    confirm: boolean = false;

    /**
     * Indicates whether the current device is a desktop.
     */
    isDesktop: boolean = false;

    /**
     * The match media service used for checking the device type.
     */
    matchMedia = inject(MatchMediaService);

    /**
     * Initializes the component.
     */
    ngOnInit(): void {
        this.isDesktop = this.matchMedia.checkIsDesktop();
    }

    /**
     * Handles the form submission.
     */
    onSubmit(): void {
        this.confirm = true;
        this.authService.sendMailToResetPassword(this.contactData.email);

        setTimeout(() => {
            this.router.navigate(["/login"]);
        }, 3500);
    }
}
