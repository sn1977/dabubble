import { Component, inject, Inject, OnDestroy, OnInit } from "@angular/core";
import {
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardImage,
} from "@angular/material/card";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogRef,
} from "@angular/material/dialog"; // Import MatDialog
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { User } from "../../../../models/user.class";
import { FirestoreService } from "../../../shared/services/firestore.service";
import { AuthService } from "../../../shared/services/auth.service";
import { ChooseAvatarComponent } from "../../auth/register/choose-avatar/choose-avatar.component";
import { Validators, FormControl } from "@angular/forms";
import { UploadService } from "../../../shared/services/upload.service";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import { MemberService } from "../../../shared/services/member-service.service";
import { Auth } from "@angular/fire/auth";
// import { AvatarService } from "../../../shared/services/avatar-service.service";
import { getAuth, updateEmail, sendEmailVerification } from "firebase/auth";

@Component({
    selector: "app-edit-profil-card",
    standalone: true,
    imports: [
        MatCard,
        MatCardContent,
        MatCardImage,
        NgOptimizedImage,
        ReactiveFormsModule,
        FormsModule,
        MatCardActions,
        MatButton,
        CommonModule,
    ],
    templateUrl: "./edit-profil-card.component.html",
    styleUrl: "./edit-profil-card.component.scss",
})
export class EditProfilCardComponent implements OnInit, OnDestroy {
    firebaseAuth = inject(Auth);
    authService = inject(AuthService);
    user: User = new User();
    templateIndex: number = 0;
    nameData = { name: "" };
    emailData = { email: "" };
    namePlaceholder?: string;
    emailPlaceholder?: string;
    inputHasValue = false;

    nameControl = new FormControl("", [
        Validators.required,
        Validators.minLength(5),
    ]);

    emailControl = new FormControl("", [
        Validators.required,
        Validators.pattern("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"),
    ]);

    contactData = {
        name: "Sascha",
        email: "",
        password: "",
        photoURL: "",
    };

    selectedAvatar: FileList | undefined;
    file: any = undefined;
    filedate: number | undefined;
    errorMessage: string | null = null;
    fileType: string = "";
    maxSizeReached: boolean = false;
    currentUser: string = "";
    auth = getAuth();

    constructor(
        private firestore: FirestoreService,
        public dialogRef: MatDialogRef<EditProfilCardComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { user: User },
        private uploadService: UploadService,
        public dialog: MatDialog, // Add MatDialog as a property
        private memberService: MemberService // private avatarService: AvatarService
    ) {
        console.log("Übergebene Benutzerdaten:", this.data.user);
    }

    updateMemberAvatar(newAvatarUrl: string) {
        this.memberService.updateMemberAvatar(
            this.authService.activeUserAccount.uid,
            newAvatarUrl
        );
    }

    // updateEmailForUser() {
    //     const auth = getAuth();
    //     const user = auth.currentUser;
    //     if (user && this.emailControl.valid) {
    //         const newEmail = this.emailControl.value;
    //         if (newEmail) {
    //             updateEmail(user, newEmail)
    //                 .then(() => {
    //                     console.log("Email successfully updated to:", newEmail);
    //                     return sendEmailVerification(user);
    //                 })
    //                 .then(() => {
    //                     console.log("Verification email sent.");
    //                 })
    //                 .catch((error) => {
    //                     console.error(
    //                         "Error in email update or verification process:",
    //                         error
    //                     );
    //                 });
    //         }
    //     } else {
    //         console.error("No user is logged in or email input is invalid.");
    //     }
    // }

    // updateEmailForUser() {
    //     const auth = getAuth();
    //     const user = auth.currentUser;
    //     if (user && this.emailControl.valid) {
    //         const newEmail = this.emailControl.value;
    //         if (newEmail) {
    //             // Zuerst die Verifizierungs-E-Mail senden
    //             sendEmailVerification(user).then(() => {
    //                 console.log("Verification email sent to the new email address.");
    //             }).catch((error) => {
    //                 console.error("Error sending verification email:", error);
    //             });

    //             // Update-E-Mail-Prozess
    //             user.reload().then(() => {
    //                 if (user.emailVerified) {
    //                     updateEmail(user, newEmail).then(() => {
    //                         console.log("Email successfully updated to:", newEmail);
    //                     }).catch((error) => {
    //                         console.error("Error updating email:", error);
    //                     });
    //                 } else {
    //                     console.error("Please verify the new email before changing email.");
    //                 }
    //             }).catch((error) => {
    //                 console.error("Error reloading user:", error);
    //             });
    //         }
    //     } else {
    //         console.error("No user is logged in or email input is invalid.");
    //     }
    // }

    // updateEmailForUser() {
    //     const auth = getAuth();
    //     const user = auth.currentUser;

    //     if (user && this.emailControl.valid) {
    //         const newEmail = this.emailControl.value;

    //         if (newEmail) {
    //             // Update the email address
    //             updateEmail(user, newEmail).then(() => {
    //                 console.log("Email successfully updated to:", newEmail);

    //                 // Send verification email to the new email address
    //                 sendEmailVerification(user).then(() => {
    //                     console.log("Verification email sent to the new email address.");
    //                 }).catch((error) => {
    //                     console.error("Error sending verification email:", error);
    //                 });

    //             }).catch((error) => {
    //                 console.error("Error updating email:", error);
    //             });

    //         } else {
    //             console.error("New email is invalid or empty.");
    //         }
    //     } else {
    //         console.error("No user is logged in or email input is invalid.");
    //     }
    // }

    async updateEmailForUser() {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user !== null) {
            // The user object has basic properties such as display name, email, etc.
            const displayName = user.displayName;
            const email = user.email;
            const photoURL = user.photoURL;
            const emailVerified = user.emailVerified;
          
            // The user's ID, unique to the Firebase project. Do NOT use
            // this value to authenticate with your backend server, if
            // you have one. Use User.getToken() instead.
            const uid = user.uid;
            console.log("User is signed in:", displayName, "<br>", email, "<br>", photoURL, "<br>", emailVerified, "<br>", uid);

            if (this.emailControl.valid) {
                    const newEmail = this.emailControl.value;
        
                    if (newEmail) {
                        // Speichere die neue E-Mail-Adresse im Local Storage oder Session Storage
                        localStorage.setItem("newEmail", newEmail);

                        try {
                            await user.getIdToken(true); // Holen Sie sich ein aktuelles ID-Token
                            await sendEmailVerification(user); // Verifizierung an alte Email senden
                            alert("Verification email sent. Please verify your new email address.");
                        } catch (error) {
                            console.log("Error sending verification email:", error);
                        }
                    }
                }
            } else {
                console.log("No user is signed in.");
            }
        
                

        // if (user && this.emailControl.valid) {
        //     const newEmail = this.emailControl.value;

        //     if (newEmail) {
        //         // Speichere die neue E-Mail-Adresse im Local Storage oder Session Storage
        //         localStorage.setItem("newEmail", newEmail);

        //         // Zuerst die Verifizierungs-E-Mail an die neue E-Mail-Adresse senden
        //         sendEmailVerification(user)
        //             .then(() => {
        //                 console.log(
        //                     "Verification email sent to the new email address."
        //                 );

        //                 // Benachrichtige den Nutzer, die neue E-Mail-Adresse zu verifizieren
        //                 alert(
        //                     "Please verify your new email address by clicking the link sent to your new email."
        //                 );
        //             })
        //             .catch((error) => {
        //                 console.error(
        //                     "Error sending verification email:",
        //                     error
        //                 );
        //             });
        //     } else {
        //         console.error("New email is invalid or empty.");
        //     }
        // } else {
        //     console.error("No user is logged in or email input is invalid.");
        // }
    }

    updateEmailAfterVerification(newEmail: string) {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            updateEmail(user, newEmail)
                .then(() => {
                    console.log("Email successfully updated to:", newEmail);
                })
                .catch((error) => {
                    console.error("Error updating email:", error);
                });
        } else {
            console.error("No user is logged in.");
        }
    }

    confirmEmailUpdate() {
        const newEmail = this.emailControl.value;
        if (newEmail) {
            // Stelle sicher, dass die E-Mail-Adresse nach Verifizierung aktualisiert wird
            this.updateEmailAfterVerification(newEmail);
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    checkInput(value: string): void {
        this.inputHasValue = !!value.trim();
    }

    closeEditProfilCard() {
        this.dialogRef.close();
    }

    onFocus() {
        this.namePlaceholder = "";
        this.emailPlaceholder = "";
    }

    ngOnInit() {
        this.firestore.subUserList(); // Abonniere die Benutzerliste

        this.nameData.name = this.data.user.displayName || "";
        this.emailData.email = this.data.user.email || "";
    }

    ngOnDestroy() {
        this.firestore.unsubUsers(); // Beende das Abonnement
    }

    saveProfile(): void {
        // Überprüfen Sie, ob nameControl und emailControl gültig sind
        if (this.nameControl.valid && this.emailControl.valid) {
            // Aktualisiere das User-Objekt mit neuen Daten aus den Formularfeldern
            this.data.user.displayName =
                this.nameData.name || this.data.user.displayName;
            this.data.user.email = this.emailData.email || this.data.user.email;

            this.firestore
                .updateUser(
                    this.data.user,
                    this.authService.activeUserAccount.uid
                )
                .then(() => {
                    this.dialogRef.close();
                })
                .catch((error) => {
                    console.error(
                        "Fehler beim Aktualisieren des Profils:",
                        error
                    );
                });

            if (this.firebaseAuth.currentUser?.photoURL) {
                this.authService.updateUserData(
                    this.nameData.name,
                    this.firebaseAuth.currentUser.photoURL
                );
            }

            this.updateEmailForUser();
        }
    }

    openAvatarDialog(): void {
        console.log(this.contactData);

        this.dialog.open(ChooseAvatarComponent, {
            width: "80%",
            data: { user: this.contactData },
        });
    }

    uploadSingleFile2() {
        if (this.selectedAvatar) {
            this.file = this.selectedAvatar.item(0);

            if (this.file?.size && this.file?.size <= 500000) {
                this.maxSizeReached = false;
                this.filedate = new Date().getTime();
                this.fileType = this.file.type;
                this.uploadService
                    .uploadFile(this.file, this.filedate, "character")
                    .then((url: string) => {
                        this.updateAuthService(url);
                        this.data.user.avatar = url;
                        this.authService.activeUserAccount.photoURL = url;
                        this.updateMemberAvatar(url);
                    })
                    .catch((error) => {
                        this.errorMessage = error.code;
                    });
            } else {
                this.maxSizeReached = true;
            }
        }
    }

    updateAuthService(url: string) {
        this.authService.updateUserData(this.user.displayName!, url);
    }

    detectAvatar(event: any) {
        this.selectedAvatar = event.target.files;
        this.uploadSingleFile2();
    }

    setAvatar(event: any) {
        this.data.user.avatar = event.target.src;
        this.updateAuthService(event.target.src);
    }
}
