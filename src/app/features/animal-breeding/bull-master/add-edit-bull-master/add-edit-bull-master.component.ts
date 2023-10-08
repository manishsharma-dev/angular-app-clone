import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { switchMap } from 'rxjs/operators';
import {
  AlphaNumericSpecialValidation,
  AlphaNumericValidation,
  TagIdSearchValidation,
} from 'src/app/shared/utility/validation';
import { Location } from '@angular/common';
import { SuccessDialogComponent } from '../../success-dialog/success-dialog.component';
import { AdditionalAnimalDetailComponent } from '../additional-animal-detail/additional-animal-detail.component';
import { AdditionalDetailsDialogComponent } from '../additional-details-dialog/additional-details-dialog.component';
import {
  AnimalDetail,
  AnimalDetailList,
  breedLevels,
  bullDetail,
} from '../bull-master-model/bull-master.model';
import { BullMasterService } from '../bull-master.service';
import { SnackBarMessage } from 'src/app/shared/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AnimalDetails } from 'src/app/features/animal-health/models/animal.model';
import { ModifyAnimalDetailsComponent } from '../../modify-animal-details/modify-animal-details.component';
import { AnimalDetailService } from 'src/app/features/animal-management/animal-registration/animal-details/animal-detail.service';
import { AgePipe } from 'src/app/shared/utility/pipes/age.pipe';

const ELEMENT_DATA_medicine = [
  { value: 'PT', cd: 1 },
  { value: 'PS', cd: 2 },
  { value: 'ET', cd: 3 },
  { value: 'Imported', cd: 4 },
  { value: 'BPTIE', cd: 5 },
  { value: 'Natural Service', cd: 6 },
  { value: 'Procured from Farmer', cd: 7 },
  { value: 'CHRS', cd: 8 },
  { value: 'Others, please specify', cd: 9 },
];
enum SEMEN_TYPE {
  S,
  C,
  B,
}

@Component({
  selector: 'app-add-edit-bull-master',
  templateUrl: './add-edit-bull-master.component.html',
  styleUrls: ['./add-edit-bull-master.component.css'],
})
export class AddEditBullMasterComponent implements OnInit {
  currentDate = sessionStorage.getItem('serverCurrentDateTime');
  addBullFormForm: FormGroup;
  isLoadingSpinner: boolean = false;
  animalDetail: AnimalDetail;
  sourceDetail = ELEMENT_DATA_medicine;
  breedingMinDate: number = 30;
  submitBullDetailForm: boolean = false;
  bullId: string;
  bullDetails: bullDetail;
  semenStationID: any;
  isImportedFlag: boolean = false;
  isTagIDVerified: boolean = false;
  verifiedError: string;
  getCommonMasterDetail: Array<{}> = [];
  semenStationInformation: any;
  semenType: any[] = [];
  agePipe = new AgePipe()
  constructor(
    public dialog: MatDialog,
    private _fb: FormBuilder,
    private bullMasterService: BullMasterService,
    private route: ActivatedRoute,
    private location: Location,
    private animalDS: AnimalDetailService
  ) { }

  ngOnInit(): void {
    this.bullId = this.route.snapshot.queryParams['bullId'];
    this.semenStationID = this.route.snapshot.queryParams['semenId'];
    this.getCommonMaster();
    if (this.bullId) {
      this.getBullMasterDetail(this.bullId);
    }
    this.initAddAdditionalDetailForm();
    this.semenStationInformation = JSON.parse(
      sessionStorage.getItem('semenName')
    );

  }

  get minDate() {
    return moment(this.currentDate)
      .subtract(this.breedingMinDate, 'days')
      .format('YYYY-MM-DD');
  }

  get today() {
    return moment(this.currentDate).format('YYYY-MM-DD');
  }

  submitBullDetail(): void {
    debugger
    let bullIdWithSemenStationCode: string;
    if (this.addBullFormForm.invalid || this.semenType.length == 0) {
      this.submitBullDetailForm = true;
      this.addBullFormForm.markAllAsTouched();
      return;
    }

    if (!this.isTagIDVerified) return;
    const isExoticLevel = this.addBullFormForm.get(
      'breedAndExoticLevels'
    ).value;
    if (
      !isExoticLevel ||
      this.animalDetail.damId == null ||
      this.animalDetail.damId == undefined ||
      !this.animalDetail.sireId
    ) {
      this.addAnimalAdditionalDetails(false);
      return;
    }
    if (
      this.semenStationInformation &&
      this.semenStationInformation?.ssId?.length > 0 &&
      this.semenStationInformation?.ssId != 'null'
    ) {
      bullIdWithSemenStationCode =
        this.semenStationInformation?.ssId +
        '-' +
        this.formControls.bullId.value;
      //  this.addBullFormForm.get("bullId").setValue(bullIdWithSemenStationCode)
    } else {
      this.alertDialog('animalBreeding.commonLabel.semen_station_req');
      return;
    }
    const enableFormField = [
      'bullRegistrationRecordDate',
      'animalStatus',
      'age',
      'animalStatus',
      'species',
      'dateOfBirth',
    ];
    this.isLoadingSpinner = true;
    if (this.bullId) enableFormField.push('bullId');
    this.enableForm(enableFormField, 'enable');
    const formValue = {
      ...this.addBullFormForm.value,
    };
    formValue.bullId = bullIdWithSemenStationCode;
    formValue.animalId = this.animalDetail?.animalId;
    formValue.semenStationId = this.semenStationID
      ? this.semenStationID
      : this.bullDetails?.semenStationId;
    formValue.speciesCd = this.animalDetail?.speciesCd;
    formValue.bullTypeFlag =
      this.semenType && this.semenType?.length == 1
        ? parseInt(this.semenType[0]) == 1
          ? 'S'
          : 'C'
        : this.semenType?.length > 1
          ? 'B'
          : null;
    delete formValue?.animalStatus;
    const sumbit = this.bullId
      ? 'animalBreeding.commonLabel.bull_update'
      : 'animalBreeding.commonLabel.bull_submit';
    formValue.bullRegistrationDate = moment(
      formValue.bullRegistrationDate
    ).format('YYYY-MM-DD');
    this.bullMasterService[
      this.bullId ? 'updateBullMastersDetails' : 'savebullMastersDetails'
    ](formValue)
      .pipe(
        switchMap((res: any) => {
          return this.dialog
            .open(SuccessDialogComponent, {
              data: {
                title: sumbit,
              },
              width: '500px',
              panelClass: 'makeItMiddle',
            })
            .afterClosed();
        })
      )
      .subscribe(
        () => {
          this.isLoadingSpinner = false;
          this.submitBullDetailForm = false;
          this.goBack();
        },
        (error) => {
          this.enableForm(enableFormField, 'disable');
          this.isLoadingSpinner = false;
        }
      );
  }
  addAdditionalDetails(isView?: boolean) {
    const dialogRef = this.dialog.open(AdditionalDetailsDialogComponent, {
      position: {
        right: '0px',
        top: '0px',
      },
      panelClass: 'custom-dialog-container',
      width: '700px',
      // width: '80vw',
      disableClose: true,
      height: '100vh',
      data: this.bullDetails,
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.dialog.open(ConfirmationDialogComponent, {
          data: {
            title: 'Success',
            message: 'Details Saved Successfully',
            primaryTextBtn: 'Ok',
            icon: '/assets/images/verified.svg',
          },
          panelClass: 'common-info-dialog',
        });
      }
    });
  }
  getAnimalDetail(): void {
    const tagId = this.addBullFormForm.value.tagId
      ? this.addBullFormForm.value.tagId
      : this.bullDetails && this.bullDetails?.tagId
        ? this.bullDetails?.tagId
        : null;
    const formValue = ['species', 'dateOfBirth','age', 'animalStatus'];
    if (tagId && tagId?.toString()?.length == 12) {
      this.isLoadingSpinner = true;
      this.bullMasterService.getsearchDetails(tagId).subscribe(
        (data: any) => {
          console.log(data)
          this.isLoadingSpinner = false;
          this.isTagIDVerified = true;
          this.animalDetail =
            data && data[0]?.animalsList?.length > 0
              ? data[0]?.animalsList[0]
              : [];
          // this.animalDetail = data ? data 
          //                     :[]
          this.addBullFormForm
            ?.get('species')
            .setValue(this.animalDetail?.species);
          this.putBreedandExoticLevel(this.animalDetail?.breedAndExoticLevels);
          this.setFormValue(formValue);
          // const isDOBAvilable = this.animalDetail?.dateOfBirth
          // if(isDOBAvilable){
          //   const changeAgeFormat = this.agePipe.transform(isDOBAvilable);
          //   this.addBullFormForm.get('age').setValue(changeAgeFormat)
          // }
        },
        (error) => {
          this.isLoadingSpinner = false;
          this.isTagIDVerified = false;
          this.verifiedError = error?.error?.message;
        }
      );
    } else {
      Object.keys(this.animalDetail).forEach((key) => {
        delete this.animalDetail[key];
      });
      this.setFormValue(formValue);
      this.addBullFormForm?.get('breedAndExoticLevels').reset();
      this.isTagIDVerified = false;
    }
  }
  checkSourceDetail(): void {
    const sourceID = this.addBullFormForm.value.bullSource;
    if (sourceID && sourceID == 9) {
      this.addBullFormForm?.get('bullSourceOthers').enable();
    } else {
      this.addBullFormForm?.get('bullSourceOthers').disable();
      this.addBullFormForm.get('bullSourceOthers').reset();
    }
  }
  get formControls() {
    return this.addBullFormForm.controls;
  }
  private initAddAdditionalDetailForm(): void {
    this.addBullFormForm = this._fb.group({
      bullRegistrationRecordDate: [
        { value: this.today, disabled: true },
        [Validators.required],
      ],
      bullRegistrationDate: [
        this.today,
        { updateOn: 'blur', validators: [Validators.required] },
      ],
      importedSemenFlag: ['N', [Validators.required]],
      tagId: [
        '',
        [
          Validators.required,
          Validators.maxLength(12),
          Validators.minLength(8),
          TagIdSearchValidation,
        ],
      ],
      bullId: [
        '',
        [
          Validators.required,
          Validators.maxLength(30),
          // Validators.minLength(12),
        ],
      ],
      nominatedBullFlag: ['Y', [Validators.required]],
      etBullFlag: [''],
      bullSource: [null, [Validators.required]],
      bullSourceOthers: [{ value: '', disabled: true }],
      animalStatus: [{ value: '', disabled: true }],
      breed: [''],
      age: [{ value: '', disabled: true }],
      dateOfBirth: [{ value: '', disabled: true }],
      species: [{ value: '', disabled: true }],
      bullStatus: [1, [Validators.required]],
      breedAndExoticLevels: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      importedNaabCd: [
        '',
        [Validators.required, AlphaNumericSpecialValidation],
      ],
      importedRegName: [
        '',
        [Validators.required, AlphaNumericSpecialValidation],
      ],
      importedRegNo: ['', [Validators.required, AlphaNumericSpecialValidation]],
      importingAgency: [
        '',
        [Validators.required, AlphaNumericSpecialValidation],
      ],
      importedFrom: ['', [Validators.required, AlphaNumericSpecialValidation]],
      importedScheme: ['', [AlphaNumericSpecialValidation]],
      bullTypeFlag: ['', [Validators.required, AlphaNumericValidation]],
    });
    // this.formControls.importedSemenFlag.valueChanges.subscribe((value) => {
    //   this.isImportedFlag = value == 'Y' ? true : false;
    //   this.changeBullPermission();
    // });
    // if (this.semenStationID) this.getSemenStationInfomation();

    this.addBullFormForm.get('bullSource').valueChanges.subscribe((value) => {
      const keys = [
        'importedNaabCd',
        'importedRegName',
        'importedRegNo',
        'importingAgency',
        'importedFrom',
        'importedScheme',
        'bullTypeFlag',
      ];
      if (value == 4) this.setValidator(keys, 'set');
      else this.setValidator(keys, 'remove');
    });
  }
  addAnimalAdditionalDetails(isView?: boolean) {
    if (this.animalDetail && this.animalDetail?.animalId) {
      const animalId = this.animalDetail?.animalId.toString();
      this.animalDS
        .getAnimalDetails(animalId)
        .subscribe((animalDetails: AnimalDetails) => {
          const dialogRef = this.dialog.open(ModifyAnimalDetailsComponent, {
            data: {
              animalData: animalDetails,
              isbull: true,
            },
            width: '500px',
            height: '100vh',
            panelClass: 'custom-dialog-container',
            position: {
              right: '0px',
              top: '0px',
            },
          });
          dialogRef.afterClosed().subscribe((res) => {
            if (res && res?.data)
              if (this.bullId) this.getBullMasterDetail(this.bullId);
            this.getAnimalDetail();
          });
        });
    } else {
      // const snackbarType = {
      //   message: 'Please Select Animal by Tag ID first',
      //   colour: 'red-snackbar',
      // };
      // this.snackBar(snackbarType);
      this.alertDialog('errorMsg.select_tag_first');
    }
  }

  goBack(): void {
    this.location.back();
  }
  onCheckChange(event) {
    const isTypeAvailable = this.semenType && this.semenType?.length > 0 ?
      this.semenType.filter(type => type == event.cd) : []
    if (!event.checked && isTypeAvailable.length == 0) {
      this.getCommonMasterDetail['semen_type'] = this.getCommonMasterDetail['semen_type'].map(p =>
        p.cd == event.cd
          ? { ...p, checked: true }
          : p
      );
      this.semenType.push(event.cd);
    } else {
      this.semenType = this.semenType.filter((type) => type !== event.cd);

      this.getCommonMasterDetail['semen_type'] = this.getCommonMasterDetail['semen_type'].map(p =>
        p.cd == event.cd
          ? { ...p, checked: false }
          : p
      );
      // const objIndex = this.getCommonMasterDetail['semen_type']?.findIndex(
      //   (obj) => obj.cd == event.cd
      // );
      // this.getCommonMasterDetail['semen_type'][objIndex].checked = false;
    }
  }

  private setFormValue(formName: Array<any>): void {
    formName.forEach((element) => {
      this.addBullFormForm?.get(element).setValue(this.animalDetail[element]);
    });
  }
  private enableForm(formName: Array<any>, type: string): void {
    formName.forEach((element) => {
      this.addBullFormForm?.get(element)[type]();
    });
  }

  private getBullMasterDetail(bullId: string): void {
    this.isLoadingSpinner = true;
    this.bullMasterService.getBullDetailsByID(bullId).subscribe(
      (data) => {
        this.isLoadingSpinner = false;
        this.bullDetails = data;
        if (this.bullDetails && this.bullDetails?.bullId) {
          const removeSemenCode = this.bullDetails?.bullId.split('-');
          if (removeSemenCode && removeSemenCode?.length > 1) {
            removeSemenCode.shift();
            const bullCode: any =
              removeSemenCode && removeSemenCode?.length > 0
                ? removeSemenCode.join('-')
                : removeSemenCode;
            this.bullDetails.bullId = bullCode;
          }
        }
        this.addBullFormForm.patchValue(this.bullDetails);
        this.semenTypeChecked(this.bullDetails?.bullTypeFlag);
        this.semenStationID = this.bullDetails?.semenStationId;
        // if (this.semenStationID) this.getSemenStationInfomation();
        const enableFormField = ['bullId', 'tagId'];
        this.enableForm(enableFormField, 'disable');
        this.getAnimalDetail();
        // this.addAdditionalDetails();
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  private semenTypeChecked(type): void {
    if (parseInt(SEMEN_TYPE[type]) < 2) {
      this.semenType.push(
        this.getCommonMasterDetail['semen_type'][SEMEN_TYPE[type]].cd
      );
      this.getCommonMasterDetail['semen_type'][SEMEN_TYPE[type]].checked = true;
    } else {
      this.getCommonMasterDetail['semen_type']?.forEach((element) => {
        element.checked = true;
        this.semenType.push(element?.cd);
      });
    }
  }
  private convertArrayToString(levels: breedLevels[]) {
    const breedLevel = levels && levels?.length > 0 ? levels : [];
    const breedString = breedLevel.map((el) =>
      JSON.stringify(el?.breed + ' ' + parseInt(el?.bloodExoticLevel) + '%')
    );
    return breedString;
  }

  private changeBullPermission(): void {
    const enableFormField = ['age', 'animalStatus', 'species', 'dateOfBirth'];
    if (this.isImportedFlag) {
      this.enableForm(enableFormField, 'enable');
      this.addBullFormForm?.get('tagId').disable();
      this.addBullFormForm?.get('tagId').clearValidators();
    } else {
      this.enableForm(enableFormField, 'disable');
      this.addBullFormForm?.get('tagId').enable();
      this.addBullFormForm
        ?.get('tagId')
        .setValidators([
          Validators.required,
          Validators.maxLength(12),
          Validators.minLength(8),
          TagIdSearchValidation,
        ]);
    }
  }
  private putBreedandExoticLevel(levels: any): void {
    const breedLevels = levels;
    const breedAndExoticLevels = this.convertArrayToString(breedLevels);
    const brredLevels = breedAndExoticLevels?.toString();
    this.addBullFormForm?.get('breedAndExoticLevels').setValue(brredLevels);
  }
  private getCommonMaster(): void {
    this.isLoadingSpinner = true;
    const key = ['bull_source', 'semen_type'];
    key.forEach((val) => {
      this.bullMasterService.getCommonMaster(val).subscribe(
        (data) => {
          this.isLoadingSpinner = false;
          this.getCommonMasterDetail[val] = data;
          this.getCommonMasterDetail[val] = this.getCommonMasterDetail[val].map(v => ({
            ...v,
            checked: false,
          }));
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    });
  }

  // private getSemenStationInfomation(): void {
  //     this.bullMasterService.getSubOrgDetails(this.semenStationID).subscribe((data:any) => {
  //       this.semenStationInformation = data?.subOrganizationBasicInfo;
  //     });
  // }
  private setValidator(formName: Array<any>, type: string): void {
    formName.forEach((element) => {
      this.addBullFormForm
        ?.get(element)
      [type == 'set' ? 'setValidators' : 'removeValidators'](
        Validators.required
      );
      this.addBullFormForm.get(element).updateValueAndValidity();
    });
  }
  private alertDialog(message: string): void {
    this.dialog
      .open(ConfirmationDeleteDialogComponent, {
        data: {
          id: '',
          title: 'common.alert',
          message: message,
          icon: 'assets/images/alert.svg',
          primaryBtnText: 'Yes',
          secondaryBtnText: 'No',
        },
        panelClass: 'common-alert-dialog',
      })
      .afterClosed();
  }
  convertInputToUpperCase(event: Event) {
    const element = event.target as HTMLInputElement;
    const position = element?.selectionStart;
    element.value = element?.value?.toString()?.toLocaleUpperCase();
    element?.setSelectionRange(position, position);
  }

  //   public findInvalidControls() {
  //     const invalid = [];
  //     const controls = this.addBullFormForm.controls;
  //     for (const name in controls) {
  //         if (controls[name].invalid) {
  //             invalid.push(name);
  //         }
  //     }
  //     return invalid;
  // }
  // ngOnDestroy() {
  //   sessionStorage.removeItem('semenName');
  // }
}
