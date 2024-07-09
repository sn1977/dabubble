import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class ItemStateService {
    private itemIdSource = new BehaviorSubject<string | null>(null);
    itemId$ = this.itemIdSource.asObservable();

    constructor() {}

    /**
     * Sets the item ID.
     * @param id - The ID of the item.
     */
    setItemId(id: string) {
        this.itemIdSource.next(id);
    }

    /**
     * Clears the current item ID.
     */
    clearItemId() {
        this.itemIdSource.next(null);
    }
}
