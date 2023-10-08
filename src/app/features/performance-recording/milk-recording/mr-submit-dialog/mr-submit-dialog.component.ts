import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-mr-submit-dialog',
  templateUrl: './mr-submit-dialog.component.html',
  styleUrls: ['./mr-submit-dialog.component.css'],
})
export class MrSubmitDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<MrSubmitDialogComponent>
  ) {}

  ngOnInit(): void {}

  onSubmit(flag: boolean) {
    this.dialogRef.close(flag);
  }
}
