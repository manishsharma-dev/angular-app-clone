import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  FormGroupName,
} from '@angular/forms';
import { IDialogData } from '../additional-details-dialog.component';

@Component({
  selector: 'app-date-section',
  templateUrl: './date-section.component.html',
  styleUrls: ['./date-section.component.css'],
})
export class DateSectionComponent implements OnInit {
  @Input('parentForm') parentForm: FormGroup;
  @Input() isSire = true;
  @Input() bullDetails: IDialogData;
  @Input() labels = {
    labelOne: 'animalBreeding.bull_id',
    labelTwo: 'animalDetails.sire_Id',
  };

  constructor() {}

  ngOnInit(): void {}

  get childFormGroup(): FormGroup {
    return this.parentForm;
  }
}
