import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class DateFormatService {
    private months: string[] = [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember",
    ];

    private weekdays: string[] = [
        "Sonntag",
        "Montag",
        "Dienstag",
        "Mittwoch",
        "Donnerstag",
        "Freitag",
        "Samstag",
    ];

    /**
     * Formats a timestamp into a string representation of the date in the format 'YYYYMMDD'.
     * If the timestamp is not available or invalid, returns the string 'Datum nicht verfügbar'.
     *
     * @param timestamp - The timestamp to format.
     * @returns The formatted date string or 'Datum nicht verfügbar'.
     */
    formatDateYYYYMMDD(timestamp: any): string {
        if (timestamp && timestamp.seconds) {
            const date = new Date(timestamp.seconds * 1000);
            const formattedDate = date
                .toISOString()
                .slice(0, 10)
                .replace(/-/g, "");
            return formattedDate;
        } else {
            return "Datum nicht verfügbar";
        }
    }

    /**
     * Formats a timestamp into a custom date format.
     * @param timestamp - The timestamp object containing seconds and nanoseconds.
     * @returns The formatted date string.
     */
    formatDate(timestamp: { seconds: number; nanoseconds: number }): any {
        if (timestamp && timestamp.seconds) {
            const date = new Date(timestamp.seconds * 1000);
            const day = this.weekdays[date.getUTCDay()];
            const dayOfMonth = date.getUTCDate();
            const month = this.months[date.getUTCMonth()];
            return `${day}, ${dayOfMonth} ${month}`;
        }
    }

    /**
     * Formats a timestamp into a string representing the time in hours and minutes.
     * @param timestamp - The timestamp object containing seconds and nanoseconds.
     * @returns A string representing the formatted time in the format "HH:MM".
     */
    formatTime(timestamp: { seconds: number; nanoseconds: number }): any {
        if (timestamp && timestamp.seconds) {
            const date = new Date(timestamp.seconds * 1000);
            const hours = ((date.getUTCHours() + 2) % 24)
                .toString()
                .padStart(2, "0");
            const minutes = date.getUTCMinutes().toString().padStart(2, "0");
            return `${hours}:${minutes}`;
        }
    }
}
