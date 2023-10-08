import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-treatment-response-dialog',
  templateUrl: './treatment-response-dialog.component.html',
  styleUrls: ['./treatment-response-dialog.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class TreatmentResponseDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      id: number;
      title: string;
      message: string;
      primaryBtnText: string;
      secondaryBtnText: string;
      colour: string;
      icon: string;
    },
    private dialogRef: MatDialogRef<TreatmentResponseDialogComponent>
  ) {}

  onSubmit(flag: boolean) {
    this.dialogRef.close(flag);
  }
}
