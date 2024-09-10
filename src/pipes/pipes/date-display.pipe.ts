import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform, inject } from '@angular/core';
import { Timestamp } from 'firebase/firestore';

@Pipe({
  name: 'dateDisplay',
  standalone: true
})
export class DateDisplayPipe implements PipeTransform {
  datePipe = inject(DatePipe);
  transform(value: Timestamp | undefined): string {
    return this.datePipe.transform(value?.toMillis(), 'd/M/yy, h:mm a', ) ?? '';
  }
}
