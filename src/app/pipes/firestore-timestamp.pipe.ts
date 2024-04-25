import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firestoreTimestamp',
  standalone: true
})
export class FirestoreTimestampPipe implements PipeTransform {

  transform(timestamp: any): string {
    const date = timestamp.toDate();
    return date.date.toISOString();
  }
}
