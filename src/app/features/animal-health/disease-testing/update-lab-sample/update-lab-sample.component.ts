import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, filter, switchMap } from 'rxjs/operators';
import { AnimalDetailService } from 'src/app/features/animal-management/animal-registration/animal-details/animal-detail.service';
import { AnimalTreatmentService } from '../../animal-treatment/animal-treatment.service';
import { HealthService } from '../../health.service';

@Component({
  selector: 'app-update-lab-sample',
  templateUrl: './update-lab-sample.component.html',
  styleUrls: ['./update-lab-sample.component.css']
})
export class UpdateLabSampleComponent implements OnInit {
  diagnosticsForm!: FormGroup;
  onSpotData = [];
  animalTagId = '';
  animal: any;
  oldSampleData: any;
  constructor(private dialogRef: MatDialogRef<UpdateLabSampleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _fb: FormBuilder,
    private _animalTreatmentService: AnimalTreatmentService,
    private router: Router,
    private route: ActivatedRoute,
    private animalMgmtService: AnimalDetailService,
    private healthService: HealthService) { }

  ngOnInit(): void {
    this.animalMgmtService.getAnimalDetails(this.data.animalTagId)
      .subscribe((data) => {
        this.animal = data;
      });
    this.diagnosticsForm = this._fb.group({
      labTestingDetails: this._fb.array([])
    })
    if (this.data.data) {
      this.oldSampleData = this.data.data;
      this.createLabSamples(this.data.data);
    }
  }
  createLabSamples(labData) {
    let labTestingDetails = this.labTestingDetails;
    labData && labData.length && labData.forEach(element => {
      labTestingDetails.push(this.addLabSamples(element))
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
      sampleExaminationDetails: this.createExamFormArray(data.sampleExaminationDetails)
    })
    return tempFB;
  }

  createExamFormArray(sampleExaminationDetails) {
    const sampleExams = new FormArray([]);
    let exam;
    sampleExaminationDetails && sampleExaminationDetails.length && sampleExaminationDetails.forEach(element => {
      if (this.data.viewFlag) {
        exam = this._fb.group({
          courierId: [element.courierId],
          diseaseCd: [element.diseaseCd],
          diseaseCdDesc: [element.diseaseCdDesc],
          finalSampleResultValue: [{ value: element.finalSampleResultValue, disabled: true }],
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
          sampleExaminationSubtypeCdDesc: [element.sampleExaminationSubtypeCdDesc],
          sampleExaminationTypeCd: [element.sampleExaminationTypeCd],
          sampleExaminationTypeCdDesc: [element.sampleExaminationTypeCdDesc],
          sampleId: [element.sampleId],
          sampleReport: [element.sampleReport],
          sampleResult: [{ value: element.sampleResult ? element.sampleResult.toString() : null, disabled: true }],
          sampleResultDesc: [{ value: element.sampleResultDesc, disabled: true }],
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
      }
      else {
        exam = this._fb.group({
          courierId: [element.courierId],
          diseaseCd: [element.diseaseCd],
          diseaseCdDesc: [element.diseaseCdDesc],
          finalSampleResultValue: [element.finalSampleResultValue, [Validators.maxLength(3)]],
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
          sampleExaminationSubtypeCdDesc: [element.sampleExaminationSubtypeCdDesc],
          sampleExaminationTypeCd: [element.sampleExaminationTypeCd],
          sampleExaminationTypeCdDesc: [element.sampleExaminationTypeCdDesc],
          sampleId: [element.sampleId],
          sampleReport: [element.sampleReport],
          sampleResult: [element.sampleResult ? element.sampleResult.toString() : null],
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
      }

      sampleExams.push(exam);
    });
    return sampleExams;
  }

  isSampleShow(item) {
    return item?.value?.sampleExaminationDetails && item?.value?.sampleExaminationDetails?.some(s => s.samplingStatus == 1);
  }

  isSampleView(item) { }

  onCancel() {

  }
  testDisplay(sample) {
  }
  get labTestingDetails() {
    return this.diagnosticsForm.get('labTestingDetails') as FormArray;
  }

  getLabExams(index) {
    return this.labTestingDetails.at(index).get('sampleExaminationDetails') as FormArray;
  }


  saveLab() {
    if (this.diagnosticsForm.invalid) {
      return;
    }
    let lab = this.diagnosticsForm.get('labTestingDetails')?.value;
    let request = {};
    let labTestingRequestDtos = [];
    lab && lab.forEach((req, index) => {
      if (req.sampleExaminationDetails.length > 0) {
        req.sampleExaminationDetails.forEach((element, childIndex) => {
          if (this.oldSampleData[index]['sampleExaminationDetails'][childIndex]['finalSampleResultValue'] != element.finalSampleResultValue
            || this.oldSampleData[index]['sampleExaminationDetails'][childIndex]['sampleResult'] != element.sampleResult) {
            labTestingRequestDtos.push(req);
          }
        });

      }
    }, this);

    request['followUpNo'] = lab[0].followUpNo;
    request['sampleCollectedDate'] = lab[0].sampleExaminationDetails[0]['sampleCollectionDate'];
    request['sourceOriginCd'] = lab[0].sampleExaminationDetails[0]['sourceOriginCd'];
    request['sourceOriginId'] = lab[0].sampleExaminationDetails[0]['sourceOriginId'];
    if (labTestingRequestDtos && labTestingRequestDtos.length) {
      request['saveSampleRequestDtos'] = [
        {
          "animalId": this.animal.animalId,
          "ownerId": this.animal.ownerId,
          "tagId": this.animal?.tagId,
          "labTestingRequestDtos": labTestingRequestDtos,
          "onSpotRequestDtos": this.onSpotData ? this.onSpotData : []
        }
      ]
    }
    else {
      this.healthService.handleError({
        title: 'Info',
        message: 'Please update values to update samples',
        primaryBtnText: 'Ok'
      })
      return;
    }
    this._animalTreatmentService.saveSampleData(request)
      .subscribe((res: any) => {
        this.dialogRef.close(true);
      })
  }

}
