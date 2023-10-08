import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { concat, iif, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  switchMap,
  tap,
  map,
} from 'rxjs/operators';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { AlphaNumericSpecialValidation } from 'src/app/shared/utility/validation';
import { HealthService } from '../../health.service';
import { AnimalTreatmentService } from '../animal-treatment.service';

@Component({
  selector: 'app-add-medicine',
  templateUrl: './add-medicine.component.html',
  styleUrls: ['./add-medicine.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AddMedicineComponent implements OnInit {
  searchMedicineFormGroup!: FormGroup;
  medicines!: Observable<any[]>;
  selectedMedicines = [];
  searchMedicine = new FormControl('', [Validators.required]);
  other_medicines!: FormGroup;
  selectedMedicine: any = [];
  otherMedicine = [];
  toAddMedicineList: any = [];
  isAddOtherMedicineSubmitted: boolean = false;
  medcineInput$ = new Subject<string>();
  medicineLoading = false;
  formMaster: any[] = [];
  constructor(
    private _fb: FormBuilder,
    public dialogRef: MatDialogRef<AddMedicineComponent>,
    private _animalTreatmentService: AnimalTreatmentService,
    private healthService: HealthService
  ) {}

  ngOnInit(): void {
    this.searchMedicineFormGroup = this._fb.group({
      medicineControl: [null],
      medicineName: [
        '',
        [
          Validators.required,
          Validators.maxLength(80),
          AlphaNumericSpecialValidation,
        ],
      ],
      remarks: ['', [Validators.maxLength(250), AlphaNumericSpecialValidation]],
    });

    this.healthService
      .getCommonMaster(AnimalHealthConfig.commonMasterKeys.medicineForm)
      .subscribe((res: any) => {
        this.formMaster = res;
      });
    this.fetchMedicines();
  }

  fetchMedicines(flag?: number) {
    //this.medicines = this._animalTreatmentService.getMedicinebySearch(request);
    this.medicines = concat(
      of([]),
      this.medcineInput$.pipe(
        distinctUntilChanged(),
        tap(() => (this.medicineLoading = true)),
        switchMap((term) => {
          return iif(
            () => term != null,
            this._animalTreatmentService.getMedicinebySearch({
              dewormerFlg: 'N',
              medicineNameOrSaltName: term,
            })
          ).pipe(
            map((res: any) => {
              if (res.errorCode) return [];
              return res;
            }),
            catchError(() => of([])), // empty list on error
            tap(() => (this.medicineLoading = false))
          );
        })
      )
    );
  }

  onSelectMedicne($event: any) {
    this.selectedMedicine = $event;

    const form: any[] = this.formMaster;
    const medicineAdded = this.toAddMedicineList.find(
      (a: any) => a.medicineCd == $event.medicineCd
    );
    if (!medicineAdded) {
      this.toAddMedicineList.push($event);
    }
    // for (let med of this.toAddMedicineList) {
    //   med['formName'] = form.find((f) => f.cd === med.medicineFormCd)?.value;
    // }
    this.searchMedicineFormGroup.patchValue({
      medicineControl: null,
    });
  }

  addToMedicineList() {
    //const addedList = this.selectedMedicine.filter((a: any) => a.isAdded);
    this.dialogRef.close({ addedMedicineList: this.toAddMedicineList });
  }

  addOtherMedicine() {
    this.isAddOtherMedicineSubmitted = true;
    if (this.searchMedicineFormGroup.invalid) {
      return;
    }
    const other_medine = this.searchMedicineFormGroup['controls'];
    const obj = {
      medicineCd: 0,
      medicineName: other_medine.medicineName.value,
      remarks: other_medine.remarks.value,
      medicinePrescribedOnlyFlag: 'Y',
    };
    this.addToMainMedicineList(obj);
    this.isAddOtherMedicineSubmitted = false;
    this.searchMedicineFormGroup.patchValue({
      medicineName: null,
      remarks: '',
      medicinePrescribedOnlyFlag: 'Y',
    });
  }

  removeOtherMedicine(i: number) {}

  addToMainMedicineList(medicine: any) {
    if (
      medicine.medicineCd != 0 &&
      !this.toAddMedicineList.find(
        (a: any) => a.medicineCd === medicine.medicineCd
      )
    ) {
      this.toAddMedicineList.push(medicine);
    } else if (
      medicine.medicineCd == 0 &&
      !this.toAddMedicineList.find(
        (a: any) => a.medicineName === medicine.medicineName
      )
    ) {
      this.toAddMedicineList.push(medicine);
    }
  }

  removeToMainMedicineList(medicine: any) {
    if (medicine.medicineCd != 0) {
      const index = this.toAddMedicineList.findIndex(
        (a: any) => a.medicineCd == medicine.medicineCd
      );
      if (index != -1) {
        this.toAddMedicineList.splice(index, 1);
      }
    } else {
      const index = this.toAddMedicineList.findIndex(
        (a: any) => a.medicineName == medicine.medicineName
      );
      if (index != -1) {
        this.toAddMedicineList.splice(index, 1);
      }
    }
  }
  isMedAdded(med: any) {
    return this.toAddMedicineList.filter(
      (a: any) => a.medicineCd == med.medicineCd
    ).length;
  }
  get formControls() {
    return this.searchMedicineFormGroup.controls;
  }
}
