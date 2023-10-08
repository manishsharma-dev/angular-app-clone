import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { decimalWithLengthValidation } from 'src/app/shared/utility/decimalWithLengthValidator';
import {
  AlphaNumericSpecialValidation,
  AlphaNumericValidation,
} from 'src/app/shared/utility/validation';
import { CommonMaster } from '../../animal-treatment/models/common-master.model';
import { Disease } from '../../animal-treatment/models/disease.model';
import {
  LabMaster,
  LabTestingRow,
  SampleExaminationSubtypeMaster,
  SampleExaminationType,
  SampleStatusFlag,
  SampleType,
} from '../../animal-treatment/models/master.model';
import { HealthService } from '../../health.service';
import { SampleFormValue } from '../../models/sample-form-value.model';

export interface SampleData {
  sampleDetails: {
    diseaseCd: number;
    diseaseCdDesc: string;
    sampleCollectedDate: string;
    sampleId: string;
    sampleType: number;
    sampleTypeDesc: string;
    sampleExaminationDetails: LabTestingRow[];
  }[];
}

@Component({
  selector: 'app-lab-testing-sample',
  templateUrl: './lab-testing-sample.component.html',
  styleUrls: ['./lab-testing-sample.component.css'],
})
export class LabTestingSampleComponent implements OnInit, OnChanges, OnDestroy {
  isLoading = false;
  @Input() diagnosticsForm: FormGroup;
  @Input() diseaseRequiredFlag = true;
  @Input() diseasesSuspected: Disease[] = [];
  @Input() isSpotUpdate = false;
  @Input() sampleData?: SampleData['sampleDetails'];
  @Input() SampleStatusFlags: SampleStatusFlag[] = [];
  @Input() isDraft = false;

  @Output() examTypeChange = new EventEmitter<any>();

  sampleTypeMaster: SampleType[] = [];
  dataSources = [new BehaviorSubject<FormGroup[]>([])];

  isUpdate = false;

  sampleExamTypeMaster: Array<Array<SampleExaminationType>> = [];
  sampleSubExamTypeMaster: Array<Array<Array<SampleExaminationSubtypeMaster>>> =
    [];
  labMaster: LabMaster[] = [];
  modeOfTransports: CommonMaster[] = [];
  showAllLabs = false;

  labTestingDisplayedColumns: string[] = [
    'sampleExaminationTypeCd',
    'sampleExaminationSubtypeCd',
    'labCd',
    'labCharges',
    'receiptNo',
    'testRemarks',
    'modeOfTransport',
    'delete',
    'add',
  ];

  constructor(private _fb: FormBuilder, private healthService: HealthService) {}

  ngOnInit(): void {
    this.getData();
    // this.setDesc();
  }

  getData() {
    this.isLoading = true;
    forkJoin([
      this.healthService.getSampleTypeMaster(this.SampleStatusFlags),
      this.healthService.getCommonMaster('mode_of_transport'),
      this.healthService.getSubOrgList(5),
      this.healthService.getDiseasesMaster(),
    ]).subscribe((res) => {
      this.sampleTypeMaster = res[0];
      this.modeOfTransports = res[1];
      if (this.healthService.isErrorResponse(res[2])) return;

      this.labMaster = res[2];

      this.diseasesSuspected = res[3];
      this.diagnosticsForm.get('samples').updateValueAndValidity();
      this.setDesc();
      if (this.sampleData && this.sampleData?.length) {
        this.checkIfLabExistsInList();
      }
      this.isLoading = false;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sampleData']?.firstChange) {
      this.diagnosticsForm.addControl('samples', this._fb.array([]));
    }
    if (this.sampleData?.length) {
      this.isUpdate = true;
      (this.diagnosticsForm.get('samples') as FormArray)?.clear();
      this.sampleData?.forEach((sample) => {
        this.addSample(sample);
      });
      this.diagnosticsForm.get('samples').markAllAsTouched();
      this.diagnosticsForm.get('samples').markAsDirty({ onlySelf: true });
    } else this.addSample();
  }

  addSample(d?: SampleData['sampleDetails'][0]) {
    const sampleGroup = this._fb.group({
      sampleId: [d && d.sampleId ? d.sampleId : null],
      diseaseCd: [d && d.diseaseCd ? d.diseaseCd : null],
      diseaseDesc: [{ value: null, disabled: true }],
      sampleType: [
        d && d.sampleType ? d.sampleType : null,
        [Validators.required],
      ],
      sampleTypeDesc: [{ value: null, disabled: true }],
      sampleExaminationDetails: this._fb.array([]),
    });
    this.sampleExamTypeMaster.push([]);
    this.sampleSubExamTypeMaster.push([]);
    this.sampleControls?.push(sampleGroup);
    this.dataSources.push(new BehaviorSubject([sampleGroup]));

    if (d?.sampleExaminationDetails) {
      this.getSampleExamType(d.sampleType, this.sampleControls?.length - 1);
      d?.sampleExaminationDetails?.forEach((details, i) => {
        this.addLabTestingRow(this.sampleControls?.length - 1, details);
        this.getSubType(
          { value: details.sampleExaminationTypeCd } as any,
          this.sampleControls?.length - 1,
          i
        );
      });

      if (!this.isDraft) sampleGroup.disable();
    } else this.addLabTestingRow(this.sampleControls?.length - 1 || 0);
  }

  deleteSample(index: number) {
    if (this.sampleControls?.length > 1) {
      this.sampleControls?.removeAt(index);
      this.dataSources.splice(index, 1);
      this.sampleExamTypeMaster.splice(index, 1);
      this.sampleSubExamTypeMaster.splice(index, 1);
    } else {
      this.sampleControls?.reset();
      this.sampleExamTypeMaster[index] = [];
      // this.sampleSubExamTypeMaster.splice(index, 1);
      this.sampleSubExamTypeMaster[index] = [];
    }
  }

  subscribeToSampleRowsChange(
    control: string,
    sampleIndex: number,
    rowIndex: number,
    event?: MatSelectChange
  ) {
    const row = this.sampleExaminationDetails(sampleIndex).at(
      rowIndex
    ) as FormGroup;

    switch (control) {
      case 'diseaseCd':
        row.patchValue({
          sampleType: null,
          sampleExaminationTypeCd: null,
          sampleExaminationSubtypeCd: null,
          labCd: null,
          labCharges: null,
          receiptNo: null,
          testRemarks: null,
          modeOfTransport: null,
        });
        break;
      case 'sampleType':
        row.patchValue({
          sampleExaminationTypeCd: null,
          sampleExaminationSubtypeCd: null,
          labCd: null,
          labCharges: null,
          receiptNo: null,
          testRemarks: null,
          modeOfTransport: null,
        });
        break;
      case 'sampleExaminationTypeCd':
        this.getSubType(event, sampleIndex, rowIndex);
        if (!this.isSpotUpdate) {
          row.patchValue({
            sampleExaminationSubtypeCd: null,
            labCharges: null,
            receiptNo: null,
            testRemarks: null,
            modeOfTransport: null,
          });
        }
        break;
      case 'sampleExaminationSubtypeCd':
        row.patchValue({
          labCharges: null,
          receiptNo: null,
          testRemarks: null,
          modeOfTransport: null,
        });
        break;
      case 'labCd':
        if (event.value === 0) {
          this.sampleExaminationDetails(sampleIndex).controls.forEach(
            (row: FormGroup) =>
              row.patchValue({
                labCd: null,
              })
          );
          this.fetchAllLabs();
          return;
        }

        this.sampleExaminationDetails(sampleIndex).controls.forEach(
          (row: FormGroup, i) => {
            row.patchValue({
              labCd: event.value,
              receiptNo: null,
              testRemarks: null,
              labCharges: null,
              modeOfTransport: null,
            });
          }
        );

        break;
    }

    this.diagnosticsForm.get('samples').updateValueAndValidity();
  }

  getSampleExamType(event: number | undefined, sampleIndex: number) {
    if (!this.sampleExamTypeMaster[sampleIndex]) {
      return;
    }
    this.sampleExamTypeMaster[sampleIndex].length = 0;
    this.sampleExaminationDetails(sampleIndex).reset();
    if (!event) {
      return;
    }

    this.healthService.getExaminationTypeMaster(event).subscribe((res: any) => {
      this.sampleExamTypeMaster[sampleIndex] = res;
      this.diagnosticsForm.get('samples').updateValueAndValidity();
    });
  }

  getSubType(event: MatSelectChange, sampleIndex: number, rowIndex: number) {
    if (!event?.value) return;

    const request = {
      sampleExaminationTypeCd: event.value,
    };
    this.healthService
      .getSubExaminationTypeMaster(request.sampleExaminationTypeCd)
      .subscribe((res) => {
        if (this.healthService.isErrorResponse(res)) {
          return;
        }
        this.sampleSubExamTypeMaster[sampleIndex][rowIndex] = res;
        this.diagnosticsForm.get('samples').updateValueAndValidity();
      });
  }

  updateLabTestingView(index: number) {
    this.dataSources[index]?.next(
      this.sampleExaminationDetails(index)?.controls as FormGroup[]
    );
  }

  addLabTestingRow(index: number, d?: LabTestingRow, noUpdate?: boolean) {
    const rows = this.sampleExaminationDetails(index);
    const labCd = rows?.length >= 1 ? rows.at(0).value.labCd : null;

    const row = this._fb.group({
      sampleId: [d && d.sampleId ? d.sampleId : null],
      sampleExaminationTypeCd: [
        d && d.sampleExaminationTypeCd ? d.sampleExaminationTypeCd : null,
        [Validators.required],
      ],
      sampleExaminationTypeDesc: [{ value: null, disabled: true }],
      sampleExaminationSubtypeCd: [
        d && d.sampleExaminationSubtypeCd ? d.sampleExaminationSubtypeCd : null,
        [],
      ],
      sampleExaminationSubtypeDesc: [{ value: null, disabled: true }],
      labCd: [d && d.labCd ? d.labCd : labCd, []],
      labDesc: [{ value: null, disabled: true }],

      labCharges: [
        d && d.labCharges ? d.labCharges : null,
        [decimalWithLengthValidation(9, 2)],
      ],
      receiptNo: [
        d && d.receiptNo ? d.receiptNo : null,
        [Validators.maxLength(10), AlphaNumericValidation],
      ],
      testRemarks: [
        d && d.testRemarks ? d.testRemarks : null,
        [Validators.maxLength(80), AlphaNumericSpecialValidation],
      ],
      modeOfTransport: [d && d.modeOfTransport ? d.modeOfTransport : null, []],
      modeOfTransportDesc: [{ value: null, disabled: true }],
      isUpdate: [noUpdate],
    });
    rows?.push(row);
    this.sampleSubExamTypeMaster[index]?.push([]);
    this.updateLabTestingView(index);
  }

  removeLabTestingElement(sampleIndex: number, rowIndex: number) {
    if (this.sampleExaminationDetails(sampleIndex).controls.length > 1) {
      this.sampleExaminationDetails(sampleIndex).removeAt(rowIndex);
      this.updateLabTestingView(sampleIndex);
      this.sampleSubExamTypeMaster[sampleIndex].splice(rowIndex, 1);
    } else {
      this.sampleExaminationDetails(sampleIndex).reset();
      this.sampleSubExamTypeMaster[sampleIndex].splice(rowIndex, 1);
    }
  }

  sampleExaminationDetails(i: number) {
    return (this.diagnosticsForm.get('samples') as FormArray)
      ?.at(i)
      .get('sampleExaminationDetails') as FormArray;
  }

  onSelectionChange(
    event: MatSelectChange,
    control: string,
    sampleIndex: number,
    examinationRowIndex: number
  ) {
    switch (control) {
      case 'sampleExaminationTypeCd':
        this.examTypeChange.emit(this.sampleControls);
        break;
    }
  }

  get sampleControls() {
    return this.diagnosticsForm.get('samples') as FormArray;
  }

  ngOnDestroy() {
    this.diagnosticsForm.removeControl('samples', { emitEvent: false });
  }

  setDesc() {
    this.diagnosticsForm
      .get('samples')
      .valueChanges.subscribe((value: SampleFormValue['samples']) => {
        if (!value) {
          return;
        }

        for (const [sampleIndex, sample] of value.entries()) {
          const sampleControl = this.sampleControls.at(sampleIndex);
          const disease = this.diseasesSuspected.find(
            (disease) => disease.diseaseCd === sample.diseaseCd
          );
          const sampleType = this.sampleTypeMaster.find(
            (sampleType) => sampleType.sampleTypeCd === sample.sampleType
          );

          sampleControl.patchValue(
            {
              diseaseDesc: disease?.diseaseDesc,
              sampleTypeDesc: sampleType?.sampleTypeDesc,
            },
            { emitEvent: false }
          );

          for (const [
            examinationRowIndex,
            examination,
          ] of sample.sampleExaminationDetails.entries()) {
            const examinationRow =
              this.sampleExaminationDetails(sampleIndex).at(
                examinationRowIndex
              );

            const sampleExaminationType = this.sampleExamTypeMaster[
              sampleIndex
            ]?.find(
              (sampleExamType) =>
                sampleExamType.sampleExaminationTypeCd ===
                examination.sampleExaminationTypeCd
            );

            const sampleExaminationSubtype = this.sampleSubExamTypeMaster[
              sampleIndex
            ][examinationRowIndex]?.find(
              (subExamType) =>
                subExamType.sampleExaminationSubtypeCd ===
                examination.sampleExaminationSubtypeCd
            );

            const lab = this.labMaster.find(
              (lab) => lab.subOrgId === examination.labCd
            );

            const modeOfTransport = this.modeOfTransports.find(
              (mode) => mode.cd === examination.modeOfTransport
            );

            examinationRow.patchValue(
              {
                sampleExaminationTypeDesc:
                  sampleExaminationType?.sampleExaminationTypeDesc,
                sampleExaminationSubtypeDesc:
                  sampleExaminationSubtype?.sampleExaminationSubtypeDesc,
                labDesc: lab?.subOrgName,
                modeOfTransportDesc: modeOfTransport?.value,
              },
              { emitEvent: false }
            );
          }
        }
      });
  }

  fetchAllLabs() {
    this.showAllLabs = true;
    this.isLoading = true;
    this.healthService.getSubOrgList(5, false).subscribe((res) => {
      this.labMaster = res;
      this.isLoading = false;
    });
  }

  checkIfLabExistsInList() {
    if (this.showAllLabs) {
      return;
    }

    for (const sample of this.sampleControls.controls as FormGroup[]) {
      const row = (sample.get('sampleExaminationDetails') as FormArray)
        .controls[0] as FormGroup;

      const labNotFound =
        this.labMaster.findIndex(
          (lab) => lab.subOrgId === row.get('labCd').value
        ) === -1;

      if (labNotFound) {
        this.fetchAllLabs();
        break;
      }
    }
  }
}
