import { Component, OnInit, Inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';
import { SnackBarMessage } from 'src/app/shared/snack-bar';
import { onlyNumberValidation } from 'src/app/shared/utility/validation';
import { EtService } from '../../et.service';
import { decimalWithLengthValidation } from 'src/app/shared/utility/decimalWithLengthValidator';
import { animalBreedingValidations } from 'src/app/shared/validatator';

export interface embryoList {
  embryoStage: number,
  embryoGrade: number,
  embryoAge: number,
  embryoType: number,
  freezingRate: number,
  embryoId: string,
  donorTagId: number,
  sireId: number
}

@Component({
  selector: 'app-edit-embryo-dialog',
  templateUrl: './edit-embryo-dialog.component.html',
  styleUrls: ['./edit-embryo-dialog.component.css']
})
export class EditEmbryoDialogComponent implements OnInit {
  isLoadingSpinner: boolean = false
  embryoDetails: FormGroup;
  dataSource = new MatTableDataSource<embryoList>();
  displayColumns = ['stage', 'grade', 'age', 'embryoType', 'freezingRate'];
  getCommonMasterDetail: Array<{}> = [];
  cmnValidation = animalBreedingValidations.common;
  constructor(@Inject(MAT_DIALOG_DATA)

  public data: {

    embryoDetail: any

  }, private etService: EtService, private _fb: FormBuilder,private _snackBar: MatSnackBar,private dialogRef: MatDialogRef<EditEmbryoDialogComponent>,private dialog: MatDialog,) { }

  ngOnInit(): void {
    this.getCommonMaster()
    this.initHeatTransactionForm()
    this.tableDataIntegration()
  }
  onSubmit(): void {
    if (this.embryoDetails.invalid) {
      this.embryoDetails.markAllAsTouched();
      return;
    }
    this.isLoadingSpinner = true
   let formData = []
    const formValue = {
      ...this.embryoDetails.value
    };
    formData.push(formValue)
    this.etService.updateEmbryoDetails(formData).subscribe(data=>{
      this.isLoadingSpinner = false
    //   const snackbarType = {message:'Embryo details updated successfully',colour:'green-snackbar'}
    //  this.snackBar(snackbarType)
    this.confirmtionDialoug('animalDetails.embryo_update_success')
   
     this.dialogRef.close({data:data})

    },error=>{
      this.isLoadingSpinner = false
    }
    )
  }
  get formControls() {
    return this.embryoDetails.controls;
  }
  private initHeatTransactionForm(): void {
    this.embryoDetails = this._fb.group({
      embryoStage: [null, [Validators.required]],
      embryoGrade: ['', [Validators.required]],
      embryoAge: ['', [Validators.required,onlyNumberValidation]],
      embryoType: ['', [Validators.required]],
      freezingRate: ['', [Validators.required,decimalWithLengthValidation(4, 2)]],
      embryoId: [''],
      donorTagId: [''],
      sireId: [''],
      semenType: [''],
      sexedSemen: [''],
      speciesCd: [''],
      labCd: [''],
      opuDate: [''],
      embryoProductionType:[''],
      allocatedToId:[''],
      allocatedTo:[''],
      embryoStatus:['']
    });

  }

  private tableDataIntegration(): void {
    this.embryoDetails.patchValue(this.data?.embryoDetail)
    let embryoDetail = []
    embryoDetail.push(this.data?.embryoDetail)
    this.dataSource = new MatTableDataSource(
      embryoDetail
    );
  }
  private getCommonMaster(): void {
    this.isLoadingSpinner = false
    const key = ['embryo_type', 'embryo_grade', 'semen_type', 'sexed_semen', 'embryo_status','embryo_stage']
    key.forEach(val => {
      this.etService.getCommonMaster(val).subscribe(data => {
        this.isLoadingSpinner = false
        this.getCommonMasterDetail[val] = data
      },
        error => { this.isLoadingSpinner = false }
      )
    })

  }
  private snackBar(snack_type:object):void{
    new SnackBarMessage(this._snackBar).onSucessMessage(
      snack_type['message'],
      'Ok',
      'right',
      'top',
      snack_type['colour']
    );
  }
  
  private confirmtionDialoug(message:string):void{
    this.dialog.open(ConfirmationDeleteDialogComponent, {
      data: {
        id: "",
        title: 'common.alert',
        message: message,
        icon:"assets/images/alert.svg",
        primaryBtnText: 'Ok'
      },
      panelClass:'common-alert-dialog'
    }).afterClosed()
  }

}
