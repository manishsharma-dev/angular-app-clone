// import { Pipe, PipeTransform } from '@angular/core';  
// @Pipe({
//   name: 'filter'
// })
// export class FilterPipe implements PipeTransform {
//   transform(value: any, searchValue): any {
//     if (!searchValue) return value;
//     return value.filter((v) => 
//     v.campaignName.toLowerCase().indexOf(searchValue.toLowerCase()) > -1 || 
//     v.batchNumber.toLowerCase().indexOf(searchValue.toLowerCase()) > -1)

//   }

// }

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter'
})

export class FilterPipe implements PipeTransform {
    transform(value: any, filtertext?: any): any {

        if (!value) return null;
        if (!filtertext) return value;

        filtertext = filtertext.toLowerCase();

        return value.filter(function (item: any) {
            return JSON.stringify(item).toLowerCase().includes(filtertext);
        });
    }
}