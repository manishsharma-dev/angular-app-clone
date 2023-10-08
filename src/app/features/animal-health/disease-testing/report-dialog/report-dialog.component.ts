import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { AnimalDetailService } from 'src/app/features/animal-management/animal-registration/animal-details/animal-detail.service';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { AnimalTreatmentService } from '../../animal-treatment/animal-treatment.service';
import { SampleLocation } from '../../animal-treatment/models/enums/sample.enum';
import { TreatmentHistory } from '../../animal-treatment/models/treatment-history.model';
import { UpdateResultsComponent } from '../../animal-treatment/update-results/update-results.component';
import { HealthService } from '../../health.service';
import { VaccinationService } from '../../vaccination/vaccination.service';
import { PreviousDiseaseTestModel } from '../previous-testing-results/previous-testing-results.component';

@Component({
  selector: 'app-report-dialog',
  templateUrl: './report-dialog.component.html',
  styleUrls: ['./report-dialog.component.css']
})
export class ReportDialogComponent implements OnInit {
  validationMsg = animalHealthValidations.updateResults;
  activeTab = 'on_spot';
  onSpotTestingForm!: FormGroup;
  labTestingForm!: FormGroup;
  diagnosticForm!: FormGroup;
  labTestingResultFile!: File;
  radiographyResultFile!: File;
  sonographyResultFile!: File;
  radiologyMaster = [];
  diagnosticsForm!: FormGroup;
  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  dataSourceLab = new BehaviorSubject<AbstractControl[]>([]);
  sampleTypeMaster: any[] = [];
  sampleExamTypeMaster: any[] = [];
  sampleSubExamTypeMaster: any[][] = [];
  radiologyreportData = [];
  diseaseMaster: any[] = [];
  labMaster: any[] = [];
  spotData = [];
  sampleData = [];
  samplingStatus = [];
  onSpotTestCdMaster = [];
  animal: any;
  constructor(
    private dialogRef: MatDialogRef<UpdateResultsComponent>,
    private _treatmentService: AnimalTreatmentService,
    private _fb: FormBuilder,
    private treatmentService: AnimalTreatmentService,
    private healthService: HealthService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _vaccinationService: VaccinationService,
    private animalMgmtService: AnimalDetailService
  ) { }

  ngOnInit(): void {
    this.animalMgmtService.getAnimalDetails(this.data.animalTagId)
      .subscribe((res) => {
        this.animal = res;
      });
    this.diagnosticsForm = this._fb.group({
      labTestingDetails: this._fb.array([])
    })
    this.diagnosticsForm = this._fb.group({
      spotTestingRows: this._fb.array([]),
    });
    this.spotData = [this.data.data] ?? [];
    this.spotData.forEach((d: any) => this.addSpotTestingRow(d, false));
    if (
      this.spotData.length &&
      this.spotData.some((a) => a.samplingStatus == 1)
    )
      this.activeTab = 'on_spot';
  }



  get spotTestingRows() {
    return this.diagnosticsForm.get('spotTestingRows') as FormArray;
  }

  addSpotTestingRow(d?: any, noUpdate?: boolean) {
    //this.items = this.orderForm.get('items') as FormArray;
    const row = this._fb.group({
      sourceOriginId: [d.sourceOriginId],
      sourceOriginCd: [d.sourceOriginCd],
      testingLocation: [d && d.testingLocation ? d.testingLocation : null, []],
      samplingStatus: [d && d.samplingStatus ? d.samplingStatus : null, []],
      createdBy: [d && d.createdBy ? d.createdBy : null, []],
      sampleCollectionDate: [
        d && d.sampleCollectionDate ? d.sampleCollectionDate : null,
        [],
      ],
      modifiedBy: [AnimalHealthConfig.userId],
      modifiedDate: [moment().format('YYYY-MM-DD')],
      followUpNo: [d.followUpNo, []],
      diseaseCd: [d && d.diseaseCd ? d.diseaseCd : null, [Validators.required]],
      sampleId: [d && d.sampleId ? d.sampleId : null, []],
      diseaseCdName: [
        d && d.diseaseCdDesc
          ? d.diseaseCdDesc
          : null,
        [],
      ],
      onSpotTestCd: [d && d.onSpotTestCd ? d.onSpotTestCd : null, []],
      onSpotTestDesc: [d && d.onSpotTestDesc ? d.onSpotTestDesc : null, []],
      sampleType: [d && d.sampleType ? d.sampleType : null, []],
      sampleTypeDesc: [d && d.sampleTypeDesc ? d.sampleTypeDesc : null, []],
      initialSampleResultValue: [
        d && d.initialSampleResultValue ? d.initialSampleResultValue : null,
        [Validators.maxLength(3)],
      ],
      finalSampleResultValue: [
        d && d.finalSampleResultValue ? d.finalSampleResultValue : null,
        [Validators.maxLength(3)],
      ],
      difference: [
        d && d.initialSampleResultValue && d.finalSampleResultValue
          ? d.initialSampleResultValue - d.finalSampleResultValue
          : null,
        [Validators.maxLength(3)],
      ],
      sampleResult: [
        d && d.sampleResult ? d.sampleResult.toString() : null,
        [],
      ],

    });
    this.spotTestingRows.push(row);
    this.disableReadings(d.onSpotTestCd, this.spotTestingRows.length - 1);
  }

  disableReadings(event: any, index: number) {
    let spotTesting = this.diagnosticsForm.get('spotTestingRows') as FormArray;

    if (!event || event == 3 || event == 4) {
      if (spotTesting.at(index).value.initialSampleResultValue != null) {
        spotTesting.controls[index].get('initialSampleResultValue')?.disable();
      }
      const currentDate = new Date(sessionStorage.getItem('serverCurrentDateTime'));
      const tDate = this.data.data.sampleCollectionDate;
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
      diffControl?.patchValue(null);
      return;
    }
    const result = +finalControl?.value - +initialControl?.value;
    diffControl?.patchValue(result);
  }



  saveTab() {
    this.updateActiveTab();
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  updateActiveTab() {
    this.saveDiagnosticsData();
  }

  saveDiagnosticsData() {
    let onSpotRequestDtos = [];
    let sampleRequest = {};
    let diagnosticsRequest = [];
    let sampleData = this.diagnosticsForm;
    for (let req of this.diagnosticsForm.value['spotTestingRows']) {
      onSpotRequestDtos.push(req);
    }

    onSpotRequestDtos.length &&
      onSpotRequestDtos.forEach((element, index) => {
        if (element.testingLocation == SampleLocation.onSpot) {
          if (
            (element.onSpotTestCd === 3 || element.onSpotTestCd === 4) &&
            element.initialSampleResultValue &&
            element.finalSampleResultValue &&
            element.difference &&
            element.sampleResult
          ) {
            element.samplingStatus = 2;
          } else if (element.sampleResult) {
            element.samplingStatus = 2;
          }
        }
      });
    sampleRequest['followUpNo'] = 0;
    sampleRequest["sampleCollectedDate"] = onSpotRequestDtos.length ? onSpotRequestDtos[0].sampleCollectionDate : null;
    sampleRequest["sourceOriginCd"] = onSpotRequestDtos.length ? onSpotRequestDtos[0].sourceOriginCd : null;
    sampleRequest["sourceOriginId"] = onSpotRequestDtos.length ? onSpotRequestDtos[0].sourceOriginId : null;
    sampleRequest['saveSampleRequestDtos'] = [
      {
        "animalId": this.animal.animalId,
        "ownerId": this.animal.ownerId,
        "tagId": this.animal?.tagId,
        "labTestingRequestDtos": [],
        "onSpotRequestDtos": onSpotRequestDtos
      }
    ]

    const requestSample = this._treatmentService.saveSampleData(sampleRequest);

    forkJoin([requestSample]).subscribe(
      ([res1]: any) => {
        this.dialogRef.close(true);
      }
    );
  }

  get today() {
    const dateObj = new Date(sessionStorage.getItem('serverCurrentDateTime'));

    const date = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();

    const dateString =
      year +
      '-' +
      (month < 10 ? `0${month}` : month) +
      '-' +
      (date < 10 ? `0${date}` : date);

    return dateString;
  }

  formatDate(d: any) {
    return moment(d).format('DD/MM/YYYY');
  }

  get getSpotTestingFormArray() {
    return this.diagnosticsForm.get('spotTestingRows') as FormArray;
  }

  isSpotTestingShow(spotData) {
    return spotData.length && spotData.some((a) => a.samplingStatus == 1);
  }

}
