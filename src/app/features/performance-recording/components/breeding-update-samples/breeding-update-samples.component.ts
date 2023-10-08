import { Component, OnInit, Inject } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { decimalNumberValidation } from 'src/app/shared/utility/validation';
import { animalBreedingValidations } from 'src/app/shared/validatator';
import { decimalWithLengthValidation } from '../../../../shared/utility/decimalWithLengthValidator';
import { MilkSamplingService } from '../../milk-sampling/milk-sampling.service';
import { PrService } from '../../pr.service';
import { CommonMaster } from 'src/app/features/animal-health/animal-treatment/models/common-master.model';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-breeding-update-samples',
  templateUrl: './breeding-update-samples.component.html',
  styleUrls: ['./breeding-update-samples.component.css'],
})
export class BreedingUpdateSamplesComponent implements OnInit {
  addSampleForm: FormGroup;
  cmnValidation = animalBreedingValidations.common;
  isLoadingSpinner = false;
  sampleResults: CommonMaster[] = [];
  sampleArrayControls = new BehaviorSubject<AbstractControl[]>([]);
  configKeys = {
    Cattle: [
      'cattleFatPercent',
      'cattleProteinPercent',
      'cattleLactosePercent',
      'cattleSNFPercent',
      'cattleSCC',
      'cattleMUN',
    ],
    Buffalo: [
      'buffaloFatPercent',
      'buffaloProteinPercent',
      'buffaloLactosePercent',
      'buffaloSNFPercent',
      'buffaloSCC',
      'buffaloMUN',
    ],
  };

  configKeyFormMapping = {
    Cattle: {
      cattleFatPercent: 'fatPercentage',
      cattleMUN: 'milkUreaNitrogen',
      cattleSCC: 'somaticCellCount',
      cattleLactosePercent: 'lactosePercentage',
      cattleSNFPercent: 'snfPercentage',
      cattleProteinPercent: 'proteinPercentage',
    },
    Buffalo: {
      buffaloFatPercent: 'fatPercentage',
      buffaloMUN: 'milkUreaNitrogen',
      buffaloSCC: 'somaticCellCount',
      buffaloLactosePercent: 'lactosePercentage',
      buffaloSNFPercent: 'snfPercentage',
      buffaloProteinPercent: 'proteinPercentage',
    },
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private prService: PrService,
    private msService: MilkSamplingService,
    private dialogRef: MatDialogRef<BreedingUpdateSamplesComponent>
  ) {}

  ngOnInit(): void {
    const species = this.data[0]?.species;
    if (this.data[0]?.breedingExaminationType === 1) {
      this.prService
        .getConfigDetails(this.configKeys[species])
        .pipe(map((res) => res.map((config) => Object.values(config)[0])))
        .subscribe((res: any) => {
          for (const config of res) {
            for (const group of this.sampleArray.controls) {
              // const group = this.sampleArray.controls;

              const control = group.get(
                this.configKeyFormMapping[species][config.key]
              );

              control.addValidators([
                Validators.min(config.rangeLowerValue),
                Validators.max(config.rangeUpperValue),
              ]);
              control.updateValueAndValidity();
            }
          }
        });
    } else {
      this.prService.getCommonMaster('sample_result').subscribe((res) => {
        this.sampleResults = res;
      });
    }

    this.addSampleForm = this.fb.group({
      milkSamples: this.fb.array([]),

      sampleResult: [],
    });
    for (const data of this.data) {
      this.addSample();
    }
    if (this.data[0].breedingExaminationType === 1) {
      // this.addSampleForm
      //   .get('fatPercentage')
      //   ?.addValidators(Validators.required);
    } else if (this.data[0].breedingExaminationType === 2) {
      this.addSampleForm.get('sampleResult').addValidators(Validators.required);
      this.sampleArray.controls.forEach((group) => {
        group.get('fatPercentage').removeValidators([Validators.required]);
        group.get('fatPercentage').updateValueAndValidity();
      });
    }
  }

  addSample() {
    const group = this.fb.group({
      fatPercentage: [
        null,
        [
          Validators.required,
          decimalNumberValidation,
          Validators.min(0),
          Validators.max(100),
        ],
      ],
      proteinPercentage: [
        null,
        [decimalNumberValidation, Validators.min(0), Validators.max(100)],
      ],
      snfPercentage: [
        null,
        [decimalNumberValidation, Validators.min(0), Validators.max(100)],
      ],
      lactosePercentage: [
        null,
        [decimalNumberValidation, Validators.min(0), Validators.max(100)],
      ],
      somaticCellCount: [],
      milkUreaNitrogen: [null, [decimalWithLengthValidation(9, 2)]],
    });

    this.sampleArray.push(group);
    this.sampleArrayControls.next(this.sampleArray.controls);
  }

  get sampleArray() {
    return this.addSampleForm.get('milkSamples') as FormArray;
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.addSampleForm.invalid) {
      this.addSampleForm.markAllAsTouched();
      return;
    }

    const reqObj = [];
    if (this.data[0].breedingExaminationType === 1) {
      this.sampleArray.value.forEach((value, i) => {
        reqObj.push({
          ...this.data[i],
          ...value,
        });
      });
    } else {
      reqObj.push({
        ...this.data[0],
        sampleResult: this.addSampleForm.value.sampleResult,
      });
    }

    this.isLoadingSpinner = true;
    this.msService.updateSamples(reqObj).subscribe(
      (res) => {
        this.isLoadingSpinner = false;
        this.dialogRef.close(true);
      },
      () => {
        this.isLoadingSpinner = false;
        this.dialogRef.close(false);
      }
    );
  }
}
