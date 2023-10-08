import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';
import { SnackBarMessage } from 'src/app/shared/snack-bar';
import { BullIdValidation, EartagValidation, NumericValidation, SiretagValidation } from 'src/app/shared/utility/validation';
// import { AnimalDetails } from '../../animal-health/models/animal.model';
import { AnimalDetails } from 'src/app/features/animal-management/animal-registration/models-animal-reg/animal-details.model';
import { AddInfoDialogComponent } from '../../animal-management/animal-registration/add-info-dialog/add-info-dialog.component';
import { AnimalManagementService } from '../../animal-management/animal-registration/animal-management.service';
import { CommonData } from '../../animal-management/owner-registration/models-owner-reg/common-data.model';
import { OwnerDetailsService } from '../../animal-management/owner-registration/owner-details.service';
import { Breed } from '../bull-master/bull-master-model/bull-master.model';
import { BullMasterService } from '../bull-master/bull-master.service';

interface ArrayControl {
  bloodExoticLevelCd: string;
  breedCd: string;
}

@Component({
  selector: 'app-modify-animal-details',
  templateUrl: './modify-animal-details.component.html',
  styleUrls: ['./modify-animal-details.component.css']
})

export class ModifyAnimalDetailsComponent implements OnInit {

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
  isShowBreedError: string = '';
  isBreedErrorVisible: boolean = false;
  exoticLevels: any;
  isTrashVisible: boolean = true;
  animalData!: AnimalDetails;
  milkingStatusCd: string = '';
  isFormValueChanged: boolean = false;
  initialFormValue: {} = {};
  isLactationNoValid: boolean = false;
  isSireIdTypeSelected = false;
  isDamIdTypeSelected = false;
  sireIdCalled = false;
  damIdCalled = false;
  sireIdTypes: CommonData[] = [];
  damIdTypes: CommonData[] = [];
  DamSireIdValue;
  sireSireIdValue;
  isBull:boolean
  
  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA)
    public data: { animalData: AnimalDetails,isbull?:boolean },
    private fb: FormBuilder,
    private animalMS: AnimalManagementService,
    private ownerDS: OwnerDetailsService,
    private _snackBar: MatSnackBar,
    private el: ElementRef,
    private dialogRef: MatDialogRef<AddInfoDialogComponent>,
    private bullMasterService: BullMasterService,
  ) {}

  ngOnInit(): void {
    this.fetchSpecies();
    this.animalData = JSON.parse(JSON.stringify(this.data.animalData));
    this.isBull  = this.data?.isbull ?  JSON.parse(JSON.stringify(this.data?.isbull)) : null
    if (
      this.animalData.sireId != undefined ||
      this.animalData.sireIdText != undefined
    ) {
      this.isSireIdTypeSelected = true;
    }
    if (
      this.animalData.damId != undefined ||
      this.animalData.damIdText != undefined
    ) {
      this.isDamIdTypeSelected = true;
    }
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
      if (this.animalData.milkingStatus) {
        this.checkMilkingStatus();
      }
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
    this.addAnimalInfoForm = this.fb.group({
      animalId: this.animalData.animalId,
      speciesCd: [
        { value: this.data?.animalData.speciesCd, disabled: true },
        Validators.required,
      ],
      breedAndExoticLevels: this.fb.array([]),
    });
    this.familyDetailsForm = this.fb.group({
      sireIdType: [ {
        value: this.animalData.sireIdType || '',
        disabled: this.animalData.sireIdType,
      },],
      damIdType: [ {
        value: this.animalData.damIdType || '',
        disabled: this.animalData.damIdType,
      }],
      sireId: [
        {
          value: this.animalData.sireId ? this.animalData.sireId : '',
          disabled: this.animalData.sireId,
        },
        [
          Validators.maxLength(30),
          Validators.minLength(12),
          SiretagValidation,
        ]
      ],
      sireSireId: [
        {
          value: this.animalData.sireSireId ? this.animalData.sireSireId : '',
          disabled: this.animalData.sireSireId,
        },
        [
          Validators.maxLength(30),
          Validators.minLength(12),
          SiretagValidation,
        ]
      ],
      damId: [
        {
          value: this.animalData.damId ? this.animalData.damId : '',
          disabled: this.animalData.damId,
        },
        [
          Validators.maxLength(30),
          Validators.minLength(12),
          EartagValidation,
        ]
      ],
      damSireId: [
        {
          value: this.animalData.damSireId ? this.animalData.damSireId : '',
          disabled: this.animalData.damSireId,
        },
        [
          Validators.maxLength(30),
          Validators.minLength(12),
          SiretagValidation,
        ]
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
          value: this.animalData.numberCalvings
            ? this.animalData.numberCalvings
            : '',
          disabled: this.animalData.numberCalvings,
        },
        NumericValidation,
      ],
      milkingStatus: [
        {
          value: this.milkingStatusCd || '',
           disabled: this.milkingStatusCd,
        },
        [Validators.required,NumericValidation]
      ],

      currentLactationNo: [
        {
          value: parseInt(this.animalData.currentLactationNo) == 0 ?'0': this.animalData.currentLactationNo || '',
          disabled: parseInt(this.animalData.currentLactationNo) == 0 ? true :this.animalData.currentLactationNo ? true :false
        },
        [Validators.required,NumericValidation]
      ],
    pregnancyStatus:[ this.animalData.pregnancyStatus || '',],
    damDamId:[null,
      [
        Validators.maxLength(30),
        Validators.minLength(12),
        EartagValidation,
      ]
    ],
    sireDamId:[null,
      [
        Validators.maxLength(30),
        Validators.minLength(12),
        EartagValidation,
      ]
    ],
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
          this.isShowError =
            'errorMsg.blood_exotic_greater';
          this.isAddMoreVisible = false;
        } else if (selectedPercentage < 100) {
          this.isShowError =
            'errorMsg.blood_exotic_less';
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
      this.isShowBreedError =
        'errorMsg.breed_already_exist';
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

  onSubmit() {
    if (
      this.isShowError ||
      this.isShowBreedError ||
      this.addAnimalInfoForm.invalid ||
      this.familyDetailsForm.invalid || this.isLactationNoValid
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
        this.isShowError = 'errorMsg.select_breed_name';
      }
      this.addAnimalInfoForm.controls.breedAndExoticLevels.markAllAsTouched();
    } else if (
      JSON.stringify(this.initialFormValue) ==
        JSON.stringify(this.familyDetailsForm.getRawValue()) &&
      !this.isFormValueChanged
    ) {
      new SnackBarMessage(this._snackBar).onSucessMessage(
        'Modify the values to save changes.',
        'Ok',
        'left',
        'top',
        'red-snackbar'
      );
    } else {
      this.checkIfAllControlsDisabled();
      this.isLoadingSpinner = true;
      var formValue = {
        ...this.familyDetailsForm.getRawValue(),
        ...this.addAnimalInfoForm.getRawValue(),
      };

      // this.animalMS.additionalAnimalDetails(formValue)
      this.bullMasterService.savebullDetails(formValue).subscribe(
        (responseData) => {
          new SnackBarMessage(this._snackBar).onSucessMessage(
            'Additional Details Added Successfully.',
            'Ok',
            'right',
            'top',
            'green-snackbar'
          );
          // this.confirmtionDialoug('animalDetails.addAdditionalSuccessfully')
          this.isLoadingSpinner = false;
          this.dialogRef.close(responseData);
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    }
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
  onSelectingSireIDType(event: Event) {
    this.familyDetailsForm.get('sireId').clearValidators();
    this.familyDetailsForm.get('sireSireId').clearValidators();
    this.familyDetailsForm.get('sireSireId').disable();
    const selectedVal = +(event.target as HTMLInputElement).value;
    if (selectedVal) {
      this.isSireIdTypeSelected = true;
    }
    switch (selectedVal) {
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
        this.familyDetailsForm.get('sireSireId').enable();
        break;
    }
    if(this.isBull)this.familyDetailsForm.get("sireId").addValidators([Validators.required])
    this.familyDetailsForm.get('sireId').updateValueAndValidity();
    this.familyDetailsForm.get('sireSireId').updateValueAndValidity();
  }

  onSelectingDamIDType(event: Event) {
    this.familyDetailsForm.get('damId').clearValidators();
    this.familyDetailsForm.get('damSireId').clearValidators();
    this.familyDetailsForm.get('damSireId').disable();
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
        this.familyDetailsForm.get('damSireId').enable();
        break;
    }
    if(this.isBull)this.familyDetailsForm.get("damId").addValidators([Validators.required])
    this.familyDetailsForm.get('damId').updateValueAndValidity();
    this.familyDetailsForm.get('damSireId').updateValueAndValidity();
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
    const sireId = this.familyDetailsForm.get('sireId').value;
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
    } else if (typeofId == '2' && isValid) {
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
      this.familyDetailsForm.removeControl('currentLactationNo');
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

  onKey() {
    const newLactationNo = this.familyDetailsForm.get("currentLactationNo").value;
    const milkingStatus = this.familyDetailsForm.get("milkingStatus").value
    if(this.animalData?.ageInMonths && milkingStatus != 1 && newLactationNo > 0){
      const animalAge = this.animalData?.ageInMonths / 12;
      this.isLactationNoValid =
        this.data && this.animalData?.currentLactationNo
          ? animalAge <= newLactationNo || newLactationNo < parseInt(this.animalData?.currentLactationNo)
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
      if(newLactationNo == 0){
        this.familyDetailsForm.get("milkingStatus").patchValue(1)
      }
    }

  }
  onMilkingChange():void{
    const milkingStatus = this.familyDetailsForm.get("milkingStatus").value
    if(milkingStatus == 1){
      this.familyDetailsForm.get("currentLactationNo").patchValue(0)
      this.familyDetailsForm.get("currentLactationNo").disable()
    }else{
      this.familyDetailsForm.get("currentLactationNo").reset()
      this.familyDetailsForm.get("currentLactationNo").enable()
    }

  }
  private confirmtionDialoug(message:string):void{
    this.dialog.open(ConfirmationDeleteDialogComponent, {
      data: {
        id: "",
        title: 'common.alert',
        message: message,
        icon:"assets/images/alert.svg",
        primaryBtnText: 'common.ok'
      },
      panelClass:'common-alert-dialog'
    }).afterClosed()
  }
}
