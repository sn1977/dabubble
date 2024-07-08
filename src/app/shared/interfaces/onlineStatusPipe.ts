import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'onlineStatus'
})
export class OnlineStatusPipe implements PipeTransform {

  /**
   * Transforms a boolean value into a string representation of online status.
   * @param value - The boolean value indicating the online status.
   * @returns The string representation of the online status ('Aktiv' if true, 'Abwesend' if false).
   */
  transform(value: boolean): string {
    return value ? 'Aktiv' : 'Abwesend';
  }
}
