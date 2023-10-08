import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ConfirmationDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      id: number;
      title: string;
      message: string;
      icon: string;
      configData?: {
        oldData: string;
        newData: string;
      };
      statusData: number;
      primaryBtnText: string;
      secondaryBtnText: string;
      colour: string;
    },
    private dialogRef: MatDialogRef<ConfirmationDialogComponent>
  ) {}
  ngOnInit(): void {
    this.dialogRef.updateSize('400px');
  }

  onSubmit() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
