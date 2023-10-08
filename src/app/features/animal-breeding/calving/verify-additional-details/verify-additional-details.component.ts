import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ArtificialInseminationService } from '../../artificial-insemination/artificial-insemination.service';
import { commonData, StatusDialogComponent } from '../../artificial-insemination/status-dialog/status-dialog.component';

@Component({
  selector: 'app-verify-additional-details',
  templateUrl: './verify-additional-details.component.html',
  styleUrls: ['./verify-additional-details.component.css']
})
export class VerifyAdditionalDetailsComponent implements OnInit {

 
  animalForm!: FormGroup;
  showStatusField: boolean = false
  isLoadingSpinner: boolean = false
  pregReason:commonData[] =[]
  pregStatus:commonData[] =[]
  milkingStatus:commonData[] =[]
  isCalving:boolean = false
  isFormSubmit:boolean  =false
  isLactationNoValid:boolean = false
  constructor(
    private fb: FormBuilder,
    private aiService: ArtificialInseminationService,
    private dialogRef: MatDialogRef<StatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title:string
      animalId: number,
      breedingStatus: number,
      currentLactationNo: any,
      milkingStatus: string,
      pregnancyStatus: string,
      aiPregnancyReason:number
    }
  ) { }
  ngOnInit(): void {
 
    this.getPregnancyStatus()
    this.getMilikingStatus()
    this.initAnimalAdditionalInformation()
  }

  markPregnancyStatus(event: Event): void {
    this.showStatusField = event.target['value'] == 'Y' ? true : false
  }
  submitStatus() {
    this.isFormSubmit = true
    if (this.animalForm.invalid || this.isLactationNoValid) {
      this.animalForm.markAllAsTouched();
      return;
    }
   
    this.isLoadingSpinner = true
    const formValue = {
      ...this.animalForm.value
    };
    formValue.pregnancyStatus = formValue.pregnancyStatus == 1 ? 'Y' : 'N'
     delete formValue.aiPregnancyReason
    this.aiService.updateAnimalDetails(formValue).subscribe(data=>{
      this.dialogRef.close({data:this.animalForm.value})
      this.isLoadingSpinner = false
      this.isFormSubmit = false
    },
    error=>{
      this.isLoadingSpinner = false
    }
    )

  }
  

  getPregnancyStatus():void{
    this.aiService.getCommonMaster('pd_result').subscribe((data:any) => {
      this.pregStatus = data
      const getStatus = this.data?.pregnancyStatus == 'Y'? 1 :2
      const pregnancy_status = this.pregStatus.filter(status=>status?.cd == getStatus)
      this.animalForm.patchValue({
        pregnancyStatus:pregnancy_status[0]?.cd
      })
    })
  }

  getMilikingStatus():void{
    this.aiService.getCommonMaster('milking_status').subscribe((data:any) => {
      this.milkingStatus = data
      const milking_status = this.milkingStatus.filter(status=>status?.value == this.data.milkingStatus)
      this.animalForm.patchValue({
        milkingStatus:milking_status[0]?.cd
      })
    })
  }

  onKey(ev:any){
    const newLactationNo = parseInt(ev.key)
    this.isLactationNoValid = this.data && this.data?.currentLactationNo ? (newLactationNo < this.data?.currentLactationNo) ? true : false :false
  }
  get searchInfo() {
    return this.animalForm.controls;
  }
  private initAnimalAdditionalInformation():void{
    this.animalForm = this.fb.group({
      animalId: ['', [Validators.required]],
      breedingStatus: [null],
      currentLactationNo: ['',[Validators.required]],
      milkingStatus: [null,[Validators.required]],
      pregnancyStatus: [null, [Validators.required]],
      aiPregnancyReason:[null]
    });

    this.animalForm.patchValue(this.data)
  }


}
