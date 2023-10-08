import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SaveDialogComponent } from '../../../pregnancy-diagnosis/save-dialog/save-dialog.component';
import { EtService } from '../../et.service';
import { Location } from '@angular/common';
import { onlyNumberValidation } from 'src/app/shared/utility/validation';
import { decimalWithLengthValidation } from 'src/app/shared/utility/decimalWithLengthValidator';
import { animalBreedingValidations } from 'src/app/shared/validatator';

export interface TableData {
  embryoStatus:string;
  embryoId: string;
  embryoAge: any;
  embryoStage:string;
  embryoGrade:string;
  embryoType:number;
  freezingRate:number;
  opuDate:string;
  allocatedTo:string;
  allocatedToId:string;
  donorTagId:number;
  sireId:number;
  labCd:string;

}

@Component({
  selector: 'app-edit-embryo-details',
  templateUrl: './edit-embryo-details.component.html',
  styleUrls: ['./edit-embryo-details.component.css']
})
export class EditEmbryoDetailsComponent implements OnInit {

  data :TableData[] = [];
  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  displayColumns = ['sr_no','opu_date','embryo_id','stage','grade','age','embryo_type','freezing_rate'];
  rows: FormArray = this._fb.array([]);
  form: FormGroup = this._fb.group({ 'sync': this.rows });
  isLoadingSpinner: boolean = false;
  isLinear = false;
  addEmbryoMasterForm: FormGroup;
  ownerId :number
  getCommonMasterDetail: Array<{}> = [];
  cmnValidation = animalBreedingValidations.common;
  constructor(private _fb: FormBuilder,private etService : EtService,
    private dialog: MatDialog,private router :Router,private location:Location) { }

  ngOnInit(): void {

    this.getCommonMaster()
  }

  saveEmbryoDetail():void{
   
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoadingSpinner = true

    const formValue = {
      ...this.form.value
    };
    this.etService.updateEmbryoDetails(formValue?.sync) 
    .pipe(
      switchMap((res:any) => {
        return   this.dialog
        .open(SaveDialogComponent, {
          data: {
            title: 'animalDetails.embryo_summit_success',
            // transaction_id: res
          },
          width: '500px',
        })
          .afterClosed()
      })
    )
    .subscribe((res) => {
      this.isLoadingSpinner = false
      this.goBack()
    },
    error =>{
      this.isLoadingSpinner = false
    }
    )
  }
  addRow(d?: TableData, noUpdate?: boolean) {
    const row = this._fb.group({
      'embryoStage'   : [d?.embryoStage , [Validators.required]],
      'embryoStatus'     : [ d?.embryoStatus],
      'embryoType' :[d?.embryoType,  [Validators.required]],
      'freezingRate' :[ d?.freezingRate , [decimalWithLengthValidation(4, 2)]],
      'embryoGrade' :[d?.embryoGrade,[Validators.required]],
      'embryoAge':[d?.embryoAge,[Validators.required,onlyNumberValidation]],
      "embryoId": [d?.embryoId,[]],
      "opuDate":[d?.opuDate,[]],
      "allocatedTo":[d?.allocatedTo,[]],
      "allocatedToId":[d?.allocatedToId,[]],
      "donorTagId":[d?.donorTagId,[]],
      "sireId":[d?.sireId,[]],
      "labCd":[d?.labCd,[]],
    });
    this.rows.push(row);
    if (!noUpdate) { this.updateView(); }
  }
  updateView() {
    this.dataSource.next(this.rows.controls);
  }
 goBack():void{
  this.location.back()
 }
 formatDate(date: string) {
  if (date) {
    return moment(new Date(date)).format('DD/MM/YYYY');
  }
  return null;
}
  private getAnimalTableData(data:any):void{
    if(data && data?.length > 0){
      this.isLoadingSpinner = true
      this.ownerId= data[0].ownerId
      var commonSync = new Promise<void>((resolve, reject) => {

        data.forEach((value, index, array)=> {
          this.etService.verifyEmbryoID(value?.embryoId).subscribe((data:any) => {
            this.addRow(data)
            if (index === array.length -1) resolve();
          },
            error => { this.isLoadingSpinner = false }
          )
        })
  
    });
    commonSync.then(() => {
      this.isLoadingSpinner = false
  });
    }else{
      this.router.navigate(['/not-found']);
    }

  }
  private getCommonMaster() {
    this.isLoadingSpinner = true
    const key = ['embryo_type', 'embryo_grade','embryo_stage']

    var commonSync = new Promise<void>((resolve, reject) => {

      key.forEach((value, index, array)=> {
        this.etService.getCommonMaster(value).subscribe(data => {
          this.getCommonMasterDetail[value] = data
          if (index === array.length -1) resolve();
        },
          error => { this.isLoadingSpinner = false }
        )
      })

  });
  commonSync.then(() => {
    this.isLoadingSpinner = false
    const animalData = JSON.parse(sessionStorage.getItem('animalData'))
    this.getAnimalTableData(animalData)
});


  }

  ngOnDestroy(){
    sessionStorage.removeItem('animalData')
  }

 
}
