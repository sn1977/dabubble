import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class MemberService {
    private members = new BehaviorSubject<any[]>([]);

    /**
     * Sets the members of the service.
     * @param {any[]} members - An array of members to set.
     */
    setMembers(members: any[]) {
        this.members.next(members);
    }

    /**
     * Returns an observable of members.
     * @returns An observable of members.
     */
    getMembers() {
        return this.members.asObservable();
    }

    /**
     * Updates the avatar of a member.
     * @param {string} uid - The unique identifier of the member.
     * @param {string} newAvatarUrl - The URL of the new avatar.
     */
    updateMemberAvatar(uid: string, newAvatarUrl: string) {
        const members = this.members.getValue();
        const member = members.find((member) => member.uid === uid);
        if (member) {
            member.avatar = newAvatarUrl;
        }
        this.setMembers(members);
    }
}
