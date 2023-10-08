import { Data } from '@angular/router';
import { AnimalDetails } from 'src/app/features/animal-management/animal-registration/models-animal-reg/animal-details.model';
import { TranslatePipe } from '@ngx-translate/core';
import {
  NumericValidation,
  NaturalNumberValidation,
} from './../../../../shared/utility/validation';
import { OwnerDetailsService } from './../../owner-registration/owner-details.service';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarMessage } from 'src/app/shared/snack-bar';
import {
  NameValidation,
  EartagValidation,
} from '../../../../shared/utility/validation';
import { CommonData } from '../../owner-registration/models-owner-reg/common-data.model';
import { AnimalManagementService } from '../animal-management.service';
import { Breed } from '../models-animal-reg/breed-list.model';
import { DatePipe } from '@angular/common';
import { AnimalManagementConfig } from 'src/app/shared/animal-management.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AppService } from 'src/app/shared/shareService/app.service';
import { AnimalDetailService } from '../animal-details/animal-detail.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import moment from 'moment';

interface ArrayControl {
  bloodExoticLevelCd: string;
  breedCd: string;
}
interface PregMonths {
  cd: number;
  value: number;
}
@Component({
  selector: 'app-edit-animal-details',
  templateUrl: './edit-animal-details.component.html',
  styleUrls: ['./edit-animal-details.component.css'],
  providers: [DatePipe, TranslatePipe],
})
export class EditAnimalDetailsComponent implements OnInit {
  isSpeciesSelected: boolean = false;
  isShowBreedError: string = '';
  dateToday: Date;
  isBreedErrorVisible: boolean = false;
  selectedField: string = '';
  rowAdd!: FormArray;
  isLoadingSpinner: boolean = false;
  breedAndExoticLevels!: FormArray;
  species: CommonData[] = [];
  isAddMoreVisible: boolean = true;
  isValueChanged: boolean = false;
  isShowError = '';
  tagDateLimit = '';
  updateDetailsRes: any;
  pregMonths: Array<PregMonths> = [];
  breeds: Breed[] = [];
  bloodLevels: CommonData[] = [];
  editOptions: CommonData[] = [];
  milkingStatus: CommonData[] = [];
  filteredMilkingStatus: CommonData[] = [];
  statusOptions: CommonData[] = [];
  coatColour: CommonData[] = [];
  animalDobLimit = AnimalManagementConfig.animalDOBLimit.defaultValue;
  taggingDateLimit = AnimalManagementConfig.taggingDateLimit;
  lastTranscDate = new Date(null);
  editAnimalForm: FormGroup;
  fieldLabel = '';
  displayType = '';
  timeInvalidError = '';
  maxTextLength = 0;
  crrAnimalStatus = 0;
  isAnimalStatusDropdown = false;
  isMilkingOrCalvingModification = false;
  isInactivatedManually = false;
  reasonKey = '';
  dropdown = ['1', '3', '10', '12', '13', '14', '16'];
  textField = ['2', '5', '6', '7', '8', '9'];
  datePickers = ['4', '11'];
  dropdownValues: CommonData[] = [];
  reasonDropdownValues: CommonData[] = [];

  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      animalData: AnimalDetails;
      animalId: string;
      tagId: string;
      gender: string;
      pregnancyStatus: string;
    },
    private fb: FormBuilder,
    private animalMS: AnimalManagementService,
    private _snackBar: MatSnackBar,
    private ownerDS: OwnerDetailsService,
    private dialogRef: MatDialogRef<EditAnimalDetailsComponent>,
    private datePipe: DatePipe,
    private translatePipe: TranslatePipe,
    private appService: AppService,
    private animalDS: AnimalDetailService
  ) {}

  ngOnInit(): void {
    this.animalDobLimit = AnimalManagementConfig.animalDOBLimit.defaultValue;
    this.crrAnimalStatus = this.data.animalData.animalStatusCd;
    this.isInactivatedManually =
      this.data.animalData.registrationStatus != '3' &&
      this.data.animalData.animalStatusCd === 7;
    this.fetchCommonAPIs();
    // this.getCurrentDate();
    this.editAnimalForm = this.fb.group({
      fieldNewValue: ['', Validators.required],
      remarks: ['', Validators.required],
    });
  }

  createRow() {
    return this.fb.group({
      breedCd: ['', Validators.required],
      bloodExoticLevelCd: ['', Validators.required],
    });
  }

  fetchCommonAPIs() {
    this.isLoadingSpinner = true;
    forkJoin({
      speciesList: this.ownerDS
        .getCommonData('species')
        .pipe(catchError((err) => of(null))),
      editFields: this.ownerDS
        .getCommonData('field_changed')
        .pipe(catchError((err) => of(null))),
      levels: this.ownerDS
        .getCommonData('blood_exotic_level')
        .pipe(catchError((err) => of(null))),
      milkingStatus: this.ownerDS
        .getCommonData('milking_status')
        .pipe(catchError((err) => of(null))),
      status: this.ownerDS
        .getCommonData('animal_status')
        .pipe(catchError((err) => of(null))),
      colour: this.ownerDS
        .getCommonData('animal_coat_colour')
        .pipe(catchError((err) => of(null))),
      pregData: this.animalDS.getPregMonthAccToSpecies(
        this.data.animalData.speciesCd
      ),
      date: this.animalMS.getCurrentDate().pipe(catchError((err) => of(null))),
      lastTransactionDate: this.animalMS
        .getLastTransactionDate([String(this.data.animalData.animalId)])
        .pipe(catchError((err) => of(null))),
    }).subscribe(
      ({
        speciesList,
        editFields,
        levels,
        milkingStatus,
        status,
        colour,
        pregData,
        date,
        lastTransactionDate,
      }) => {
        this.species = speciesList;
        this.editOptions =
          this.isInactivatedManually ||
          this.data.animalData?.animalStatusCd === 4
            ? editFields.filter((value) => value.cd === 10)
            : editFields;
        this.removeCalvingIfMale();
        this.bloodLevels = levels;
        this.milkingStatus = milkingStatus;
        this.data.animalData['milkingStatusCd'] = this.milkingStatus.filter(
          (ele) => ele.value === this.data.animalData.milkingStatus
        )[0]?.cd;
        this.statusOptions = this.isInactivatedManually
          ? status.filter((value) => value.cd === 1)
          : status.filter(
              (crrStatus) => +crrStatus.cd != 5 && +crrStatus.cd != 6
            );
        this.coatColour = colour;
        this.pregMonths = [];
        let crrMonth = 1;
        while (crrMonth <= pregData.maxPregnancyMonths) {
          this.pregMonths.push({ cd: crrMonth, value: crrMonth++ });
        }
        this.dateToday = new Date(date.value);
        this.getMaxTime();
        this.getPastTaggingDate(+this.taggingDateLimit.defaultValue);
        this.isLoadingSpinner = false;
        this.lastTranscDate = new Date(Date.parse(lastTransactionDate.value));
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  checkDateAndTime() {
    this.timeInvalidError = '';
    let timeSelected = this.editAnimalForm
      ?.get('timeOfDeath')
      ?.value?.split(':');
    let dateAndTime = this.editAnimalForm?.get('dateOfDeath')?.value;
    dateAndTime = moment(dateAndTime).set('hours', +timeSelected[0]);
    dateAndTime = moment(dateAndTime).set('minutes', +timeSelected[1]);
    if (moment(dateAndTime).isAfter(this.dateToday)) {
      this.timeInvalidError = this.translatePipe.transform(
        'common.please_enter_valid_time'
      );
    }
  }

  getMaxTime() {
    let selectedDate = new Date(this.editAnimalForm?.get('dateOfDeath')?.value);
    if (selectedDate?.toDateString() == this.dateToday?.toDateString()) {
      let time = moment(this.dateToday).format('HH:mm:ss');
      return time;
    }
    return '';
  }

  getPastTaggingDate(days: number): string {
    var tempDate = new Date(this.dateToday);
    tempDate.setDate(tempDate.getDate() - days);
    this.tagDateLimit = tempDate.toISOString().split('T')[0];
    return this.tagDateLimit;
  }

  onDropdownSelection() {
    this.removeAdditionalControlsAndErrors();
    this.isAnimalStatusDropdown = false;
    this.isMilkingOrCalvingModification = false;
    this.reasonKey = '';
    this.editAnimalForm.patchValue({ fieldNewValue: '', remarks: '' });
    this.editAnimalForm.markAsUntouched();
    this.editAnimalForm.updateValueAndValidity();
    let filteredArray = this.editOptions.filter(
      (data) => data.cd == this.selectedField
    );
    this.fieldLabel = filteredArray[0].value;
    if (this.dropdown.includes(this.selectedField)) {
      this.displayType = 'dropdown';
      this.setDropdownValue();
    } else if (this.textField.includes(this.selectedField)) {
      this.displayType = 'text';
      this.setMaxLengthForTextField();
    } else if (this.datePickers.includes(this.selectedField)) {
      this.displayType = 'datepicker';
    } else {
      this.displayType = '';
    }
  }

  setMaxLengthForTextField() {
    this.editAnimalForm.get('fieldNewValue').clearValidators();
    this.editAnimalForm.get('fieldNewValue').addValidators(Validators.required);
    if (this.selectedField == '2') {
      this.maxTextLength = 50;
      this.editAnimalForm.get('fieldNewValue').addValidators(NameValidation);
    } else if (5 <= +this.selectedField && 8 >= +this.selectedField) {
      this.maxTextLength = 12;
      this.editAnimalForm.get('fieldNewValue').addValidators(EartagValidation);
    } else if (this.selectedField === '9') {
      this.maxTextLength = 2;
      this.editAnimalForm.get('fieldNewValue').addValidators(NumericValidation);
    } else {
      this.maxTextLength = 0;
    }
    this.editAnimalForm.get('fieldNewValue').updateValueAndValidity();
  }

  setDropdownValue() {
    this.editAnimalForm.get('fieldNewValue').clearValidators();
    this.editAnimalForm.get('fieldNewValue').addValidators(Validators.required);
    switch (this.selectedField) {
      case '1':
        this.dropdownValues = this.species;
        this.editAnimalForm.addControl(
          'breedAndExoticLevels',
          this.fb.array([])
        );
        this.addRow();
        this.checkBloodLevel();
        break;
      case '3':
        this.dropdownValues = [
          { cd: 'M', value: 'Male' },
          { cd: 'F', value: 'Female' },
        ];
        break;
      case '10':
        this.dropdownValues = this.statusOptions;
        break;
      case '12':
        this.dropdownValues = this.coatColour;
        break;
      case '13':
        this.dropdownValues = [
          { cd: 'Y', value: 'Yes' },
          { cd: 'N', value: 'No' },
        ];
        break;
      case '14':
        this.dropdownValues = this.milkingStatus;
        break;
      case '16':
        this.dropdownValues = [
          { cd: 'true', value: 'Yes' },
          { cd: 'false', value: 'No' },
        ];
        break;
    }
    this.editAnimalForm.updateValueAndValidity();
  }

  removeAdditionalControlsAndErrors() {
    this.editAnimalForm?.removeControl('breedAndExoticLevels');
    this.editAnimalForm?.removeControl('reasonCd');
    this.editAnimalForm?.removeControl('timeOfDeath');
    this.editAnimalForm?.removeControl('dateOfDeath');
    this.editAnimalForm?.removeControl('pregnancyMonths');
    this.editAnimalForm.removeControl('additionalCalvingValue');
    this.editAnimalForm.updateValueAndValidity();
    this.isMilkingOrCalvingModification = false;

    this.isShowBreedError = '';
    this.isShowError = '';
    this.timeInvalidError = '';
  }

  removeCalvingIfMale() {
    if (this.data.gender == 'M') {
      let indx = this.editOptions.length;
      while (indx--) {
        if (
          this.editOptions[indx].cd == '9' ||
          this.editOptions[indx].cd == '13' ||
          this.editOptions[indx].cd == '14'
        ) {
          const ind = this.editOptions.indexOf(this.editOptions[indx]);
          this.editOptions.splice(ind, 1);
        }
      }
    }
  }

  onSelectingFieldNewValue(event: Event) {
    var selectedValue = (event.target as HTMLInputElement)?.value;
    this.isAnimalStatusDropdown = false;
    this.isMilkingOrCalvingModification = false;

    switch (this.selectedField) {
      case '1':
        this.isSpeciesSelected = true;
        this.animalMS.getBreeds(selectedValue).subscribe((breeds) => {
          this.breeds = breeds;
        });
        break;

      case '9':
        this.removeAdditionalControlsAndErrors();
        if (this.editAnimalForm.get('fieldNewValue').valid) {
          if (+selectedValue === 0) {
            this.filteredMilkingStatus = this.milkingStatus;
            this.editAnimalForm.addControl(
              'additionalMilkingStatusValue',
              new FormControl('1', [Validators.required])
            );
            this.editAnimalForm.patchValue({
              additionalMilkingStatusValue: '1',
            });
            this.editAnimalForm.get('additionalMilkingStatusValue').disable();
          } else if (+selectedValue >= 1) {
            this.filteredMilkingStatus = this.milkingStatus.filter(
              (data) => +data.cd > 1
            );
            this.editAnimalForm.addControl(
              'additionalMilkingStatusValue',
              new FormControl('', [Validators.required])
            );
            this.editAnimalForm.patchValue({
              additionalMilkingStatusValue:
                this.data.animalData['milkingStatusCd'] == 1
                  ? ''
                  : this.data.animalData['milkingStatusCd'] || '',
            });
            this.editAnimalForm.get('additionalMilkingStatusValue').enable();
          }
          this.isMilkingOrCalvingModification = true;
        }

        break;

      case '10':
        this.removeAdditionalControlsAndErrors();

        if (
          (this.crrAnimalStatus == 1 || this.crrAnimalStatus == 4) &&
          selectedValue == '7'
        ) {
          //activeToInactive

          this.fetchAnimalModificationReasons('active_to_inactive_reasons');

          this.toggleAnimalStatusDropdown();
        } else if (
          (this.crrAnimalStatus == 1 || this.crrAnimalStatus == 4) &&
          selectedValue == '3'
        ) {
          //activeToDied

          this.fetchAnimalModificationReasons('active_to_died_reasons');
          this.toggleAnimalStatusDropdown(true);
        } else if (this.crrAnimalStatus == 7 && selectedValue == '1') {
          //inactiveToActive
          this.fetchAnimalModificationReasons('inactive_to_active_reasons');
          this.toggleAnimalStatusDropdown();
        }
        break;

      case '13':
        this.removeAdditionalControlsAndErrors();
        this.fetchAnimalModificationReasons(
          'pregnancy_reason_for_update',
          true,
          selectedValue
        );
        this.toggleAnimalStatusDropdown();
        if (selectedValue === 'Y') {
          this.toggleAnimalStatusDropdown(false, true);
        } else {
          this.toggleAnimalStatusDropdown();
        }
        break;

      case '14':
        this.removeAdditionalControlsAndErrors();
        this.isMilkingOrCalvingModification = true;
        if (selectedValue === '1') {
          this.editAnimalForm.addControl(
            'additionalCalvingValue',
            new FormControl('0', [Validators.required, NumericValidation])
          );
          this.editAnimalForm.get('additionalCalvingValue').disable();
        } else if (selectedValue != '1') {
          this.editAnimalForm.addControl(
            'additionalCalvingValue',
            new FormControl(this.data.animalData.numberCalvings || '', [
              Validators.required,
              NaturalNumberValidation,
            ])
          );
          this.editAnimalForm.get('additionalCalvingValue').enable();
        }
    }
  }

  fetchAnimalModificationReasons(
    key: string,
    isPregKey?: boolean,
    selValue?: string
  ) {
    this.reasonKey = key;
    this.isLoadingSpinner = true;
    this.ownerDS.getCommonData(key).subscribe(
      (reason) => {
        if (!isPregKey) {
          this.reasonDropdownValues = reason;
        } else {
          if (selValue == 'Y') {
            //1,3
            this.reasonDropdownValues = reason.filter((data) => data.cd != '2');
          } else if (selValue == 'N') {
            //1,2
            this.reasonDropdownValues = reason.filter((data) => data.cd != '3');
          }
        }
        this.isLoadingSpinner = false;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  toggleAnimalStatusDropdown(isDead?: boolean, isPregnant?: boolean) {
    if (isDead) {
      this.editAnimalForm.addControl(
        'timeOfDeath',
        this.fb.control(
          moment(this.dateToday).format('HH:mm'),
          Validators.required
        )
      );
      this.editAnimalForm.addControl(
        'dateOfDeath',
        this.fb.control(moment(this.dateToday), Validators.required)
      );
    }
    if (isPregnant) {
      this.editAnimalForm.addControl(
        'pregnancyMonths',
        this.fb.control('', Validators.required)
      );
    }
    this.editAnimalForm.addControl(
      'reasonCd',
      this.fb.control('', Validators.required)
    );
    this.isAnimalStatusDropdown = true;
  }

  get formbreedAndExoticLevels() {
    return (this.editAnimalForm.get('breedAndExoticLevels') as FormArray)[
      'controls'
    ];
  }

  getToday(): string {
    if (this.selectedField == '4') {
      return new Date(this.dateToday).toISOString().split('T')[0];
    } else if (this.selectedField == '10') {
      return new Date(this.dateToday).toISOString().split('T')[0];
    } else if (this.selectedField == '11') {
      return this.data.animalData.registrationDate;
    }
    return null;
  }

  getPastDate(): string {
    if (this.selectedField == '4') {
      // animalDob
      var tempDate = new Date(this.dateToday);
      tempDate.setFullYear(tempDate.getFullYear() - +this.animalDobLimit);
      return tempDate.toISOString().split('T')[0];
    } else if (this.selectedField == '10') {
      // animal status
      var tempDate = new Date(this.dateToday);
      let transferDate =
        +AnimalManagementConfig.animalDeathDateLimit?.defaultValue || 30;
      tempDate.setDate(tempDate.getDate() - transferDate);
      let calcDate = (
        tempDate > this.lastTranscDate ? tempDate : this.lastTranscDate
      )
        .toLocaleString()
        .split(',')[0];
      calcDate = moment(Date.parse(calcDate)).format('YYYY-MM-DD');
      return calcDate;
    } else if (this.selectedField == '11') {
      //dateOfTagging
      return this.tagDateLimit;
    }
    return null;
  }

  checkDuplicateBreed() {
    const dup = this.editAnimalForm.value.breedAndExoticLevels
      .map((val: ArrayControl) => val.breedCd)
      .filter(
        (val: ArrayControl, i: number, breed: ArrayControl[]) =>
          breed.indexOf(val) != i
      );
    const dupBreed = this.editAnimalForm.value.breedAndExoticLevels.filter(
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

  onBreedSelect() {
    this.checkDuplicateBreed();
  }

  checkBloodLevel() {
    this.editAnimalForm
      .get('breedAndExoticLevels')
      ?.valueChanges.subscribe((data) => {
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

  get formRowTitles() {
    return (this.editAnimalForm.get('breedAndExoticLevels') as FormArray)[
      'controls'
    ];
  }

  addRow() {
    this.rowAdd = this.editAnimalForm.get('breedAndExoticLevels') as FormArray;
    if (this.rowAdd.length < 4) {
      this.rowAdd.push(this.createRow());
    }
  }

  removeRow(i: number) {
    let deletedRow = this.editAnimalForm.get(
      'breedAndExoticLevels'
    ) as FormArray;
    deletedRow.removeAt(i);
    this.checkDuplicateBreed();
  }

  onModifyingDetails(formValue: FormGroup) {
    if (
      formValue.invalid ||
      this.isShowBreedError ||
      this.isShowError ||
      this.timeInvalidError
    ) {
      formValue.markAllAsTouched();
    } else if (formValue.get('fieldNewValue').value === '') {
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
      let formModifiedValues = { ...formValue.getRawValue() };
      if (this.selectedField === '4' || this.selectedField === '11') {
        formModifiedValues.fieldNewValue = this.datePipe.transform(
          formModifiedValues.fieldNewValue,
          'yyyy-MM-dd'
        );
      } else if (this.selectedField === '10') {
        if (
          (this.crrAnimalStatus === 1 || this.crrAnimalStatus === 4) &&
          this.editAnimalForm.get('fieldNewValue').value === '3'
        ) {
          let time = formModifiedValues.timeOfDeath.split(':');
          formModifiedValues.dateOfDeath = moment(
            formModifiedValues.dateOfDeath
          ).set('hours', time[0]);
          formModifiedValues.dateOfDeath = moment(
            formModifiedValues.dateOfDeath
          ).set('minutes', time[1]);
          formModifiedValues.dateOfDeath = moment(
            formModifiedValues.dateOfDeath
          )
            .local()
            .format('YYYY-MM-DD HH:mm:ss');
          delete formModifiedValues.timeOfDeath;
        }
      }
      const animalKeys = {
        animalId: this.data.animalId,
        tagId: this.data.tagId,
        fieldChanged: this.selectedField,
      };
      var payload = { ...formModifiedValues, ...animalKeys };
      if (
        this.reasonKey &&
        this.isAnimalStatusDropdown &&
        this.displayType === 'dropdown'
      ) {
        payload['reasonKey'] = this.reasonKey;
      }
      this.isLoadingSpinner = true;
      this.appService.getModulebyUrl('/animal/modifyanimal');
      this.animalMS.updateAnimalDetails(payload).subscribe(
        (res) => {
          this.updateDetailsRes = res;
          this.animalMS.setEditAnimal(true);
          this.isLoadingSpinner = false;
        },
        (error) => {
          this.isLoadingSpinner = false;
        },
        () => {
          this.dialog.open(ConfirmationDialogComponent, {
            data: {
              title: this.translatePipe.transform('common.info_label'),
              icon: 'assets/images/info.svg',
              message:
                this.selectedField == '2' ||
                this.data.animalData.ownerDetails.orgId ||
                !this.updateDetailsRes?.supervisorName
                  ? this.translatePipe.transform('common.modified_success')
                  : this.translatePipe.transform('common.sent_supervisor') +
                    String(this.updateDetailsRes?.supervisorName || ''),
              primaryBtnText: this.translatePipe.transform('common.ok_string'),
            },
            panelClass: 'common-info-dialog',
          });
          this.dialogRef.close();
        }
      );
    }
  }
}
