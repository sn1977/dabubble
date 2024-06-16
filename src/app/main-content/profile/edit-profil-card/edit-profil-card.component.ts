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
        private memberService: MemberService
    ) // private avatarService: AvatarService
    {
        console.log("Übergebene Benutzerdaten:", this.data.user);
    }

    updateMemberAvatar(newAvatarUrl: string) {
        this.memberService.updateMemberAvatar(
            this.authService.activeUserAccount.uid,
            newAvatarUrl
        );
    }

    updateEmailForUser() {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user && this.emailControl.valid) {
            const newEmail = this.emailControl.value;
            if (newEmail) {
                updateEmail(user, newEmail).then(() => {
                    console.log("Email successfully updated to:", newEmail);
                    return sendEmailVerification(user);
                }).then(() => {
                    console.log("Verification email sent.");
                }).catch((error) => {
                    console.error("Error in email update or verification process:", error);
                });
            }
        } else {
            console.error("No user is logged in or email input is invalid.");
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
                        this.authService.updateUserData(
                            this.user.displayName!,
                            url
                        );
                        //NOTE - direkt live anzeigen lassen & in authentififizierung (UID) speichern / ändern & user.objekt speichern
                        // this.contactData.photoURL = url;
                        // this.textBoxData.inputField = url;
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

    detectAvatar(event: any) {
        this.selectedAvatar = event.target.files;
        this.uploadSingleFile2();
    }

    setAvatar(event: any) {
        this.data.user.avatar = event.target.src;
    }

    // updateMemberAvatar(newAvatarUrl: string) {
    //     // Durchlaufen Sie jedes Mitglied in channel.member
    //     this.channel.member.forEach(member => {
    //       // Wenn die uid des Mitglieds mit der uid des aktiven Benutzers übereinstimmt, aktualisieren Sie das avatar-Feld
    //       if (member.uid === this.authService.activeUserAccount.uid) {
    //         member.avatar = newAvatarUrl;
    //       }
    //     });
    //   }

    // onAvatarChange(newAvatarUrl: string) {
    //      // Lösen Sie ein Ereignis aus, wenn das Profilbild geändert wird
    // this.avatarService.avatarChanged(newAvatarUrl);
    //   }
}
