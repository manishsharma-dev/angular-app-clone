import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';
import { SnackBarMessage } from 'src/app/shared/snack-bar';
import { onlyNumberValidation } from 'src/app/shared/utility/validation';
import { ArtificialInseminationService } from '../artificial-insemination.service';

export interface commonData {
  key: string;
  cd: number;
  value: string;
}

@Component({
  selector: 'app-status-dialog',
  templateUrl: './status-dialog.component.html',
  styleUrls: ['./status-dialog.component.css'],
})
export class StatusDialogComponent implements OnInit {
  animalForm!: FormGroup;
  showStatusField: boolean = false;
  isLoadingSpinner: boolean = false;
  pregReason: commonData[] = [];
  pregStatus: commonData[] = [];
  milkingStatus: commonData[] = [];
  isCalving: boolean = false;
  isFormSubmit: boolean = false;
  isLactationNoValid: boolean = false;
  constructor(
    private fb: FormBuilder,
    private aiService: ArtificialInseminationService,
    private dialogRef: MatDialogRef<StatusDialogComponent>,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      animal_id: string;
      isBreedingActivity: boolean;
      tagId: any;
      lactationNo: any;
      animalAge: number;
      moduleType?:any
    }
  ) {}
  ngOnInit(): void {
    this.animalForm = this.fb.group({
      animalId: [this.data.animal_id, [Validators.required]],
      breedingStatus: [null],
      currentLactationNo: [null,[Validators.required,onlyNumberValidation]],
      milkingStatus: [null,[Validators.required]],
      pregnancyStatus: [null, [Validators.required]],
      aiPregnancyReason: [null],
    });
    this.getPregnancyReason();
    this.getPregnancyStatus();
    this.getMilikingStatus();
    this.fetchInformation();
    const keys = ['milkingStatus']
    if(this.data?.isBreedingActivity){
      this.setValidator(keys,'set')
    }else {
      this.setValidator(keys,'remove')
    }
    this.animalForm.get("aiPregnancyReason").valueChanges.subscribe((value) => {
      if(value == 1){
        this.setValidator(['currentLactationNo'],'remove')
      }
    })
  }

  markPregnancyStatus(event: Event): void {
    this.showStatusField = event.target['value'] == 'Y' ? true : false;
    if (!this.showStatusField)
    this.alertdialoug('errorMsg.ai_not_done_since_preg')
  }
  submitStatus() {
    this.isFormSubmit = true;
    if (this.animalForm.invalid || this.isLactationNoValid) {
      this.animalForm.markAllAsTouched();
      return;
    }

    if(this.data?.moduleType == 'AI' && this.animalForm.get('pregnancyStatus').value == 1){
      // this.snackBarMessage('AI cannot be done since animal is pregnant');
      this.alertdialoug('errorMsg.ai_not_done_since_preg')
      return
    }

    this.isLoadingSpinner = true;
    const formValue = {
      ...this.animalForm.value,
    };
    formValue.pregnancyStatus = formValue.pregnancyStatus == 1 ? 'Y' : 'N';
    delete formValue.aiPregnancyReason;
    this.aiService.updateAnimalDetails(formValue).subscribe(
      (data) => {
        this.dialogRef.close({
          data: this.animalForm.value,
          isCalving: this.isCalving,
        });
        this.isLoadingSpinner = false;
        this.isFormSubmit = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  getPregnancyReason() {
    this.aiService
      .getCommonMaster('ai_pregnancy_reason')
      .subscribe((data: any) => {
        this.pregReason = data;
      });
  }

  getPregnancyStatus(): void {
    this.aiService.getCommonMaster('pd_result').subscribe((data: any) => {
      this.pregStatus = data;
    });
  }

  getMilikingStatus(): void {
    this.aiService.getCommonMaster('milking_status').subscribe((data: any) => {
      this.milkingStatus = data;
    });
  }

  fetchInformation(): void {}
  onKey(ev: any) {
    const newLactationNo = parseInt(ev?.target['value']);
    if(this.data?.lactationNo){
      const animalAge = this.data?.animalAge / 12;
      this.isLactationNoValid =
        this.data && this.data?.lactationNo
          ? animalAge < newLactationNo || newLactationNo < this.data?.lactationNo
            ? true
            : animalAge
            ? animalAge < newLactationNo
              ? true
              : false
            : false
          : animalAge
          ? animalAge < newLactationNo
            ? true
            : false
          : false;
    }else{
      this.isLactationNoValid = newLactationNo == 0 ? false : true
    }
    
  }
  get searchInfo() {
    return this.animalForm.controls;
  }
  private setValidator(formName: Array<any>,type:string): void {
    formName.forEach((element) => {
      this.animalForm?.get(element)[type == 'set' ? 'setValidators' :'removeValidators'](Validators.required);
      this.animalForm.get(element).updateValueAndValidity();
    });
  }
  private alertdialoug(message:string):void{
    this.dialog
      .open(ConfirmationDeleteDialogComponent, {
        data: {
          id: "",
          title: 'Alert',
          message: message,
          icon:"assets/images/alert.svg",
          primaryBtnText: 'Ok'
        },
        panelClass:'common-alert-dialog'
      }).afterClosed()
  }
}
