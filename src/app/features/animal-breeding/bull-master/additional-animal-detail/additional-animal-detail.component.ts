import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';
import { SnackBarMessage } from 'src/app/shared/snack-bar';
import { BullIdValidation, EartagValidation, onlyNumberValidation } from 'src/app/shared/utility/validation';
import { Breed } from '../bull-master-model/bull-master.model';
import { BullMasterService } from '../bull-master.service';
import { CommonData } from 'src/app/features/animal-management/owner-registration/models-owner-reg/common-data.model';
import { OwnerDetailsService } from 'src/app/features/animal-management/owner-registration/owner-details.service';
import { AnimalManagementService } from 'src/app/features/animal-management/animal-registration/animal-management.service';

export interface commonDetails {
  cd: string;
  key: string;
  value: string;
};

@Component({
  selector: 'app-additional-animal-detail',
  templateUrl: './additional-animal-detail.component.html',
  styleUrls: ['./additional-animal-detail.component.css']
})
export class AdditionalAnimalDetailComponent implements OnInit {
  isLoadingSpinner: boolean = false
  additionalAnimalForm: FormGroup;
  exoticLevel: commonDetails[] = []
  breedDetails:Breed[] = []
  animalID:number
  animalData:any
  isSireIdTypeSelected = false;
  isDamIdTypeSelected = false;
  sireIdCalled = false;
  damIdCalled = false;
  sireIdTypes: CommonData[] = [];
  damIdTypes: CommonData[] = [];
  DamSireIdValue;
  sireSireIdValue;
  constructor(private fb: FormBuilder, 
    private bullMasterService: BullMasterService,
    private ownerDS: OwnerDetailsService,public dialog: MatDialog,
    private animalMS: AnimalManagementService,
    @Inject(MAT_DIALOG_DATA)

    public data: {

      data:any

    },private dialogRef: MatDialogRef<AdditionalAnimalDetailComponent>) { }

  ngOnInit(): void {
   
    this.initAdditionalForm()
    this.getBreedDetail()
    // this.autoSelectedBreed()
    this.animalID = this.data?.data?.bullDetails?.animalId
    this.animalData = this.data?.data?.bullDetails
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
    this.ownerDS.getCommonData('sire_id_type').subscribe((sireIdTypes) => {
      this.sireIdTypes = sireIdTypes;
    });
    this.ownerDS.getCommonData('dam_id_type').subscribe((damIdTypes) => {
      this.damIdTypes = damIdTypes;
    });
  }

  addMoreExoticLevel(breedLength : number) {
    Array.from({ length: breedLength }, () => (this.levels.push(this.createBloodLevels())))
    
  }

  onSubmit() {
    if (this.additionalAnimalForm.invalid) {
      this.additionalAnimalForm.markAllAsTouched();
      return;
    }
  
    const exoticLevelsCount = this.checkExoticLevelsCounts()
    if(exoticLevelsCount != 100){
      // const snackbarType = {message:'Exotic level percentage is more than 100 %',colour:'red-snackbar'}
      // this.snackBar(snackbarType)
     this.alertDialog('animalBreeding.commonLabel.exotic_percentage')
      return
    }
    this.isLoadingSpinner  = true
    const formValue = {
      ...this.additionalAnimalForm.getRawValue()
    };
     formValue.animalId = this.animalID
    this.bullMasterService.savebullDetails(formValue)
     .subscribe(data=>{
      this.isLoadingSpinner  = false
      // const snackbarType = {message:'Animal additional details successfully',colour:'green-snackbar'}
      this.alertDialog('animalDetails.addAdditionalSuccessfully')
      
    //  this.snackBar(snackbarType)
     this.dialogRef.close({data:data})
    },
    error=>{
      this.isLoadingSpinner  = false
    }
    )
  }

  get levels() {
    return this.additionalAnimalForm.get("breedAndExoticLevels") as FormArray;
  }
  removeBreedExoticLevel(index: number): void {
    const arr = this.additionalAnimalForm.get('breedAndExoticLevels') as FormArray;

    if (arr.length === 1) {
      arr.reset();
      return;
    }

    (this.additionalAnimalForm.get('breedAndExoticLevels') as FormArray).removeAt(
      index
    );
  }
  onSelectingSireIDType(event: Event) {
    this.additionalAnimalForm.get('sireId').clearValidators();
    this.additionalAnimalForm.get('sireSireId').clearValidators();
    this.additionalAnimalForm.get('sireSireId').disable();
    const selectedVal = +(event.target as HTMLInputElement).value;
    if (selectedVal) {
      this.isSireIdTypeSelected = true;
    }
    switch (selectedVal) {
      case 1:
        this.additionalAnimalForm.get('sireId').addValidators(EartagValidation);
        this.additionalAnimalForm
          .get('sireSireId')
          .addValidators(EartagValidation);
        break;
      case 2:
        this.additionalAnimalForm.get('sireId').addValidators(BullIdValidation);
        this.additionalAnimalForm
          .get('sireSireId')
          .addValidators(BullIdValidation);
        break;
      case 3:
        this.additionalAnimalForm.get('sireSireId').enable();
        break;
    }
    this.additionalAnimalForm.get('sireId').updateValueAndValidity();
    this.additionalAnimalForm.get('sireSireId').updateValueAndValidity();
  }
  onSelectingDamIDType(event: Event) {
    this.additionalAnimalForm.get('damId').clearValidators();
    this.additionalAnimalForm.get('damSireId').clearValidators();
    this.additionalAnimalForm.get('damSireId').disable();
    const selectedVal = +(event.target as HTMLInputElement).value;
    if (selectedVal) {
      this.isDamIdTypeSelected = true;
    }
    switch (selectedVal) {
      case 1:
        this.additionalAnimalForm.get('damId').addValidators(EartagValidation);
        this.additionalAnimalForm.get('damSireId').addValidators(EartagValidation);
        break;
      case 2:
        this.additionalAnimalForm.get('damSireId').enable();
        break;
    }
    this.additionalAnimalForm.get('damId').updateValueAndValidity();
    this.additionalAnimalForm.get('damSireId').updateValueAndValidity();
  }
  get formControls() {
    return this.additionalAnimalForm.controls;
  }

  private initAdditionalForm(): void {
    // this.additionalAnimalForm = new FormGroup({
    //   "breedAndExoticLevels": this.fb.array([])
    // })
    this.additionalAnimalForm = this.fb.group({
      "breedAndExoticLevels": this.fb.array([]),
      damId:[null, 
        [
        Validators.required,
        Validators.maxLength(12),
        Validators.minLength(12),
        onlyNumberValidation,
      ]
    ],
      damSireId:[null,
        [
          Validators.maxLength(12),
          Validators.minLength(12),
          onlyNumberValidation,
        ]
      ],
      sireId:[null,
        [
          Validators.required,
          Validators.maxLength(12),
          Validators.minLength(12),
          onlyNumberValidation,
        ]
      ],
      sireSireId:[null,
        [
          Validators.maxLength(12),
          Validators.minLength(12),
          onlyNumberValidation,
        ],
      ],
      damDamId:[null,
        [
          Validators.maxLength(12),
          Validators.minLength(12),
          onlyNumberValidation,
        ]
      ],
      sireDamId:[null,
        [
          Validators.maxLength(12),
          Validators.minLength(12),
          onlyNumberValidation,
        ]
      ],
      sireIdType: [''],
      damIdType: [''],
    })
  }

  private createBloodLevels() {
    return this.fb.group({
      bloodExoticLevelCd: [],
      breedCd: [],
    });
  }

  private getCommonMasterDetail(): void {
    this.isLoadingSpinner = false
    this.bullMasterService.getCommonMaster('blood_exotic_level').subscribe((data: any) => {
      this.isLoadingSpinner = false
      this.exoticLevel = data
      const breedExoticLevels = this.data && this.data?.data && 
    this.data?.data?.breedAndExoticLevels?.length > 0 ? this.data?.data?.breedAndExoticLevels : []
      this.autoSelectedBreed()
    },
      error => { this.isLoadingSpinner = false }
    )
  }

  private getBreedDetail(): void {
    this.isLoadingSpinner = false
    this.bullMasterService.getBreeds(this.data?.data?.bullDetails?.speciesCd).subscribe((data: any) => {
      this.isLoadingSpinner = false
      this.breedDetails = data
      this.getCommonMasterDetail()
    },
      error => { this.isLoadingSpinner = false }
    )
  }

  private autoSelectedBreed():void{
    const breedExoticLevels = this.data && this.data?.data && 
    this.data?.data?.breedAndExoticLevels?.length > 0 ? this.data?.data?.breedAndExoticLevels : []
    const breedExoticLength = breedExoticLevels?.length > 0 ? breedExoticLevels?.length : 1
    this.addMoreExoticLevel(breedExoticLength);
      const getBreedPresent = breedExoticLevels ? this.breedDetails.filter(o => breedExoticLevels.some((k) => o.breedName === k.breed )):[]
      const getExoticLevelPresent = breedExoticLevels ? this.exoticLevel.filter(o => breedExoticLevels.some((k) => parseInt(o.value) === parseInt(k.bloodExoticLevel) )):[]  
    getBreedPresent.forEach((levels,index)=>{
        this.levels.at(index).get('breedCd').setValue(levels?.breedCd)
    })
    getExoticLevelPresent.forEach((levels,index)=>{
      this.levels.at(index).get('bloodExoticLevelCd').setValue(levels?.cd)
  })
  this.setIds()

  }

  setIds():void{
    const bullDetail = this.data && this.data?.data
                       &&  this.data?.data?.bullDetails ? 
                       this.data?.data?.bullDetails : [];
    this.animalID = bullDetail?.animalId
    const idsCollection = ['damId','damSireId','damDamId','sireId','sireDamId','sireSireId']
    idsCollection.forEach(id=>{
      this.additionalAnimalForm.get(id).setValue(bullDetail[id])
    }
      )

  }
  getSireSireId() {
    this.sireIdCalled = true;
    const isValid = this.additionalAnimalForm.get('sireId').valid;
    const typeofId = this.additionalAnimalForm.get('sireIdType').value;
    const sireId = this.additionalAnimalForm.get('sireId').value;
    if (sireId.length == 12 && !isNaN(+sireId) && typeofId == '1' && isValid) {
      this.isLoadingSpinner = true;
      this.animalMS.getSireSireId(sireId, '1').subscribe(
        (sireSireIdVal: any) => {
          this.isLoadingSpinner = false;
          this.additionalAnimalForm.patchValue({
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
          this.additionalAnimalForm.patchValue({
            sireSireId: sireSireIdVal.animalDetails[0].sireId,
          });
          this.sireSireIdValue = sireSireIdVal.id;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    } else if (typeofId != '3') {
      this.additionalAnimalForm.patchValue({
        sireSireId: '',
      });
    }
  }
  getDamSireId() {
    this.damIdCalled = true;
    const damId = this.additionalAnimalForm.get('damId').value;
    const typeofDamId = this.additionalAnimalForm.get('damIdType').value;
    if (damId.length == 12 && !isNaN(+damId) && typeofDamId == '1') {
      this.isLoadingSpinner = true;
      this.animalMS.getSireSireId(damId, '1').subscribe(
        (damSireIdVal: any) => {
          this.isLoadingSpinner = false;
          this.additionalAnimalForm.patchValue({
            damSireId: damSireIdVal.animalDetails[0].sireId,
          });
          this.DamSireIdValue = damSireIdVal.id;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    } else if (typeofDamId != '2') {
      this.additionalAnimalForm.patchValue({
        damSireId: '',
      });
    }
  }
  private checkExoticLevelsCounts(){
    const getExoticLevelList = this.additionalAnimalForm.get("breedAndExoticLevels").value
    let exoticLevelValue = 0
    if(getExoticLevelList && getExoticLevelList?.length > 0){
     const parseLevels  = getExoticLevelList.reduce( (acc, x ) => acc.concat(+x.bloodExoticLevelCd), [])
     this.exoticLevel.filter(o => parseLevels.some((k) => {
      if(o.cd == k) exoticLevelValue += parseInt(o.value)
    }))
    }
  return exoticLevelValue
  }
  private alertDialog(message:string):void{
    this.dialog
      .open(ConfirmationDeleteDialogComponent, {
        data: {
          id: "",
          title: 'common.alert',
          message: message,
          icon:"assets/images/alert.svg",
          primaryBtnText: 'Yes',
          secondaryBtnText: 'No',
        },
        panelClass:'common-alert-dialog'
      }).afterClosed()
  }
}
