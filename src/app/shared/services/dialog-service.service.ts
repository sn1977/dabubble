import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DirectMessageOverlayComponent } from "../../main-content/direct-message/direct-message-overlay/direct-message-overlay.component";
import { User } from "../../../models/user.class";

@Injectable({
    providedIn: "root",
})
export class DialogServiceService {
    itemID: any = "";
    user: User = new User();

    constructor(private dialog: MatDialog) {}

    /**
     * Opens a direct message dialog.
     *
     * @param userData - The user data to pass to the dialog.
     * @param itemId - The ID of the item to pass to the dialog.
     */
    openDirectMessageDialog(userData: any, itemId: string) {
        this.dialog.open(DirectMessageOverlayComponent, {
            minWidth: "398px",
            minHeight: "600px",
            panelClass: "custom-dialog-container",
            data: { user: userData, itemId: itemId },
        });
    }
}
