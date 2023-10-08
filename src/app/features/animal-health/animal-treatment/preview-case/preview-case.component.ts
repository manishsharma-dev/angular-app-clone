import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
import { AnimalTreatmentService } from '../animal-treatment.service';
@Component({
  selector: 'app-preview-case',
  templateUrl: './preview-case.component.html',
  styleUrls: ['./preview-case.component.css']
})
export class PreviewCaseComponent implements OnInit {
  isLoadingSpinner : boolean = false;
  prescriptionRes: any = {};
  constructor(private treatmentService: AnimalTreatmentService, @Inject(MAT_DIALOG_DATA) public data: any,private dialogRef: MatDialogRef<PreviewCaseComponent>) { }

  ngOnInit(): void {
    this.prescriptionRes = this.data.openRequest;
  }

  formatDate(date: string) {
    return moment(date).format('DD/MM/YYYY');
  }

  getAnimalAge(dob: string) {
    const monthCount = moment().diff(moment(dob), 'months');

    return this.treatmentService.getWords(monthCount);
  }

  onSubmit(flag: boolean) {
    this.dialogRef.close(flag);
  }

}
