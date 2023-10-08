import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { Disease } from '../../animal-treatment/models/disease.model';
import { SampleType } from '../../animal-treatment/models/master.model';
import { AnimalTreatmentService } from '../../animal-treatment/animal-treatment.service';
import { HealthService } from '../../health.service';
import { forkJoin } from 'rxjs';
import { getDecryptedData } from 'src/app/shared/shareService/storageData';
import { DiseaseTestingService } from '../../disease-testing/disease-testing.service';
import { switchMap } from 'rxjs/operators';
import { SampleLocation } from '../../animal-treatment/models/enums/sample.enum';
import { MatDialog } from '@angular/material/dialog';
import { GroupDialogComponent } from '../group-dialog/group-dialog.component';
import { AlphaNumericSpecialValidation } from 'src/app/shared/utility/validation';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { TreatmentResponseDialogComponent } from '../../treatment-response-dialog/treatment-response-dialog.component';
import { PoolDialogComponent } from '../pool-dialog/pool-dialog.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-new-pool-test',
  templateUrl: './new-pool-test.component.html',
  styleUrls: ['./new-pool-test.component.css'],
  providers: [TranslatePipe],
})
export class NewPoolTestComponent implements OnInit {
  validationMsg = animalHealthValidations.groupDiseaseTesting;
  @Input() firFlag;
  isLoadingSpinner: boolean = false;
  animalTagList: any[] = [];
  poolDiseaseTestingForm!: FormGroup;
  onSpotDiseaseSuspected: Disease[] = [];
  sampleTypeMaster: SampleType[] = [];
  sampleData?: any;
  @ViewChild('onSpotChild') onSpotChild;
  @ViewChild('onLabChild') onLabChild;
  sharedData: any;
  poolCount: any;
  village: any;
  constructor(
    private location: Location,
    private _fb: FormBuilder,
    private treatmentService: AnimalTreatmentService,
    private healthService: HealthService,
    private _diseaseTestingService: DiseaseTestingService,
    private readonly translateService: TranslateService,
    private translatePipe: TranslatePipe,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.sharedData = getDecryptedData('AESSHA256pdAnimal').id;
    this.animalTagList = this.sharedData.tagIdList;
    this.poolCount = this.sharedData.poolCount;
    this.village = this.sharedData.village;
    const type = getDecryptedData('AESSHA256pdAnimal').type;
    this.createGroupDiseaseTesting();
    this.getMasterData();
  }

  getMasterData() {
    this.isLoadingSpinner = true;
    const sampleTypeRequest = this.treatmentService.getSampleTypeMaster([
      'A',
      'B',
      'D',
      'O',
    ]);
    const getOnSpotDiseaseSuspectedRequest =
      this.treatmentService.getDiseasesMaster();
    forkJoin([sampleTypeRequest, getOnSpotDiseaseSuspectedRequest]).subscribe(
      ([res1, res5, planIDResponse]: any) => {
        this.sampleTypeMaster = res1;
        this.onSpotDiseaseSuspected = res5;
        this.isLoadingSpinner = false;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  createGroupDiseaseTesting() {
    this.poolDiseaseTestingForm = this._fb.group({
      tagId: [null],
      animalId: [null],
      diseaseTestingType: ['2'],
      suspectedDisease: [null, [Validators.required]],
      ownerId: [''],
      remarks: ['', [Validators.maxLength(250), AlphaNumericSpecialValidation]],
      testingDate: [new Date(sessionStorage.getItem('serverCurrentDateTime')), [Validators.required]],
      testingRecordDate: [
        { value: moment(this.today).format('DD/MM/YYYY'), disabled: true },
      ],
      ticketNo: [''],
      animalImageUrl: [''],
      symptom_image: [''],
      onSpotTestingFlg: [{ value: 'N', disabled: this.firFlag ? true : false }],
      labTestingFlg: ['N'],
      spotTestingRows: this._fb.array([]),
      labTestingRows: this._fb.array([]),
      modifiedBy: [AnimalHealthConfig.userId],
      createdBy: [AnimalHealthConfig.userId],
      creationDate: [new Date(sessionStorage.getItem('serverCurrentDateTime'))],
    });
  }

  goBack() {
    this.location.back();
  }

  cancelPage() {
    this.dialog
      .open(TreatmentResponseDialogComponent, {
        data: {
          title: this.translatePipe.transform('diseaseTesting.warning'),
          icon: 'assets/images/info.svg',
          message: this.translatePipe.transform(
            'errorMsg.do_you_want_to_go_to_previous_page'
          ),
          primaryBtnText: this.translatePipe.transform('common.yes'),
          secondaryBtnText: this.translatePipe.transform('common.no'),
        },
        panelClass: 'common-info-dialog',
      })
      .afterClosed()
      .subscribe((res: boolean) => {
        if (res) {
          this.goBack();
        }
      });
  }

  onReset() {
    this.dialog
      .open(TreatmentResponseDialogComponent, {
        data: {
          title: this.translateService.instant('diseaseTesting.warning'),
          icon: 'assets/images/info.svg',
          message: this.translateService.instant(
            'diseaseTesting.reset_the_page'
          ),
          primaryBtnText: this.translateService.instant('registration.Yes'),
          secondaryBtnText: this.translateService.instant('registration.No'),
        },
        panelClass: 'common-info-dialog',
      })
      .afterClosed()
      .subscribe((res: boolean) => {
        if (res) {
          window.location.reload();
        }
      });
  }

  get today() {
    return moment(sessionStorage.getItem('serverCurrentDateTime')).format('YYYY-MM-DD');
  }

  get minDate() {
    return moment(sessionStorage.getItem('serverCurrentDateTime'))
      .subtract(AnimalHealthConfig.treatmentMinDate, 'days')
      .format('YYYY-MM-DD');
  }

  submitPoolDiseaseTest() {
    if (
      this.poolDiseaseTestingForm.invalid ||
      this.onSpotChild?.onSpotRequestDtos?.invalid ||
      this.onLabChild?.sampleExaminationDetails?.invalid
    ) {
      this.poolDiseaseTestingForm.markAllAsTouched();
      this.onSpotChild?.onSpotRequestDtos?.markAllAsTouched();
      this.onLabChild?.sampleExaminationDetails?.markAllAsTouched();
      return;
    }
    //let request = {};
    const formValue = this.poolDiseaseTestingForm.getRawValue();
    let request = {
      diseaseTestingDetails: [],
      sampleRequestDtos: [],
    };
    const onSpotData = this.onSpotChild?.onSpotRequestDtos.getRawValue();
    let tempSamples = this.onLabChild?.sampleExaminationDetails.getRawValue();

    if (tempSamples) {
      tempSamples = tempSamples
        ? [
          {
            diseaseCd: '',
            sampleExaminationDetails: [
              {
                courierId: 0,
                labCd: tempSamples?.labCd?.subOrgId,
                labCharges: tempSamples.labCharges,
                modeOfTransport: tempSamples.modeOfTransport,
                receiptNo: tempSamples.receiptNo,
                sampleExaminationSubtypeCd:
                  tempSamples?.sampleExaminationSubtypeCd?.sampleExaminationSubtypeCd,

                sampleExaminationTypeCd:
                  tempSamples['sampleExaminationTypeCd'][
                  'sampleExaminationTypeCd'
                  ],
                testImageUrl1: '',
                testRemarks: '',
              },
            ],
            sampleId: '',
            sampleType: tempSamples['sampleType']['sampleTypeCd'],
          },
        ]
        : [];
    }

    if (!onSpotData && !tempSamples) {
      this.isLoadingSpinner = false;
      this.healthService.handleError({
        title: this.translatePipe.transform('errorMsg.message'),
        message: this.translatePipe.transform(
          'errorMsg.please_select_atleast_one_testing_type'
        ),
        primaryBtnText: this.translatePipe.transform('common.ok_string'),
      });
      return;
    }

    this.animalTagList.length &&
      this.animalTagList.map((animal: any, index) => {
        request['diseaseTestingDetails'].push({
          animalId: animal.animalId,
          animalImageUrl: '',
          diseaseTestingType: 3,
          ownerId: animal.ownerId,
          planId: '',
          remarks: formValue.remarks,
          tagId: animal.tagId,
          testingDate: moment(formValue.testingDate).format('YYYY-MM-DD'),
          testingRecordDate: this.today,
          ticketNo: '',
        });
      });
    if (this.poolCount - this.animalTagList.length) {
      for (var i = 0; i < this.poolCount - this.animalTagList.length; i++) {
        request['diseaseTestingDetails'].push({
          animalId: null,
          animalImageUrl: '',
          diseaseTestingType: 3,
          ownerId: null,
          planId: '',
          remarks: formValue.remarks,
          tagId: null,
          testingDate: moment(formValue.testingDate).format('YYYY-MM-DD'),
          testingRecordDate: this.today,
          ticketNo: '',
        });
      }
    }

    request['sampleRequestDtos'].push({
      animalId: null,
      ownerId: null,
      tagId: null,
      labTestingRequestDtos: tempSamples ? tempSamples : [],
      onSpotRequestDtos: onSpotData
        ? [
          {
            diseaseCd: onSpotData?.diseaseCd?.diseaseCd,
            finalSampleResultValue: onSpotData?.finalSampleResultValue,
            initialSampleResultValue: onSpotData?.initialSampleResultValue,
            onSpotTestCd: onSpotData?.onSpotTestCd
              ? parseInt(onSpotData.onSpotTestCd)
              : null,
            sampleId: '',
            sampleResult: onSpotData?.sampleResult,
            sampleType: onSpotData?.sampleType?.sampleTypeCd,
            testRemarks: '',
          },
        ]
        : [],
    });
    request['villageCdList'] =
      this.animalTagList && this.animalTagList.length
        ? [...new Set(this.animalTagList.map((animal) => animal.villageCd))]
        : [this.village.villageCd];
    request['poolNoOfAnimals'] = this.poolCount;
    request['diseaseCd'] = formValue.suspectedDisease?.diseaseCd;
    this.isLoadingSpinner = true;
    this._diseaseTestingService
      .submitGroupDiseaseTesting(request)
      .pipe(
        switchMap((res: any) => {
          const onspot = res.sampleDetails
            ?.filter((s) => s.testingLocation === SampleLocation.onSpot)
            .map((sample) => [
              'OnSpot',
              sample.sampleId,
              sample.sampleTypeDesc,
            ]);

          const lab = res.sampleDetails
            ?.filter((s) => s.testingLocation === SampleLocation.labTesting)
            .map((sample) => ['Lab', sample.sampleId, sample.sampleTypeDesc]);

          const samples: any[] = [];
          onspot?.forEach((s) => samples.push(s));
          lab?.forEach((s) => samples.push(s));
          this.isLoadingSpinner = false;
          return this.dialog
            .open(PoolDialogComponent, {
              data: {
                title: this.translatePipe.transform(
                  'diseaseTesting.group_disease_testing_details_saved_successfully'
                ),
                table_header: {
                  col1: this.translatePipe.transform(
                    'animalTreatmentSurgery.sample_for'
                  ),
                  col2: this.translatePipe.transform(
                    'animalTreatmentSurgery.sample_id'
                  ),
                  col3: this.translatePipe.transform(
                    'animalTreatmentSurgery.sample_type'
                  ),
                },
                animalCount: this.poolCount,
                diseaseCode: res.data.diseaseTestId,
                table_value: res.data.sampleDetails ?? null,
                supervisorName: res.data?.supervisorName
              },
              disableClose: true,
              width: '500px',
            })
            .afterClosed();
        })
      )
      .subscribe(
        (res: any) => {
          this.isLoadingSpinner = false;
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
  }

  get formControls() {
    return this.poolDiseaseTestingForm.controls;
  }
}
