import { Directive, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Form } from '@angular/forms';

@Directive({
  selector: '[appCheckDuplicateList],[message]'
})
export class CheckDuplicateListDirective implements OnInit {
  @Input('appCheckDuplicateList') formData:any;
  @Input('message') isShowError:string;
  @Output() public myCustomMouseover = new EventEmitter<string>();

  constructor(private elementRef:ElementRef) {
    
   }
   ngOnInit(): void {
    //this.elementRef.nativeElement.innerText=this.isShowError;
     
   }
   @HostListener('change')changes(){
  console.log(this.isShowError)
    this.checkDuplicateList(this.formData.value.levelsInfo)
   }

   checkDuplicateList(data) {
    
    const dup = data
      .map((val: any) => val.roleCd)
      .filter(
        (val: any, i: number, arr: any[]) =>
          arr.indexOf(val) != i
      );
    const dupRecord = data.filter(
      (obj: any) => obj.roleCd && dup.includes(obj.roleCd)
    );
    if (dupRecord.length > 1) {
      
      this.isShowError ='Role Name Already exists. Please select Another Role Name';
      this.myCustomMouseover.emit(this.isShowError);
    } else {
      this.isShowError = '';
      this.myCustomMouseover.emit('');
    }
  }

}
