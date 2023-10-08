import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringConcat'
})
export class StringConcatPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (Array.isArray(value) && value.length) {
      return args[1] ? value.join(' ' + args[0] + ' ') : value.join(args[0]);
    }
    return null;
  }

}
