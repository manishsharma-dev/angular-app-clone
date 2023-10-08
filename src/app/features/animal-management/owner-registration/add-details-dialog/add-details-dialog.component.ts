import { TranslatePipe } from '@ngx-translate/core';
import {
  AlphaNumericSpecialValidation,
  EmailValidation,
  MobileValidation,
} from './../../../../shared/utility/validation';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SnackBarMessage } from 'src/app/shared/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { OwnerDetailsService } from '../owner-details.service';
import { CommonData } from '../models-owner-reg/common-data.model';
import { CompleteOwnerDetails } from '../models-owner-reg/get-ownerby-ownerID.model';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AppService } from 'src/app/shared/shareService/app.service';
import { encryptText } from 'src/app/shared/shareService/storageData';

@Component({
  selector: 'app-add-details-dialog',
  templateUrl: './add-details-dialog.component.html',
  styleUrls: ['./add-details-dialog.component.css'],
  providers: [TranslatePipe],
})
export class AddDetailsDialogComponent implements OnInit {
  additionalOwnerDetailsForm!: FormGroup;
  landHoldings: CommonData[] = [];
  ownerCategory: CommonData[] = [];
  isFormValueModified: boolean = false;
  formInitialValue: {} = {};

  constructor(
    private _formBuilder: FormBuilder,
    private ownerDS: OwnerDetailsService,
    private _snackBar: MatSnackBar,
    private translatePipe: TranslatePipe,
    private dialogRef: MatDialogRef<AddDetailsDialogComponent>,
    public dialog: MatDialog,
    private appService: AppService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      ownerData: CompleteOwnerDetails;
      isIndividual: boolean;
    }
  ) {}

  ngOnInit(): void {
    console.log('data non or ind', this.data);
    this.additionalOwnerDetailsForm = this._formBuilder.group({
      ownerId: this.data.ownerData.ownerId,
      emailId: [
        {
          value: this.data.ownerData.emailId || '',
          disabled: this.data.ownerData.emailId,
        },
        EmailValidation,
      ],
      alternateMobileNo: [
        {
          value: this.data.ownerData.alternateMobileNo || '',
          disabled: this.data.ownerData.alternateMobileNo,
        },
        MobileValidation,
      ],
      ownerLandHoldingCd: [
        {
          value: this.data.ownerData.ownerLandHoldingCd || '',
          disabled: this.data.ownerData.ownerLandHoldingCd,
        },
      ],
      hhid: [
        {
          value: this.data.ownerData.hhid || '',
          disabled: this.data.ownerData.hhid,
        },
        AlphaNumericSpecialValidation,
      ],
      // isCategoryVerified: [
      //   {
      //     value: this.data.ownerData.isCategoryVerified || false,
      //     disabled: !(this.data.ownerData.isCategoryVerified == undefined),
      //   },
      // ],
      isPourerMember: [
        {
          value: this.data.ownerData.isPourerMember || false,
          disabled: !(this.data.ownerData.isPourerMember == undefined),
        },
      ],
      isOwnerBelowPovertyLine: [
        {
          value: this.data.ownerData.isOwnerBelowPovertyLine || false,
          disabled: !(this.data.ownerData.isOwnerBelowPovertyLine == undefined),
        },
      ],
    });
    this.formInitialValue = this.additionalOwnerDetailsForm.value;
    this.getCommonAPIData();
  }

  getCommonAPIData() {
    this.ownerDS.getCommonData('land_holding').subscribe((landHoldings) => {
      this.landHoldings = landHoldings;
    });
    this.ownerDS.getCommonData('owner_category').subscribe((ownerCat) => {
      this.ownerCategory = ownerCat;
    });
  }

  checkIfFromValueChanged() {
    if (
      JSON.stringify(this.formInitialValue) ==
      JSON.stringify(this.additionalOwnerDetailsForm.value)
    ) {
      this.isFormValueModified = false;
    } else {
      this.isFormValueModified = true;
    }
  }

  submitOwnerAdditionalDetails() {
    this.checkIfFromValueChanged();
    if (!this.isFormValueModified) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translatePipe.transform('common.info_label'),
          icon: 'assets/images/info.svg',
          message: this.translatePipe.transform('common.modify_to_save'),
          primaryBtnText: this.translatePipe.transform('common.ok_string'),
        },
        panelClass: 'common-info-dialog',
      });
    }
    if (this.additionalOwnerDetailsForm.valid && this.isFormValueModified) {
      this.appService.getModulebyUrl('/owner/ownersearch');
      const formValue = this.additionalOwnerDetailsForm.getRawValue();
      if (String(formValue.alternateMobileNo)?.length > 0) {
        formValue.alternateMobileNo = encryptText(formValue.alternateMobileNo);
      }
      if (this.data.isIndividual) {
        this.ownerDS.addAdditionalOwnerDetails(formValue).subscribe((data) => {
          this.dialogRef.close();
          this.ownerDS.setAddDetailsFlag(true);
          if (data) {
            this.dialog.open(ConfirmationDialogComponent, {
              data: {
                title: this.translatePipe.transform('common.info_label'),
                icon: 'assets/images/info.svg',
                message: this.translatePipe.transform(
                  'animalDetails.addAdditionalSuccessfully'
                ),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
              },
              panelClass: 'common-info-dialog',
            });
          }
        });
      } else {
        this.ownerDS
          .addNonIndAdditionalOwnerDetails(formValue)
          .subscribe((data) => {
            this.dialogRef.close();
            this.ownerDS.setAddDetailsFlag(true);
            if (data) {
              this.dialog.open(ConfirmationDialogComponent, {
                data: {
                  title: this.translatePipe.transform('common.info_label'),
                  icon: 'assets/images/info.svg',
                  message: this.translatePipe.transform(
                    'animalDetails.addAdditionalSuccessfully'
                  ),
                  primaryBtnText:
                    this.translatePipe.transform('common.ok_string'),
                },
                panelClass: 'common-info-dialog',
              });
            }
          });
      }
    }
  }

  get addAdditionalInfo() {
    return this.additionalOwnerDetailsForm.controls;
  }

  checkIfAllControlsDisabled() {
    let countofDisabledControls = 0;
    let noOfTraverses = 0;
    Object.keys(this.additionalOwnerDetailsForm.controls).forEach((value) => {
      noOfTraverses += 1;
      if (this.additionalOwnerDetailsForm.get(value).status == 'DISABLED') {
        countofDisabledControls += 1;
      }
    });
    if (countofDisabledControls == noOfTraverses - 1) {
      return true;
    } else {
      return false;
    }
  }
}
