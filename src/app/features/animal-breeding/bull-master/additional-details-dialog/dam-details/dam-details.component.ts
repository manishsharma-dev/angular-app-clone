import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { IDialogData } from '../additional-details-dialog.component';

@Component({
  selector: 'app-dam-details',
  templateUrl: './dam-details.component.html',
  styleUrls: ['./dam-details.component.css'],
})
export class DamDetailsComponent implements OnInit {
  @Input() parentForm: FormGroup;
  @Input() formGroupNameString: string;
  @Input() bullDetails: IDialogData;

  @ViewChild('parameters') parameters: ElementRef<HTMLDivElement>;
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const form = this.fb.group({
      standardYield: this.fb.group({
        lactations: this.fb.array([this.fb.control(null)]),
        breedingValue: [],
      }),
      fatPercentage: this.fb.group({
        lactations: this.fb.array([this.fb.control(null)]),
        breedingValue: [],
      }),
      fatYield: this.fb.group({
        lactations: this.fb.array([this.fb.control(null)]),
        breedingValue: [],
      }),
      proteinPercentage: this.fb.group({
        lactations: this.fb.array([this.fb.control(null)]),
        breedingValue: [],
      }),
      proteinYield: this.fb.group({
        lactations: this.fb.array([this.fb.control(null)]),
        breedingValue: [],
      }),
      lactosePercentage: this.fb.group({
        lactations: this.fb.array([this.fb.control(null)]),
        breedingValue: [],
      }),
      lactoseYield: this.fb.group({
        lactations: this.fb.array([this.fb.control(null)]),
        breedingValue: [],
      }),
      scc: this.fb.group({
        lactations: this.fb.array([this.fb.control(null)]),
        breedingValue: [],
      }),
      mun: this.fb.group({
        lactations: this.fb.array([this.fb.control(null)]),
        breedingValue: [],
      }),
    });

    this.parentForm?.addControl(this.formGroupNameString, form);
  }

  get childFormGroup(): FormGroup {
    return this.parentForm.get(this.formGroupNameString) as FormGroup;
  }

  addLactation() {
    for (const control of Object.values(this.childFormGroup.controls)) {
      (control.get('lactations') as FormArray)?.push(this.fb.control(null));
    }
  }

  deleteLactation(i: number) {
    const lactationsLength = (
      this.childFormGroup.get('mun').get('lactations') as FormArray
    ).length;

    if (lactationsLength > 1) {
      for (const control of Object.values(this.childFormGroup.controls)) {
        (control.get('lactations') as FormArray)?.removeAt(i);
      }
    } else {
      for (const control of Object.values(this.childFormGroup.controls)) {
        (control.get('lactations') as FormArray)?.at(0).reset();
      }
    }
  }

  getLactations(groupName: string) {
    return (
      (this.childFormGroup.get(groupName) as FormGroup).get(
        'lactations'
      ) as FormArray
    ).controls;
  }

  onLeftScrollButtonClick(direction: 'left' | 'right') {
    switch (direction) {
      case 'left':
        // this.parameters.nativeElement.scrollLeft -= 230;
        this.parameters.nativeElement.scrollTo({
          behavior: 'smooth',
          left: this.parameters.nativeElement.scrollLeft - 230,
        });
        break;
      case 'right':
        // this.parameters.nativeElement.scrollLeft += 230;
        this.parameters.nativeElement.scrollTo({
          behavior: 'smooth',
          left: this.parameters.nativeElement.scrollLeft + 230,
        });
        break;
    }
  }
}
