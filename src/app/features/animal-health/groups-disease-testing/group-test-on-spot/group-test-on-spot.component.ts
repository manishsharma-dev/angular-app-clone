import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { AnimalTreatmentService } from '../../animal-treatment/animal-treatment.service';
import {
  SampleType,
  SpotTestMaster,
} from '../../animal-treatment/models/master.model';
import { HealthService } from '../../health.service';
import { decimalWithLengthValidation } from 'src/app/shared/utility/decimalWithLengthValidator';

@Component({
  selector: 'app-group-test-on-spot',
  templateUrl: './group-test-on-spot.component.html',
  styleUrls: ['./group-test-on-spot.component.css'],
})
export class GroupTestOnSpotComponent implements OnInit, OnChanges {
  isDiseaseRequired: boolean = false;
  validationMsg = animalHealthValidations.newCase;
  @Input() animalTagList: number[];
  @Input() testingDate: any;
  @Input() sampleTypeMaster: SampleType[] = [];
  suspectedDiseaseMaster = [];
  suspectedDisease: any;
  onSpotTestMaster: SpotTestMaster[] = [];
  onSpotTest: SpotTestMaster[] = [];
  onSpotSampleMaster = [];
  onSpotRequestDtos!: FormGroup;
  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  isLoadingSpinner: boolean = false;
  spotTestingDisplayedColumns: string[] = [
    'srno',
    'tagId',
    'initialSampleResultValue',
    'finalSampleResultValue',
    'difference',
    'sampleResult',
  ];
  constructor(
    private treatmentService: AnimalTreatmentService,
    private healthService: HealthService,
    private _fb: FormBuilder
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.testingDate?.currentValue) {
      if (this.onSpotRequestDtos) this.testingDateChange();
    }
  }
  filterSpotMaster(suspectedDisease: number) {
    this.onSpotTest = this.suspectedDisease
      ? this.onSpotTestMaster.filter(
          (spot: SpotTestMaster) => spot.diseaseCd == suspectedDisease
        )
      : [];
    if (!this.onSpotTest.length) {
      this.onSpotTest = this.onSpotTestMaster;
    }
  }

  ngOnInit(): void {
    this.getMasterData();
    this.createForm();
    this.onSpotRequestDtos
      .get('suspectedDisease')
      ?.valueChanges.subscribe((value) => {
        if (value) {
          this.onSpotTest = this.onSpotTestMaster.filter(
            (spot: SpotTestMaster) => spot.diseaseCd == value?.diseaseCd
          );
          this.onSpotRequestDtos.setControl(
            'spotTestingRows',
            this._fb.array([])
          );
          this.animalTagList.length &&
            this.animalTagList.forEach((tagId: number, index: number) => {
              if (value.diseaseCd == 207 || value.diseaseCd == 208) {
                this.spotTestingDisplayedColumns = [
                  'srno',
                  'tagId',
                  'initialSampleResultValue',
                  'finalSampleResultValue',
                  'difference',
                  'sampleResult',
                ];
              } else {
                this.spotTestingDisplayedColumns = [
                  'srno',
                  'tagId',
                  'sampleResult',
                ];
              }
              if (
                !value.diseaseCd ||
                value?.diseaseCd == 207 ||
                value?.diseaseCd == 208 ||
                value?.diseaseCd == 362
              ) {
                this.onSpotRequestDtos.get('sampleType')?.disable();
              } else {
                this.onSpotRequestDtos.get('sampleType')?.enable();
              }
              this.addSpotTestingRow(tagId);
              this.disableReadings(
                index,
                this.onSpotRequestDtos.get('suspectedDisease').value?.diseaseCd
              );
            });
        }
      });
  }

  testingDateChange() {
    this.onSpotRequestDtos?.setControl('spotTestingRows', this._fb.array([]));
    this.animalTagList.length &&
      this.animalTagList.forEach((tagId: any, index: number) => {
        if (this.onSpotRequestDtos.get('suspectedDisease').value?.diseaseCd) {
          if (
            this.onSpotRequestDtos.get('suspectedDisease').value?.diseaseCd ==
              207 ||
            this.onSpotRequestDtos.get('suspectedDisease').value?.diseaseCd ==
              208
          ) {
            this.spotTestingDisplayedColumns = [
              'srno',
              'tagId',
              'initialSampleResultValue',
              'finalSampleResultValue',
              'difference',
              'sampleResult',
            ];
          } else {
            this.spotTestingDisplayedColumns = [
              'srno',
              'tagId',
              'sampleResult',
            ];
          }
          this.addSpotTestingRow(tagId);
          this.disableReadings(
            index,
            this.onSpotRequestDtos.get('suspectedDisease').value?.diseaseCd
          );
        }
      });
  }

  createForm() {
    this.onSpotRequestDtos = this._fb.group({
      suspectedDisease: [null, []],
      onSpotTestCd: [null, [Validators.required]],
      sampleType: [null],
      spotTestingRows: this._fb.array([]),
    });
  }

  getMasterData() {
    this.isLoadingSpinner = true;
    const getOnSpotTestMasterRequest =
      this.treatmentService.getOnSpotTestMaster();
    const getOnSpotDiseaseSuspectedRequest =
      this.treatmentService.getOnSpotDiseaseSuspected();
    forkJoin([
      getOnSpotTestMasterRequest,
      getOnSpotDiseaseSuspectedRequest,
    ]).subscribe(
      ([getOnSpotTestMasterRes, getOnSpotDiseaseSuspectedResponse]: any) => {
        this.onSpotTestMaster = getOnSpotTestMasterRes;
        this.suspectedDiseaseMaster = getOnSpotDiseaseSuspectedResponse;
        this.onSpotTest = this.suspectedDisease
          ? this.onSpotTestMaster.filter(
              (spot: SpotTestMaster) =>
                spot.diseaseCd == this.suspectedDisease.diseaseCd
            )
          : [];
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

  addSpotTestingRow(d?: any, noUpdate?: boolean) {
    const row = this._fb.group({
      tagId: [{ value: d.tagId, disabled: true }],
      initialSampleResultValue: [null, [decimalWithLengthValidation(7, 2)]],
      finalSampleResultValue: [null, [decimalWithLengthValidation(7, 2)]],
      difference: [null, [decimalWithLengthValidation(7, 2)]],
      sampleResult: [null, []],
      samplingStatus: [1],
    });
    this.spotTestingRows.push(row);
    this.updateSpotTestingView();
  }

  updateSpotTestingView() {
    this.dataSource.next(this.spotTestingRows.controls);
  }

  disableReadings(index: number, testTypeCode: any) {
    let spotTesting = this.onSpotRequestDtos.get(
      'spotTestingRows'
    ) as FormArray;
    spotTesting.controls[index].get('initialSampleResultValue')?.enable();
    if (testTypeCode == 207 || testTypeCode == 208) {
      const currentDate = new Date(
        sessionStorage.getItem('serverCurrentDateTime')
      );
      const tDate = this.testingDate;
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
      spotTesting.controls[index].get('sampleResult')?.enable();
    }
  }
  disableOnSpotTestChange(): void {
    let spotTesting = this.onSpotRequestDtos.get(
      'spotTestingRows'
    ) as FormArray;
    const suspectedDisease =
      this.onSpotRequestDtos.get('suspectedDisease')?.value;
    const onSpotTestCd = this.onSpotRequestDtos.get('onSpotTestCd')?.value;
    this.animalTagList.length &&
      this.animalTagList.forEach((tagId: number, index: number) => {
        if (
          suspectedDisease.diseaseCd == 207 ||
          suspectedDisease.diseaseCd == 208
        ) {
          if (!onSpotTestCd || (onSpotTestCd != 1 && onSpotTestCd != 2)) {
            const currentDate = new Date(
              sessionStorage.getItem('serverCurrentDateTime')
            );
            const tDate = this.testingDate;
            if (tDate) {
              const diffdate = this.treatmentService.getDifferenceDate(
                currentDate,
                tDate
              );
              if (diffdate < 3) {
                spotTesting.controls[index]
                  .get('initialSampleResultValue')
                  ?.disable();
                spotTesting.controls[index]
                  .get('finalSampleResultValue')
                  ?.disable();
                spotTesting.controls[index].get('difference')?.disable();
                spotTesting.controls[index].get('sampleResult')?.disable();
              } else {
                spotTesting.controls[index]
                  .get('initialSampleResultValue')
                  ?.enable();
                spotTesting.controls[index]
                  .get('finalSampleResultValue')
                  ?.enable();
                spotTesting.controls[index].get('difference')?.enable();
                spotTesting.controls[index].get('sampleResult')?.enable();
              }
            }
          } else {
            spotTesting.controls[index]
              .get('initialSampleResultValue')
              ?.disable();
            spotTesting.controls[index]
              .get('finalSampleResultValue')
              ?.disable();
            spotTesting.controls[index].get('difference')?.disable();
            spotTesting.controls[index].get('sampleResult')?.disable();
          }
        }
      });
  }

  subscribeTospotTestingRowsChange(event: any) {
    if (event.target.value != 10) {
      this.onSpotRequestDtos
        .get('suspectedDisease')
        .addValidators([Validators.required]);
      this.isDiseaseRequired = true;
    } else {
      this.onSpotRequestDtos.get('suspectedDisease').clearValidators();
      this.isDiseaseRequired = false;
    }
    this.onSpotRequestDtos
      .get('suspectedDisease')
      .updateValueAndValidity({ emitEvent: false });
    this.onSpotRequestDtos.patchValue({ sampleType: null });
    this.onSpotSampleMaster = this.onSpotTest.filter(
      (spot) => spot.onSpotTestCd == event.target.value
    );
    //this.disableOnSpotTestChange()
  }

  dateChangeChanges() {}

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
    return this.onSpotRequestDtos.get('spotTestingRows') as FormArray;
  }

  get formControls() {
    return this.onSpotRequestDtos.controls;
  }
}
