import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { forkJoin, of } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { SuccessDialogComponent } from 'src/app/features/animal-breeding/success-dialog/success-dialog.component';
import { LabMaster } from 'src/app/features/animal-health/animal-treatment/models/master.model';
import { HealthService } from 'src/app/features/animal-health/health.service';
import { AnimalDetailService } from 'src/app/features/animal-management/animal-registration/animal-details/animal-detail.service';
import { AnimalDetails } from 'src/app/features/animal-management/animal-registration/models-animal-reg/animal-details.model';
import { animalBreedingPRConfig } from 'src/app/shared/animal-breeding-pr.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { getDecryptedData } from 'src/app/shared/shareService/storageData';
import {
  AlphaNumericSpecialValidation,
  decimalNumberValidation,
} from 'src/app/shared/utility/validation';
import { animalBreedingValidations } from 'src/app/shared/validatator';
import { decimalWithLengthValidation } from '../../../../shared/utility/decimalWithLengthValidator';
import { PrService } from '../../pr.service';
import { MilkSamplingService } from '../milk-sampling.service';
import { SaveSampleReq } from '../models/save-sample-req.model';
import { CommonMaster } from 'src/app/features/animal-health/animal-treatment/models/common-master.model';
import { GenerateSampleIdsService } from '../../generate-sample-ids/generate-sample-ids.service';

@Component({
  selector: 'app-add-milk-sample',
  templateUrl: './add-milk-sample.component.html',
  styleUrls: ['./add-milk-sample.component.css'],
  providers: [TranslatePipe],
})
export class AddMilkSampleComponent implements OnInit {
  isLoadingSpinner = false;
  cmnValidation = animalBreedingValidations.common;
  validationMsg = animalBreedingValidations.milkSampling;
  addSampleForm: FormGroup;
  animal!: AnimalDetails;
  labMaster: LabMaster[] = [];
  sampleData: SampleData | SampleData['milkRecordingForRecordNo'][0];
  minDate: string;
  showAllLabs = true;
  recordingPeriod: CommonMaster[] = [];
  projectId: any;

  configKeys = {
    1: [
      'cattleFatPercent',
      'cattleProteinPercent',
      'cattleLactosePercent',
      'cattleSNFPercent',
      'cattleSCC',
      'cattleMUN',
    ],
    2: [
      'buffaloFatPercent',
      'buffaloProteinPercent',
      'buffaloLactosePercent',
      'buffaloSNFPercent',
      'buffaloSCC',
      'buffaloMUN',
    ],
  };

  configKeyFormMapping = {
    1: {
      cattleFatPercent: 'fatPercentage',
      cattleMUN: 'milkUreaNitrogen',
      cattleSCC: 'somaticCellCount',
      cattleLactosePercent: 'lactosePercentage',
      cattleSNFPercent: 'snfPercentage',
      cattleProteinPercent: 'proteinPercentage',
    },
    2: {
      buffaloFatPercent: 'fatPercentage',
      buffaloMUN: 'milkUreaNitrogen',
      buffaloSCC: 'somaticCellCount',
      buffaloLactosePercent: 'lactosePercentage',
      buffaloSNFPercent: 'snfPercentage',
      buffaloProteinPercent: 'proteinPercentage',
    },
  };

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private dialog: MatDialog,
    private milkSamplingService: MilkSamplingService,
    private animalMgmtService: AnimalDetailService,
    private healthService: HealthService,
    private dataService: DataServiceService,
    private prService: PrService,
    private router: Router,
    private route: ActivatedRoute,
    private translatePipe: TranslatePipe,
    private generateSampleIdsService: GenerateSampleIdsService
  ) {}

  ngOnInit(): void {
    this.getData();
    this.initForm();
  }

  getData() {
    this.isLoadingSpinner = true;
    this.dataService
      .getProjectInfo()
      .subscribe((projectId) => (this.projectId = projectId));
    this.sampleData = getDecryptedData('selectedMrSample').id;
    if (!Object.keys(this.sampleData).length) {
      this.router.navigateByUrl(
        '/dashboard/performance-recording/milk-sampling/sample-list'
      );
      return;
    }

    const req1 = this.animalMgmtService.getAnimalDetails(
      this.sampleData.animalId.toString()
    );

    const req2 = this.dataService.getDefaultConfig(
      animalBreedingPRConfig.backdate.MilkSamplingBackdate
    );

    const req3 = this.getLabs().pipe(catchError((err) => of([])));

    const req4 = this.prService.getCommonMaster('recording_period');

    forkJoin([req1, req2, req3, req4])
      .pipe(
        switchMap(([animal, dateConfig, labData, recordingPeriod]) => {
          this.recordingPeriod = recordingPeriod;
          this.labMaster = labData;
          // labData[1]?.length > 0
          //   ? labData[1].filter(
          //       (org) =>
          //         org?.orgId == labData[0].orgId && org?.subOrgType == 5
          //     )
          //   : [];
          this.animal = animal;
          this.minDate = moment(this.prService.currentDate)
            .subtract(dateConfig.defaultValue, 'd')
            .format('YYYY-MM-DD');
          if (this.animal.speciesCd === 1 || this.animal.speciesCd === 2) {
            return this.prService
              .getConfigDetails(this.configKeys[this.animal.speciesCd])
              .pipe(
                map((res) => res.map((config) => Object.values(config)[0]))
              );
          }

          return of(null);
        })
      )
      .subscribe(
        (res) => {
          if (res instanceof Array) {
            const group = this.addSampleForm.get('onSpotTesting') as FormGroup;
            for (const config of res) {
              const control = group.get(
                this.configKeyFormMapping[this.animal.speciesCd][config.key]
              );

              control.addValidators([
                Validators.min(config.rangeLowerValue),
                Validators.max(config.rangeUpperValue),
              ]);
              control.updateValueAndValidity();
            }
          }

          this.isLoadingSpinner = false;
        },
        () => (this.isLoadingSpinner = false)
      );
  }

  initForm() {
    this.addSampleForm = this.fb.group({
      sampleCollectionDate: [
        { value: moment(this.sampleData.mrDate), disabled: true },
        { validators: [Validators.required], updateOn: 'blur' },
      ],
      recordingPeriod: [null, [Validators.required]],
      sampleType: [{ value: 'Milk', disabled: true }],
      examinationType: [{ value: 'Milk Analysis', disabled: true }],
      examinationSubType: [
        { value: 'Milk Component Analysis', disabled: true },
      ],
      sampleTesting: this.fb.group({
        sampleId: [null, [Validators.required, AlphaNumericSpecialValidation]],
        labCd: [null, [Validators.required]],
        testCharges: [
          null,
          [decimalWithLengthValidation(6, 2), Validators.min(0)],
        ],
        receiptNo: [null, [AlphaNumericSpecialValidation]],
      }),
      onSpotTesting: this.fb.group({
        fatPercentage: [
          null,
          [
            Validators.required,
            decimalNumberValidation,
            Validators.min(0),
            Validators.max(100),
          ],
        ],
        proteinPercentage: [
          null,
          [
            // Validators.required,
            decimalNumberValidation,
            Validators.min(0),
            Validators.max(100),
          ],
        ],
        snfPercentage: [
          null,
          [
            // Validators.required,
            decimalNumberValidation,
            Validators.min(0),
            Validators.max(100),
          ],
        ],
        lactosePercentage: [
          null,
          [
            // Validators.required,
            decimalNumberValidation,
            Validators.min(0),
            Validators.max(100),
          ],
        ],
        somaticCellCount: [null],
        milkUreaNitrogen: [
          null,
          [
            // Validators.required,
            decimalWithLengthValidation(7, 2),
          ],
        ],
      }),
      sampleTestingInLab: ['no'],
      onSpot: ['no'],
    });
    this.addSampleForm.get('onSpotTesting').disable();
    this.addSampleForm.get('sampleTesting').disable();

    this.addSampleForm
      .get('sampleTestingInLab')
      .valueChanges.subscribe((value) => {
        if (value === 'yes') {
          if (this.addSampleForm.get('onSpot').value === 'yes') {
            this.dialog
              .open(ConfirmationDialogComponent, {
                data: {
                  primaryBtnText: this.translatePipe.transform('common.yes'),
                  secondaryBtnText: this.translatePipe.transform('common.no'),
                  title: this.translatePipe.transform('common.info_label'),
                  message: this.translatePipe.transform(
                    'performanceRecording.adding_sample_data_will_remove_on_spot_data_do_you_want_to_continue'
                  ),
                  icon: 'assets/images/alert.svg',
                },
                panelClass: 'common-info-dialog',
              })
              .afterClosed()
              .subscribe((res) => {
                if (res) {
                  this.addSampleForm.get('onSpot').patchValue('no');
                } else {
                  this.addSampleForm.get('sampleTestingInLab').patchValue('no');
                }
              });
          }
          this.addSampleForm.get('sampleTesting').enable();
        } else {
          this.addSampleForm.get('sampleTesting').disable();
          this.addSampleForm.get('onSpotTesting').enable();
          this.addSampleForm.get('sampleTesting').reset();
        }
      });

    this.addSampleForm.get('onSpot').valueChanges.subscribe((value) => {
      if (value === 'yes') {
        if (this.addSampleForm.get('sampleTestingInLab').value === 'yes') {
          this.dialog
            .open(ConfirmationDialogComponent, {
              data: {
                primaryBtnText: this.translatePipe.transform('common.yes'),
                secondaryBtnText: this.translatePipe.transform('common.no'),
                title: this.translatePipe.transform('common.info_label'),
                message: this.translatePipe.transform(
                  'performanceRecording.adding_on_spot_data_will_remove_sample_data_do_you_want_to_continue'
                ),
                icon: 'assets/images/alert.svg',
              },
              panelClass: 'common-info-dialog',
            })
            .afterClosed()
            .subscribe((res) => {
              if (res) {
                this.addSampleForm.get('sampleTestingInLab').patchValue('no');
              } else {
                this.addSampleForm.get('onSpot').patchValue('no');
              }
            });
        }
        this.addSampleForm.get('onSpotTesting').enable();
      } else {
        this.addSampleForm.get('onSpotTesting').disable();
        this.addSampleForm.get('sampleTesting').enable();
        this.addSampleForm.get('onSpotTesting').reset();
      }
    });

    this.addSampleForm
      .get('sampleCollectionDate')
      .valueChanges.pipe(
        filter(() => !!this.animal?.taggingDate),
        distinctUntilChanged()
      )
      .subscribe((res) => {
        const selectedDate = moment(res);

        const taggingDate = moment(this.animal?.taggingDate);

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
            .subscribe(() =>
              this.addSampleForm.get('sampleCollectionDate').reset()
            );
        }
      });
  }

  onSubmit() {
    if (this.addSampleForm.invalid) {
      this.addSampleForm.markAllAsTouched();
      return;
    }

    const formValue = this.addSampleForm.getRawValue();

    if (this.addSampleForm.get('sampleTestingInLab').value === 'yes') {
      const reqObj: SaveSampleReq = {
        // breedingSampleType: 5,
        // breedingExaminationType: 1,
        // breedingExaminationSubtype: null,
        ...formValue.sampleTesting,
        recordingPeriod: formValue.recordingPeriod,
        testingLocation: 2,
        animalId: this.animal.animalId,
        tagId: this.animal.tagId,
        mrDate: moment(this.sampleData.mrDate).format('YYYY-MM-DD'),
        sampleCollectionDate: moment(this.sampleData.mrDate).format(
          'YYYY-MM-DD'
        ),
      };
      this.isLoadingSpinner = true;
      this.milkSamplingService.saveSampleTesting(reqObj).subscribe(
        (res) => {
          this.isLoadingSpinner = false;
          this.openSuccessDialog(res);
        },
        () => (this.isLoadingSpinner = false)
      );
    } else if (this.addSampleForm.get('onSpot').value === 'yes') {
      this.isLoadingSpinner = true;

      const reqObj: SaveSampleReq = {
        ...formValue.onSpotTesting,
        // snfPercentage: +formValue.snfPercentage,
        // milkUreaNitrogen: +formValue.milkUreaNitrogen,
        recordingPeriod: formValue.recordingPeriod,
        testingLocation: 1,
        animalId: this.animal.animalId,
        tagId: this.animal.tagId,
        sampleId: '124446',
        mrDate: moment(this.sampleData.mrDate).format('YYYY-MM-DD'),
        sampleCollectionDate: moment(this.sampleData.mrDate).format(
          'YYYY-MM-DD'
        ),
      };

      this.milkSamplingService.saveOnSpotTesting(reqObj).subscribe(
        (res) => {
          this.isLoadingSpinner = false;
          this.openSuccessDialog(res, true);
        },
        () => (this.isLoadingSpinner = false)
      );
    } else {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          primaryBtnText: this.translatePipe.transform('common.yes'),
          title: this.translatePipe.transform('common.info_label'),
          message: this.translatePipe.transform(
            'performanceRecording.please_enter_sample_data_or_on_spot_data'
          ),
          icon: 'assets/images/alert.svg',
        },
        panelClass: 'common-info-dialog',
      });
    }
  }

  openSuccessDialog(res: any, isOnSpot = false) {
    this.dialog
      .open(SuccessDialogComponent, {
        data: {
          transaction_id: res.data.transactionId,
          title: this.translatePipe.transform(
            'performanceRecording.milk_sampling_saved_successfully'
          ),
          onSpotId: isOnSpot && res.data.sampleId,
        },
      })
      .afterClosed()
      .subscribe(() => {
        this.goBack();
      });
  }

  onLabChange(labCd: number) {
    if (labCd === 0) {
      this.addSampleForm.get('sampleTesting.labCd')?.reset();
      this.showAllLabs = true;
      this.isLoadingSpinner = true;
      this.getLabs(false).subscribe(
        (labs) => {
          this.labMaster = labs;
          this.isLoadingSpinner = false;
        },
        () => (this.isLoadingSpinner = false)
      );
    }
  }

  onReset() {
    this.addSampleForm.reset({
      sampleTestingInLab: 'no',
      onSpot: 'no',
      sampleType: 'Milk',
      examinationType: 'Milk Analysis',
      examinationSubType: 'Milk Component Analysis',
      sampleCollectionDate: moment(this.sampleData.mrDate),
    });
    this.addSampleForm.get('onSpotTesting').disable();
    this.addSampleForm.get('sampleTesting').disable();
  }

  goBack() {
    if (this.checkSampleDataType(this.sampleData)) {
      this.location.back();
    } else {
      this.router.navigate(
        ['/dashboard/performance-recording/milk-recording/add-mr'],
        {
          relativeTo: this.route,
          queryParams: {
            ownerDetail: this.sampleData?.tagId,
          },
        }
      );
    }
  }

  get today() {
    return moment(this.prService.currentDate).format('YYYY-MM-DD');
  }

  getAnimalAge(age: number) {
    return this.healthService.getWords(age);
  }

  private getLabs(flag: boolean = true) {
    return this.prService.getSubOrgList(5, !flag);
  }

  get recordingPeriods() {
    const sampleData = this.sampleData;
    let periods: CommonMaster[] = [];
    if (this.checkSampleDataType(sampleData)) {
      periods = this.recordingPeriod.filter(
        (period) =>
          sampleData?.milkRecordingForRecordNo?.findIndex(
            (record) => record.recordingPeriod === period.cd
          ) !== -1
      );
    } else {
      periods = this.recordingPeriod.filter(
        (period) => period.cd === sampleData.recordingPeriod
      );
    }
    if (periods.length === 1) {
      this.addSampleForm.get('recordingPeriod').setValue(periods[0].cd);
    }
    return periods;
  }

  checkSampleDataType(
    obj: SampleData | SampleData['milkRecordingForRecordNo'][0]
  ): obj is SampleData {
    return 'milkRecordingForRecordNo' in obj;
  }

  generateSampleId() {
    this.isLoadingSpinner = true;

    const req = {
      projectId: this.projectId,
      noOfIds: 1,
    };

    this.generateSampleIdsService.generateSampleId(req).subscribe({
      next: (res) => {
        if (Array.isArray(res) && res.length === 1) {
          this.addSampleForm
            .get('sampleTesting.sampleId')
            .setValue(res[0]?.sampleId);
        }
      },
      complete: () => {
        this.isLoadingSpinner = false;
      },
    });
  }
}

export interface SampleData {
  sampleId: string[];
  recordNo: number;
  mrDate: string;
  morningYield: number;
  afternoonYield: number;
  eveningYield: string;
  totalYield: number;
  daysInMilk: string;
  ownerName: string;
  villageName: string;
  milkRecordingForRecordNo?: MilkRecordingForRecordNo[];
  animalId: number;
}

export interface MilkRecordingForRecordNo {
  mrId: number;
  mrScheduleId: null;
  animalId: number;
  tagId: number;
  projectId: null;
  lactationNo: number;
  recordNo: number;
  mrRecordDate: string;
  mrDate: string;
  recordingPeriod: number;
  swsPortNumber: string;
  milkVolume: number;
  mastitisTreated: string;
  teatsFunctionalNo: null;
  calfSuckling: string;
  bodyConditionScore: null;
  sopFlag: string;
  modifiedDate: string;
  modifiedBy: string;
  creationDate: string;
  createdBy: string;
  roleCd: number;
  isMigrated: null;
}
