import { BullIdValidation } from './../../../../shared/utility/validation';
import { TranslatePipe } from '@ngx-translate/core';
import { AnimalDetails } from 'src/app/features/animal-management/animal-registration/models-animal-reg/animal-details.model';
import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AnimalManagementService } from '../animal-management.service';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { CommonData } from '../../owner-registration/models-owner-reg/common-data.model';
import { OwnerDetailsService } from '../../owner-registration/owner-details.service';
import { Breed } from '../models-animal-reg/breed-list.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  EartagValidation,
  NumericValidation,
} from 'src/app/shared/utility/validation';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AppService } from 'src/app/shared/shareService/app.service';

interface ArrayControl {
  bloodExoticLevelCd: string;
  breedCd: string;
}

@Component({
  selector: 'app-add-info-dialog',
  templateUrl: './add-info-dialog.component.html',
  styleUrls: ['./add-info-dialog.component.css'],
  providers: [TranslatePipe],
})
export class AddInfoDialogComponent implements OnInit {
  bloodLevels: CommonData[] = [];
  milkingStatus: CommonData[] = [];
  isLoadingSpinner: boolean = false;
  isAddMoreVisible: boolean = true;
  isShowError: string = '';
  addAnimalInfoForm!: FormGroup;
  familyDetailsForm!: FormGroup;
  additonalDetails!: Object;
  rowAdd!: FormArray;
  species: CommonData[] = [];
  isSpeciesSelected: boolean = false;
  breeds!: Breed[];
  coatColour: CommonData[] = [];
  milkingStatusLocal: CommonData[] = [];
  isShowBreedError: string = '';
  isBreedErrorVisible: boolean = false;
  exoticLevels: any;
  isTrashVisible: boolean = true;
  animalData!: AnimalDetails;
  milkingStatusCd: string = '';
  isFormValueChanged: boolean = false;
  initialFormValue: {} = {};
  sireIdTypes: CommonData[] = [];
  damIdTypes: CommonData[] = [];
  DamSireIdValue;
  sireSireIdValue;
  isSireIdTypeSelected = false;
  isDamIdTypeSelected = false;
  sireIdCalled = false;
  damIdCalled = false;

  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA)
    public data: { animalData: AnimalDetails },
    private fb: FormBuilder,
    private animalMS: AnimalManagementService,
    private ownerDS: OwnerDetailsService,
    private _snackBar: MatSnackBar,
    private el: ElementRef,
    private dialogRef: MatDialogRef<AddInfoDialogComponent>,
    private translatePipe: TranslatePipe,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.fetchSpecies();
    this.animalData = JSON.parse(JSON.stringify(this.data.animalData));
    if (this.animalData.sireId != undefined) {
      this.isSireIdTypeSelected = true;
    }
    if (this.animalData.damId != undefined) {
      this.isDamIdTypeSelected = true;
    }
    this.getCommonAPIsData();
    this.addAnimalInfoForm = this.fb.group({
      animalId: this.animalData.animalId,
      speciesCd: [
        { value: this.data?.animalData.speciesCd, disabled: true },
        Validators.required,
      ],
      breedAndExoticLevels: this.fb.array([]),
    });
    this.familyDetailsForm = this.fb.group({
      sireIdType: [
        {
          value: this.animalData.sireIdType || '',
          disabled: this.animalData.sireIdType,
        },
      ],
      damIdType: [
        {
          value: this.animalData.damIdType || '',
          disabled: this.animalData.damIdType,
        },
      ],
      sireId: [
        {
          value: this.animalData.sireId || '',
          disabled: this.animalData.sireId,
        },
        EartagValidation,
      ],
      sireSireId: [
        {
          value: this.animalData.sireSireId || '',
          disabled: true,
        },
        EartagValidation,
      ],
      damId: [
        {
          value: this.animalData.damId || '',
          disabled: this.animalData.damId,
        },
        EartagValidation,
      ],
      damSireId: [
        {
          value: this.animalData.damSireId || '',
          disabled: true,
        },
        EartagValidation,
      ],
      coatColourCd: [
        {
          value: this.animalData?.coatColourCd
            ? this.animalData.coatColourCd
            : '',
          disabled: this.animalData.coatColourCd,
        },
      ],
      numberCalvings: [
        {
          value:
            this.animalData.numberCalvings == undefined
              ? ''
              : this.animalData.numberCalvings,
          disabled: this.animalData.numberCalvings == undefined ? false : true,
        },
        NumericValidation,
      ],
      isLoanOnAnimal: [
        {
          value: this.animalData.isLoanOnAnimal || false,
          disabled: !(this.animalData.isLoanOnAnimal == undefined),
        },
      ],
      milkingStatus: [
        {
          value: this.milkingStatusCd || '',
          disabled: this.milkingStatusCd,
        },
      ],

      // currentLactationNo: [
      //   {
      //     value: this.animalData.currentLactationNo || '',
      //     disabled: this.animalData.currentLactationNo,
      //   },
      //   NumericValidation,
      // ],
    });
    if (!this.animalData.breedAndExoticLevels) {
      this.addRow();
      this.checkBloodLevel();
    } else {
      this.rowAdd = this.addAnimalInfoForm.get(
        'breedAndExoticLevels'
      ) as FormArray;
    }
    this.initialFormValue = this.familyDetailsForm.getRawValue();
    // this.removeSireIdTypeIfDiffSpecies();
  }

  // removeSireIdTypeIfDiffSpecies() {
  //   if (
  //     this.data.animalData.speciesCd != 1 &&
  //     this.data.animalData.speciesCd != 2
  //   ) {
  //     this.familyDetailsForm?.removeControl('sireIdType');
  //     this.familyDetailsForm?.removeControl('damIdType');
  //   }
  // }

  getCommonAPIsData() {
    this.ownerDS.getCommonData('blood_exotic_level').subscribe((levels) => {
      this.bloodLevels = levels;
      if (this.animalData.breedAndExoticLevels) {
        this.animalData.breedAndExoticLevels.map((currentLevels) => {
          let tempVar = this.bloodLevels.find(
            (ele) => +ele.value == +currentLevels.bloodExoticLevel
          );
          currentLevels.bloodExoticLevel = tempVar?.cd;
          return currentLevels;
        });
      }
    });
    this.ownerDS.getCommonData('milking_status').subscribe((status) => {
      this.milkingStatus = status;
      this.milkingStatusLocal = status;
      if (this.animalData.milkingStatus) {
        this.checkMilkingStatus();
      }
      this.checkInitialStatus();
    });
    this.ownerDS.getCommonData('animal_coat_colour').subscribe((colour) => {
      this.coatColour = colour;
    });
    this.ownerDS.getCommonData('sire_id_type').subscribe((sireIdTypes) => {
      this.sireIdTypes = sireIdTypes;
    });
    this.ownerDS.getCommonData('dam_id_type').subscribe((damIdTypes) => {
      this.damIdTypes = damIdTypes;
    });
  }

  checkInitialStatus() {
    if (
      this.animalData.numberCalvings != undefined &&
      +this.animalData.numberCalvings > 0
    ) {
      this.milkingStatus.splice(0, 1);
    }
  }

  checkMilkingStatus() {
    for (let i = 0; i < this.milkingStatus.length; i++) {
      if (this.milkingStatus[i].value == this.animalData.milkingStatus) {
        this.milkingStatusCd = this.milkingStatus[i].cd;
        this.familyDetailsForm.patchValue({
          milkingStatus: this.milkingStatusCd,
        });
        this.familyDetailsForm?.get('milkingStatus')?.disable();
        this.initialFormValue = this.familyDetailsForm.getRawValue();
      }
    }
  }

  createRow(breedCd?: string, bloodExoticLevelCd?: string) {
    if (breedCd != undefined && bloodExoticLevelCd != undefined) {
      this.isAddMoreVisible = false;
      this.isTrashVisible = false;
    }
    return this.fb.group({
      bloodExoticLevelCd: [
        {
          value: bloodExoticLevelCd || '',
          disabled: bloodExoticLevelCd != undefined,
        },
        Validators.required,
      ],
      breedCd: [
        { value: breedCd || '', disabled: breedCd != undefined },
        Validators.required,
      ],
    });
  }

  addRow(breedCd?: string, bloodExoticLevelCd?: string) {
    this.rowAdd = this.addAnimalInfoForm.get(
      'breedAndExoticLevels'
    ) as FormArray;
    if (this.rowAdd.length < 4) {
      this.rowAdd.push(this.createRow(breedCd, bloodExoticLevelCd));
    }
  }

  fetchSpecies() {
    this.isLoadingSpinner = true;
    this.ownerDS.getCommonData('species').subscribe(
      (speciesList: CommonData[]) => {
        this.species = speciesList;
        this.isLoadingSpinner = false;
        this.isSpeciesSelected = true;
        this.onSelectingSpecies();
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  get additionalAnimalInfo() {
    return this.addAnimalInfoForm.controls;
  }

  get formRowTitles() {
    return (this.addAnimalInfoForm.get('breedAndExoticLevels') as FormArray)[
      'controls'
    ];
  }

  checkBloodLevel() {
    this.addAnimalInfoForm
      .get('breedAndExoticLevels')
      ?.valueChanges.subscribe((data) => {
        this.isFormValueChanged = true;
        let selectedPercentage = 0;
        for (let i of data) {
          let bloodLevelCd = i.bloodExoticLevelCd;
          if (!isNaN(parseInt(bloodLevelCd))) {
            for (let level of this.bloodLevels) {
              if (level.cd == bloodLevelCd) {
                selectedPercentage += +level.value;
              }
            }
          }
        }
        if (selectedPercentage > 100) {
          this.isShowError = this.translatePipe.transform(
            'errorMsg.exotic_level_exceed'
          );
          this.isAddMoreVisible = false;
        } else if (selectedPercentage < 100) {
          this.isShowError = this.translatePipe.transform(
            'errorMsg.exotic_level_less'
          );

          this.isAddMoreVisible = true;
        } else {
          this.isAddMoreVisible = false;
          this.isShowError = '';
        }
      });
  }

  onBreedSelect() {
    this.checkDuplicateBreed();
  }

  checkDuplicateBreed() {
    const dup = this.addAnimalInfoForm.value.breedAndExoticLevels
      .map((val: ArrayControl) => val.breedCd)
      .filter(
        (val: ArrayControl, i: number, breed: ArrayControl[]) =>
          breed.indexOf(val) != i
      );
    const dupBreed = this.addAnimalInfoForm.value.breedAndExoticLevels.filter(
      (obj: ArrayControl) => obj.breedCd && dup.includes(obj.breedCd)
    );
    if (dupBreed.length > 1) {
      this.isShowBreedError = this.translatePipe.transform(
        'errorMsg.same_breed'
      );
    } else {
      this.isShowBreedError = '';
    }
  }

  get exoticLevelArray() {
    return this.addAnimalInfoForm.get('breedAndExoticLevels') as FormArray;
  }

  onSelectingSpecies() {
    var selectedSpecies = String(this.data?.animalData.speciesCd);
    this.animalMS.getBreeds(selectedSpecies).subscribe((breeds) => {
      this.breeds = breeds;
      if (this.breeds) {
        if (this.animalData.breedAndExoticLevels) {
          this.animalData.breedAndExoticLevels.map((currentLevels) => {
            var arr = this.breeds.find(
              (ele) => ele.breedName == currentLevels.breed
            );
            currentLevels.breed = String(arr.breedCd);
            return currentLevels;
          });
          this.animalData.breedAndExoticLevels.forEach((value) => {
            this.addRow(value.breed, value.bloodExoticLevel);
          });
          this.exoticLevelArray.updateValueAndValidity();
        }
      }
    });
  }

  addValidations(selVal) {
    switch (selVal) {
      case 1:
        this.familyDetailsForm.get('sireId').addValidators(EartagValidation);
        this.familyDetailsForm
          .get('sireSireId')
          .addValidators(EartagValidation);
        break;
      case 2:
        this.familyDetailsForm.get('sireId').addValidators(BullIdValidation);
        this.familyDetailsForm
          .get('sireSireId')
          .addValidators(BullIdValidation);
        break;
      case 3:
        this.familyDetailsForm.get('sireSireId')?.enable();
        break;
    }
    this.familyDetailsForm?.get('sireId')?.updateValueAndValidity();
    this.familyDetailsForm?.get('sireSireId')?.updateValueAndValidity();
  }

  onSelectingSireIDType(event: Event) {
    this.familyDetailsForm?.get('sireId')?.clearValidators();
    this.familyDetailsForm?.get('sireSireId')?.clearValidators();
    this.familyDetailsForm?.get('sireSireId')?.disable();
    this.familyDetailsForm.get('sireId').setValue('');
    this.familyDetailsForm.get('sireSireId').setValue('');
    const selectedVal = +(event.target as HTMLInputElement).value;
    if (selectedVal) {
      this.isSireIdTypeSelected = true;
    }
    this.addValidations(selectedVal);
  }

  onSelectingDamIDType(event: Event) {
    this.familyDetailsForm?.get('damId')?.clearValidators();
    this.familyDetailsForm?.get('damSireId')?.clearValidators();
    this.familyDetailsForm?.get('damSireId')?.disable();
    this.familyDetailsForm.get('damId').setValue('');
    this.familyDetailsForm.get('damSireId').setValue('');
    const selectedVal = +(event.target as HTMLInputElement).value;
    if (selectedVal) {
      this.isDamIdTypeSelected = true;
    }
    switch (selectedVal) {
      case 1:
        this.familyDetailsForm.get('damId').addValidators(EartagValidation);
        this.familyDetailsForm.get('damSireId').addValidators(EartagValidation);
        break;
      case 2:
        this.familyDetailsForm.get('damSireId')?.enable();
        break;
    }
    this.familyDetailsForm.get('damId')?.updateValueAndValidity();
    this.familyDetailsForm.get('damSireId')?.updateValueAndValidity();
  }

  removeRow(i: number) {
    let deletedRow = this.addAnimalInfoForm.get(
      'breedAndExoticLevels'
    ) as FormArray;
    deletedRow.removeAt(i);
    this.checkDuplicateBreed();
  }

  getformGroupName(num: number) {
    return 'fGroup' + num;
  }

  getSireSireIdForOtherSpecies(event: Event) {
    if (
      (event.target as HTMLInputElement).value.length == 12 &&
      !isNaN(+(event.target as HTMLInputElement).value)
    ) {
      let id = (event.target as HTMLInputElement).value;
      this.animalMS.getSireSireId(id, '1').subscribe((sireSireIdVal: any) => {
        this.familyDetailsForm.patchValue({
          sireSireId: sireSireIdVal.animalDetails[0].sireId || '',
          sireIdType: 1,
        });
        this.sireSireIdValue = sireSireIdVal.id;
      });
    } else {
      this.familyDetailsForm.patchValue({
        sireSireId: '',
        sireIdType: 1,
      });
    }
  }

  getDamSireIdForOtherSpecies(event: Event) {
    if (
      (event.target as HTMLInputElement).value.length == 12 &&
      !isNaN(+(event.target as HTMLInputElement).value)
    ) {
      let id = (event.target as HTMLInputElement).value;
      this.animalMS.getSireSireId(id, '1').subscribe((damSireIdVal: any) => {
        this.familyDetailsForm.patchValue({
          damSireId: damSireIdVal.animalDetails[0].sireId || '',
          damIdType: 1,
        });
        this.DamSireIdValue = damSireIdVal.id;
      });
    } else {
      this.familyDetailsForm.patchValue({
        damSireId: '',
        damIdType: 1,
      });
    }
  }

  getDamSireId() {
    this.damIdCalled = true;
    const damId = this.familyDetailsForm.get('damId').value;
    const typeofDamId = this.familyDetailsForm.get('damIdType').value;
    if (damId.length == 12 && !isNaN(+damId) && typeofDamId == '1') {
      this.isLoadingSpinner = true;
      this.animalMS.getSireSireId(damId, '1').subscribe(
        (damSireIdVal: any) => {
          this.isLoadingSpinner = false;
          this.familyDetailsForm.patchValue({
            damSireId: damSireIdVal.animalDetails[0].sireId,
          });
          this.DamSireIdValue = damSireIdVal.id;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    } else if (typeofDamId != '2') {
      this.familyDetailsForm.patchValue({
        damSireId: '',
      });
    }
  }

  getSireSireId() {
    this.sireIdCalled = true;
    const isValid = this.familyDetailsForm.get('sireId').valid;
    const typeofId = this.familyDetailsForm.get('sireIdType').value;
    const sireId: string = this.familyDetailsForm.get('sireId').value;
    if (sireId.length == 12 && !isNaN(+sireId) && typeofId == '1' && isValid) {
      this.isLoadingSpinner = true;
      this.animalMS.getSireSireId(sireId, '1').subscribe(
        (sireSireIdVal: any) => {
          this.isLoadingSpinner = false;
          this.familyDetailsForm.patchValue({
            sireSireId: sireSireIdVal.animalDetails[0].sireId,
          });
          this.sireSireIdValue = sireSireIdVal.id;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    } else if (typeofId == '2' && isValid && sireId.trim().length > 0) {
      this.isLoadingSpinner = true;
      this.animalMS.getSireSireId(sireId, '37').subscribe(
        (sireSireIdVal: any) => {
          this.isLoadingSpinner = false;
          this.familyDetailsForm.patchValue({
            sireSireId: sireSireIdVal.animalDetails[0].sireId,
          });
          this.sireSireIdValue = sireSireIdVal.id;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    } else if (typeofId != '3') {
      this.familyDetailsForm.patchValue({
        sireSireId: '',
      });
    }
  }

  checkIfAllControlsDisabled() {
    if (this.data?.animalData.sex == 'M') {
      this.familyDetailsForm.removeControl('numberCalvings');
      this.familyDetailsForm.removeControl('milkingStatus');
    }
    let countofDisabledControls = 0;
    let noOfTraverses = 0;
    Object.keys(this.familyDetailsForm.controls).forEach((value) => {
      noOfTraverses += 1;
      if (this.familyDetailsForm.get(value).status == 'DISABLED') {
        countofDisabledControls += 1;
      }
    });
    if (countofDisabledControls == noOfTraverses) {
      return true;
    } else {
      return false;
    }
  }

  checkCalvings(enteredValue: Event) {
    if (this.animalData.milkingStatus == undefined) {
      const val = (enteredValue.target as HTMLInputElement).value;
      this.milkingStatus = JSON.parse(JSON.stringify(this.milkingStatusLocal));
      if (val == '0') {
        this.familyDetailsForm.patchValue({ milkingStatus: 1 });
        this.familyDetailsForm.get('milkingStatus').disable();
      } else if (
        this.familyDetailsForm.get('numberCalvings').status == 'VALID' &&
        (+val > 0 || val == '')
      ) {
        if (val != '') {
          this.milkingStatus.splice(0, 1);
        }
        this.familyDetailsForm.get('milkingStatus').enable();
        this.familyDetailsForm.patchValue({ milkingStatus: '' });
      }
    }
  }

  onMilkingChange() {
    if (this.animalData.numberCalvings == undefined) {
      if (this.familyDetailsForm.get('milkingStatus').value == 1) {
        this.familyDetailsForm.patchValue({ numberCalvings: 0 });
      } else {
        if (this.familyDetailsForm.get('numberCalvings').value == 0)
          this.familyDetailsForm.patchValue({ numberCalvings: '' });
      }
    }
  }

  onSubmit() {
    if (
      this.isShowError ||
      this.isShowBreedError ||
      this.addAnimalInfoForm.invalid ||
      this.familyDetailsForm.invalid
    ) {
      this.addAnimalInfoForm.markAllAsTouched();
      if (this.familyDetailsForm.invalid) {
        const controls = this.familyDetailsForm.controls;
        for (const name in controls) {
          if (controls[name].invalid) {
            const invalidControl = this.el.nativeElement.querySelector(
              '[formcontrolname="' + name + '"]'
            );
            invalidControl.focus();
          }
        }
        return;
      }
      if (this.addAnimalInfoForm.invalid) {
        this.isShowError = 'Please Select Breed';
      }
      this.addAnimalInfoForm.controls.breedAndExoticLevels.markAllAsTouched();
    } else if (
      JSON.stringify(this.initialFormValue) ==
        JSON.stringify(this.familyDetailsForm.getRawValue()) &&
      !this.isFormValueChanged
    ) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translatePipe.transform('common.info_label'),
          icon: 'assets/images/info.svg',
          message: this.translatePipe.transform('common.modify_to_save'),
          primaryBtnText: this.translatePipe.transform('common.ok_string'),
        },
        panelClass: 'common-info-dialog',
      });
    } else {
      const sireId = this.familyDetailsForm.get('sireId')?.value;
      const damId = this.familyDetailsForm.get('damId')?.value;
      const sireSireId = this.familyDetailsForm.get('sireSireId')?.value;
      const damSireId = this.familyDetailsForm.get('damSireId')?.value;
      if (
        +this.data.animalData.speciesCd === 1 ||
        +this.data.animalData.speciesCd === 2
      ) {
        if (sireId && !this.sireIdCalled) {
          this.getSireSireId();
        }
        if (damId && !this.damIdCalled) {
          this.getDamSireId();
        }
        if (!this.isSireIdTypeSelected) {
          this.familyDetailsForm.removeControl('sireId');
          this.familyDetailsForm.removeControl('sireSireId');
        }
        if (!this.isDamIdTypeSelected) {
          this.familyDetailsForm.removeControl('damId');
          this.familyDetailsForm.removeControl('damSireId');
        }
      }
      this.checkIfAllControlsDisabled();
      this.isLoadingSpinner = true;
      if (sireId == '' && sireSireId != '') {
        this.isLoadingSpinner = false;
        this.dialog.open(ConfirmationDialogComponent, {
          data: {
            title: this.translatePipe.transform('common.info_label'),
            icon: 'assets/images/info.svg',
            message: this.translatePipe.transform('animalDetails.enter_sireId'),
            primaryBtnText: this.translatePipe.transform('common.ok_string'),
          },
          panelClass: 'common-info-dialog',
        });
        return;
      }
      if (damId == '' && damSireId != '') {
        this.isLoadingSpinner = false;
        this.dialog.open(ConfirmationDialogComponent, {
          data: {
            title: this.translatePipe.transform('common.info_label'),
            icon: 'assets/images/info.svg',
            message: this.translatePipe.transform('animalDetails.enter_damId'),
            primaryBtnText: this.translatePipe.transform('common.ok_string'),
          },
          panelClass: 'common-info-dialog',
        });
        return;
      }
      var formValue = {
        ...this.familyDetailsForm.getRawValue(),
        ...this.addAnimalInfoForm.getRawValue(),
      };
      this.animalMS.additionalAnimalDetails(formValue).subscribe(
        (responseData) => {
          if (responseData['supervisorName']) {
            this.dialog.open(ConfirmationDialogComponent, {
              data: {
                title: this.translatePipe.transform('common.info_label'),
                icon: 'assets/images/info.svg',
                message:
                  this.translatePipe.transform(
                    'animalDetails.addAdditionalSuccessfullySupervisor'
                  ) + String(responseData['supervisorName']),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
              },
              panelClass: 'common-info-dialog',
            });
          } else {
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
          this.isLoadingSpinner = false;
          this.animalMS.setAdditionalDetails(true);
          this.dialogRef.close();
        },
        (error) => {
          this.isLoadingSpinner = false;
          this.familyDetailsForm.addControl('sireId', new FormControl(''));
          this.familyDetailsForm.addControl('sireSireId', new FormControl(''));
          this.familyDetailsForm.addControl('damId', new FormControl(''));
          this.familyDetailsForm.addControl('damSireId', new FormControl(''));
        }
      );
    }
  }
}
