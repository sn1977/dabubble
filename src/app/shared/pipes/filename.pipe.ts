import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "filename",
    standalone: true,
})
export class FilenamePipe implements PipeTransform {
    /**
     * Transforms a URL-encoded string into a filename.
     *
     * @param value - The URL-encoded string to transform.
     * @returns The filename extracted from the URL-encoded string.
     */
    transform(value: string): string {
        if (!value) {
            return "";
        }
        try {
            const decodedUrl = decodeURIComponent(value);
            const startIndex =
                decodedUrl.indexOf("attachments/") + "attachments/".length;
            let filename = decodedUrl.substring(startIndex);
            const endIndex = filename.indexOf("?");
            if (endIndex !== -1) {
                filename = filename.substring(0, endIndex);
            }
            return filename;
        } catch (e) {
            return value;
        }
    }
}
