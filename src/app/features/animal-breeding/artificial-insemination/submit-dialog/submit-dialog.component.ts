import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SaveDialogComponent } from '../../pregnancy-diagnosis/save-dialog/save-dialog.component';

@Component({
  selector: 'app-submit-dialog',
  templateUrl: './submit-dialog.component.html',
  styleUrls: ['./submit-dialog.component.css']
})
export class SubmitDialogComponent implements OnInit {

 
  constructor(
    private dialogRef: MatDialogRef<SaveDialogComponent>,
    private _location: Location,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      transaction_id:string;
    }
  ) {}

  ngOnInit(): void {}
  closeDialog() {
    this.dialogRef.close();
    // this._location.back();
  }

}
