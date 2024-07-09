import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class AvatarService {
    private avatarChangeSource = new Subject<string>();
    avatarChange$ = this.avatarChangeSource.asObservable();

    /**
     * Changes the avatar URL and notifies subscribers.
     *
     * @param newAvatarUrl - The new URL of the avatar.
     */
    avatarChanged(newAvatarUrl: string) {
        this.avatarChangeSource.next(newAvatarUrl);
    }
}
