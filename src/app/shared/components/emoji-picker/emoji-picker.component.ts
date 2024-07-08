import { Component, EventEmitter, Output } from "@angular/core";
import { EmojiEvent } from "@ctrl/ngx-emoji-mart/ngx-emoji";
import { PickerComponent } from "@ctrl/ngx-emoji-mart";

@Component({
    selector: "app-emoji-picker",
    templateUrl: "./emoji-picker.component.html",
    styleUrls: ["./emoji-picker.component.scss"],
    standalone: true,
    imports: [PickerComponent],
})
export class EmojiPickerComponent {
    @Output() emojiSelect = new EventEmitter<string>();

    /**
     * Handles the selection of an emoji.
     *
     * @param event - The EmojiEvent object containing the selected emoji.
     */
    onEmojiSelect(event: EmojiEvent) {
        if (event.emoji && event.emoji.unified) {
            const emojiUnicode = this.convertToNative(event.emoji.unified);
            this.emojiSelect.emit(emojiUnicode);
        }
    }

    /**
     * Converts a Unicode string to its native representation.
     *
     * @param unified - The Unicode string to convert.
     * @returns The native representation of the Unicode string.
     */
    convertToNative(unified: string): string {
        return unified
            .split("-")
            .map((u) => String.fromCodePoint(parseInt(u, 16)))
            .join("");
    }
}
