import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { OwnerServiceService } from 'src/app/shared/shareService/owner-detail-service/owner-service.service';
import { SaveDialogComponent } from '../../../pregnancy-diagnosis/save-dialog/save-dialog.component';
import { EtService } from '../../et.service';
import { Location } from '@angular/common';
import { AnimalDetailService } from 'src/app/features/animal-management/animal-registration/animal-details/animal-detail.service';
import { AnimalDetails } from 'src/app/features/animal-management/animal-registration/models-animal-reg/animal-details.model';
import { ModifyAnimalDetailsComponent } from '../../../modify-animal-details/modify-animal-details.component';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import {
  TagIdSearchValidation,
  onlyNumberValidation,
} from 'src/app/shared/utility/validation';
import { TranslatePipe } from '@ngx-translate/core';
import { decimalWithLengthValidation } from 'src/app/shared/utility/decimalWithLengthValidator';
import { animalBreedingValidations } from 'src/app/shared/validatator';

export interface TableData {
  embryoId: string;
  embryoAge: any;
  sireId: string;
  sireBreed: string;
  embryoStage: string;
  embryoGrade: string;
  semenType: any;
  sexedSemen: any;
}
export interface commonData {
  key: string;
  cd: number;
  value: string;
}
@Component({
  selector: 'app-create-embryo',
  templateUrl: './create-embryo.component.html',
  styleUrls: ['./create-embryo.component.css'],
  providers: [TranslatePipe],
})
export class CreateEmbryoComponent implements OnInit {
  @ViewChild('stepper') private matStepper: MatStepper;
  isLoadingSpinner: boolean = false;
  addEmbryoMasterForm: FormGroup;
  sireDetailsList: FormArray;
  users: FormArray;
  data: TableData[] = [];
  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  displayColumns = [
    'sr_no',
    'embryoId',
    'sireId',
    'sireBreed',
    'embryoStage',
    'embryoGrade',
    'embryoAge',
    'freezing_rate',
    '#',
  ];
  rows: FormArray = this._fb.array([]);
  form: FormGroup = this._fb.group({ dates: this.rows });
  animalDetals: any;
  movetoEmbryoFieldScreen: boolean = false;
  breedingMinDate: number = 30;
  getCommonMasterDetail: commonData[] = [];
  embryoList = [];
  isbullValidate: any = [];
  bullDetails: any = [];
  isDonorValidate: string = null;
  getDatabyID: any[] = [];
  userInfo: any[] = [];
  labsAssign: any[] = [];
  currentDate = sessionStorage.getItem('serverCurrentDateTime');
  speciesCode: number;
  isStepOneCompleted: boolean = false;
  cmnValidation = animalBreedingValidations.common;
  isHeaderActive :boolean= false
  constructor(
    private _fb: FormBuilder,
    private etService: EtService,
    private OwnerService: OwnerServiceService,
    private dialog: MatDialog,
    private location: Location,
    private animalDS: AnimalDetailService,
    private dataService: DataServiceService
  ) {}

  ngOnInit(): void {
    this._fetchUserInformation();
    this.initHeatTransactionForm();
    this.addSireRow(1, 0);
    this.getCommonMaster();
  }

  submitEmbryoMasterForm() {
    if (this.addEmbryoMasterForm.invalid || this.isDonorValidate) {
      this.addEmbryoMasterForm.markAllAsTouched();
      return;
    }
    this.isLoadingSpinner = true;

    const formValue = {
      ...this.addEmbryoMasterForm.value,
    };
    this.etService
      .saveEmbryoMasterDetails(formValue.dates)
      .pipe(
        switchMap((res: any) => {
          return this.dialog
            .open(SaveDialogComponent, {
              data: {
                title: 'animalDetails.embryo_summit_success',
                //  transaction_id: res,
              },
              width: '500px',
              panelClass: 'makeItMiddle',
            })
            .afterClosed();
        })
      )
      .subscribe(
        (res) => {
          this.isLoadingSpinner = false;
          this.gotoPreviousScreen();
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
  }

  addSireRow(param: number, counter?: number) {
    const calvingDetailControl = [
      'laboratory',
      'etProductionType',
      'bullId',
      'donorTagId',
      `sireDetailsList`,
    ];
    const checkTabValidation = this.findInvalidControls(calvingDetailControl);
    if (
      checkTabValidation.length == 0 ||
      this.isbullValidate.length > 0 ||
      counter == 0
    ) {
      this.sireDetailsList = this.addEmbryoMasterForm.get(
        'sireDetailsList'
      ) as FormArray;
      this.sireDetailsList.push(this.sireDetails(param));
    } else {
      this.confirmtionDialoug('errorMsg.fill_required_field');
    }
  }
  get minDate() {
    return moment(this.currentDate)
      .subtract(this.breedingMinDate, 'days')
      .format('YYYY-MM-DD');
  }

  get today() {
    return moment(this.currentDate).format('YYYY-MM-DD');
  }
  onRemoveOtherSymptom(i: number) {
    const array = this.sireDetailsList.get('sireDetailsList') as FormArray;

    array.removeAt(i);
  }

  removeSireDetail(i: number): void {
    const arr = this.addEmbryoMasterForm.get('sireDetailsList') as FormArray;

    if (arr.length === 1) {
      arr.reset();
      return;
    }

    (this.addEmbryoMasterForm.get('sireDetailsList') as FormArray).removeAt(i);
  }
  createEmbryoDetailsList(index: number): void {
    const numberOfEmbryo = this.sireDetailsList
      .at(index)
      .get('noOfEmbryo').value;
    if (numberOfEmbryo < 1) {
      this.confirmtionDialoug('animalBreeding.no_of_embryo');
      this.sireDetailsList.at(index).get('noOfEmbryo').reset();
      return;
    }
    const calvingDetailControl = [
      'laboratory',
      'etProductionType',
      'bullId',
      'donorTagId',
      `sireDetailsList`,
    ];
    const checkTabValidation = this.findInvalidControls(calvingDetailControl);
    if (checkTabValidation.length == 0 || this.isbullValidate.length > 0) {
      const embryoObj = {
        flushingDate: this.formControls.opuDate.value,
        subOrgId: this.formControls.laboratory.value,
        noOfEmbryos: numberOfEmbryo,
        sireId: this.sireDetailsList.at(index).get('sireId').value,
      };
      this.embryoList[index] = embryoObj;
      this.isLoadingSpinner = true;
      const arr = this.form.get('dates') as FormArray;
      if (arr.length > 0) {
        arr.clear();
        this.updateView();
      }
      this.etService.getEmbryoIDs(this.embryoList).subscribe(
        (data: any) => {
          this.isLoadingSpinner = false;
          if (data) {
            data.forEach((element) => {
              let embryoColumn = {
                embryoId: element?.embryoId,
                embryoAge: element?.ageInDays,
                sireId: element?.sireId,
                embryoStage: null,
                embryoGrade: null,
                sireBreed: this.sireDetailsList.at(index).get('sireBreed')
                  .value,
                semenType: this.sireDetailsList.at(index).get('semenType')
                  .value,
                sexedSemen: this.sireDetailsList.at(index).get('sexedSemen')
                  .value,
              };
              this.addRow(embryoColumn);
            });
            this.isStepOneCompleted = true;
            this.isHeaderActive =false
          } else {
            this.isStepOneCompleted = false;
            this.isHeaderActive =false
          }
        },
        (error) => {
          this.isLoadingSpinner = false;
          this.isStepOneCompleted = false;
          this.isHeaderActive =false
        }
      );
    } else {
      this.sireDetailsList.at(index).get('noOfEmbryo').reset();
      // const snackbarType = {message:'Please fill all required field first',colour:'red-snackbar'}
      // this.snackBar(snackbarType)
      this.confirmtionDialoug('errorMsg.fill_required_field');
    }
  }
  get formControls() {
    return this.addEmbryoMasterForm.controls;
  }
  verifyIds(event, type: string, index: number) {
    let tagID = type == 'DI' ? event.target['value'] : event;
    const isTagIDCorrect = tagID && tagID?.length > 8 ? true : false;
    // if(isTagIDCorrect){
    this.isLoadingSpinner = true;
    this.OwnerService.getAnimalHistory(tagID).subscribe(
      (data: any) => {
        this.isLoadingSpinner = false;
        this.isDonorValidate = type == 'DI' ? null : this.isDonorValidate;
        this.animalDetals =
          data &&
          data?.ownerResponse &&
          data?.ownerResponse?.animalsList?.length > 0
            ? data?.ownerResponse?.animalsList
            : [];
        if (this.animalDetals?.length > 0 && type == 'DI') {
          if (this.animalDetals[0].sex == 'F') {
            this.getDatabyID[type] = data?.ownerResponse?.animalsList[0];
            this.addEmbryoMasterForm.controls['donorSpecies'].setValue(
              this.animalDetals[0]?.species
            );
            this.addEmbryoMasterForm.controls['donorBreed'].setValue(
              this.animalDetals[0]?.breed
            );
             this.checkSpeciesCode(this.animalDetals[0]?.speciesCd,true)
          } else {
            this.confirmtionDialoug('errorMsg.animal_not_female');
            this.addEmbryoMasterForm.controls['donorSpecies'].reset();
            this.addEmbryoMasterForm.controls['donorBreed'].reset();
            this.addEmbryoMasterForm.controls['donorTagId'].reset();
          }
        } else {
          if (this.getDatabyID[type] === undefined) {
            this.getDatabyID[type] = [];
            this.getDatabyID[type][index] = data?.ownerResponse?.animalsList[0];
          } else
            this.getDatabyID[type][index] = data?.ownerResponse?.animalsList[0];

          // this.getDatabyID.splice(index, 1, data?.ownerResponse?.animalsList[0]);
          this.sireDetailsList
            .at(index)
            .get('sireSpecies')
            .setValue(this.animalDetals[0]?.species);
          this.sireDetailsList
            .at(index)
            .get('sireBreed')
            .setValue(this.animalDetals[0]?.breed);
           this.checkSpeciesCode(this.animalDetals[0]?.speciesCd,false,index)
        }
      },
      (error) => {
        this.isDonorValidate = error?.error?.message;
        this.isLoadingSpinner = false;
      }
    );
    // }
  }

  gotoEmbryoDetails(): void {
    this.movetoEmbryoFieldScreen = true;
    const calvingDetailControl = [
      'laboratory',
      'etProductionType',
      'bullId',
      'donorTagId',
      `sireDetailsList`,
    ];
    const checkTabValidation = this.findInvalidControls(calvingDetailControl);
    // const formValue = {
    //   ...this.addEmbryoMasterForm.getRawValue(),
    // };
    // console.log(formValue,this.formControls.donorSpecies.value)
    if (
      (checkTabValidation.length == 0 || this.isbullValidate.length > 0) &&
      this.isStepOneCompleted
    ) {
      this.matStepper.next();
      this.addValidationControls();
      this.isHeaderActive = true
    }else{
      this.isHeaderActive = false
    }
  }
  gotoPreviousScreen(): void {
    this.location.back();
  }

  removeEmbryoDetail(i: number): void {
    const arr = this.addEmbryoMasterForm.get('dates') as FormArray;

    if (arr.length === 1) {
      arr.reset();
      this.updateView();
      return;
    }

    (this.addEmbryoMasterForm.get('dates') as FormArray).removeAt(i);
    this.updateView();
  }

  getBullDetails(event, index: number) {
    this.isLoadingSpinner = true;
    const bullId = event.target['value'];
    this.OwnerService.getBullDetailsByID(bullId).subscribe({
      next: (data) => {
        this.bullDetails[index] = data;
        this.isbullValidate.splice(index, 1);
        this.isLoadingSpinner = false;
        this.verifyIds(this.bullDetails[index]?.tagId, 'SI', index);
      },
      error: (error) => {
        this.bullDetails.splice(index, 1);
        this.isbullValidate[index] = error?.error?.message;
        this.isLoadingSpinner = false;
        this.sireDetailsList
        .at(index)
        .get('sireSpecies')
        .reset()
      this.sireDetailsList
        .at(index)
        .get('sireBreed')
       .reset()
      //  this.sireDetailsList
      //  .at(index)
      //  .get('sireId')
      // .reset()
      },
    });
  }
  private initHeatTransactionForm(): void {
    this.addEmbryoMasterForm = this._fb.group({
      laboratory: [null, [Validators.required]],
      etProductionType: ['', [Validators.required]],
      opuDate: [this.today],
      donorTagId: [
        '',
        [
          Validators.required,
          Validators.maxLength(12),
          Validators.minLength(12),
          TagIdSearchValidation,
        ],
      ],
      donorSpecies: [{ value: '', disabled: true }, [Validators.required]],
      sireDetailsList: new FormArray([]),
      donorBreed: [{ value: '', disabled: true }],
      dates: this.rows,
    });
    // this.addEmbryoMasterForm.get('opuDate').valueChanges.subscribe((res) => {
    //   const selectedDate = moment(res);

    //   const taggingDate = moment(this.animalDetals?.taggingDate);

    //   if (selectedDate.isBefore(taggingDate)) {
    //     this.dialog.open(ConfirmationDialogComponent, {
    //       data: {
    //         title: this.translatePipe.transform('common.info_label'),
    //         message: this.translatePipe.transform(
    //           'performanceRecording.please_select_date_after_animal_tagging_date'
    //         ),
    //         primaryBtnText: this.translatePipe.transform('common.ok_string'),
    //         icon: 'assets/images/alert.svg',
    //       },
    //       panelClass: 'common-info-dialog',
    //     });
    //     this.addEmbryoMasterForm.get('opuDate').reset();
    //   }
    // });
    this.data.forEach((d: TableData) => this.addRow(d, false));
    this.updateView();
  }
  private sireDetails(count): FormGroup {
    return this._fb.group({
      sireId: ['', [Validators.required]],
      sireSpecies: [{ value: '', disabled: true }],
      sireBreed: [{ value: '', disabled: true }],
      semenType: [null, [Validators.required]],
      sexedSemen: [null, [Validators.required]],
      noOfEmbryo: ['', [Validators.required, onlyNumberValidation]],
    });
  }
  removeEmbryo(i: number) {
    while (this.rows.length !== 0) {
      this.rows.removeAt(0);
    }
    this.updateView();
  }
  addRow(d?: TableData, noUpdate?: boolean) {
    const row = this._fb.group({
      embryoId: [d && d?.embryoId ? d?.embryoId : '--', []],
      embryoAge: [d?.embryoAge, [Validators.required, onlyNumberValidation]],
      sireId: [d?.sireId],
      sireBreed: [d?.sireBreed],
      embryoStage: [null, [Validators.required]],
      embryoGrade: [null, [Validators.required]],
      donorTagId: this.formControls?.donorTagId?.value,
      labCd: this.addEmbryoMasterForm.get('laboratory')?.value,
      opuDate: moment(this.formControls?.opuDate?.value).format('YYYY-MM-DD'),
      embryoProductionType: this.formControls?.etProductionType?.value,
      semenType: [d?.semenType],
      sexedSemen: [d?.sexedSemen],
      freezingRate: [null, [Validators.required, decimalWithLengthValidation(4, 2)]],
      embryoType: this.formControls?.etProductionType?.value,
    });
    this.rows.push(row);
    if (!noUpdate) {
      this.updateView();
    }
  }

  updateView() {
    this.dataSource.next(this.rows.controls);
  }
  openAddInfoDialog(type: string, index: number) {
    const animalId =
      type && type == 'DI'
        ? this.getDatabyID[type]?.animalId
        : this.getDatabyID[type][index]?.animalId;
    if (animalId) {
      this.animalDS
        .getAnimalDetails(animalId)
        .subscribe((animalDetails: AnimalDetails) => {
          const dialogRef = this.dialog.open(ModifyAnimalDetailsComponent, {
            data: {
              animalData: animalDetails,
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
            // if (this.animalMS.getAdditionalDetails()) {
            //   this.getAnimalDetails(sessionStorage.getItem('animalId')!);
            //   this.animalMS.setAdditionalDetails(false);
            // }
          });
        });
    } else {
      const message =
        type == 'DI'
          ? 'animalDetails.enter_damId'
          : 'animalDetails.enter_sireId';
      this.confirmtionDialoug(message);
      // const snackbarType = {message:`anima ${type == 'DI' ? 'Dam Id' : 'Sire Id'}`,colour:'red-snackbar'}
      // this.snackBar(snackbarType)
    }
  }
  verifyType(index: number): void {
    const value = this.sireDetailsList.at(index).get('semenType').value;
    switch (value) {
      case 1:
        this.sireDetailsList
          .at(index)
          .get('sexedSemen')
          .setValidators([Validators.required]);
        this.sireDetailsList
          .at(index)
          .get('sexedSemen')
          .updateValueAndValidity();
        break;

      default:
        this.sireDetailsList
          .at(index)
          .get('sexedSemen')
          .removeValidators([Validators.required]);
        this.sireDetailsList
          .at(index)
          .get('sexedSemen')
          .updateValueAndValidity();
        break;
    }
  }

  checkSpeciesCode(species_code: number, isdonor?: boolean, index?: number) {
    if (this.speciesCode) {
      const isAnimalSpeciesSame: boolean =
        this.speciesCode == species_code ? true : false;
      if (!isAnimalSpeciesSame) {
        this.confirmtionDialoug('errorMsg.species_mismatch');
        if (isdonor) {
          this.addEmbryoMasterForm.controls['donorSpecies'].reset();
          this.addEmbryoMasterForm.controls['donorBreed'].reset();
          this.addEmbryoMasterForm.controls['donorTagId'].reset();
        } else {
          this.sireDetailsList.at(index).get('sireId').reset();
          this.sireDetailsList.at(index).get('sireSpecies').reset();
          this.sireDetailsList.at(index).get('sireBreed').reset();
        }
      }
    } else {
      this.speciesCode = species_code;
    }
  }

  private addValidationControls() {
    const noOfRows = this.rows.length;
    if (noOfRows && noOfRows > 0) {
      this.rows.controls.forEach((element, index) => {
        this.rows
          .at(index)
          .get('embryoAge')
          .setValidators([Validators.required, onlyNumberValidation]);
        this.rows
          .at(index)
          .get('embryoGrade')
          .setValidators([Validators.required]);
        this.rows
          .at(index)
          .get('embryoStage')
          .setValidators([Validators.required]);
        this.rows.at(index).get('embryoAge').updateValueAndValidity();
        this.rows.at(index).get('embryoStage').updateValueAndValidity();
        this.rows.at(index).get('embryoGrade').updateValueAndValidity();
      });
    }
  }
  private findInvalidControls(check_fields: any) {
    const invalid = [];
    const controls = this.addEmbryoMasterForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    const intersection = invalid.filter((element) =>
      check_fields.includes(element)
    );
    return intersection;
  }

  private getCommonMaster(): void {
    this.isLoadingSpinner = true;
    const key = [
      'embryo_grade',
      'embryo_production_type',
      'sexed_semen',
      'semen_type',
      'embryo_stage',
    ];
    key.forEach((val) => {
      this.etService.getCommonMaster(val).subscribe(
        (data) => {
          this.isLoadingSpinner = false;
          this.getCommonMasterDetail[val] = data;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    });
  }
  private confirmtionDialoug(message: string): void {
    this.dialog
      .open(ConfirmationDeleteDialogComponent, {
        data: {
          id: '',
          title: 'common.alert',
          message: message,
          icon: 'assets/images/alert.svg',
          primaryBtnText: 'Ok',
        },
        panelClass: 'common-alert-dialog',
      })
      .afterClosed();
  }
  _fetchUserInformation(): void {
    this.dataService._getUserDetailsByUserId().subscribe((data: any) => {
      this.getLabs(data?.orgId);
    });
  }

  private getLabs(orgId: number): void {
    this.dataService._getLabsListing().subscribe((orgList: any) => {
      this.labsAssign =
        orgList?.length > 0
          ? orgList
          : // .filter(org => org?.orgId == orgId)
            [];
    });
  }
}
