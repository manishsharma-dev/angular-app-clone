import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { AnimalDetails } from 'src/app/features/animal-management/animal-registration/models-animal-reg/animal-details.model';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { HealthService } from '../../health.service';

import { decimalWithLengthValidation } from 'src/app/shared/utility/decimalWithLengthValidator';
import { AnimalTreatmentService } from '../animal-treatment.service';
import { Disease } from '../models/disease.model';
import {
  LabTestingRow,
  SampleExaminationType,
  SampleType,
  SpotTestMaster,
  SpotTestingRow,
} from '../models/master.model';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-add-diagnostics',
  templateUrl: './add-diagnostics.component.html',
  styleUrls: ['./add-diagnostics.component.css'],
  providers: [TranslatePipe],
})
export class AddDiagnosticsComponent implements OnInit {
  diagnosticsForm!: FormGroup;
  spotTestingDisplayedColumns: string[] = [
    'diseaseSuspected',
    'onSpotTestCd',
    'sampleType',
    'initialReading',
    'finalReading',
    'difference',
    'sampleResult',
    'action',
  ];
  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  labTestingDisplayedColumns: string[] = [
    'diseaseCd',
    'sampleType',
    'sampleExaminationTypeCd',
    'sampleExaminationSubtypeCd',
    'labCd',
    'labCharges',
    'receiptNo',
    'testRemarks',
    'modeOfTransport',
    'action',
  ];
  dataSourceLab = new BehaviorSubject<AbstractControl[]>([]);
  spotTestingData = [];
  labTestingData = [];
  sampleTypeMaster: SampleType[] = [];
  sampleExamTypeMaster: SampleExaminationType[] = [];
  sampleSubExamTypeMaster: any[][] = [];
  radiologyreportData: any[] = [];
  diseaseMaster: any[] = [];
  labMaster: any = [];
  onSpotTestCd: any = [];
  minSampleDate = new Date(sessionStorage.getItem('serverCurrentDateTime'));
  onSpotDiseaseSuspected: Disease[] = [];
  onSpotTestMaster: SpotTestMaster[] = [];
  onSpotTestMasterRow: Array<Array<SpotTestMaster>> = [];
  isDiseaseRequired: boolean = false;
  onSpotSampleList = [];
  constructor(
    private _fb: FormBuilder,
    public dialogRef: MatDialogRef<AddDiagnosticsComponent>,
    private treatmentService: AnimalTreatmentService,
    private translatePipe: TranslatePipe,
    @Inject(MAT_DIALOG_DATA)
    public data: DialogData,
    private healthService: HealthService
  ) { }

  ngOnInit(): void {
    this.getMasterData();
    this.diagnosticsForm = this._fb.group({
      onSpotTesting: [
        (this.data.isSpotUpdate || this.data.isDraft) &&
          this.data.spotData?.length
          ? 'yes'
          : 'no',
      ],
      sampleforLabTesting: [
        (this.data.isSpotUpdate || this.data.isDraft) &&
          this.data.sampleData?.length
          ? 'yes'
          : 'no',
      ],
      spotTestingRows: this._fb.array([]),
      sampleExaminationDetails: this._fb.array([]),
      diagnosticsData: this._fb.array([]),
    });

    this.diagnosticsForm
      ?.get('onSpotTesting')
      ?.valueChanges.subscribe((res: any) => {
        let spotTesting = this.diagnosticsForm.get(
          'spotTestingRows'
        ) as FormArray;
        if (res == 'no') {
          spotTesting.clear();
          if (spotTesting['controls'].length) {
            spotTesting['controls'].forEach((control, index) => {
              control.get('diseaseSuspected')?.clearValidators();
              control.get('diseaseSuspected')?.updateValueAndValidity();
            });
          }
        } else {
          if (spotTesting['controls'].length) {
            spotTesting['controls'].forEach((control, index) => {
              control
                .get('diseaseSuspected')
                ?.setValidators([Validators.required]);
              control.get('diseaseSuspected')?.updateValueAndValidity();
            });
          } else {
            this.spotTestingData = ELEMENT_DATA_spotTesting;
            this.spotTestingData.forEach((d: SpotTestingRow) =>
              this.addSpotTestingRow(d, false)
            );
            this.updateSpotTestingView();
          }
        }
      });

    if (
      moment(this.minDate).isAfter(moment(this.data.animal.registrationDate))
    ) {
      this.minSampleDate = new Date(this.minDate);
    } else {
      this.minSampleDate = new Date(this.data.animal.registrationDate);
    }
  }

  subscribeTospotTestingRowsChange(
    control,
    index,
    element,
    event?: MatSelectChange,
    isUpdate = false
  ) {
    const spotTestingRows = this.diagnosticsForm.get(
      'spotTestingRows'
    ) as FormArray;

    switch (control) {
      case 'diseaseSuspected':
        spotTestingRows.at(index).patchValue({
          onSpotTestCd: '',
          sampleType: '',
          initialReading: '',
          finalReading: '',
          difference: '',
          sampleResult: '',
        });

        this.onSpotTestMasterRow[index] = this.onSpotTestMaster.filter(
          ({ diseaseCd }) => diseaseCd == event.value
        );

        this.disableReadings(event, element, index);
        break;
      case 'onSpotTestCd':
        const diseaseSuspected = (
          this.spotTestingRows.at(index) as FormGroup
        ).get('diseaseSuspected');
        if (event.value != 10) {
          diseaseSuspected.addValidators([Validators.required]);
          diseaseSuspected.enable();
        } else {
          diseaseSuspected.disable();
          diseaseSuspected.clearValidators();
        }
        diseaseSuspected.updateValueAndValidity({ emitEvent: false });
        if (!isUpdate) {
          spotTestingRows.at(index).patchValue({
            sampleType: '',
            initialReading: '',
            finalReading: '',
            difference: '',
            sampleResult: '',
          });
        }
        for (let control of this.spotTestingRows.controls) {
          if (control.get('diseaseSuspected').errors?.required) {
            this.isDiseaseRequired = true;
            //return; // This control is required
          } else {
            this.isDiseaseRequired = false;
          }
        }
        this.onSpotSampleList[index] = this.onSpotTestMaster.filter(
          (spot) => spot.onSpotTestCd == event.value
        );
        //this.disableOnSpotChanged(event, element, index);
        break;
      case 'sampleType':
        spotTestingRows.at(index).patchValue({
          initialReading: '',
          finalReading: '',
          difference: '',
          sampleResult: '',
        });
        break;
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
    const result = +finalControl?.value - +initialControl?.value;
    diffControl?.patchValue(result.toFixed(2));
  }

  disableOnSpotChanged(event: any, element: any, index: number) {
    let spotTesting = this.diagnosticsForm.get('spotTestingRows') as FormArray;
    if (
      element.value.diseaseSuspected == 207 ||
      element.value.diseaseSuspected == 208
    ) {
      if (!event || (event.value != 1 && event.value != 2)) {
        const currentDate = new Date(sessionStorage.getItem('serverCurrentDateTime'));
        const tDate = this.data.treatmentDate;
        if (tDate) {
          const diffdate = this.treatmentService.getDifferenceDate(
            currentDate,
            tDate
          );
          if (diffdate < 3) {
            spotTesting.controls[index].get('initialReading')?.disable();
            spotTesting.controls[index].get('finalReading')?.disable();
            spotTesting.controls[index].get('difference')?.disable();
            spotTesting.controls[index].get('sampleResult')?.disable();
          } else {
            spotTesting.controls[index].get('initialReading')?.enable();
            spotTesting.controls[index].get('finalReading')?.enable();
            spotTesting.controls[index].get('difference')?.enable();
            spotTesting.controls[index].get('sampleResult')?.enable();
          }
        }
      } else {
        spotTesting.controls[index].get('initialReading')?.disable();
        spotTesting.controls[index].get('finalReading')?.disable();
        spotTesting.controls[index].get('difference')?.disable();
        spotTesting.controls[index].get('sampleResult')?.disable();
      }
    }
  }

  disableReadings(event: any, element: any, index: number) {
    //if (!element) this.subscribeTospotTestingRowsChange('onSpotTestCd', index);
    let spotTesting = this.diagnosticsForm.get('spotTestingRows') as FormArray;
    if (!event || event.value == 207 || event.value == 208) {
      spotTesting.controls[index].get('initialReading')?.enable();
      const currentDate = new Date(sessionStorage.getItem('serverCurrentDateTime'));
      const tDate = this.data.treatmentDate;
      if (tDate) {
        const diffdate = this.treatmentService.getDifferenceDate(
          currentDate,
          tDate
        );
        if (diffdate > 3) {
          spotTesting.controls[index].get('finalReading')?.enable();
          spotTesting.controls[index].get('difference')?.enable();
          spotTesting.controls[index].get('sampleResult')?.enable();
        } else {
          spotTesting.controls[index].get('finalReading')?.disable();
          spotTesting.controls[index].get('difference')?.disable();
          spotTesting.controls[index].get('sampleResult')?.disable();
        }
      } else {
        spotTesting.controls[index].get('finalReading')?.disable();
        spotTesting.controls[index].get('difference')?.disable();
        spotTesting.controls[index].get('sampleResult')?.disable();
      }
    } else {
      spotTesting.controls[index].get('initialReading')?.disable();
      spotTesting.controls[index].get('finalReading')?.disable();
      spotTesting.controls[index].get('difference')?.disable();
      spotTesting.controls[index].get('sampleResult')?.enable();
    }
    if (
      !event ||
      event.value == 207 ||
      event.value == 208 ||
      event.value == 362
    ) {
      spotTesting.controls[index].get('sampleType')?.disable();
    } else {
      spotTesting.controls[index].get('sampleType')?.enable();
    }
  }

  getMasterData() {
    const sampleTypeRequest = this.treatmentService.getSampleTypeMaster([
      'A',
      'B',
      'D',
      'O',
    ]);

    const radiologyreportRequest = this.healthService.getCommonMaster(
      AnimalHealthConfig.commonMasterKeys.radiologyReportType
    );
    const diseaseRequest = this.treatmentService.getDiseasesMaster();

    const getOnSpotDiseaseSuspectedRequest =
      this.treatmentService.getOnSpotDiseaseSuspected();
    const getOnSpotTestMasterRequest =
      this.treatmentService.getOnSpotTestMaster();
    forkJoin([
      sampleTypeRequest,
      radiologyreportRequest,
      diseaseRequest,
      getOnSpotDiseaseSuspectedRequest,
      getOnSpotTestMasterRequest,
    ]).subscribe(
      ([res1, res2, res3, res5, res6]) => {
        this.sampleTypeMaster = res1;
        this.radiologyreportData = res2;
        this.diseaseMaster = res3;

        this.onSpotDiseaseSuspected = res5;
        this.onSpotTestMaster = res6;
        if (this.data.isSpotUpdate || this.data.isDraft) {
          this.spotTestingData = this.data.spotData;
          if (this.spotTestingData?.length) {
            this.spotTestingData.forEach((d: SpotTestingRow) =>
              this.addSpotTestingRow(d, true)
            );
            this.updateSpotTestingView();
          }
        }
        this.addSelectedRadioData(res2);
      },
      (err) => { }
    );
  }

  get radioFormArray() {
    return this.diagnosticsForm.controls.diagnosticsData as FormArray;
  }

  addSelectedRadioData(radiologyreportData: any) {
    radiologyreportData?.forEach((d) => {
      if (this.data?.radiologyData?.find((a: any) => a.cd == d.cd)) {
        this.radioFormArray.push(
          new FormControl({ value: true, disabled: this.data.isSpotUpdate })
        );
      } else {
        this.radioFormArray.push(
          new FormControl({ value: false, disabled: this.data.isSpotUpdate })
        );
      }
    });
  }

  updateSpotTestingView() {
    this.dataSource.next(this.spotTestingRows.controls);
  }

  addSpotTestingRow(d?: any, noUpdate?: boolean) {
    this.onSpotTestMasterRow.push(this.onSpotTestMaster);
    const row = this._fb.group({
      sampleId: [d && d.sampleId ? d.sampleId : null],
      diseaseSuspected: [d && d.diseaseCd ? d.diseaseCd : null],
      onSpotTestCd: [
        d && d.onSpotTestCd ? d.onSpotTestCd : null,
        [Validators.required],
      ],
      sampleType: [d && d.sampleType ? d.sampleType : null, []],
      initialReading: [
        d && d.initialSampleResultValue ? d.initialSampleResultValue : null,
        [decimalWithLengthValidation(7, 2)],
      ],
      finalReading: [
        d && d.finalSampleResultValue ? d.finalSampleResultValue : null,
        [decimalWithLengthValidation(7, 2)],
      ],
      difference: [
        d && d.difference ? d.difference : null,
        [decimalWithLengthValidation(7, 2)],
      ],
      sampleResult: [d && d.sampleResult ? d.sampleResult : null, []],
      isUpdate: [noUpdate],
      samplingStatus: [1],
    });
    this.spotTestingRows.push(row);
    this.updateSpotTestingView();
    if ((this.data.isDraft || this.data.isSpotUpdate) && d) {
      const val = row.get('onSpotTestCd')?.value;

      this.subscribeTospotTestingRowsChange(
        'onSpotTestCd',
        this.spotTestingRows.length - 1,
        {},
        new MatSelectChange({} as any, val),
        true
      );
    }
    if (!this.data.isDraft && noUpdate) {
      row.disable();
      return;
    }
    if (!this.data.isDraft && this.data.isSpotUpdate && d) {
      this.disableReadings(
        { value: d.onSpotTestCd },
        this.data.isSpotUpdate,
        this.spotTestingRows.length - 1
      );
    }
    if (!this.data.isDraft && this.data.isSpotUpdate && d) {
      this.disableReadings(
        { value: d.onSpotTestCd },
        this.data.isSpotUpdate,
        this.spotTestingRows.length - 1
      );
    }
  }

  removeSpotTestingElement(index: number) {
    if (this.spotTestingRows.controls.length > 1) {
      this.spotTestingRows.removeAt(index);
      this.updateSpotTestingView();
    } else {
      this.spotTestingRows.at(0).reset();
    }
    this.onSpotTestMasterRow.splice(index, 1);
    this.onSpotSampleList.splice(index, 1);
  }

  saveDiagnosticsData() {
    this.spotTestingRows.markAllAsTouched();
    this.diagnosticsForm.markAllAsTouched();
    if (
      this.spotTestingRows.invalid ||
      this.diagnosticsForm.controls.samples?.invalid
    ) {
      return;
    }
    const diagnosticsData = this.diagnosticsForm.getRawValue();

    diagnosticsData.samples?.length &&
      diagnosticsData.samples?.forEach((sample, i) => {
        diagnosticsData.samples[i]['sampleTypeName'] =
          this.sampleTypeMaster.find(
            (a: SampleType) => a.sampleTypeCd == sample.sampleType
          )?.sampleTypeDesc;
      });

    diagnosticsData.spotTestingRows.length &&
      diagnosticsData.spotTestingRows?.forEach((labCd: any, index: number) => {
        labCd['diseaseSuspectedName'] = this.onSpotDiseaseSuspected.find(
          (disease) => disease.diseaseCd == labCd['diseaseSuspected']
        )?.diseaseDesc;
        labCd['onSpotTestCdName'] = this.onSpotTestMaster.find(
          (a: any) => a.onSpotTestCd === labCd.onSpotTestCd
        )?.onSpotTestDesc;
        labCd['sampleTypeName'] = this.sampleTypeMaster.find(
          (a: SampleType) => a.sampleTypeCd === labCd.sampleType
        )?.sampleTypeDesc;
        labCd['sampleResultDesc'] =
          labCd['sampleResult'] == 1
            ? 'Positive'
            : labCd['sampleResult'] == 2
              ? 'Negative'
              : '';

        if (
          (labCd.onSpotTestCd === 3 || labCd.onSpotTestCd === 4) &&
          labCd.initialSampleResultValue &&
          labCd.finalSampleResultValue &&
          labCd.difference &&
          labCd.sampleResult
        ) {
          labCd.samplingStatus = 2;
        } else if (labCd.sampleResult) {
          labCd.samplingStatus = 2;
        }
      });

    diagnosticsData.diagnosticsDataDetails = [];
    diagnosticsData.diagnosticsData?.forEach((d: boolean, index: number) => {
      if (d)
        diagnosticsData.diagnosticsDataDetails.push(
          this.radiologyreportData[index]
        );
    });

    this.dialogRef.close(diagnosticsData);
  }

  get spotTestingRows() {
    return this.diagnosticsForm.get('spotTestingRows') as FormArray;
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  getSubType(event: any, formIndex: number) {
    this.sampleSubExamTypeMaster[formIndex] = [];
    const request = {
      sampleExaminationTypeCd: event.value,
    };
    this.treatmentService
      .getSubExaminationTypeMaster(request)
      .subscribe((res: any) => {
        if (this.healthService.isErrorResponse(res)) {
          return;
        }

        this.sampleSubExamTypeMaster[formIndex] = res;
      });
  }

  get today() {
    return moment(sessionStorage.getItem('serverCurrentDateTime')).format('YYYY-MM-DD');
  }

  get minDate() {
    return this.data.treatmentDate
      ? moment(this.data.treatmentDate).format('YYYY-MM-DD')
      : moment(sessionStorage.getItem('serverCurrentDateTime'))
        .subtract(AnimalHealthConfig.treatmentMinDate, 'days')
        .format('YYYY-MM-DD');
  }
}

const ELEMENT_DATA_spotTesting: SpotTestingRow[] = [
  {
    diseaseSuspected: '',
    onSpotTestCd: '',
    sampleType: '',
    initialReading: '',
    finalReading: '',
    difference: '',
    sampleResult: '',
    samplingStatus: 1,
  },
];

const ELEMENT_DATA_LabTesting: LabTestingRow[] = [
  {
    diseaseCd: '',
    sampleType: '',
    sampleExaminationTypeCd: '',
    sampleExaminationSubtypeCd: '',
    labCd: '',
    labCharges: '',
    receiptNo: '',
    testRemarks: '',
    modeOfTransport: '',
  },
];

interface DialogData {
  spotData: any[];
  sampleData: any;
  radiologyData: any[];
  isSpotUpdate: boolean;
  animal: AnimalDetails;
  treatmentDate: Date;
  diseasesSuspected: Disease[];
  isDraft: boolean;
}
