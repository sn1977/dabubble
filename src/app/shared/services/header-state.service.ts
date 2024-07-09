import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class HeaderStateService {
    private _alternativeHeader = new BehaviorSubject<boolean>(false);
    alternativeHeader$ = this._alternativeHeader.asObservable();

    /**
     * Sets the alternative header value.
     *
     * @param value - The new value for the alternative header.
     */
    setAlternativeHeader(value: boolean) {
        this._alternativeHeader.next(value);
    }
}
