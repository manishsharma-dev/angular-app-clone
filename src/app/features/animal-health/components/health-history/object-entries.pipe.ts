import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'objectEntries',
})
export class ObjectEntriesPipe implements PipeTransform {
  transform(value: object): [string, any][] {
    if (value) {
      return Object.entries(value).filter((e) => e[1] && e[1] !== 'null');
    } else {
      return [];
    }
  }
}
