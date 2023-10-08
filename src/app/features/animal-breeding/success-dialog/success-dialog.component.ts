import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-success-dialog',
  templateUrl: './success-dialog.component.html',
  styleUrls: ['./success-dialog.component.css'],
})
export class SuccessDialogComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<SuccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      lactationNo: string;
      transaction_id: string;
      temporary_id: string;
      calvingDate: any;
      isCalving: boolean;
      testPlanId: string;
      onSpotId: string;
      sampleId: string;
      dryOffId: string;
    }
  ) {}

  ngOnInit(): void {}
  closeDialog() {
    this.dialogRef.close();
    // this._location.back();
  }
}
