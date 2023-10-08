import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { getDecryptedData } from 'src/app/shared/shareService/storageData';
import { Location } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { mimeType } from 'src/app/shared/utility/mime-type.validator';
import moment from 'moment';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { AnimalTreatmentService } from '../../animal-treatment/animal-treatment.service';
import {
  SampleType,
  SpotTestMaster,
} from '../../animal-treatment/models/master.model';
import { Disease } from '../../animal-treatment/models/disease.model';
import { SampleLocation } from '../../animal-treatment/models/enums/sample.enum';
import { HealthService } from '../../health.service';
import { DiseaseTestingService } from '../../disease-testing/disease-testing.service';
import { MatDialog } from '@angular/material/dialog';
import { switchMap } from 'rxjs/operators';
import { GroupDialogComponent } from '../group-dialog/group-dialog.component';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { TreatmentResponseDialogComponent } from '../../treatment-response-dialog/treatment-response-dialog.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlphaNumericSpecialValidation } from 'src/app/shared/utility/validation';
@Component({
  selector: 'app-new-group-test',
  templateUrl: './new-group-test.component.html',
  styleUrls: ['./new-group-test.component.css'],
  providers: [TranslatePipe],
})
export class NewGroupTestComponent implements OnInit {
  validationMsg = animalHealthValidations.groupDiseaseTesting;
  @Input() firFlag;
  @Output() formSubmitted = new EventEmitter();
  @ViewChild('onSpotChild') onSpotChild;
  @ViewChild('onLabChild') onLabChild;
  spotTestingDisplayedColumns: string[] = [
    'diseaseCd',
    'onSpotTestCd',
    'sampleType',
    'initialSampleResultValue',
    'finalSampleResultValue',
    'difference',
    'sampleResult',
    'action',
  ];
  isLoadingSpinner: boolean = false;
  animalTagList: any[] = [];
  groupDiseaseTestingForm: FormGroup;
  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  onSpotTestMasterRow: Array<Array<SpotTestMaster>> = [];
  onSpotTestMaster: SpotTestMaster[] = [];
  onSpotDiseaseSuspected: Disease[] = [];
  sampleTypeMaster: SampleType[] = [];
  sampleData?: any;
  labMaster: any = [];
  diseaseMaster: any[] = [];
  planIdMaster: any[] = [];
  isPlanRequired: boolean = false;
  constructor(
    private location: Location,
    private _fb: FormBuilder,
    private treatmentService: AnimalTreatmentService,
    private healthService: HealthService,
    private diseaseTestingService: DiseaseTestingService,
    private readonly translateService: TranslateService,
    private dialog: MatDialog,
    private translatePipe: TranslatePipe
  ) { }

  ngOnInit(): void {
    this.animalTagList = getDecryptedData('AESSHA256gdAnimal').id;
    const type = getDecryptedData('AESSHA256gdAnimal').type;
    this.getMasterData();
    this.createGroupDiseaseTesting();
    this.groupDiseaseTestingForm
      .get('labTestingFlg')
      .valueChanges.subscribe((value: string) => {
        if (value != 'Y') {
          this.groupDiseaseTestingForm.get('planId').clearValidators();
          this.groupDiseaseTestingForm.get('planId').updateValueAndValidity();
          this.isPlanRequired = false;
        }
      });
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
    const planIDRequest = this.healthService.getPlanIdMaster();
    forkJoin([
      sampleTypeRequest,
      getOnSpotDiseaseSuspectedRequest,
      planIDRequest,
    ]).subscribe(
      ([res1, res5, planIDResponse]: any) => {
        this.sampleTypeMaster = res1;
        this.onSpotDiseaseSuspected = res5;
        this.planIdMaster = planIDResponse;
        this.isLoadingSpinner = false;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  createGroupDiseaseTesting() {
    this.groupDiseaseTestingForm = this._fb.group({
      tagId: [null],
      animalId: [null],
      diseaseTestingType: ['2'],
      suspectedDisease: [null, [Validators.required]],
      ownerId: [''],
      planId: [null],
      remarks: ['', [Validators.maxLength(250), AlphaNumericSpecialValidation]],
      testingDate: [new Date(sessionStorage.getItem('serverCurrentDateTime')), [Validators.required]],
      testingRecordDate: [
        { value: moment(this.today).format('DD/MM/YYYY'), disabled: true },
      ],
      ticketNo: [''],
      animalImageUrl: [''],
      symptom_image: ['', { asyncValidators: [mimeType] }],
      onSpotTestingFlg: [{ value: 'N', disabled: this.firFlag ? true : false }],
      labTestingFlg: ['N'],
      spotTestingRows: this._fb.array([]),
      labTestingRows: this._fb.array([]),
      modifiedBy: [AnimalHealthConfig.userId],
      createdBy: [AnimalHealthConfig.userId],
      creationDate: [new Date(sessionStorage.getItem('serverCurrentDateTime'))],
    });
  }

  get minDate() {
    return moment(sessionStorage.getItem('serverCurrentDateTime'))
      .subtract(AnimalHealthConfig.treatmentMinDate, 'days')
      .format('YYYY-MM-DD');
  }

  subscribeTospotTestingRowsChange(control, index, event?: MatSelectChange) {
    const spotTestingRows = this.groupDiseaseTestingForm.get(
      'spotTestingRows'
    ) as FormArray;

    switch (control) {
      case 'diseaseCd':
        spotTestingRows.at(index).patchValue({
          testType: '',
          sampleType: '',
          initialSampleResultValue: '',
          finalSampleResultValue: '',
          difference: '',
          sampleResult: '',
        });

        this.onSpotTestMasterRow[index] = this.onSpotTestMaster.filter(
          ({ diseaseCd }) => diseaseCd == event.value
        );
        break;
      case 'testType':
        spotTestingRows.at(index).patchValue({
          sampleType: '',
          initialSampleResultValue: '',
          finalSampleResultValue: '',
          difference: '',
          sampleResult: '',
        });
        break;
      case 'sampleType':
        spotTestingRows.at(index).patchValue({
          initialSampleResultValue: '',
          finalSampleResultValue: '',
          difference: '',
          sampleResult: '',
        });
        break;
    }
  }

  disableReadings(event: any, element: any, index: number) {
    let spotTesting = this.groupDiseaseTestingForm.get(
      'spotTestingRows'
    ) as FormArray;
    if (!event || event.value == 207 || event.value == 208) {
      spotTesting.controls[index].get('initialSampleResultValue')?.enable();
      const currentDate = new Date(sessionStorage.getItem('serverCurrentDateTime'));
      const tDate = this.groupDiseaseTestingForm.getRawValue().testingDate;
      if (tDate) {
        const diffdate = this.treatmentService.getDifferenceDate(
          currentDate,
          tDate
        );
        if (diffdate > 3) {
          spotTesting.controls[index].get('finalSampleResultValue')?.enable();
          spotTesting.controls[index].get('difference')?.enable();
          spotTesting.controls[index].get('sampleResult')?.enable();
        } else {
          spotTesting.controls[index].get('finalSampleResultValue')?.disable();
          spotTesting.controls[index].get('difference')?.disable();
          spotTesting.controls[index].get('sampleResult')?.disable();
        }
      } else {
        spotTesting.controls[index].get('finalSampleResultValue')?.disable();
        spotTesting.controls[index].get('difference')?.disable();
        spotTesting.controls[index].get('sampleResult')?.disable();
      }
    } else {
      spotTesting.controls[index].get('initialSampleResultValue')?.disable();
      spotTesting.controls[index].get('finalSampleResultValue')?.disable();
      spotTesting.controls[index].get('difference')?.disable();
      spotTesting.controls[index].get('sampleResult')?.enable();
    }
  }

  addSpotTestingRow(d?: any, noUpdate?: boolean) {
    this.onSpotTestMasterRow.push(this.onSpotTestMaster);
    const row = this._fb.group({
      diseaseCd: [d && d.diseaseCd ? d.diseaseCd : null, [Validators.required]],
      onSpotTestCd: [d && d.onSpotTestCd ? d.onSpotTestCd : null, []],
      sampleType: [d && d.sampleType ? d.sampleType : null, []],
      initialSampleResultValue: [
        d && d.initialSampleResultValue ? d.initialSampleResultValue : null,
        [],
      ],
      finalSampleResultValue: [
        d && d.finalSampleResultValue ? d.finalSampleResultValue : null,
        [],
      ],
      difference: [d && d.difference ? d.difference : null, []],
      sampleResult: [d && d.sampleResult ? d.sampleResult : null, []],
      testingLocation: SampleLocation.onSpot,
      sourceOriginCd: AnimalHealthConfig.sourceOriginCd.diseaseTesting,
      createdBy: AnimalHealthConfig.userId,
      modifiedBy: AnimalHealthConfig.userId,
      creationDate: new Date(sessionStorage.getItem('serverCurrentDateTime')),
    });
    (<FormArray>this.groupDiseaseTestingForm.controls.spotTestingRows).push(
      row
    );
    if (!noUpdate) {
      this.updateSpotTestingView();
    }
  }

  updateDifference(index: number, event: Event) {
    const initialControl = (this.spotTestingRows.at(index) as FormGroup).get(
      'initialReading'
    );
    const finalControl = (this.spotTestingRows.at(index) as FormGroup).get(
      'finalReading'
    );
    const diffControl = (this.spotTestingRows.at(index) as FormGroup).get(
      'difference'
    );

    if (
      initialControl?.value === null ||
      initialControl?.value === '' ||
      isNaN(initialControl?.value) ||
      finalControl?.value === null ||
      finalControl?.value === '' ||
      isNaN(finalControl?.value)
    ) {
      return;
    }
    const result = +initialControl?.value - +finalControl?.value;
    diffControl?.patchValue(result.toFixed(2));
  }

  get spotTestingRows() {
    return this.groupDiseaseTestingForm.get('spotTestingRows') as FormArray;
  }

  updateSpotTestingView() {
    this.dataSource.next(
      (<FormArray>this.groupDiseaseTestingForm.controls.spotTestingRows)
        .controls
    );
  }

  submitGroupDiseaseTest() {
    if (
      this.groupDiseaseTestingForm.invalid ||
      this.onSpotChild?.onSpotRequestDtos.invalid
    ) {
      this.groupDiseaseTestingForm.markAllAsTouched();
      this.onSpotChild?.onSpotRequestDtos?.markAllAsTouched();
      return;
    }
    this.isLoadingSpinner = true;
    const formValue = this.groupDiseaseTestingForm.getRawValue();
    let request = {
      diseaseTestingDetails: [],
      sampleRequestDtos: [],
    };
    let tempSamples = this.onLabChild?.diagnosticsForm.getRawValue().samples;
    const onSpotData = this.onSpotChild?.onSpotRequestDtos.getRawValue();
    if (
      (!onSpotData?.spotTestingRows || !onSpotData?.spotTestingRows.length) &&
      !tempSamples
    ) {
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
      this.animalTagList.forEach((animal, index) => {
        request['diseaseTestingDetails'].push({
          animalId: animal.animalId,
          animalImageUrl: '',
          diseaseTestingType: 2,
          ownerId: animal.ownerId,
          planId: formValue?.planId?.id,
          remarks: formValue.remarks,
          tagId: animal.tagId,
          testingDate: moment(formValue.testingDate).format('YYYY-MM-DD'),
          testingRecordDate: this.today,
          ticketNo: '',
        });
        request['sampleRequestDtos'].push({
          animalId: animal.animalId,
          ownerId: animal.ownerId,
          tagId: animal.tagId,
          labTestingRequestDtos: tempSamples ? tempSamples : [],
          onSpotRequestDtos: onSpotData?.spotTestingRows
            ? [
              {
                diseaseCd: onSpotData.suspectedDisease?.diseaseCd,
                finalSampleResultValue:
                  onSpotData?.spotTestingRows[index].finalSampleResultValue,
                initialSampleResultValue:
                  onSpotData?.spotTestingRows[index].initialSampleResultValue,
                onSpotTestCd: onSpotData.onSpotTestCd
                  ? parseInt(onSpotData.onSpotTestCd)
                  : null,
                sampleId: '',
                sampleResult: onSpotData?.spotTestingRows[index].sampleResult,
                sampleType: onSpotData.sampleType?.sampleTypeCd,
                testRemarks: '',
              },
            ]
            : [],
        });
      });
    request['villageCdList'] = [
      ...new Set(
        this.animalTagList.map(
          (animal) =>
            animal.villageCd || animal?.ownerDetails?.ownerAddressCityVillageCd
        )
      ),
    ];

    request['diseaseCd'] = formValue.suspectedDisease.diseaseCd;

    if (this.firFlag) {
      request.sampleRequestDtos.length &&
        request.sampleRequestDtos.forEach((element, index) => {
          element.labTestingRequestDtos.forEach((lab, labIndex) => {
            this.onLabChild?.sampleExamTypeMaster.find(
              (ex: any) =>
                ex['sampleExaminationTypeCd'] == ex['sampleExaminationTypeCd']
            )?.sampleExaminationTypeDesc;
            lab['sampleTypeDesc'] = this.onLabChild?.sampleTypeMaster.find(
              (sample: any) => lab['sampleType'] == sample['sampleTypeCd']
            )?.sampleTypeDesc;
            lab['sampleExaminationDetails'].length &&
              lab['sampleExaminationDetails'].forEach(
                (exam: any, examIndex) => {
                  exam['sampleExaminationTypeDesc'] =
                    this.onLabChild?.sampleExamTypeMaster[labIndex].find(
                      (ex: any) =>
                        ex['sampleExaminationTypeCd'] ==
                        exam['sampleExaminationTypeCd']
                    )?.sampleExaminationTypeDesc;
                },
                this,
                labIndex
              );
          }, this);
        }, this);
      this.formSubmitted.emit(request);
      this.isLoadingSpinner = false;
    } else {
      this.diseaseTestingService
        .submitGroupDiseaseTesting(request)
        .pipe(
          switchMap((res: any) => {
            const onspot = res.data.sampleDetails
              ?.filter((s) => s.testingLocation === SampleLocation.onSpot)
              .map((sample) => [
                'OnSpot',
                sample.sampleId,
                sample.sampleTypeDesc,
              ]);

            const lab = res.data.sampleDetails
              ?.filter((s) => s.testingLocation === SampleLocation.labTesting)
              .map((sample) => ['Lab', sample.sampleId, sample.sampleTypeDesc]);

            const samples: any[] = [];
            onspot?.forEach((s) => samples.push(s));
            lab?.forEach((s) => samples.push(s));
            this.isLoadingSpinner = false;
            return this.dialog
              .open(GroupDialogComponent, {
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
                  animalCount: this.animalTagList.length,
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
          (res: any) => { },
          (err) => {
            this.isLoadingSpinner = false;
          }
        );
    }
  }

  get today() {
    return moment(sessionStorage.getItem('serverCurrentDateTime')).format('YYYY-MM-DD');
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
          if (this.firFlag) {
            this.dialog.closeAll();
          }
          else {
            this.goBack();
          }
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
          if (this.firFlag) {
            this.groupDiseaseTestingForm.reset();
            this.groupDiseaseTestingForm.get('labTestingFlg').patchValue('N');
            this.groupDiseaseTestingForm.get('testingDate').patchValue(new Date(sessionStorage.getItem('serverCurrentDateTime')));
            this.groupDiseaseTestingForm.get('testingRecordDate').patchValue(moment(this.today).format('DD/MM/YYYY'));
          }
          else {
            window.location.reload();
          }

        }
      });
  }

  get formControls() {
    return this.groupDiseaseTestingForm.controls;
  }

  changeExamType(event) {
    let exam = event.value.filter((sample) =>
      sample.sampleExaminationDetails.some(
        (examination) => examination.sampleExaminationTypeCd == 8
      )
    );
    if (exam.length) {
      this.groupDiseaseTestingForm
        .get('planId')
        .addValidators([Validators.required]);
      this.isPlanRequired = true;
    } else {
      this.groupDiseaseTestingForm.get('planId').clearValidators();
      this.isPlanRequired = false;
    }
    this.groupDiseaseTestingForm.get('planId').updateValueAndValidity();
  }
}
