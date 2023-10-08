import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';
import { ArtificialInseminationService } from '../../artificial-insemination/artificial-insemination.service';
import { commonData, StatusDialogComponent } from '../../artificial-insemination/status-dialog/status-dialog.component';

@Component({
  selector: 'app-calving-status-dialog',
  templateUrl: './calving-status-dialog.component.html',
  styleUrls: ['./calving-status-dialog.component.css']
})
export class CalvingStatusDialogComponent implements OnInit {
  currentDate = sessionStorage.getItem('serverCurrentDateTime')
  animalForm!: FormGroup;
  showStatusField: boolean = false
  isLoadingSpinner: boolean = false
  pregReason:commonData[] =[]
  pregStatus:commonData[] =[]
  milkingStatus:commonData[] =[]
  isCalving:boolean = false
  isFormSubmit:boolean  =false
  isLactationNoValid:boolean = false
  breedingMinDate:number = 30
  constructor(
    private fb: FormBuilder,
    private aiService: ArtificialInseminationService,
    private dialogRef: MatDialogRef<StatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      animal_id: string;
      tagId:any
    }
  ) { }
  ngOnInit(): void {
    this.animalForm = this.fb.group({
      animalId: [this.data.animal_id, [Validators.required]],
      breedingStatus: [null],
      currentLactationNo: [''],
      milkingStatus: [null,[Validators.required]],
      aiPregnancyReason:[null]
    })
    this.getMilikingStatus()
  }

  markPregnancyStatus(event: Event): void {
    this.showStatusField = event.target['value'] == 'Y' ? true : false
  }
  submitStatus() {
    this.isFormSubmit = true
    if (this.animalForm.invalid) {
      this.animalForm.markAllAsTouched();
      return;
    }
   
    this.isLoadingSpinner = true
    const formValue = {
      ...this.animalForm.value
    };
    
    this.aiService.updateAnimalDetails(formValue).subscribe((data:any)=>{
      if(data.animalId){
        this.dialogRef.close({data:data?.milkingStatus})
      }
      // 
      this.isLoadingSpinner = false
      this.isFormSubmit = false
    },
    error=>{
      this.isLoadingSpinner = false
    }
    )

  }
  
  get today() {
    return moment(this.currentDate).format('YYYY-MM-DD');
  }
  get minDate() {
    return moment(this.currentDate)
      .subtract(this.breedingMinDate, 'days')
      .format('YYYY-MM-DD');
  }
  getMilikingStatus():void{
    this.aiService.getCommonMaster('milking_status').subscribe((data:any) => {
      this.milkingStatus = data
      this.milkingStatus = this.milkingStatus.filter(value=>value?.cd === 3)
    })
  }

  get searchInfo() {
    return this.animalForm.controls;
  }

}
