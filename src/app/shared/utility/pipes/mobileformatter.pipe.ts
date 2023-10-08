import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mobileformatter'
})
export class MobileformatterPipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): unknown {
    let mobile =  atob(value).split('').slice(6).join('');
    let result = `XXXXXX${mobile}`
    return result;
    // return null
  }


}

