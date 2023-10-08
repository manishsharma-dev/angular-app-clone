import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { Subscription, forkJoin, of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  switchMap,
} from 'rxjs/operators';
import { animalBreedingPRConfig } from 'src/app/shared/animal-breeding-pr.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { getSessionData } from 'src/app/shared/shareService/storageData';
import {
  decimalNumberWeightValidation,
  getFileSize,
  NameValidation,
  onlyNumberValidation,
} from 'src/app/shared/utility/validation';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { SaveDialogComponent } from '../../pregnancy-diagnosis/save-dialog/save-dialog.component';
import { CalvingService } from '../calving.service';
import {
  animalDetails,
  CalvingCommonDetail,
  CommonMasterDetails,
} from '../model/calving-detail.model';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-new-calving',
  templateUrl: './new-calving.component.html',
  styleUrls: ['./new-calving.component.css'],
  providers: [TranslatePipe],
})
export class NewCalvingComponent implements OnInit, OnDestroy {
  validationMsg = animalHealthValidations.newCase;
  currentDate = sessionStorage.getItem('serverCurrentDateTime');
  addCalvingForm!: FormGroup;
  calfDetailsList: FormArray;
  showAdditionalInfo: boolean = false;
  showcalvesInfo: boolean = false;
  activeTab = 'INTIMATION-reports';
  controls = [];
  showSireTagField: boolean = false;
  showMetabolicType: boolean = false;
  showCalfOneDetail: boolean = false;
  showFirstAnimalDetail: boolean = false;
  showCalfTwoDetail: boolean = false;
  showAdditionalInfoCalfTwo: boolean = false;
  showAdditionalInfoCalfOne: boolean = false;
  isSireIdRequired: boolean = false;
  isAbortion: boolean = false;
  showCalfDetail = [];
  showCalfAdditionalDetail = [];
  isAILinked: boolean = false;
  commonDetail: CalvingCommonDetail;
  calfValidation: boolean = false;
  selectedTabIndex: number = 0;
  isLoadingSpinner: boolean = false;
  isStillBirth: boolean = false;
  isEarTagSelected: boolean = false;
  isServiceType: boolean = false;
  sireIdValidation: boolean = false;
  ismovetoCalfDetail: boolean = false;
  historyDetail: any = {};
  lastBreedingHistory: any;
  gestationLimit: any = {
    Cattle: { GL: 220, GH: 260 },
    Buffalo: { GL: 240, GH: 290 },
  };
  ownerDetail: animalDetails;
  breedingMinDate = '';
  tagId: number;
  serviceType: CommonMasterDetails[] = [];
  showInMilkStatus: boolean = false;
  validationType: any;
  isCalfTagIDUnique: boolean = false;
  isCalfNameIDUnique: boolean = false;
  weightError = [];
  verifySireID = {};
  verifyEarTagID = {};
  geneticList: any[] = [];
  getAdditionalDetailsPermission = [];
  isCalvingEdit: boolean = false;
  calvingDetails: any;
  fileSize: number = 10000000;
  projectSub: Subscription;
  constructor(
    private _fb: FormBuilder,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private calvingService: CalvingService,
    private dataService: DataServiceService,
    private translatePipe: TranslatePipe
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        filter((params) => {
          if (!params['tagId']) {
            this.router.navigate(['/not-found']);
            return false;
          }
          this.tagId = params['tagId'];
          this.isCalvingEdit = params['isEdit'];
          this.isAILinked = params['isAILinked'] ? true : false;
          if(!this.isCalvingEdit){
            const calvingData = moment(this.today).format('YYYY-MM-DD');
            this.dataService.setGestationDaysInformation(calvingData);
          }
          return true;
        }),
        switchMap(() =>
          forkJoin([
            this.calvingService
              .getCommonMaster('calving_status')
              .pipe(catchError((err) => of(null))),

            this.calvingService
              .getCommonMaster('calving_ease')
              .pipe(catchError((err) => of(null))),

            this.calvingService
              .getCommonMaster('no_of_calves')
              .pipe(catchError((err) => of(null))),
            this.calvingService
              .getCommonMaster('genetic_defects')
              .pipe(catchError((err) => of(null))),

            this.calvingService
              .getCommonMaster('reason_for_not_registering')
              .pipe(catchError((err) => of(null))),
            this.calvingService
              .getCommonMaster('service_type')
              .pipe(catchError((err) => of(null))),

            this.dataService
              .getDefaultConfig(animalBreedingPRConfig.backdate.CalvingBackdate)
              .pipe(catchError((err) => of(null))),
          ])
        )
      )
      .subscribe(
        ([
          calvingStatus,
          calvingEase,
          numberOfCalves,
          geneticDefects,
          reasonForNotRegister,
          serviceType,
          config,
        ]) => {
          this.commonDetail = {
            calvingStatus,
            calvingEase,
            numberOfCalves,
            geneticDefects,
            reasonForNotRegister,
            serviceType,
          };
          this.selectAllForDropdownItems(this.commonDetail.geneticDefects);
          // this.isServiceType = this.commonDetail?.serviceType?.length > 0  ? true : false
          this.breedingMinDate = moment(this.currentDate)
            .subtract(config.defaultValue, 'days')
            .format('YYYY-MM-DD');
        }
      );
    this.historyDetail = {
      compDetail: 'Calving',
      newPageUrl: 'new-calving',
      apiType: 'apiUrlBreedingModule',
      apiUrl: 'animalbreeding/history/getBreedingHistory?tagId=',
      tagId: this.tagId,
      isHistory: false,
      name: 'animalBreeding.calving',
    };
    this.clavingInitForm();
    this.setValidationType();
    this.getProjectID();
    
  }

  get formControls() {
    return this.addCalvingForm.controls;
  }
  // For other symptoms

  submitCase() {
    if (
      this.addCalvingForm.invalid ||
      this.isCalfTagIDUnique ||
      this.isCalfNameIDUnique
    ) {
      this.addCalvingForm.markAllAsTouched();
      return;
    }
    if (!this.isCalvingEdit && this.formControls.calvingStatus.value != 3) {
      const checkCalfImageSize = this.checkImageSize();
      if (checkCalfImageSize) {
        this.confirmtionDialoug('animalBreeding.total_image_size');
        return;
      }
    }
    this.isLoadingSpinner = true;
    const formValue = {
      ...this.addCalvingForm.getRawValue(),
    };
    formValue.animalId = this.ownerDetail?.animalId;
    formValue.calvingDate = moment(formValue?.calvingDate).format('YYYY-MM-DD');
    const calvingAfterNintyDays = moment(formValue?.calvingDate)
      .add(3, 'months')
      .format('YYYY-MM-DD');
    formValue.calvingRecordDate = moment(formValue?.calvingRecordDate).format(
      'YYYY-MM-DD'
    );
    formValue.pregnancyMonth = formValue.pregnancyMonth
      ? formValue.pregnancyMonth
      : 0;
    formValue.inMilk = this.showInMilkStatus ? formValue.inMilk : 'N';
    formValue.tagId = this.tagId;

    formValue.calfDetailsList.forEach((value, index) => {
      formValue.calfDetailsList[index].calvingGeneticDefectsList =
        this.formatDefectList(value.calvingGeneticDefectsList, index + 1);
      formValue[`calf${index + 1}Girth`] = value?.calfGirth;
      formValue[`calf${index + 1}Length`] = value?.calfLength;
      formValue[`calf${index + 1}Name`] = value?.calfName;
      formValue[`calf${index + 1}Sex`] = value?.sexOfCalf;
      formValue[`calf${index + 1}Weight`] = value?.calfWeight;
      formValue[`calf${index + 1}TagId`] = value?.calfTmporaryTagId
        ? value?.calfTmporaryTagId
        : '';
      formValue[`calf${index + 1}Image`] = value?.calfImage;
      formValue[`reasonForNotRegistering${index + 1}`] =
        value?.reasonForNotRegistering;
      formValue.calvingGeneticDefectsList = this.geneticDefectList(
        formValue.calfDetailsList[index]?.calvingGeneticDefectsList
      );
    });
    formValue.currentLactationNo = this.ownerDetail.currentLactationNo;
    if (this.isCalvingEdit) {
      formValue.approvalRejectionRemarks = null;
      formValue.approvalRejectionDate = null;
      formValue.approvedRejectedBy = null;
      formValue.projectId = this.calvingDetails?.projectId;
      formValue.calvingId = this.calvingDetails.calvingId;
    }

    const calf1Pic = formValue.calf1Image ? formValue.calf1Image : null;
    const calf2Pic = formValue.calf2Image ? formValue.calf2Image : null;
    const calfDetails = formValue.calfDetailsList;
    delete formValue.calfDetailsList;
    delete formValue.calf1Image;
    delete formValue.calf2Image;
    const mData = JSON.stringify(formValue);
    const formData = new FormData();

    formData.append(
      'calvingDetails',
      new Blob([mData], { type: 'application/json' })
    );
    formData.append('calf1Pic', calf1Pic);
    formData.append('calf2Pic', calf2Pic);
    this.calvingService[
      this.isCalvingEdit ? 'updateCalvingDetails' : 'registerNewCalving'
    ](formData)
      .pipe(
        switchMap((res: any) => 
        {
          if(res && (res?.msg?.msgCode == 3558)){
            return this.dialog
            .open(ConfirmationDialogComponent, {
              data: {
                title: this.translatePipe.transform('common.info_label'),
                icon: 'assets/images/info.svg',
                message:res?.msg?.msgDesc,
                  // this.translatePipe.transform(
                  //   'animalDetails.transaction-success-supervisor'
                  // ) + String(res?.msg?.msgDesc),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
              },
              panelClass: 'common-info-dialog',
            })
            .afterClosed()
          }else{
            return this.dialog
            .open(SaveDialogComponent, {
              data: {
                title: this.isCalvingEdit
                  ? 'animalDetails.transaction_approval'
                  : res?.msg?.msgDesc,
                transaction_id: res?.data?.calvingId,
                temporary_id: res?.data,
                calvingDate: calvingAfterNintyDays,
                isCalving: true,
                calvingStatus: formValue?.calvingStatus,
                isCalvingEdit: this.isCalvingEdit ? this.isCalvingEdit : false,
                calfDetails: calfDetails,
              },
              width: '500px',
            })
            .afterClosed();
          }
          
        }


        // {
        //   return this.dialog
        //     .open(SaveDialogComponent, {
        //       data: {
        //         title: this.isCalvingEdit
        //           ? 'animalDetails.transaction_approval'
        //           : res?.msg?.msgDesc,
        //         transaction_id: res?.data?.calvingId,
        //         temporary_id: res?.data,
        //         calvingDate: calvingAfterNintyDays,
        //         isCalving: true,
        //         calvingStatus: formValue?.calvingStatus,
        //         isCalvingEdit: this.isCalvingEdit ? this.isCalvingEdit : false,
        //         calfDetails: calfDetails,
        //       },
        //       width: '500px',
        //     })
        //     .afterClosed();
        // }
        )
      )
      .subscribe(
        (res) => {
          this.isLoadingSpinner = false;
          this.ismovetoCalfDetail = false;
          this.activeTab = 'INTIMATION-reports';
          // this.addCalvingForm.reset({
          //   calvingRecordDate: this.addCalvingForm.get('calvingRecordDate').value,
          //   calvingDate: this.addCalvingForm.get('calvingDate').value,
          //   serviceType:this.addCalvingForm.get('serviceType').value
          // })
          // this.shareDataService.setData(this.historyDetail)
          this.goBack();
          if (this.isAILinked) {
            this.router.navigate(
              ['./dashboard/animal-breeding/artificial-insemination'],
              { queryParams: { ownerId: this.ownerDetail.ownerId } }
            );
          }
        },
        (error) => {
          this.isLoadingSpinner = false;
          this.formControls.calvingRecordDate.disable();
        }
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
  selectAllForDropdownItems(items: any[]) {
    let allSelect = (items) => {
      items.forEach((element) => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };

    allSelect(items);
  }
  toggleMetabolic(value: boolean) {
    if (value == true) this.showMetabolicType = true;
    else this.showMetabolicType = false;
  }

  gotoNextTab(): void {
    this.ismovetoCalfDetail = true;
    const checkTabValidation = this.findInvalidControls();
    this.calfValidation = checkTabValidation?.length == 0 ? true : false;
    // this.selectedTabIndex = checkTabValidation.length == 0 ? 1 : 0
    if (this.calfValidation && this.calfDetailsList?.length > 0) {
      this.showCalfDetail[0] = true;
      this.activeTab = 'fir-rep';
    }
    const isCalfStillBirth = this.addCalvingForm.get('calvingStatus').value;
    if (isCalfStillBirth == 3) {
      const length = this.calfDetailsList.length;
      const calfNumber = Array.apply(null, { length: length }).map(
        Number.call,
        Number
      );
      calfNumber.forEach((count, index) => {
        const removeValidatorsList = [
          'reasonForNotRegistering',
          'calfName',
          'calfImage',
          'calfTmporaryTagId',
        ];
        this.removeValidators(index, removeValidatorsList, true);
      });
    }
  }
  getOwnerId(param) {
    this.ownerDetail = param?.animalResponse;
    if (!this.isCalvingEdit) this.getServiceType();
    else {
      this.serviceType = this.commonDetail?.serviceType;
      this.editCalvingDetails();
    }
  }
  goBack() {
    this.router.navigate(['..'], {
      relativeTo: this.route,
      queryParams: { ownerId: this.ownerDetail.ownerId },
    });
  }
  private clavingInitForm(): void {
    this.addCalvingForm = this._fb.group({
      calvingRecordDate: [
        { value: this.today, disabled: true },
        [Validators.required],
      ],
      calvingDate: [
        this.today,
        { updateOn: 'blur', validators: [Validators.required] },
      ],
      calvingEase: [null],
      calvingStatus: [null, [Validators.required]],
      serviceType: [null, [Validators.required]],
      noOfCalves: [null],
      sireTagId: [
        '',
        [
          Validators.minLength(12),
          Validators.maxLength(12),
          onlyNumberValidation,
        ],
      ],
      recieptNo: ['', onlyNumberValidation],
      treatedForMilkFever: ['NA'],
      treatedForKetosis: ['NA'],
      treatedForDownerSyndrome: ['NA'],
      retentionOfPlacenta: ['NA'],
      prolapse: ['NA'],
      colostrumFeeding: ['NA'],
      cuttingOfNavalCord: ['NA'],
      colostrumFeedingWithinTwoHrs: ['NA'],
      metabolicDisease: ['NA'],
      metabolicType: ['NA'],
      calfDetailsList: new FormArray([]),
      inMilk: ['Y', [Validators.required]],
      bullId: [
        '',
        //  [Validators.maxLength(12), Validators.minLength(12)]
      ],
    });
    this.addCalvingForm.get('serviceType').valueChanges.subscribe((value) => {
      if (value == 2 || value == 4) {
        this.isSireIdRequired = value == 2 ? true : false;
        this.showSireTagField = true;
        if (value == 2) {
          this.addCalvingForm
            .get('sireTagId')
            .setValidators([
              Validators.required,
              onlyNumberValidation,
              Validators.maxLength(12),
              Validators.minLength(12),
            ]);
          this.addCalvingForm.get('sireTagId')?.updateValueAndValidity();
        } else {
          this.addCalvingForm.get('sireTagId').clearValidators();
          // this.addCalvingForm.get('sireTagId').reset();
          this.addCalvingForm.get('sireTagId')?.updateValueAndValidity();
        }
      } else {
        this.isSireIdRequired = false;
        this.showSireTagField = false;
        this.addCalvingForm.get('sireTagId').clearValidators();
        // this.addCalvingForm.get('sireTagId').reset();
        this.addCalvingForm.get('sireTagId')?.updateValueAndValidity();
      }
    });
    this.addCalvingForm.get('calvingStatus').valueChanges.subscribe((value) => {
      if (value == 1 || value == 3) {
        this.showcalvesInfo = true;
        this.isAbortion = false;
        this.showAdditionalInfo = true;
        this.isStillBirth = value == 3 ? true : false;
        this.isEarTagSelected = false;
        this.addCalvingForm
          .get('calvingEase')
          .setValidators(Validators.required);
        this.addCalvingForm
          .get('noOfCalves')
          .setValidators(Validators.required);
        this.addCalvingForm.get('calvingEase').updateValueAndValidity();
        this.addCalvingForm.get('noOfCalves').updateValueAndValidity();
      } else {
        this.showcalvesInfo = false;
        this.isAbortion = value == 2 ? true : false;
        this.showAdditionalInfo = false;
        this.isStillBirth = false;
        this.isEarTagSelected = false;
        this.clearFormField();
      }
    });

    this.addCalvingForm
      .get('calvingDate')
      .valueChanges.pipe(
        filter(() => !!this.ownerDetail?.taggingDate),
        distinctUntilChanged()
      )
      .subscribe((res) => {
        console.log(res);
        const selectedDate = moment(res);

        const taggingDate = moment(this.ownerDetail?.taggingDate);
       

        if (selectedDate.isBefore(taggingDate)) {
          this.dialog
            .open(ConfirmationDialogComponent, {
              data: {
                title: this.translatePipe.transform('common.info_label'),
                message: this.translatePipe.transform(
                  'performanceRecording.please_select_date_after_animal_tagging_date'
                ),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
                icon: 'assets/images/alert.svg',
              },
              panelClass: 'common-info-dialog',
            })
            .afterClosed()
            .subscribe(() => this.addCalvingForm.get('calvingDate').reset());
        }
      });
    this.addCalvingForm.get('noOfCalves').valueChanges.subscribe((value) => {
      if (value && value > 0) {
        this.createCalvesDetailsList(value);
      }
    });
    if (!this.isCalvingEdit) {
      const calvingData = moment(this.today).format('YYYY-MM-DD');
      this.dataService.setGestationDaysInformation(calvingData);
    }
  }

  updateValidation(param: boolean, index: number) {
    const addValidatorsList = ['calfTmporaryTagId','calfImage'];
    const removeValidatorsList = ['reasonForNotRegistering'];
    this.calfDetailsList
      .at(index)
      .get('calvingGeneticDefectsList')
      .patchValue([this.commonDetail?.geneticDefects[0]?.cd]);
    if (param) {
      this.addValidators(index, addValidatorsList, true);
      this.removeValidators(index, removeValidatorsList, true);
    } else {
      this.addValidators(index, removeValidatorsList, true);
      this.removeValidators(index, addValidatorsList, true);
    }
    this.calfDetailsList.at(index).updateValueAndValidity();
    if (this.isCalvingEdit) this.patchCalvesDetails(false);
  }
  verifySireId(index: number, event: Event): void {
    const length = this.calfDetailsList.length;
    const sireId = this.calfDetailsList
      .at(index)
      .get('calfTmporaryTagId').value;
    const indexMatch =
      length && length > 1
        ? index > 0
          ? this.calfDetailsList.at(index - 1).get('calfTmporaryTagId').value
          : this.calfDetailsList.at(index + 1).get('calfTmporaryTagId').value
        : null;
    if (indexMatch != sireId) {
      this.isCalfTagIDUnique = false;
      this.isLoadingSpinner = true;
      this.calvingService.validateEarTagId(sireId).subscribe(
        (value) => {
          this.isLoadingSpinner = false;
          this.verifyEarTagID['key'] = false;
          this.verifyEarTagID['value'] = '';
        },
        (error) => {
          this.isLoadingSpinner = false;
          this.verifyEarTagID['key'] = true;
          this.verifyEarTagID['value'] = error?.error?.message;
        }
      );
    } else this.isCalfTagIDUnique = true;
  }
  verifyCalfName(index: number): void {
    const length = this.calfDetailsList.length;
    const firstCalfName = this.calfDetailsList.at(index).get('calfName').value;
    const indexMatch =
      length && length > 1
        ? index > 0
          ? this.calfDetailsList.at(index - 1).get('calfName').value
          : this.calfDetailsList.at(index + 1).get('calfName').value
        : null;
    if (indexMatch != firstCalfName) {
      this.isCalfNameIDUnique = false;
    } else this.isCalfNameIDUnique = true;
  }

  getAnimalWeight(index): void {
    const calfLength = parseFloat(
      this.calfDetailsList.at(index).get('calfLength').value
    );
    const calfGirth = parseFloat(
      this.calfDetailsList.at(index).get('calfGirth').value
    );
    if (calfGirth && calfLength) {
      if (calfGirth > calfLength) {
        this.weightError[index] = false;
        const calfWeight = (Math.pow(calfGirth, 2) * calfLength) / 660;
        this.calfDetailsList.at(index).patchValue({
          calfWeight: calfWeight.toFixed(2),
        });
      } else {
        this.weightError[index] = true;
      }
    }
  }

  getBreedingHistoryDetail($event): void {
    
    this.lastBreedingHistory = $event;
    const animalHistory =
      this.lastBreedingHistory?.latestBreeding?.length > 0
        ? this.lastBreedingHistory?.latestBreeding[0]
        : [];
    this.addCalvingForm
      .get('bullId')
      .setValue(animalHistory?.bullId ? animalHistory?.bullId : '');
    this.addCalvingForm
      .get('sireTagId')
      .setValue(animalHistory?.sireTagId ? animalHistory?.sireTagId : '');
    if (!this.isCalvingEdit) {
      Object.keys(this.gestationLimit).forEach((key) => {
        if (key == this.lastBreedingHistory?.species) {
          const gestationDays = this.lastBreedingHistory?.gestationDays
            ? this.lastBreedingHistory?.gestationDays
            : null;
          // this.lastBreedingHistory?.latestBreeding[0]?.gestationDays;
          if (gestationDays) {
            if (this.gestationLimit[key].GL > gestationDays) {
              this.commonDetail.calvingStatus =
                this.commonDetail?.calvingStatus.filter(
                  (obj) => obj?.cd !== 3 && obj?.cd !== 1
                );
            } else if (this.gestationLimit[key].GH <= gestationDays)
              this.commonDetail.calvingStatus =
                this.commonDetail?.calvingStatus.filter((obj) => obj?.cd !== 2);
            else if (
              this.gestationLimit[key].GL >
              gestationDays <
              this.gestationLimit[key].GH
            ) {
              this.showInMilkStatus = true;
            }
          }
        }
      });
    }
  }

  private createCalfDetailList(count): FormGroup {
    return this._fb.group({
      calfGirth: [null, decimalNumberWeightValidation],
      calfLength: [null, decimalNumberWeightValidation],
      calfWeight: [null, decimalNumberWeightValidation],
      sexOfCalf: [null, [Validators.required]],
      calfTmporaryTagId: [
        '',
        [
          Validators.required,
          Validators.maxLength(12),
          Validators.minLength(12),
          onlyNumberValidation,
        ],
      ],
      tagId: [this.ownerDetail.tagId],
      isEarTag: [null],
      calfName: ['', [NameValidation]],
      calfNo: [count + 1],
      reasonForNotRegistering: [null, [Validators.required]],
      calvingGeneticDefectsList: [1],
      calfImage: ['', [Validators.required]],
    });
  }
  createCalvesDetailsList(calf_number: number): void {
    this.removeCalfDetail();
    let calveNumber = calf_number;
    let index = 0;
    const calfNumber = Array.apply(null, { length: calveNumber }).map(
      Number.call,
      Number
    );
    calfNumber.forEach((count) => {
      this.calfDetailsList = this.addCalvingForm.get(
        'calfDetailsList'
      ) as FormArray;
      this.calfDetailsList.push(this.createCalfDetailList(count));
      index++;
    });
  }
  private findInvalidControls() {
    const invalid = [];
    const controls = this.addCalvingForm.controls;
    const calvingDetailControl = [
      'serviceType',
      'calvingEase',
      'noOfCalves',
      'sireTagId',
    ];
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    const intersection = invalid.filter((element) =>
      calvingDetailControl.includes(element)
    );
    return intersection;
  }
  private clearFormField() {
    const removeValidator = [
      'calvingEase',
      'sireTagId',
      'noOfCalves',
      'calvingGeneticDefectsList',
    ];
    this.removeCalfDetail();
    this.calfValidation = false;
    this.removeValidators(0, removeValidator, false);
  }
  verifyBullID(): void {
    const bullId = this.formControls.bullId.value;
    if (
      bullId
      // && bullId.length == 12
    ) {
      this.isLoadingSpinner = true;
      let reqObj: any = {};
      reqObj.bullId = bullId;
      reqObj.cattleId = this.tagId;
      this.calvingService.validateBullID(reqObj).subscribe(
        (data) => {
          this.isLoadingSpinner = false;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    }
  }

  formatDefectList(defectlist: any, index: number) {
    const isListAvailable = defectlist?.length > 0 ? true : false;
    const geneticList = [];
    if (isListAvailable) {
      for (const defect in defectlist) {
        geneticList.push({ geneticDefectCd: defect, calfNo: index });
      }
    }
    return geneticList;
  }
  onFileUpload(event: Event, index: number) {

    if ((event.target as HTMLInputElement).files.length == 0) {
      return;
    }
    const file = (event.target as HTMLInputElement).files[0];
    let data = getFileSize(file);
    if (!data) {
      this.confirmtionDialoug('animalBreeding.image_size');
      return;
    }
    this.calfDetailsList.at(index).patchValue({
      calfImage: file,
    });
  }
  calfWeightChange(index: number) {
    const weightOFCalf = this.calfDetailsList.at(index).get('calfWeight').value;
    if (weightOFCalf) {
      this.calfDetailsList.at(index).get('calfGirth').reset();
      this.calfDetailsList.at(index).get('calfGirth').disable();
      this.calfDetailsList.at(index).get('calfLength').reset();
      this.calfDetailsList.at(index).get('calfLength').disable();
      this.calfDetailsList.at(index).updateValueAndValidity();
    } else {
      this.getAnimalWeight(index);
      this.calfDetailsList.at(index).get('calfGirth').enable();
      this.calfDetailsList.at(index).get('calfLength').enable();
      this.calfDetailsList.at(index).updateValueAndValidity();
    }
  }
  private removeCalfDetail(): void {
    let indexToRemove = [];
    let fromArray = this.addCalvingForm.get('calfDetailsList') as FormArray;

    fromArray.controls.forEach((control, index) => {
      if (!control.value.street) {
        indexToRemove.push(index);
      }
    });
    indexToRemove.reverse().forEach((index) => {
      fromArray.removeAt(index);
    });
  }
  validateSireId(event: any): void {
    const tagId = event.target['value'];
    this.sireIdValidation = tagId.length !== 12 || isNaN(+tagId);
    if (this.sireIdValidation) return;
    this.isLoadingSpinner = true;
    let reqObj: any = {};
    reqObj.tagId = tagId;
    reqObj.cattleId = this.tagId;
    this.calvingService.validateSireId(reqObj).subscribe(
      (value) => {
        this.isLoadingSpinner = false;
        this.verifySireID['key'] = false;
        this.verifySireID['value'] = '';
      },
      (error) => {
        this.addCalvingForm.get('sireTagId').patchValue(null);
        this.isLoadingSpinner = false;
        this.verifySireID['key'] = true;
        this.verifySireID['value'] = error?.error?.message;
      }
    );
  }

  getGeneticDefectsInformation(event, index: number): void {
    const latestSelectedDefects =
      event && event?.length > 0 ? event.slice(-1).pop() : null;
    if (latestSelectedDefects && latestSelectedDefects.cd != 1) {
      let selectedDefects = this.calfDetailsList
        .at(index)
        .get('calvingGeneticDefectsList').value;
      selectedDefects =
        selectedDefects && selectedDefects.length > 0
          ? selectedDefects.filter((ele) => ele != 1)
          : selectedDefects;
      this.calfDetailsList
        .at(index)
        .get('calvingGeneticDefectsList')
        .setValue(selectedDefects);
    } else {
      this.calfDetailsList
        .at(index)
        .get('calvingGeneticDefectsList')
        .setValue([latestSelectedDefects.cd]);
    }
  }

  checkGestationDays(event: MatDatepickerInputEvent<Date>) {
    const value = event.value;
    if (value && !this.isCalvingEdit) {
      const calvingData = moment(value).format('YYYY-MM-DD');
      this.dataService.setGestationDaysInformation(calvingData);
      this.getServiceType();
    }
  }

  private getServiceType(): void {
    this.isLoadingSpinner = true;
    const transactionDate = this.addCalvingForm.get('calvingDate').value
      ? this.addCalvingForm.get('calvingDate').value
      : this.today;

    const serviceObj = {
      tagId: this.ownerDetail?.tagId,
      currentLactationNo: this.ownerDetail?.currentLactationNo,
      transactionDate: moment(transactionDate).format('YYYY-MM-DD'),
    };
    this.calvingService.getServiceType(serviceObj).subscribe(
      (data: any) => {
        this.isLoadingSpinner = false;
        if (!this.isCalvingEdit) {
          this.serviceType = data;
          const animalHistory = this.lastBreedingHistory?.latestBreeding[0];
          const autoServiceId = animalHistory?.serviceType
            ? this.serviceType.filter(
                (type) => type?.value == animalHistory?.serviceType
              )
            : null;
          if (autoServiceId && autoServiceId?.length > 0)
            this.addCalvingForm
              .get('serviceType')
              .setValue(autoServiceId[0].cd);
          this.addCalvingForm
            .get('bullId')
            .setValue(animalHistory?.bullId ? animalHistory?.bullId : '');
          this.addCalvingForm
            .get('sireTagId')
            .setValue(animalHistory?.sireTagId ? animalHistory?.sireTagId : '');
        } else {
          this.serviceType = this.commonDetail?.serviceType;
          this.editCalvingDetails();
        }
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  private removeValidators(index: number, value: any, isFormArray: boolean) {
    value.forEach((element) => {
      switch (isFormArray) {
        case true:
          this.calfDetailsList.at(index).get(element).clearValidators();
          this.calfDetailsList.at(index).get(element).reset();
          this.calfDetailsList.at(index).get(element).updateValueAndValidity();
          break;
        case false:
          this.addCalvingForm.get(element)?.clearValidators();
          if (element != 'sireTagId') this.addCalvingForm.get(element)?.reset();
          this.addCalvingForm.get(element)?.updateValueAndValidity();
          break;
      }
    });
  }

  private addValidators(index: number, value: any, isFormArray: boolean) {
    value.forEach((element) => {
      switch (isFormArray) {
        case true:
          this.calfDetailsList
            .at(index)
            .get(element)
            .setValidators(this.validationType[element]);
          this.calfDetailsList.at(index).get(element).updateValueAndValidity();
          break;
        case false:
          this.addCalvingForm
            .get(element)
            .setValidators(this.validationType[element]);
          this.addCalvingForm.get(element).updateValueAndValidity();
          break;
      }
    });
  }
  setValidationType() {
    this.validationType = {
      calfTmporaryTagId: [
        Validators.required,
        Validators.maxLength(12),
        Validators.minLength(12),
        onlyNumberValidation,
      ],
      reasonForNotRegistering: [Validators.required],
      calfImage: [Validators.required],
    };
  }
  geneticDefectList(isListAvailable?: any) {
    if (isListAvailable && isListAvailable?.length > 0) {
      isListAvailable.forEach((element) => {
        this.geneticList.push(element);
      });
    }
    return this.geneticList;
  }
  getProjectID(): void {
    const currentSection = getSessionData('subModuleCd');
    let getPermission = [];
    this.projectSub = this.dataService.fetchProjectInfo
      .pipe(
        filter((projectID) => projectID != null && projectID != '0'),
        switchMap((projectID) => {
          this.isLoadingSpinner = true;
          return this.dataService._getProjectDetail(projectID);
        })
      )
      .subscribe({
        next: (data: any) => {
          this.isLoadingSpinner = false;
          getPermission = data?.activityCd?.filter(
            (obj) => obj.activityCd == currentSection?.subModuleCd
          );
          const activityPermissionList =
            getPermission && getPermission?.length > 0
              ? getPermission[0].activityParameterList
              : [];
          this.getAdditionalDetailsPermission =
            activityPermissionList && activityPermissionList.length > 0
              ? activityPermissionList.filter((obj) => obj.parameterCd == 4)
              : [];
        },
        complete: () => (this.isLoadingSpinner = false),
      });
  }
  private editCalvingDetails() {
    this.isLoadingSpinner = true;
    // const tag = 100000004756
    this.calvingService.getCalvingDetailsByID(this.tagId).subscribe(
      (data: any) => {
        this.calvingDetails = data;
        this.addCalvingForm.patchValue(this.calvingDetails);
        const name_list = ['calvingStatus', 'noOfCalves'];
        this.dataService._enableDisableFormKeys(
          this.formControls,
          name_list,
          'disable'
        );
        //  this.getServiceType()
        if (this.calvingDetails?.calvesList?.length > 0) {
          this.patchCalvesDetails(true);
        }
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  private patchCalvesDetails(isEdit?: boolean) {
    this.calvingDetails?.calvesList?.forEach((element, index) => {
      this.calfDetailsList
        .at(index)
        .get(`calfGirth`)
        .setValue(element?.calfGirth);
      this.calfDetailsList
        .at(index)
        .get(`calfLength`)
        .setValue(element?.calfLength);
      this.calfDetailsList
        .at(index)
        .get(`calfWeight`)
        .setValue(element?.calfWeight);
      this.calfDetailsList
        .at(index)
        .get(`calfTmporaryTagId`)
        .setValue(element?.tagId);
      this.calfDetailsList
        .at(index)
        .get(`sexOfCalf`)
        .setValue(element?.calfSex);
      this.calfDetailsList
        .at(index)
        .get(`calfName`)
        .setValue(element?.animalName);
      this.calfDetailsList
        .at(index)
        .get('reasonForNotRegistering')
        .setValue(
          element?.reasonForNotRegistering
            ? element?.reasonForNotRegistering
            : null
        );
      this.calfDetailsList
        .at(index)
        .get('calfImage')
        .setValue(element?.animalPicUrl);
      if (isEdit)
        this.calfDetailsList
          .at(index)
          .get('isEarTag')
          .setValue(element?.reasonForNotRegistering ? 'N' : 'Y');
      this.calfDetailsList.at(index).get('isEarTag').disable();
      this.calfDetailsList.at(index).get('reasonForNotRegistering').disable();
      this.calfDetailsList.at(index).get('calfTmporaryTagId').disable();
      if (this.calfDetailsList.at(index).get('isEarTag').value == 'Y') {
        this.showCalfAdditionalDetail[index] = true;
      }
      this.calfDetailsList.at(index).updateValueAndValidity();
    });
  }
  convertInputToUpperCase(event: Event) {
    const element = event.target as HTMLInputElement;
    const position = element?.selectionStart;
    element.value = element?.value?.toString()?.toLocaleUpperCase();
    element?.setSelectionRange(position, position);
  }
  private confirmtionDialoug(message: string): void {
    this.dialog
      .open(ConfirmationDeleteDialogComponent, {
        data: {
          id: '',
          title: 'common.alert',
          message: message,
          icon: 'assets/images/alert.svg',
          primaryBtnText: 'common.ok',
        },
        panelClass: 'common-alert-dialog',
      })
      .afterClosed();
  }
  private checkImageSize() {
    let calfImageSize: number = 0;
    this.formControls.calfDetailsList?.value?.forEach((value) => {
      calfImageSize += value?.calfImage && value?.calfImage?.size
                        ? value?.calfImage?.size : 0
    });
    let fileSize = Math.round(calfImageSize / 1024);
    if (fileSize <= 10 * 1024) {
      return false;
    }
    return true;
  }

  ngOnDestroy(): void {
    this.projectSub?.unsubscribe()
  }
}
