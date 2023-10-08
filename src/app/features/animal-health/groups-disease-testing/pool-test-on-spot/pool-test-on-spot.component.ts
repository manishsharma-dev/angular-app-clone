import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { AnimalTreatmentService } from '../../animal-treatment/animal-treatment.service';
import { SampleType, SpotTestMaster } from '../../animal-treatment/models/master.model';
import { HealthService } from '../../health.service';
import { decimalWithLengthValidation } from 'src/app/shared/utility/decimalWithLengthValidator';

@Component({
  selector: 'app-pool-test-on-spot',
  templateUrl: './pool-test-on-spot.component.html',
  styleUrls: ['./pool-test-on-spot.component.css']
})
export class PoolTestOnSpotComponent implements OnInit {
  validationMsg = animalHealthValidations.groupDiseaseTesting;
  @Input() animalTagList: number[];
  @Input() testingDate: any;
  @Input() sampleTypeMaster: SampleType[] = [];
  suspectedDiseaseMaster = [];
  suspectedDisease: any;
  onSpotTestMaster: SpotTestMaster[] = [];
  onSpotTest: SpotTestMaster[] = [];
  onSpotSampleMaster = [];
  onSpotRequestDtos!: FormGroup;
  isLoadingSpinner: boolean = false;
  isReadingShow: boolean = false;
  constructor(private treatmentService: AnimalTreatmentService, private healthService: HealthService, private _fb: FormBuilder) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.testingDate?.currentValue) {
      if (this.onSpotRequestDtos && this.onSpotRequestDtos.get('diseaseCd').value) this.enableDisableReadings(this.onSpotRequestDtos.get('diseaseCd')?.value?.diseaseCd);
    }
  }
  filterSpotMaster(suspectedDisease: number) {
    this.onSpotTest = this.suspectedDisease ? this.onSpotTestMaster.filter((spot: SpotTestMaster) => spot.diseaseCd == suspectedDisease) : [];
    if (!this.onSpotTest.length) {
      this.onSpotTest = this.onSpotTestMaster;
    }
  }

  ngOnInit(): void {
    this.getMasterData();
    this.createForm();
    this.onSpotRequestDtos.get('diseaseCd').valueChanges.subscribe((value) => {
      if (value) {
        this.onSpotTest = this.onSpotTestMaster.filter((spot: SpotTestMaster) => spot.diseaseCd == value.diseaseCd);
        this.enableDisableReadings(value.diseaseCd);
      }
    })
    this.onSpotRequestDtos.get('onSpotTestCd').valueChanges.subscribe((value) => {
      this.onSpotRequestDtos.patchValue({ sampleType: null });
      this.onSpotSampleMaster = this.onSpotTest.filter((spot) => spot.onSpotTestCd == value);
    });
  }

  testingDateChange() {
    this.onSpotRequestDtos?.setControl('spotTestingRows', this._fb.array([]));
  }

  createForm() {
    this.onSpotRequestDtos = this._fb.group({
      diseaseCd: [null, [Validators.required]],
      onSpotTestCd: [null, [Validators.required]],
      sampleType: [null],
      initialSampleResultValue: [null, [decimalWithLengthValidation(7, 2)],],
      finalSampleResultValue: [null, [decimalWithLengthValidation(7, 2)],],
      difference: [null, [decimalWithLengthValidation(7, 2)],],
      sampleResult: [null]
    })
  }

  getMasterData() {
    this.isLoadingSpinner = true;
    const getOnSpotTestMasterRequest =
      this.treatmentService.getOnSpotTestMaster();
    const getOnSpotDiseaseSuspectedRequest = this.treatmentService.getOnSpotDiseaseSuspected();
    forkJoin([
      getOnSpotTestMasterRequest,
      getOnSpotDiseaseSuspectedRequest
    ]).subscribe(
      ([getOnSpotTestMasterRes, getOnSpotDiseaseSuspectedResponse]: any) => {
        this.onSpotTestMaster = getOnSpotTestMasterRes;
        this.suspectedDiseaseMaster = getOnSpotDiseaseSuspectedResponse;
        this.onSpotTest = this.suspectedDisease ? this.onSpotTestMaster.filter((spot: SpotTestMaster) => spot.diseaseCd == this.suspectedDisease.diseaseCd) : [];
        if (!this.onSpotTest.length) {
          this.onSpotTest = this.onSpotTestMaster;
        }
        this.isLoadingSpinner = false;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  enableDisableReadings(testTypeCode, flag?) {
    if (testTypeCode == 207 || testTypeCode == 208) {
      this.isReadingShow = true;
      const currentDate = new Date(sessionStorage.getItem('serverCurrentDateTime'));
      const tDate = this.testingDate;
      this.onSpotRequestDtos.get('initialSampleResultValue')?.enable();
      if (tDate) {
        const diffdate = this.treatmentService.getDifferenceDate(
          currentDate,
          tDate
        );
        if (diffdate > 3) {
          this.onSpotRequestDtos.get('finalSampleResultValue').enable();
          this.onSpotRequestDtos.get('difference')?.enable();
          this.onSpotRequestDtos.get('sampleResult')?.enable();
        } else {
          this.onSpotRequestDtos.get('finalSampleResultValue').disable();
          this.onSpotRequestDtos.get('difference')?.disable();
          this.onSpotRequestDtos.get('sampleResult')?.disable();
        }
      } else {
        this.onSpotRequestDtos.get('finalSampleResultValue').enable();
        this.onSpotRequestDtos.get('difference')?.disable();
        this.onSpotRequestDtos.get('sampleResult')?.disable();
      }
    }
    else {
      this.isReadingShow = false;
      this.onSpotRequestDtos.get('sampleResult')?.enable();
    }
    if (!testTypeCode || testTypeCode == 207 || testTypeCode == 208 || testTypeCode == 362) {
      this.onSpotRequestDtos.get('sampleType')?.disable();
    }
    else {
      this.onSpotRequestDtos.get('sampleType')?.enable();
    }
  }

  disableOnSpotChanged(event: any) {
    let spotTesting = this.onSpotRequestDtos;
    if (spotTesting.get('diseaseCd').value.diseaseCd == 207 || spotTesting.get('diseaseCd').value.diseaseCd == 208) {
      if (!event || event.target.value != 1 && event.target.value != 2) {
        const currentDate = new Date(sessionStorage.getItem('serverCurrentDateTime'));
        const tDate = this.testingDate;
        if (tDate) {
          const diffdate = this.treatmentService.getDifferenceDate(
            currentDate,
            tDate
          );
          if (diffdate < 3) {
            spotTesting.get('initialSampleResultValue')?.disable();
            spotTesting.get('finalSampleResultValue')?.disable();
            spotTesting.get('difference')?.disable();
            spotTesting.get('sampleResult')?.disable();
          }
          else {
            spotTesting.get('initialSampleResultValue')?.enable();
            spotTesting.get('finalSampleResultValue')?.enable();
            spotTesting.get('difference')?.enable();
            spotTesting.get('sampleResult')?.enable();
          }
        }
      }
      else {
        spotTesting.get('initialSampleResultValue')?.disable();
        spotTesting.get('finalSampleResultValue')?.disable();
        spotTesting.get('difference')?.disable();
        spotTesting.get('sampleResult')?.disable();
      }
    }
    if (event.value != 10) {
      spotTesting.get('diseaseCd')?.addValidators([Validators.required]);
    }
    else {
      spotTesting.get('diseaseCd')?.clearValidators();
    }
    spotTesting.get('diseaseCd').updateValueAndValidity({ emitEvent: false });
  };

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
    diffControl?.patchValue(result.toFixed());
  }

  get spotTestingRows() {
    return this.onSpotRequestDtos.get('spotTestingRows') as FormArray;
  }

  get formControls() {
    return this.onSpotRequestDtos.controls;
  }

}
