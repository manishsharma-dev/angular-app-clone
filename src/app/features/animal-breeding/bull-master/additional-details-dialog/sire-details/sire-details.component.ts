import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';
import { IDialogData } from '../additional-details-dialog.component';

@Component({
  selector: 'app-sire-details',
  templateUrl: './sire-details.component.html',
  styleUrls: ['./sire-details.component.css'],
})
export class SireDetailsComponent implements OnInit {
  @Input() isParent = true;
  @Input() parentForm: FormGroup;
  @Input() formGroupNameString: string;
  @Input() bullDetails: IDialogData;
  // form: FormGroup;
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const form = this.fb.group({
      standardYield: [],
      standardYieldBreeding: [],
      standardYieldReliability: [],
      fatPercent: [],
      fatPercentBreeding: [],
      fatPercentReliability: [],
      fatYield: [],
      fatYieldBreeding: [],
      fatYieldReliability: [],
      protienPercent: [],
      protienPercentBreeding: [],
      protienPercentReliability: [],
      protienYield: [],
      protienYieldBreeding: [],
      protienYieldReliability: [],
      lactosePercent: [],
      lactosePercentBreeding: [],
      lactosePercentReliability: [],
      lactoseYield: [],
      lactoseYieldBreeding: [],
      lactoseYieldReliability: [],
      sscValue: [],
      sscBreeding: [],
      sscReliability: [],
      munValue: [],
      munBreeding: [],
      munReliability: [],
    });

    this.parentForm?.addControl(this.formGroupNameString, form);
  }

  // get dateGroup() {
  //   return this.parentForm?.get('dateGroup') as FormGroup;
  // }

  get childFormGroup(): FormGroup {
    return this.parentForm.get(this.formGroupNameString) as FormGroup;
  }
}
