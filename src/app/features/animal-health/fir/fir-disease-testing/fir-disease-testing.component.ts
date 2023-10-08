import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';

@Component({
  selector: 'app-fir-disease-testing',
  templateUrl: './fir-disease-testing.component.html',
  styleUrls: ['./fir-disease-testing.component.css'],
})
export class FirDiseaseTestingComponent implements OnInit {
  firDiseaseTestingForm: FormGroup = this.fb.group({});
  firFlag = true;
  formSelected = false;
  individualTestForm = false;
  public minDate = moment().format('YYYY-MM-DD');
  public maxDate = '';

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<FirDiseaseTestingComponent>,) { }

  ngOnInit(): void {
    this.firDiseaseTestingForm = this.fb.group({
      testingDate: [],
      testingRecordDate: [
        { value: moment().format('DD/MM/YYYY'), disabled: true },
      ],
    });
  }
  newFormSelected(event) {
    this.formSelected = true;
  }

  get formControl() {
    return this.firDiseaseTestingForm.controls;
  }
  formSubmitted($event) {
    this.dialogRef.close({ sampleData: $event.sampleRequestDtos });
  }
}
