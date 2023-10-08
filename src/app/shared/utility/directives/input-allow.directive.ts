import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appInputAllow]'
})
export class InputAllowDirective {

  constructor(private el: ElementRef) {
   
 }

 @HostListener('keypress', ['$event'])
    onKeypress(event) {
      
      let k:any;  
      k = event.charCode;  //         k = event.keyCode;  (Both can be used)
      //return (((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57))) && ((k > 31 && (k < 48 || k > 57))) ;
      
      return  ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
      
    }
    

}