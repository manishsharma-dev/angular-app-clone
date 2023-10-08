import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-owner-response-dialog',
  templateUrl: './owner-response-dialog.component.html',
  styleUrls: ['./owner-response-dialog.component.css'],
})
export class OwnerResponseDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      id: number;
      disableIcon: boolean;
      title: string;
      message: string;
      primaryBtnText: string;
      secondaryBtnText: string;
      colour: string;
    },
    private dialogRef: MatDialogRef<OwnerResponseDialogComponent>
  ) {}

  onSubmit(flag: boolean) {
    this.dialogRef.close(flag);
  }
}
