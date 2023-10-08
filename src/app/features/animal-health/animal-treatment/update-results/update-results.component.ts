import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { getSessionData } from 'src/app/shared/shareService/storageData';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { HealthService } from '../../health.service';
import { VaccinationService } from '../../vaccination/vaccination.service';

import { AnimalTreatmentService } from '../animal-treatment.service';
import { SampleLocation } from '../models/enums/sample.enum';
import { SampleDetail } from '../models/new-case-response.model';
import { TreatmentHistory } from '../models/treatment-history.model';

@Component({
  selector: 'app-update-results',
  templateUrl: './update-results.component.html',
  styleUrls: ['./update-results.component.css'],
})
export class UpdateResultsComponent implements OnInit {
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
  oldSpotData: any[] = [];
  oldSampleData: any[] = [];
  sampleData = [];
  samplingStatus = [];
  onSpotTestCdMaster = [];
  tempfileArray = [];
  constructor(
    private dialogRef: MatDialogRef<UpdateResultsComponent>,
    private _treatmentService: AnimalTreatmentService,
    private _fb: FormBuilder,
    private treatmentService: AnimalTreatmentService,
    private healthService: HealthService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _vaccinationService: VaccinationService
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
    const samplingStatus = this.healthService.getCommonMaster(
      AnimalHealthConfig.commonMasterKeys.samplingStatus
    );
    // const onSpotTestCdRequest = this.healthService.getCommonMaster(
    //   AnimalHealthConfig.commonMasterKeys.onSpotTestCd
    // );
    forkJoin([
      sampleTypeRequest,
      radiologyreportRequest,
      diseaseRequest,
      samplingStatus
    ]).subscribe(
      ([res1, res3, res4, res6]: any) => {
        this.sampleTypeMaster = res1;
        this.radiologyreportData = res3;
        this.diseaseMaster = res4;

        this.samplingStatus = res6;
        //this.onSpotTestCdMaster = res7;
        this.spotData = this.data.data.sampleDetails?.onSpotDetails ?? [];
        this.oldSpotData = this.spotData.map((spot: any) => spot);
        this.sampleData = this.data.data.sampleDetails?.labTestingDetails ?? [];
        this.oldSampleData = this.sampleData.map((spot: any) => spot);
        this.spotData.forEach((d: any) => this.addSpotTestingRow(d, false));
        this.sampleData.forEach((d: any, index: number): any => {
          const request = {
            sampleExaminationTypeCd: d.sampleExaminationTypeCd,
          };
          // this.treatmentService
          //   .getSubExaminationTypeMaster(request)
          //   .subscribe((res: any) => {
          //     this.sampleSubExamTypeMaster[index] = res;
          //     this.addLabTestingRow(d, index);
          //   });
        });
        this.data.data.radiologyDetails.length &&
          this.data.data.radiologyDetails.forEach((element: any, index: any) => {
            if (!element.testImageUrl1)
              this.adddiagnosticsRow(element, index);
          });
        //this.addSelectedRadioData();
        this.tempfileArray.length = this.data.data.radiologyDetails.length;
        if (
          this.spotData.length &&
          this.spotData.some((a) => a.samplingStatus == 1)
        )
          this.activeTab = 'on_spot';
        //else if (this.sampleData.length) this.activeTab = 'lab';
        else if (
          this.data.data.radiologyDetails.length &&
          this.data.data.radiologyDetails.some((a) => !a.testImageUrl1)
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
      sourceOriginId: [this.data.data.treatmentDetails.caseId],
      sourceOriginCd: [getSessionData('subModuleCd')?.subModuleCd
        ? getSessionData('subModuleCd')?.subModuleCd.toString()
        : ''],
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
        d && d.diseaseCd
          ? this.diseaseMaster.find((a: any) => a.diseaseCd == d.diseaseCd)
            ?.diseaseDesc
          : '',
        [],
      ],
      onSpotTestCd: [d && d.onSpotTestCd ? d.onSpotTestCd : '', []],
      onSpotTestDesc: [d && d.onSpotTestDesc ? d.onSpotTestDesc : '', []],
      sampleType: [d && d.sampleType ? d.sampleType : '', []],
      sampleTypeDesc: [d && d.sampleTypeDesc ? d.sampleTypeDesc : '', []],
      initialSampleResultValue: [
        d && d.initialSampleResultValue ? d.initialSampleResultValue : '',
        [],
      ],
      finalSampleResultValue: [
        d && d.finalSampleResultValue ? d.finalSampleResultValue : '',
        [],
      ],
      difference: [
        d && d.initialSampleResultValue && d.finalSampleResultValue
          ? d.initialSampleResultValue - d.finalSampleResultValue
          : '',
        [],
      ],
      sampleResult: [
        d && d.sampleResult ? d.sampleResult.toString() : '',
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
      const tDate = this.data.data.treatmentDetails.treatmentDate;
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

  get labTestingRows() {
    return this.diagnosticsForm.get('labTestingRows') as FormArray;
  }

  addLabTestingRow(d: any, index: number) {
    const row = this._fb.group({
      sourceOriginId: [this.data.data.treatmentDetails.caseId],
      sourceOriginCd: [getSessionData('subModuleCd')?.subModuleCd
        ? getSessionData('subModuleCd')?.subModuleCd.toString()
        : ''],
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
      labName: [
        d && d.labCd
          ? this.labMaster.find((a: any) => a.labCd == d.labCd)?.value
          : null,
        [],
      ],
      labCharges: [d && d.labCharges ? d.labCharges : null, []],
      receiptno: [d && d.receiptno ? d.receiptno : null, []],
      modeOfTransport: [d && d.modeOfTransport ? d.modeOfTransport : null, []],
      testImageUrl1: [d && d.testImageUrl1 ? d.testImageUrl1 : null, []],
      testImageUrl2: [d && d.testImageUrl2 ? d.testImageUrl2 : null, []],
      testRemarks: [d && d.testRemarks ? d.testRemarks : null, []],
    });
    this.labTestingRows.push(row);
  }

  get diagnosticsRows() {
    return this.diagnosticsForm.get('diagnosticsData') as FormArray;
  }

  adddiagnosticsRow(d?: any, noUpdate?: boolean) {
    //this.items = this.orderForm.get('items') as FormArray;
    const row = this._fb.group({
      caseId: [this.data.data.treatmentDetails.caseId, [Validators.required]],
      followUpNo: [this.data.data.treatmentDetails.followUpNo, []],
      radiologyReportTypeFlag: [d && d.radiologyReportType ? true : null, []],
      radiologyReportType: [
        d && d.radiologyReportType ? d.radiologyReportType : null,
        [],
      ],
      radiologyReportTypeName: [
        d && d.radiologyReportTypeDesc
          ? d.radiologyReportTypeDesc
          : null,
      ],
      radiologyReportDate: [
        d && d.radiologyReportDate ? d.radiologyReportDate : null,
        [],
      ],
      reportObservationsRemarks: [
        d && d.reportObservationsRemarks ? d.reportObservationsRemarks : null,
        [],
      ],
      samplingStatus: this.samplingStatus[0].cd,
      runSeqNo: [d && d.runSeqNo ? d.runSeqNo : null, []],
      testImageUrl1: [d && d.testImageUrl1 ? d.testImageUrl1 : null, []],
      testImageUrl2: [d && d.testImageUrl2 ? d.testImageUrl2 : null, []],
    });
    this.diagnosticsRows.push(row);
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

  onFileUpload(
    event: any,
    control: string,
    id: string,
    controlElement: AbstractControl
  ) {
    if ((event.target as HTMLInputElement).files?.length == 0) {
      return;
    }
    controlElement.markAsTouched();
    controlElement.markAsDirty();
    const file = event.target.files[0];
    switch (control) {
      case 'labTesting':
        var section = 'labTesting';
        break;
      default:
        section = 'diagnostics';
        const diagnostics =
          this.diagnosticsForm['controls']['diagnosticsData']['controls'];
        const tempDiagnostics = diagnostics.find((diag: any) => diag.value.radiologyReportType == id)?.value
        const labIndex = diagnostics.findIndex(
          (a) => a.value.radiologyReportType == id
        );
        //var file = element.files[0];
        const fileType = file.name.split('.')[1];
        var blob = file.slice(0, file.size, file['type']);
        let newFile = new File([blob], `${tempDiagnostics.caseId}${tempDiagnostics.followUpNo}${tempDiagnostics.runSeqNo}.${file.name.split('.')[1]}`, { type: file['type'] });
        this.tempfileArray[labIndex] = newFile;
        break;
    }
    //const fd = new FormData();

    // fd.append('file', file);
    // fd.append('id', id);
    // fd.append('moduleFilePath', 'uploadSampleImageTreatmentPath');
    // fd.append('uploadType', 'uploadSampleReport');
    // this.uploadFile(fd, section, id);
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
        if (
          this.getDiagnosticsFormArray['controls'].length &&
          this.getDiagnosticsFormArray['controls'].some(
            (sample) => !sample.value.testImageUrl1
          )
        ) {
          this.activeTab = 'diagnostics';
        } else {
          this.saveDiagnosticsData();
        }
        //this.activeTab = this.getLabTestingFormArray['controls'].length ? 'lab' : 'diagnostics';
        break;
      case 'lab':
        if (
          this.getDiagnosticsFormArray['controls'].length &&
          this.getDiagnosticsFormArray['controls'].some(
            (sample) => !sample.value.testImageUrl1
          )
        ) {
          this.activeTab = 'diagnostics';
        } else {
          this.saveDiagnosticsData();
        }
        break;
      case 'diagnostics':
        this.saveDiagnosticsData();
        //this.activeTab = 'on_spot';
        break;
    }
    //this.activeTab = 'on_spot';
  }

  saveDiagnosticsData() {
    var requestList = [];
    let sampleRequest = {
      onSpotRequestDtos: [],
      labTestingRequestDtos: [],
      followUpNo: this.data.data.treatmentDetails.followUpNo,
      sampleCollectedDate: this.data.data.treatmentDetails.treatmentDate,
      sourceOriginCd: getSessionData('subModuleCd')?.subModuleCd
        ? getSessionData('subModuleCd')?.subModuleCd.toString()
        : '',
      sourceOriginId: this.data.data.treatmentDetails.caseId,
    };
    let diagnosticsRequest = [];
    let sampleData = this.diagnosticsForm;

    this.diagnosticsForm.getRawValue()['spotTestingRows'].length && this.diagnosticsForm.getRawValue()['spotTestingRows'].forEach((req, index) => {
      if (this.oldSpotData[index]['initialSampleResultValue'] != req['initialSampleResultValue'] ||
        this.oldSpotData[index]['finalSampleResultValue'] != req['finalSampleResultValue'] ||
        (req['sampleResult'] != "" && this.oldSpotData[index]['sampleResult'] != req['sampleResult'])
      ) {
        sampleRequest.onSpotRequestDtos.push(req);
      }
    });
    // for (let req of this.diagnosticsForm.getRawValue()['spotTestingRows']) {
    //   sampleRequest.onSpotRequestDtos.push(req);
    // }
    for (let req of this.diagnosticsForm.getRawValue()['labTestingRows']) {
      sampleRequest.labTestingRequestDtos.push(req);
    }

    // for(let req of this.diagnosticsForm.value['diagnosticsData']){
    //   diagnosticsRequest.push(req)
    // }
    if (sampleRequest.onSpotRequestDtos.length) {
      sampleRequest['saveSampleRequestDtos'] = [
        {
          "animalId": this.data.animal.animalId,
          "ownerId": this.data.animal.ownerId,
          "tagId": this.data.animal.tagId,
          "labTestingRequestDtos": [],
          "onSpotRequestDtos": sampleRequest.onSpotRequestDtos
        }
      ]
    }

    sampleRequest.onSpotRequestDtos.length &&
      sampleRequest.onSpotRequestDtos.forEach((element, index) => {
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
    if (sampleRequest['labTestingRequestDtos'].length || sampleRequest['onSpotRequestDtos'].length)
      requestList.push(this._treatmentService.saveSampleData(sampleRequest))

    var radioRequest = new FormData();
    if (this.tempfileArray.length && !this.tempfileArray.every(a => !a)) {
      for (let image of this.tempfileArray) {
        if (image) {
          radioRequest.append('files', image);
        }
      }
      if (this.diagnosticsForm.value['diagnosticsData']) {
        radioRequest.append('jsonObject', JSON.stringify(this.diagnosticsForm.value['diagnosticsData']));
      }
      requestList.push(this._treatmentService.saveRadiologyDataT(
        radioRequest
      ))
    }
    delete sampleRequest.labTestingRequestDtos;
    delete sampleRequest.onSpotRequestDtos;
    if (!requestList.length) {
      this.healthService.handleError({
        title: 'Info',
        message: 'Please update values to update samples',
        primaryBtnText: 'Ok'
      })
      return;
    }
    forkJoin(requestList).subscribe(
      ([responseList]: any) => {
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

  uploadFile(obj: any, section: string, id?: string) {
    this._vaccinationService.uploadImage(obj).subscribe((res: any) => {
      switch (section) {
        case 'labTesting':
          const lab = this.diagnosticsForm['controls'][
            'labTestingRows'
          ] as FormArray;
          const index = lab['controls'].findIndex(
            (a: any) => a.value.sampleId == id
          );
          if (index == -1) return;
          lab.at(index).patchValue({
            testImageUrl1: res.file,
          });

          break;
        default:
          const diagnostics =
            this.diagnosticsForm['controls']['diagnosticsData']['controls'];
          const labIndex = diagnostics.findIndex(
            (a) => a.value.radiologyReportType == id
          );
          if (labIndex == -1) return;
          diagnostics.at(labIndex).patchValue({
            testImageUrl1: res.file,
          });
          break;
      }
    });
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

  testConsole(d) {
  }

  isSpotTestingShow(spotData) {
    return spotData.length && spotData.some((a) => a.samplingStatus == 1);
  }

  isRadiologyShow(radiologyDetails) {
    return (
      radiologyDetails.length && radiologyDetails.some((a) => !a.testImageUrl1)
    );
  }
}
