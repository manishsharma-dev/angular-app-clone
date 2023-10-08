import { Location } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError, filter, switchMap } from 'rxjs/operators';
import { AnimalDetailService } from 'src/app/features/animal-management/animal-registration/animal-details/animal-detail.service';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { mimeType } from 'src/app/shared/utility/mime-type.validator';
import { AlphaNumericSpecialValidation } from 'src/app/shared/utility/validation';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { environment } from 'src/environments/environment';
import { AnimalTreatmentService } from '../../animal-treatment/animal-treatment.service';
import { Disease } from '../../animal-treatment/models/disease.model';
import { SampleLocation } from '../../animal-treatment/models/enums/sample.enum';
import {
  SampleExaminationType,
  SampleType,
  SpotTestMaster,
} from '../../animal-treatment/models/master.model';
import { HealthService } from '../../health.service';
import { TreatmentResponseDialogComponent } from '../../treatment-response-dialog/treatment-response-dialog.component';
import { VaccinationService } from '../../vaccination/vaccination.service';
import { DiseaseTestingService } from '../disease-testing.service';
import { SubmitDialogComponent } from '../submit-dialog/submit-dialog.component';
import { decimalWithLengthValidation } from 'src/app/shared/utility/decimalWithLengthValidator';

@Component({
  selector: 'app-new-test',
  templateUrl: './new-test.component.html',
  styleUrls: ['./new-test.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [TranslatePipe],
})
export class NewTestComponent implements OnInit {
  isDiseaseRequired: boolean = false;
  validationMsg = animalHealthValidations.groupDiseaseTesting;
  isLoadingSpinner: boolean = false;
  animalTagId: string;
  animal: AnimalData;
  diseaseTestingForm: FormGroup;
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
  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  labTestingDisplayedColumns: string[] = [
    'sampleCollectionDate',
    'sampleType',
    'sampleExaminationTypeCd',
    'sampleExaminationSubtypeCd',
    'labCd',
    'labCharges',
    'receiptNo',
    'modeOfTransport',
    'action',
  ];
  dataSourceLab = new BehaviorSubject<AbstractControl[]>([]);
  spotTestingData = ELEMENT_DATA_spotTesting;
  labTestingData = ELEMENT_DATA_LabTesting;
  sampleTypeMaster: SampleType[] = [];
  sampleExamTypeMaster: SampleExaminationType[] = [];
  sampleSubExamTypeMaster: any[][] = [];
  radiologyreportData: any[] = [];
  diseaseMaster: any[] = [];
  labMaster: any = [];
  testType = [];
  sampleData?: any;
  onSpotDiseaseSuspected: Disease[] = [];
  onSpotTestMaster: SpotTestMaster[] = [];
  onSpotTestMasterRow: Array<Array<SpotTestMaster>> = [];
  file: File;
  onSpotSampleList = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _diseaseTestingService: DiseaseTestingService,
    private location: Location,
    private _fb: FormBuilder,
    private animalMgmtService: AnimalDetailService,
    private treatmentService: AnimalTreatmentService,
    private _vaccinationService: VaccinationService,
    private readonly translateService: TranslateService,
    public dialog: MatDialog,
    private healthService: HealthService,
    private translatePipe: TranslatePipe
  ) { }

  ngOnInit(): void {
    this.getMasterData();
    this.route.queryParams
      .pipe(
        filter((params) => {
          if (!params['animalId']) {
            this.router.navigate(['/not-found']);
            return false;
          }
          this.animalTagId = params['animalId'];
          return true;
        }),
        switchMap(() =>
          forkJoin([
            this.animalMgmtService
              .getAnimalDetails(this.animalTagId)
              .pipe(catchError((err) => of(null))),
          ])
        )
      )
      .subscribe((data: any) => {
        this.animal = data[0];
        this.diseaseTestingForm.patchValue({
          tagId: this.animal.tagId,
          ownerId: this.animal.ownerId,
        });
      });

    this.diseaseTestingForm = this._fb.group({
      tagId: [''],
      testingRecordDate: [
        { value: moment(this.today).format('DD/MM/YYYY'), disabled: true },
      ],
      testingDate: [new Date(sessionStorage.getItem('serverCurrentDateTime')), [Validators.required]],
      symptom_image: ['', { asyncValidators: [mimeType] }],
      suspectedDisease: [null, [Validators.required]],
      remarks: [null, [Validators.maxLength(250), AlphaNumericSpecialValidation]],
      ticketNo: [''],
      onSpotTestingFlg: ['N'],
      animalImageUrl: [''],
      labTestingFlg: ['N'],
      animalId: [this.animalTagId],
      planId: ['1'],
      ownerId: [''],
      spotTestingRows: this._fb.array([], this.hasOnSpotDuplicate()),
      labTestingRows: this._fb.array([]),
      modifiedBy: [AnimalHealthConfig.userId],
      createdBy: [AnimalHealthConfig.userId],
      diseaseTestingType: ['1'],
      creationDate: [new Date(sessionStorage.getItem('serverCurrentDateTime'))],
    });

    this.diseaseTestingForm
      ?.get('onSpotTestingFlg')
      ?.valueChanges.subscribe((res: any) => {
        let spotTesting = this.diseaseTestingForm.get(
          'spotTestingRows'
        ) as FormArray;
        if (res == 'N') {
          spotTesting.clear();
          if (spotTesting['controls'].length) {
            spotTesting['controls'].forEach((control, index) => {
              control.get('diseaseCd')?.clearValidators();
              control.get('diseaseCd')?.updateValueAndValidity();
            });
          }
        } else {
          if (spotTesting['controls'].length) {
            spotTesting['controls'].forEach((control, index) => {
              control.get('diseaseCd')?.setValidators([Validators.required]);
              control.get('diseaseCd')?.updateValueAndValidity();
            });
          } else {
            this.spotTestingData.forEach((d: any) =>
              this.addSpotTestingRow(d, false)
            );
            this.updateSpotTestingView();
          }
        }
      });

    this.diseaseTestingForm
      .get('labTestingFlg')
      ?.valueChanges.subscribe((res: any) => {
        let labTestingRows = this.diseaseTestingForm.get(
          'labTestingRows'
        ) as FormArray;
        if (res !== 'N') {
          if (!labTestingRows['controls'].length) {
            this.labTestingData.forEach((d: any) =>
              this.addLabTestingRow(d, false)
            );
            this.updateLabTestingView();
          }
        } else {
          labTestingRows.clear();
        }
      });
    this.diseaseTestingForm
      .get('testingDate')
      ?.valueChanges.subscribe((res: any) => {
        if (this.diseaseTestingForm.get('onSpotTestingFlg').value != 'N') {
          this.spotTestingRows.value.length &&
            this.spotTestingRows.value.forEach((element, index) => {
              this.disableReadings(false, element, index);
            });
        }
      });
  }

  hasOnSpotDuplicate() {
    return (formArray: FormArray): { [key: string]: any } | null => {
      let duplicates: any = [];
      const onSpotList = this.diseaseTestingForm?.get('spotTestingRows')?.value;
      onSpotList &&
        onSpotList.length &&
        onSpotList.forEach((spot, index) => { });
      if (onSpotList && onSpotList.length) {
        duplicates = Object.values(
          onSpotList?.reduce((c: any, v: any) => {
            let k = v.diseaseCd + '-' + v.onSpotTestCd;
            c[k] = c[k] || [];
            c[k].push(v);
            return c;
          }, {})
        ).reduce((c: any, v: any) => (v.length > 1 ? c.concat(v) : c), []);
      }
      return duplicates.length
        ? {
          error: this.translateService.instant(
            'errorMsg.duplicate_test_type_for_same_disease_found'
          ),
        }
        : null;
    };
  }

  subscribeTospotTestingRowsChange(
    control,
    index,
    element,
    event?: MatSelectChange
  ) {
    const spotTestingRows = this.diseaseTestingForm.get(
      'spotTestingRows'
    ) as FormArray;

    switch (control) {
      case 'diseaseCd':
        spotTestingRows.at(index).patchValue({
          onSpotTestCd: '',
          sampleType: '',
          initialSampleResultValue: '',
          finalSampleResultValue: '',
          difference: '',
          sampleResult: '',
        });

        this.onSpotTestMasterRow[index] = this.onSpotTestMaster.filter(
          ({ diseaseCd }) => diseaseCd == event.value
        );
        this.disableReadings(event, element, index);
        break;
      case 'onSpotTestCd':
        const diseaseSuspected = (this.spotTestingRows.at(index) as FormGroup).get(
          'diseaseCd'
        );
        if (event.value != 10) {
          diseaseSuspected.addValidators([Validators.required]);
        }
        else {
          diseaseSuspected.clearValidators();
        }
        diseaseSuspected.updateValueAndValidity({ emitEvent: false });
        spotTestingRows.at(index).patchValue({
          sampleType: '',
          initialSampleResultValue: '',
          finalSampleResultValue: '',
          difference: '',
          sampleResult: '',
        });
        for (let control of this.spotTestingRows.controls) {
          if (control.get('diseaseCd').errors?.required) {
            this.isDiseaseRequired = true;
            //return; // This control is required
          }
          else {
            this.isDiseaseRequired = false;
          }
        }
        this.onSpotSampleList[index] = this.onSpotTestMaster.filter((spot) => spot.onSpotTestCd == event.value && spot.sampleTypeCd);
        //this.disableOnSpotChanged(event, element, index);
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

  disableOnSpotChanged(event: any, element: any, index: number) {
    let spotTesting = this.diseaseTestingForm.get(
      'spotTestingRows'
    ) as FormArray;
    if (element.value.diseaseCd == 207 || element.value.diseaseCd == 208) {
      if (!event || event.value != 1 && event.value != 2) {
        const currentDate = new Date(sessionStorage.getItem('serverCurrentDateTime'));
        const tDate = this.diseaseTestingForm.value.testingDate;
        if (tDate) {
          const diffdate = this.treatmentService.getDifferenceDate(
            currentDate,
            tDate
          );
          if (diffdate < 3) {
            spotTesting.controls[index].get('initialSampleResultValue')?.disable();
            spotTesting.controls[index].get('finalSampleResultValue')?.disable();
            spotTesting.controls[index].get('difference')?.disable();
            spotTesting.controls[index].get('sampleResult')?.disable();
          }
          else {
            spotTesting.controls[index].get('initialSampleResultValue')?.enable();
            spotTesting.controls[index].get('finalSampleResultValue')?.enable();
            spotTesting.controls[index].get('difference')?.enable();
            spotTesting.controls[index].get('sampleResult')?.enable();
          }
        }
      }
      else {
        spotTesting.controls[index].get('initialSampleResultValue')?.disable();
        spotTesting.controls[index].get('finalSampleResultValue')?.disable();
        spotTesting.controls[index].get('difference')?.disable();
        spotTesting.controls[index].get('sampleResult')?.disable();
      }
    }
  };

  getMasterData() {
    const sampleTypeRequest = this.treatmentService.getSampleTypeMaster([
      'A',
      'B',
      'D',
      'O',
    ]);
    //const examTypeRequest = this.treatmentService.getExaminationTypeMaster();
    const diseaseRequest = this.treatmentService.getDiseasesMaster();
    const labRequest = this.healthService.getSubOrgList(5);
    const onSpotTestCdRequest = this.healthService.getCommonMaster(
      AnimalHealthConfig.commonMasterKeys.onSpotTestCd
    );
    const getOnSpotDiseaseSuspectedRequest =
      this.treatmentService.getOnSpotDiseaseSuspected();
    const getOnSpotTestMasterRequest =
      this.treatmentService.getOnSpotTestMaster();
    const diseaseMasterRequest = this.treatmentService.getDiseasesMaster();
    forkJoin([
      sampleTypeRequest,
      diseaseRequest,
      labRequest,
      getOnSpotDiseaseSuspectedRequest,
      getOnSpotTestMasterRequest,
    ]).subscribe(
      ([res1, res2, res3, res5, res6]: any) => {
        this.sampleTypeMaster = res1;
        //this.sampleExamTypeMaster = res2;
        this.diseaseMaster = [...res2];
        this.labMaster = res3;
        this.onSpotDiseaseSuspected = res5;
        this.onSpotTestMaster = res6;
      },
      (err) => { }
    );
  }

  get diseaseInfo() {
    return this.diseaseTestingForm.controls;
  }

  updateDifference(index: number, event: Event) {
    const initialControl = (this.spotTestingRows.at(index) as FormGroup).get(
      'initialSampleResultValue'
    );
    const finalControl = (this.spotTestingRows.at(index) as FormGroup).get(
      'finalSampleResultValue'
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
    const result = +finalControl?.value - +initialControl?.value;
    diffControl?.patchValue(result.toFixed(2));
  }

  get spotTestingRows() {
    return this.diseaseTestingForm.get('spotTestingRows') as FormArray;
  }

  get labTestingRows() {
    return this.diseaseTestingForm.get('labTestingRows') as FormArray;
  }

  getSubType(event: any, formIndex: number) {
    const request = {
      sampleExaminationTypeCd: event.value,
    };
    this.treatmentService
      .getSubExaminationTypeMaster(request)
      .subscribe((res: any) => {
        if (res.errorCode) {
          this.sampleSubExamTypeMaster[formIndex] = [];
          return;
        }
        this.sampleSubExamTypeMaster[formIndex] = res;
      });
  }

  disableReadings(event: any, element: any, index: number) {
    let spotTesting = this.diseaseTestingForm.get(
      'spotTestingRows'
    ) as FormArray;
    if (!event || event.value == 207 || event.value == 208) {
      spotTesting.controls[index].get('initialSampleResultValue')?.enable();
      const currentDate = new Date(sessionStorage.getItem('serverCurrentDateTime'));
      const tDate = this.diseaseTestingForm.value.testingDate;
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
    if (!event || event.value == 207 || event.value == 208 || event.value == 362) {
      spotTesting.controls[index].get('sampleType')?.disable();
    }
    else {
      spotTesting.controls[index].get('sampleType')?.enable();
    }
  }

  updateSpotTestingView() {
    this.dataSource.next(
      (<FormArray>this.diseaseTestingForm.controls.spotTestingRows).controls
    );
  }

  addSpotTestingRow(d?: any, noUpdate?: boolean) {
    this.onSpotTestMasterRow.push(this.onSpotTestMaster);
    const row = this._fb.group({
      diseaseCd: [d && d.diseaseCd ? d.diseaseCd : null, []],
      onSpotTestCd: [d && d.onSpotTestCd ? d.onSpotTestCd : null, [Validators.required]],
      sampleType: [d && d.sampleType ? d.sampleType : null, []],
      initialSampleResultValue: [
        d && d.initialSampleResultValue ? d.initialSampleResultValue : null,
        [decimalWithLengthValidation(7, 2)],
      ],
      finalSampleResultValue: [
        d && d.finalSampleResultValue ? d.finalSampleResultValue : null,
        [decimalWithLengthValidation(7, 2)],
      ],
      difference: [
        d && d.difference ? d.difference : null,
        [decimalWithLengthValidation(7, 2)],
      ],
      sampleResult: [d && d.sampleResult ? d.sampleResult : null, []],
      testingLocation: SampleLocation.onSpot,
      sourceOriginCd: AnimalHealthConfig.sourceOriginCd.diseaseTesting,
      createdBy: AnimalHealthConfig.userId,
      modifiedBy: AnimalHealthConfig.userId,
      creationDate: new Date(sessionStorage.getItem('serverCurrentDateTime')),
    });
    (<FormArray>this.diseaseTestingForm.controls.spotTestingRows).push(row);
    if (!noUpdate) {
      this.updateSpotTestingView();
    }
  }

  removeSpotTestingElement(index: number) {
    if (
      (<FormArray>this.diseaseTestingForm.controls.spotTestingRows).controls
        .length > 1
    ) {
      (<FormArray>this.diseaseTestingForm.controls.spotTestingRows).removeAt(
        index
      );
      this.updateSpotTestingView();
      this.onSpotTestMasterRow.splice(index, 1);
      this.onSpotSampleList.splice(index, 1);
    }

  }

  updateLabTestingView() {
    this.dataSourceLab.next(
      (<FormArray>this.diseaseTestingForm.controls.labTestingRows).controls
    );
  }

  addLabTestingRow(d?: any, noUpdate?: boolean) {
    const row = this._fb.group({
      sampleCollectionDate: [
        d && d.sampleCollectionDate ? d.sampleCollectionDate : null,
        [],
      ],
      sampleType: [d && d.sampleType ? d.sampleType : null, []],
      sampleExaminationTypeCd: [
        d && d.sampleExaminationTypeCd ? d.sampleExaminationTypeCd : null,
        [],
      ],
      sampleExaminationSubtypeCd: [
        d && d.sampleExaminationSubtypeCd ? d.sampleExaminationSubtypeCd : null,
        [],
      ],
      labCd: [d && d.labCd ? d.labCd : null, []],
      labCharges: [d && d.labCharges ? d.labCharges : null, []],
      receiptNo: [d && d.receiptNo ? d.receiptNo : null, []],
      testRemarks: [d && d.testRemarks ? d.testRemarks : null, []],
      modeOfTransport: [d && d.modeOfTransport ? d.modeOfTransport : null, []],
      testingLocation: SampleLocation.labTesting,
      sourceOriginCd: AnimalHealthConfig.sourceOriginCd.diseaseTesting,
      createdBy: AnimalHealthConfig.userId,
      modifiedBy: AnimalHealthConfig.userId,
      creationDate: new Date(sessionStorage.getItem('serverCurrentDateTime')),
    });
    (<FormArray>this.diseaseTestingForm.controls.labTestingRows).push(row);
    if (!noUpdate) {
      this.updateLabTestingView();
    }
  }

  onFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    let selectedFile = (event.target as HTMLInputElement)?.files![0];
    var blob = selectedFile.slice(0, file.size, selectedFile.type);
    let newFile = new File([blob], 'name.png', { type: selectedFile.type });
    this.diseaseTestingForm.patchValue({ symptom_image: newFile });
    this.file = selectedFile;
  }

  uploadFile(selectedFile, id = '0') {
    const fd = new FormData();
    fd.append('file', selectedFile);
    fd.append('id', id);
    fd.append('moduleFilePath', 'uploadSampleImageTreatmentPath');
    fd.append('uploadType', 'uploadSampleReport');
    this._vaccinationService.uploadImage(fd).subscribe((res: any) => {
      this.diseaseTestingForm.patchValue({ animalImageUrl: res.file });
      this.createNewDiseaseTesting();
    });
  }

  removeLabTestingElement(index: number) {
    if (
      (<FormArray>this.diseaseTestingForm.controls.labTestingRows).controls
        .length > 1
    ) {
      (<FormArray>this.diseaseTestingForm.controls.labTestingRows).removeAt(
        index
      );
      this.updateLabTestingView();
    } else {
    }
  }

  submitDiseaseTest() {
    this.spotTestingRows.markAllAsTouched();
    this.diseaseTestingForm.markAllAsTouched();
    this.labTestingData;
    if (this.diseaseTestingForm.invalid) {
      return;
    }

    if (this.file) {
      if (this.diseaseTestingForm.get('symptom_image').valid)
        this.uploadFile(this.file, this.animalTagId);
    } else {
      this.createNewDiseaseTesting();
    }
  }
  //moment(formValue.followUpDate).format('YYYY-MM-DD')
  createNewDiseaseTesting() {
    let req = {
      ...this.diseaseTestingForm.getRawValue(),
      testingRecordDate: moment().format('YYYY-MM-DD'),
      testingDate: moment(
        this.diseaseTestingForm.getRawValue().testingDate
      ).format('YYYY-MM-DD'),
    };

    const diseaseTestingDetail = {
      animalId: req.animalId,
      animalImageUrl: req.animalImageUrl,
      diseaseTestingType: req.diseaseTestingType,
      ownerId: req.ownerId,
      planId: null,
      remarks: req.remarks,
      tagId: req.tagId,
      testingDate: req.testingDate,
      testingRecordDate: req.testingRecordDate,
    };
    if (!req.spotTestingRows.length && !req.samples) {
      this.healthService.handleError({
        title: this.translatePipe.transform('errorMsg.message'),
        message: this.translatePipe.transform(
          'errorMsg.please_select_atleast_one_testing_type'
        ),
        primaryBtnText: this.translatePipe.transform('common.ok_string'),
      });
      return;
    }
    let request = {
      diseaseTestingDetail: diseaseTestingDetail,
      diseaseCd: req.suspectedDisease?.diseaseCd,
    };
    if (req.spotTestingRows.length) {
      request['onSpotRequestDtos'] = req.spotTestingRows;
    } else {
      request['onSpotRequestDtos'] = [];
    }
    if (req.samples && req.samples.length) {
      request['labTestingRequestDtos'] = req.samples;
    } else {
      request['labTestingRequestDtos'] = [];
    }
    request['diseaseCd'] = req.suspectedDisease.diseaseCd;
    this.isLoadingSpinner = true;
    this._diseaseTestingService
      .submitDiseaseTesting(request)
      .pipe(
        switchMap((res: any) => {
          const onspot = res.data?.sampleDetails
            ?.filter((s) => s.testingLocation === SampleLocation.onSpot)
            .map((sample) => [
              'OnSpot',
              sample.sampleId,
              this.getSampleName(+sample.sampleType),
            ]);

          const lab = res.data?.sampleDetails
            ?.filter((s) => s.testingLocation === SampleLocation.labTesting)
            .map((sample) => [
              'Lab',
              sample.sampleId,
              this.getSampleName(+sample.sampleType),
            ]);

          const samples: any[] = [];
          onspot?.forEach((s) => samples.push(s));
          lab?.forEach((s) => samples.push(s));
          return this.dialog
            .open(SubmitDialogComponent, {
              data: {
                ownerId: this.animal.ownerId,
                title: this.translatePipe.transform(
                  'errorMsg.disease_testing_details_saved_successfully'
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

                table_value: res.data?.sampleDetails ?? null,
                supervisorName: res.data?.supervisorName
              },
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

  getSampleName(sampleId: number) {
    return this.sampleTypeMaster?.find(
      (sample) => sample.sampleTypeCd === sampleId
    )?.sampleTypeDesc;
  }

  get formControls() {
    return this.diseaseTestingForm.controls;
  }

  get today() {
    return moment(sessionStorage.getItem('serverCurrentDateTime')).format('YYYY-MM-DD');
  }

  get minDate() {
    return moment()
      .subtract(AnimalHealthConfig.treatmentMinDate, 'days')
      .format('YYYY-MM-DD');
  }

  goBack() {
    this.router.navigate(['..'], {
      relativeTo: this.route,
      queryParams: { ownerId: this.animal.ownerId },
    });
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

  getAnimalAge(ageInMonths: any) {
    return this.treatmentService.getWords(ageInMonths);
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
}

export interface AnimalData {
  animalId: number;
  ownerDetails: OwnerDetails;
  breedAndExoticLevels: BreedAndExoticLevel[];
  animalName: string;
  animalPicUrl: string;
  ageInMonths: number | string;
  animalStatusCd: number;
  animalStatus: string;
  coatColourCd: number;
  damId: number;
  damSireId: number;
  dateOfBirth: string;
  isLoanOnAnimal: boolean;
  ownerId: number;
  registrationDate: string;
  registrationStatus: string;
  sex: string;
  sireId: number;
  sireSireId: number;
  speciesCd: number;
  species: string;
  tagId: number;
  taggingDate: string;
  milkingStatus: string;
  pregnancyStatus: string;
  fieldSubmittedforUpdate: string;
  imagePreviewUrl: string;
}

export interface BreedAndExoticLevel {
  breed: string;
  bloodExoticLevel: string;
}

export interface OwnerDetails {
  ownerId: number;
  ownerUuidKey1: string;
  ownerUuidKey2: string;
  ownerName: string;
  fatherName: string;
  ownerDateOfbirth: string;
  ownerGender: string;
  ownerMobileNo: number;
  emailId: string;
  ownerAddressPincode: number;
  ownerAddressStateCd: number;
  ownerStateName: string;
  ownerAddressDistrictCd: number;
  ownerDistrictName: string;
  ownerAddressCityVillageCd: number;
  ownerVillageName: string;
  ownerAddressTehsilCd: number;
  ownerTehsilName: string;
  affiliatedAgencyUnionOrPc: boolean;
  registrationStatus: string;
  modifiedDate: string;
  modifiedBy: string;
  createdBy: string;
  creationDate: string;
  alternateMobileNo: number;
  ownerCastCategoryCd: number;
  ownerLandHoldingCd: number;
  isPourerMember: boolean;
  isOwnerBelowPovertyLine: boolean;
  hhid: string;
  isOwnerMobileVerified: boolean;
}


const ELEMENT_DATA_spotTesting: spotTestingModel[] = [
  {
    diseaseSuspected: '',
    onSpotTestCd: '',
    sampleType: '',
    initialReading: '',
    finalReading: '',
    difference: '',
    results: '',
  },
];

export interface spotTestingModel {

  diseaseSuspected: string;
  onSpotTestCd: string;
  sampleType: string;
  initialReading: string;
  finalReading: string;
  difference: string;
  results: string;
}

const ELEMENT_DATA_LabTesting: LabTestingModel[] = [
  {
    sampleColl: '',
    sampleType: '',
    typeOfExam: '',
    examsubType: '',
    lab: '',
    labCharges: '',
    receiptno: '',
    transportmode: '',
  },
];

export interface LabTestingModel {
  sampleColl: string;
  sampleType: string;
  typeOfExam: string;
  examsubType: string;
  lab: string;
  labCharges: string;
  receiptno: string;
  transportmode: string;
}
