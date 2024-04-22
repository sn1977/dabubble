import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firestoreTimestamp',
  standalone: true
})
export class FirestoreTimestampPipe implements PipeTransform {

  transform(timestamp: any): string {
    const date = timestamp.toDate(); // Konvertiere Firestore Timestamp in ein JavaScript Date-Objekt
    return date.toLocaleString(); // Formatieren Sie das Datum nach Ihren Wünschen
  }

}
