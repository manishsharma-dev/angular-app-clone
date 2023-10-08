import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { CommonMaster } from '../../animal-treatment/models/common-master.model';
import { LabMaster, SampleExaminationSubtypeMaster, SampleExaminationType } from '../../animal-treatment/models/master.model';
import { HealthService } from '../../health.service';

@Component({
  selector: 'app-group-test-sample',
  templateUrl: './group-test-sample.component.html',
  styleUrls: ['./group-test-sample.component.css']
})
export class GroupTestSampleComponent implements OnInit {
  @Input() sampleTypeMaster: any;
  labTestingRequestDtos!: FormGroup;
  modeOfTransports: CommonMaster[] = [];
  labMaster: LabMaster[] = [];
  sampleExamTypeMaster: SampleExaminationType[][] = [];
  sampleSubExamTypeMaster: SampleExaminationSubtypeMaster[][] = [];
  planIdMaster: any[] = [];
  sampleTestTypeMaster: any[] = [];
  tempForm!: FormGroup;
  constructor(private _fb: FormBuilder, private healthService: HealthService) { }

  ngOnInit(): void {
    this.createSampleForm();
    this.getMasterData();
    // this.labTestingRequestDtos?.get('sampleType')?.valueChanges.subscribe((value: any) => {
    //   this.getExaminationType(value.sampleTypeCd);
    // })
    // this.labTestingRequestDtos?.get('sampleExaminationTypeCd')?.valueChanges.subscribe((value: any) => {
    //   this.getSubExaminationType(value);
    // })
  }

  createSampleForm() {
    // this.labTestingRequestDtos = this._fb.group({
    //   testType: [],
    //   planID: [],
    //   sampleType: [],
    //   sampleExaminationTypeCd: [],
    //   sampleExaminationSubtypeCd: [],
    //   labCd: [],
    //   labCharges: [],
    //   receiptNo: [],
    //   modeOfTransport: []
    // })
    this.labTestingRequestDtos = this._fb.group({
      testType: [],
      planID: [],
      sampleExaminationDetails: this._fb.array([])
    })
    this.addNewSampleExaminationDetails();
  }

  addNewSampleExaminationDetails() {
    const tempgroup = this._fb.group({
      sampleType: [],
      sampleExaminationTypeCd: [],
      sampleExaminationSubtypeCd: [],
      labCd: [],
      labCharges: [],
      receiptNo: [],
      modeOfTransport: []
    });
    let arr = this.labTestingRequestDtos.get('sampleExaminationDetails') as FormArray;
    arr.push(tempgroup);
  }

  removeExamType(i) {
    const add = this.labTestingRequestDtos.get('sampleExaminationDetails') as FormArray;
    add.removeAt(i)
  }

  getMasterData() {
    const modeofTransportRequest = this.healthService.getCommonMaster('mode_of_transport');
    const labRequest = this.healthService.getSubOrgList(5);
    const sampleTestTypeRequest = this.healthService.getSampleTestTypeMaster();
    const planIdRequest = this.healthService.getPlanIdMaster();
    forkJoin([modeofTransportRequest, labRequest, sampleTestTypeRequest, planIdRequest]).subscribe(([modeofTransportResponse, labResponse, sampleTestTypeResponse, planIdResponse]: any[]) => {
      this.modeOfTransports = modeofTransportResponse;
      this.labMaster = labResponse;
      this.sampleTestTypeMaster = sampleTestTypeResponse;
      this.planIdMaster = planIdResponse;
    });
  }

  getExaminationType(sampleType: any, index) {
    this.healthService.getExaminationTypeMaster(sampleType.sampleTypeCd).subscribe((res: SampleExaminationType[] | any) => {
      if (res.errorCode) {
        return;
      }
      this.sampleExamTypeMaster[index] = res;
    });
  }

  getSubExaminationType(examinationType: any, index) {
    this.healthService
      .getSubExaminationTypeMaster(examinationType.target.value).subscribe((res: SampleExaminationSubtypeMaster[] | any) => {
        if (this.healthService.isErrorResponse(res)) {
          return;
        }
        this.sampleSubExamTypeMaster[index] = res;
      })
  }

}
