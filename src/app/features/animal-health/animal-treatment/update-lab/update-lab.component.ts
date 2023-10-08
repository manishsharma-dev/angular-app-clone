import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { AnimalTreatmentService } from '../animal-treatment.service';
import { TreatmentHistory } from '../models/treatment-history.model';
import { HealthService } from '../../health.service';

@Component({
  selector: 'app-update-lab',
  templateUrl: './update-lab.component.html',
  styleUrls: ['./update-lab.component.css'],
})
export class UpdateLabComponent implements OnInit {
  diagnosticsForm!: FormGroup;
  onSpotData = [];
  oldSampleData: any[] = [];
  constructor(
    private dialogRef: MatDialogRef<UpdateLabComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _fb: FormBuilder,
    private _animalTreatmentService: AnimalTreatmentService,
    private healthService: HealthService
  ) { }

  ngOnInit(): void {
    this.diagnosticsForm = this._fb.group({
      labTestingDetails: this._fb.array([]),
    });
    this.onSpotData = this.data.data.sampleDetails?.onSpotDetails;
    this.oldSampleData = this.data.data.sampleDetails?.labTestingDetails.map(sample => sample);
    if (this.data.data.sampleDetails?.labTestingDetails) {
      this.createLabSamples(this.data.data.sampleDetails?.labTestingDetails);
    }
  }
  createLabSamples(labData) {
    let labTestingDetails = this.labTestingDetails;
    labData &&
      labData.length &&
      labData.forEach((element) => {
        labTestingDetails.push(this.addLabSamples(element));
      });
  }

  addLabSamples(data) {
    let tempFB = this._fb.group({
      diseaseCd: [data.diseaseCd],
      diseaseCdDesc: [data.diseaseCdDesc],
      sampleCollectionDate: [data.sampleCollectionDate],
      sampleId: [data.sampleId],
      sampleType: [data.sampleType],
      sampleTypeDesc: [data.sampleTypeDesc],
      followUpNo: [data.sampleExaminationDetails[0].followUpNo],
      sampleExaminationDetails: this.createExamFormArray(
        data.sampleExaminationDetails
      ),
    });
    return tempFB;
  }

  createExamFormArray(sampleExaminationDetails) {
    const sampleExams = new FormArray([]);
    sampleExaminationDetails &&
      sampleExaminationDetails.length &&
      sampleExaminationDetails.forEach((element) => {
        const exam = this._fb.group({
          courierId: [element.courierId],
          diseaseCd: [element.diseaseCd],
          diseaseCdDesc: [element.diseaseCdDesc],
          finalSampleResultValue: [element.finalSampleResultValue],
          followUpNo: [element.followUpNo],
          initialSampleResultValue: [element.initialSampleResultValue],
          labCd: [element.labCd],
          labCdDesc: [element.labCdDesc],
          labCharges: [element.labCharges],
          modeOfTransport: [element.modeOfTransport],
          modeOfTransportDesc: [element.modeOfTransportDesc],
          onSpotTestCd: [element.onSpotTestCd],
          onSpotTestDesc: [element.onSpotTestDesc],
          poolNoOfAnimals: [element.poolNoOfAnimals],
          receiptNo: [element.receiptNo],
          runSeqNo: [element.runSeqNo],
          sampleBarCd: [element.sampleBarCd],
          sampleCollectionDate: [element.sampleCollectionDate],
          sampleExaminationSubtypeCd: [element.sampleExaminationSubtypeCd],
          sampleExaminationSubtypeCdDesc: [
            element.sampleExaminationSubtypeCdDesc,
          ],
          sampleExaminationTypeCd: [element.sampleExaminationTypeCd],
          sampleExaminationTypeCdDesc: [element.sampleExaminationTypeCdDesc],
          sampleId: [element.sampleId],
          sampleReport: [element.sampleReport],
          sampleResult: [
            element.sampleResult ? element.sampleResult.toString() : null,
          ],
          sampleResultDesc: [element.sampleResultDesc],
          sampleResultRecievedDate: [element.sampleResultRecievedDate],
          sampleType: [element.sampleType],
          sampleTypeDesc: [element.sampleTypeDesc],
          samplingStatus: [element.samplingStatus],
          samplingStatusDesc: [element.samplingStatusDesc],
          sourceOriginCd: [element.sourceOriginCd],
          sourceOriginId: [element.sourceOriginId],
          testImageUrl1: [element.testImageUrl1],
          testImageUrl2: [element.testImageUrl2],
          testRemarks: [element.testRemarks],
          testingLocation: [element.testingLocation],
          testingLocationDesc: [element.testingLocationDesc],
        });
        sampleExams.push(exam);
      });
    return sampleExams;
  }

  isSampleShow(item) {
    return (
      item?.value?.sampleExaminationDetails &&
      item?.value?.sampleExaminationDetails?.some((s) => s.samplingStatus == 1)
    );
  }

  onCancel() {
    this.dialogRef.close(false);
  }
  testDisplay(sample) {
  }
  get labTestingDetails() {
    return this.diagnosticsForm.get('labTestingDetails') as FormArray;
  }

  getLabExams(index) {
    return this.labTestingDetails
      .at(index)
      .get('sampleExaminationDetails') as FormArray;
  }

  saveLab() {
    let lab = this.diagnosticsForm.get('labTestingDetails')?.value;
    let request = {};
    request['labTestingRequestDtos'] = [];
    lab && lab.forEach((req, index) => {
      if (req.sampleExaminationDetails.length > 0) {
        req.sampleExaminationDetails.forEach((element, childIndex) => {
          if (this.oldSampleData[index]['sampleExaminationDetails'][childIndex]['finalSampleResultValue'] != element.finalSampleResultValue
            || this.oldSampleData[index]['sampleExaminationDetails'][childIndex]['sampleResult'] != element.sampleResult) {
            request['labTestingRequestDtos'].push(req);
          }
        });

      }
    }, this);


    request['followUpNo'] = lab[0].followUpNo;
    //request['labTestingRequestDtos'] = lab;
    request['sampleCollectedDate'] =
      lab[0].sampleExaminationDetails[0]['sampleCollectionDate'];
    request['sourceOriginCd'] =
      lab[0].sampleExaminationDetails[0]['sourceOriginCd'];
    request['sourceOriginId'] =
      lab[0].sampleExaminationDetails[0]['sourceOriginId'];
    request['onSpotRequestDtos'] = this.onSpotData ? this.onSpotData : [];
    if (request['labTestingRequestDtos'] && request['labTestingRequestDtos'].length) {
      request['saveSampleRequestDtos'] = [
        {
          animalId: this.data.animal.animalId,
          ownerId: this.data.animal.ownerId,
          tagId: this.data.animal.tagId,
          labTestingRequestDtos: lab,
          onSpotRequestDtos: [],
        },
      ];
    }
    else {
      this.healthService.handleError({
        title: 'Info',
        message: 'Please update values to update samples',
        primaryBtnText: 'Ok'
      })
      return;
    }
    this._animalTreatmentService
      .saveSampleData(request)
      .subscribe((res: any) => {
        this.dialogRef.close(true);
      });
  }
}
