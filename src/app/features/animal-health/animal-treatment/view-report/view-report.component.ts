import { Component, Inject, OnInit } from '@angular/core';
import {
  FormGroup,
  AbstractControl,
  FormBuilder,
  FormArray,
  Validators,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import FileSaver from 'file-saver';
import moment from 'moment';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { getSessionData } from 'src/app/shared/shareService/storageData';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { HealthService } from '../../health.service';
import { VaccinationService } from '../../vaccination/vaccination.service';
import { AnimalTreatmentService } from '../animal-treatment.service';
import { SampleLocation } from '../models/enums/sample.enum';
import { TreatmentHistory } from '../models/treatment-history.model';
import { UpdateResultsComponent } from '../update-results/update-results.component';

@Component({
  selector: 'app-view-report',
  templateUrl: './view-report.component.html',
  styleUrls: ['./view-report.component.css'],
  providers: [TranslatePipe],
})
export class ViewReportComponent implements OnInit {
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
  constructor(
    private dialogRef: MatDialogRef<UpdateResultsComponent>,
    private _treatmentService: AnimalTreatmentService,
    private _fb: FormBuilder,
    private treatmentService: AnimalTreatmentService,
    private healthService: HealthService,
    private translatePipe: TranslatePipe,
    @Inject(MAT_DIALOG_DATA) public data: TreatmentHistory,
    private _vaccinationService: VaccinationService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getMasterData();
    this.healthService
      .getCommonMaster(AnimalHealthConfig.commonMasterKeys.radiologyReportType)
      .subscribe((res: any) => {
        this.radiologyMaster = res;
      });
    this.diagnosticsForm = this._fb.group({
      spotTestingRows: this._fb.array([]),
      labTestingRows: this._fb.array([]),
      diagnosticsData: this._fb.array([]),
    });
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
    //const labRequest = this.healthService.getLabMaster();
    const samplingStatus = this.healthService.getCommonMaster(
      AnimalHealthConfig.commonMasterKeys.samplingStatus
    );
    forkJoin([
      sampleTypeRequest,
      radiologyreportRequest,
      diseaseRequest,
      samplingStatus,
    ]).subscribe(
      ([res1, res3, res5, res6]: any) => {
        this.sampleTypeMaster = res1;
        this.radiologyreportData = res3;
        this.labMaster = res5;
        this.samplingStatus = res6;
        this.spotData = this.data.sampleDetails?.onSpotDetails ?? [];
        this.sampleData = this.data.sampleDetails?.labTestingDetails ?? [];

        this.spotData.forEach((d: any) => this.addSpotTestingRow(d, false));
        this.sampleData.forEach((d: any, index: number): any => {
          this.addLabTestingRow(d, index);
          // const request = {
          //   sampleExaminationTypeCd: d.sampleExaminationTypeCd,
          // };
          // this.treatmentService
          //   .getSubExaminationTypeMaster(request)
          //   .subscribe((res: any) => {
          //     this.sampleSubExamTypeMaster[index] = res;
          //     this.addLabTestingRow(d, index);
          //   });
        });
        this.data.radiologyDetails.length &&
          this.data.radiologyDetails.forEach((element: any, index: any) => {
            this.adddiagnosticsRow(element, index);
          });
        //this.addSelectedRadioData();
        if (
          this.spotData.length &&
          this.spotData.some((a) => a.samplingStatus == 2)
        )
          this.activeTab = 'on_spot';
        else if (this.sampleData.length) this.activeTab = 'lab';
        else if (
          this.data.radiologyDetails.length &&
          this.data.radiologyDetails.some((a) => a.testImageUrl1)
        )
          this.activeTab = 'diagnostics';
      },
      (err) => { }
    );
  }

  // addSelectedRadioData() {
  //   this.radiologyreportData.forEach((d) => {
  //     this.radioFormArray.push(new FormControl(false));
  //   });
  // }

  get radioFormArray() {
    return this.diagnosticsForm.controls.diagnosticsData as FormArray;
  }

  get spotTestingRows() {
    return this.diagnosticsForm.get('spotTestingRows') as FormArray;
  }

  addSpotTestingRow(d?: any, noUpdate?: boolean) {
    //this.items = this.orderForm.get('items') as FormArray;
    const row = this._fb.group({
      sourceOriginId: [this.data.treatmentDetails.caseId],
      sourceOriginCd: [
        getSessionData('subModuleCd')?.subModuleCd
          ? getSessionData('subModuleCd')?.subModuleCd.toString()
          : '',
      ],
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
      diseaseCdName: [d && d.diseaseDesc ? d.diseaseDesc : null, []],
      onSpotTestCd: [d && d.onSpotTestCd ? d.onSpotTestCd : null, []],
      onSpotTestDesc: [d && d.onSpotTestDesc ? d.onSpotTestDesc : null, []],
      sampleType: [d && d.sampleType ? d.sampleType : null, []],
      sampleTypeDesc: [d && d.sampleTypeDesc ? d.sampleTypeDesc : null, []],
      initialSampleResultValue: [
        d && d.initialSampleResultValue ? d.initialSampleResultValue : null,
        [],
      ],
      finalSampleResultValue: [
        d && d.finalSampleResultValue ? d.finalSampleResultValue : null,
        [],
      ],
      difference: [
        d && d.initialSampleResultValue && d.finalSampleResultValue
          ? d.initialSampleResultValue - d.finalSampleResultValue
          : null,
        [],
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
    spotTesting.controls[index].get('initialSampleResultValue')?.disable();
    spotTesting.controls[index].get('finalSampleResultValue')?.disable();
    spotTesting.controls[index].get('difference')?.disable();
    spotTesting.controls[index].get('sampleResult')?.disable();
  }

  get labTestingRows() {
    return this.diagnosticsForm.get('labTestingRows') as FormArray;
  }

  addLabTestingRow(d: any, index: number) {
    const row = this._fb.group({
      diseaseCdDesc: [d && d.diseaseCdDesc ? d.diseaseCdDesc : null],
      sourceOriginId: [this.data.treatmentDetails.caseId],
      sourceOriginCd: [
        getSessionData('subModuleCd')?.subModuleCd
          ? getSessionData('subModuleCd')?.subModuleCd.toString()
          : '',
      ],
      samplingStatus: [d && d.samplingStatus ? d.samplingStatus : null, []],
      testingLocation: [d && d.testingLocation ? d.testingLocation : null, []],
      createdBy: [d && d.createdBy ? d.createdBy : null, []],
      creationDate: [d && d.creationDate ? d.creationDate : null, []],
      modifiedBy: [AnimalHealthConfig.userId],
      followUpNo: [d.followUpNo, []],
      modifiedDate: [moment().format('YYYY-MM-DD')],
      sampleCollectionDate: [
        d && d.sampleCollectionDate ? d.sampleCollectionDate : null,
        [],
      ],
      sampleId: [d && d.sampleId ? d.sampleId : null, []],
      sampleType: [d && d.sampleType ? d.sampleType : null, []],
      sampleTypeName: [
        d && d.sampleType
          ? this.sampleTypeMaster.find((a) => a.sampleTypeCd == d.sampleType)
            ?.sampleTypeDesc
          : null,
        [],
      ],
      typeOfExamName: [
        d && d.sampleExaminationTypeCd
          ? this.sampleExamTypeMaster.find(
            (a: any) => a.sampleExaminationTypeCd == d.sampleExaminationTypeCd
          )?.sampleExaminationTypeDesc
          : null,
        [],
      ],
      sampleExaminationDetails: this._fb.array(
        this.createSampleExaminationDetails(d.sampleExaminationDetails)
      ),
      sampleExaminationTypeCd: [
        d && d.sampleExaminationTypeCd ? d.sampleExaminationTypeCd : null,
        [],
      ],
      sampleExaminationSubtypeCd: [
        d && d.sampleExaminationSubtypeCd ? d.sampleExaminationSubtypeCd : null,
        [],
      ],
      examsubTypeName: [
        d && d.sampleExaminationSubtypeCd
          ? this.sampleSubExamTypeMaster[index].find(
            (a: any) =>
              a.sampleExaminationSubtypeCd == d.sampleExaminationSubtypeCd
          )?.sampleExaminationSubtypeDesc
          : null,
        [],
      ],
      labCd: [d && d.labCd ? d.labCd : null, []],
      labName: [d && d.labCdDesc ? d.labCdDesc : null, []],
      labCharges: [d && d.labCharges ? d.labCharges : null, []],
      receiptno: [d && d.receiptno ? d.receiptno : null, []],
      modeOfTransport: [d && d.modeOfTransport ? d.modeOfTransport : null, []],
      testImageUrl1: [d && d.testImageUrl1 ? d.testImageUrl1 : null, []],
      testImageUrl2: [d && d.testImageUrl2 ? d.testImageUrl2 : null, []],
      testRemarks: [
        { value: d && d.testRemarks ? d.testRemarks : null, disabled: true },
        [],
      ],
    });
    this.labTestingRows.push(row);
  }

  createSampleExaminationDetails(sample) {
    let sampleArray = [];
    sample.length &&
      sample.forEach((element) => {
        const sampleForm = this._fb.group({
          diseaseDesc: [element.diseaseDesc],
          finalSampleResultValue: [element.finalSampleResultValue],
          labCd: [element.labCd],
          labName: [element.labCdDesc],
          labCharges: [element.labCharges],
          modeOfTransport: [element.modeOfTransport],
          modeOfTransportDesc: [element.modeOfTransportDesc],
          receiptNo: [element.receiptNo],
          sampleCollectionDate: [element.sampleCollectionDate],
          sampleExaminationSubtypeCdDesc: [
            element.sampleExaminationSubtypeCdDesc,
          ],
          sampleExaminationTypeCdDesc: [element.sampleExaminationTypeCdDesc],
          sampleResultDesc: [element.sampleResultDesc],
        });
        sampleArray.push(sampleForm);
      });

    return sampleArray;
  }

  get diagnosticsRows() {
    return this.diagnosticsForm.get('diagnosticsData') as FormArray;
  }

  adddiagnosticsRow(d?: any, noUpdate?: boolean) {
    //this.items = this.orderForm.get('items') as FormArray;
    const row = this._fb.group({
      caseId: [this.data.treatmentDetails.caseId, [Validators.required]],
      createdBy: [d && d.createdBy ? d.createdBy : null, []],
      creationDate: [d && d.creationDate ? d.creationDate : null, []],
      modifiedBy: [AnimalHealthConfig.userId],
      modifiedDate: [moment().format('YYYY-MM-DD')],
      followUpNo: [this.data.treatmentDetails.followUpNo, []],
      radiologyReportTypeFlag: [d && d.radiologyReportType ? true : null, []],
      radiologyReportType: [
        d && d.radiologyReportType ? d.radiologyReportType : null,
        [],
      ],
      radiologyReportTypeName: [
        d && d.radiologyReportTypeDesc ? d.radiologyReportTypeDesc : null,
      ],
      radiologyReportDate: [
        d && d.radiologyReportDate ? d.radiologyReportDate : null,
        [],
      ],
      reportObservationsRemarks: [
        {
          value:
            d && d.reportObservationsRemarks
              ? d.reportObservationsRemarks
              : null,
          disabled: true,
        },
        [],
      ],
      samplingStatus: this.samplingStatus[0].cd,
      runSeqNo: [d && d.runSeqNo ? d.runSeqNo : null, []],
      testImageUrl1: [d && d.testImageUrl1 ? d.testImageUrl1 : null, []],
      testImageUrl2: [d && d.testImageUrl2 ? d.testImageUrl2 : null, []],
    });
    this.diagnosticsRows.push(row);
  }

  saveTab() {
    this.updateActiveTab();
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  updateActiveTab() {
    switch (this.activeTab) {
      case 'on_spot':
        if (this.getLabTestingFormArray['controls'].length) {
          this.activeTab = 'lab';
        } else if (this.getDiagnosticsFormArray['controls'].length) {
          this.activeTab = 'diagnostics';
        } else {
          this.dialogRef.close();
        }
        //this.activeTab = this.getLabTestingFormArray['controls'].length ? 'lab' : 'diagnostics';
        break;
      case 'lab':
        if (this.getDiagnosticsFormArray['controls'].length) {
          this.activeTab = 'diagnostics';
        } else {
          this.dialogRef.close();
        }

        break;
      case 'diagnostics':
        this.dialogRef.close();
        //this.activeTab = 'on_spot';
        break;
    }
    //this.activeTab = 'on_spot';
  }

  downloadReport(fileKey: string) {
    const fd = new FormData();
    fd.append('fileKey', fileKey);
    const fileName = `report`;
    this.healthService.downloadFile(fd).subscribe((res: any) => {
      // this.isLoadingSpinner = false;
      const fileType = res.headers.get('Content-Type');
      let blob: any = new Blob([res.body], { type: fileType });
      const url = window.URL.createObjectURL(blob);

      FileSaver.saveAs(blob, fileName);
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translatePipe.transform('common.info_label'),
          icon: 'assets/images/info.svg',
          message: this.translatePipe.transform(
            'animalTreatmentSurgery.report_downloaded'
          ),
          primaryBtnText: this.translatePipe.transform('common.info_label'),
        },
        panelClass: 'common-info-dialog',
      });
    });
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

  get getSpotTestingFormArray() {
    return this.diagnosticsForm.get('spotTestingRows') as FormArray;
  }

  get getLabTestingFormArray() {
    return this.diagnosticsForm.get('labTestingRows') as FormArray;
  }

  get getDiagnosticsFormArray() {
    return this.diagnosticsForm.get('diagnosticsData') as FormArray;
  }

  isSpotTestingShow(spotData) {
    return spotData.length && spotData.some((a) => a.samplingStatus == 2);
  }

  isRadiologyShow(radiologyDetails) {
    return (
      radiologyDetails.length && radiologyDetails.some((a) => a.testImageUrl1)
    );
  }
}
