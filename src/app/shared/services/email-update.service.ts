import { Injectable } from '@angular/core';
import { getAuth, updateEmail } from 'firebase/auth';

@Injectable({
    providedIn: 'root'
})
export class EmailUpdateService {
    constructor() {}

    updateEmailAfterVerification(newEmail: string) {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            updateEmail(user, newEmail).then(() => {
                console.log("Email successfully updated to:", newEmail);
            }).catch((error) => {
                console.error("Error updating email:", error);
            });
        } else {
            console.error("No user is logged in.");
        }
    }
}