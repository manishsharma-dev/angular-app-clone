import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
import { animalBreedingValidations } from 'src/app/shared/validatator';
import { PrService } from '../../pr.service';

@Component({
  selector: 'app-update-calving-date-dialog',
  templateUrl: './update-calving-date-dialog.component.html',
  styleUrls: ['./update-calving-date-dialog.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class UpdateCalvingDateDialogComponent implements OnInit {
  cmnValidation = animalBreedingValidations.common;
  form = new FormGroup({
    calvingDate: new FormControl(this.today, [Validators.required]),
  });

  constructor(
    private readonly dialogRef: MatDialogRef<UpdateCalvingDateDialogComponent>,
    private prService: PrService
  ) {}

  ngOnInit(): void {}

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.form.value);
  }

  get today() {
    return moment(this.prService.currentDate);
  }

  get minDate() {
    return this.today.subtract(3, 'year');
  }
}
