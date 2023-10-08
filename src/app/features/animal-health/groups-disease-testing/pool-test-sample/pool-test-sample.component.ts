import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  AlphaNumericSpecialValidation,
  AlphaNumericValidation,
  NumericValidation,
} from 'src/app/shared/utility/validation';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { AnimalTreatmentService } from '../../animal-treatment/animal-treatment.service';
import { CommonMaster } from '../../animal-treatment/models/common-master.model';
import {
  LabMaster,
  SampleExaminationSubtypeMaster,
  SampleExaminationType,
  SampleStatusFlag,
  SampleType,
} from '../../animal-treatment/models/master.model';
import { HealthService } from '../../health.service';
import { decimalWithLengthValidation } from 'src/app/shared/utility/decimalWithLengthValidator';

@Component({
  selector: 'app-pool-test-sample',
  templateUrl: './pool-test-sample.component.html',
  styleUrls: ['./pool-test-sample.component.css'],
})
export class PoolTestSampleComponent implements OnInit {
  validationMsg = animalHealthValidations.poolDiseaseTesting;
  isLoadingSpinner: boolean = false;
  sampleExaminationDetails!: FormGroup;
  @Input() SampleStatusFlags: SampleStatusFlag[] = [];
  sampleTypeMaster: SampleType[] = [];
  sampleExamTypeMaster: SampleExaminationType[] = [];
  sampleSubExamTypeMaster: SampleExaminationSubtypeMaster[] = [];
  labMaster: LabMaster[] = [];
  modeOfTransports: CommonMaster[] = [];
  constructor(
    private _fb: FormBuilder,
    private _treatmentService: AnimalTreatmentService,
    private _healthService: HealthService
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.getMasterData();
    this.sampleExaminationDetails
      .get('sampleType')
      .valueChanges.subscribe((sample: SampleType) => {
        this.getExaminationTypeMaster(sample.sampleTypeCd);
      });

    this.sampleExaminationDetails
      .get('sampleExaminationTypeCd')
      .valueChanges.subscribe((examType: SampleExaminationType) => {
        this.getExaminationSubType(examType.sampleExaminationTypeCd);
      });

    this.sampleExaminationDetails
      .get('labCd')
      .valueChanges.subscribe((lab: any) => {
        if (lab.subOrgId == 0) {
          this.sampleExaminationDetails
            .get('labCd')
            .patchValue(null, { emitEvent: false });
          this.fetchAllLabs();
        }
      });
  }

  createForm() {
    this.sampleExaminationDetails = this._fb.group({
      sampleType: [null, [Validators.required]],
      diseaseCd: [null],
      courierId: [null],
      labCd: [null],
      labCharges: [null, [decimalWithLengthValidation(9, 2)]],
      modeOfTransport: [null],
      receiptNo: [null, [Validators.maxLength(10), AlphaNumericValidation]],
      sampleExaminationSubtypeCd: [null],
      sampleExaminationTypeCd: [null, [Validators.required]],
      testImageUrl1: [null],
      testRemarks: [
        null,
        [Validators.maxLength(80), AlphaNumericSpecialValidation],
      ],
    });
  }

  getMasterData() {
    this.isLoadingSpinner = true;
    const getSampleTypeMasterRequest = this._healthService.getSampleTypeMaster(
      this.SampleStatusFlags
    );
    const getLabMasterRequest = this._healthService.getSubOrgList(5);
    const modeOfTransportRequest =
      this._healthService.getCommonMaster('mode_of_transport');
    forkJoin([
      getSampleTypeMasterRequest,
      getLabMasterRequest,
      modeOfTransportRequest,
    ]).subscribe(
      ([
        getSampleTypeMasterResponse,
        getLabMasterResponse,
        modeOfTransportResponse,
      ]: any) => {
        this.sampleTypeMaster = getSampleTypeMasterResponse;
        this.labMaster = getLabMasterResponse;
        this.labMaster.push({
          subOrgId: 0,
          orgId: 0,
          uin: '',
          parentOrganization: '',
          subOrgName: 'Show All Labs',
          subOrgType: 0,
          subOrgTypeDesc: 'Show All Labs',
          stateCd: 0,
          stateName: '',
          districtCd: 0,
          districtName: '',
          subOrgStatus: 0,
          subOrgStatusDesc: '',
        });
        this.modeOfTransports = modeOfTransportResponse;
      },
      (err) => (this.isLoadingSpinner = false)
    );
    this._healthService.getSampleTypeMaster(this.SampleStatusFlags).subscribe(
      (res: any) => {
        this.sampleTypeMaster = res;
        this.isLoadingSpinner = false;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  fetchAllLabs() {
    this.isLoadingSpinner = true;
    this._healthService.getSubOrgList(5, false).subscribe((res) => {
      this.labMaster = res;
      this.isLoadingSpinner = false;
    });
  }

  getExaminationTypeMaster(code) {
    this.isLoadingSpinner = true;
    this._healthService.getExaminationTypeMaster(code).subscribe(
      (res: any) => {
        if (res.errorCode) {
          this.isLoadingSpinner = false;
          return;
        }
        this.sampleExamTypeMaster = res;
        this.isLoadingSpinner = false;
      },
      (err) => (this.isLoadingSpinner = false)
    );
  }

  getExaminationSubType(code) {
    this.isLoadingSpinner = true;
    this._healthService.getSubExaminationTypeMaster(code).subscribe(
      (res) => {
        if (this._healthService.isErrorResponse(res)) {
          this.isLoadingSpinner = false;
          return;
        }
        this.sampleSubExamTypeMaster = res;
        this.isLoadingSpinner = false;
      },
      (err) => (this.isLoadingSpinner = false)
    );
  }

  get formControls() {
    return this.sampleExaminationDetails.controls;
  }
}
