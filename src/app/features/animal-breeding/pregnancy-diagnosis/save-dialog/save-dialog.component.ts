import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Location } from '@angular/common';
@Component({
  selector: 'app-save-dialog',
  templateUrl: './save-dialog.component.html',
  styleUrls: ['./save-dialog.component.css']
})
export class SaveDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<SaveDialogComponent>,
    private _location: Location,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      transaction_id:string;
      temporary_id:any;
      calvingDate:any
      isCalving:boolean,
      calvingStatus:number,
      isCalvingEdit:boolean,
      calfDetails?:any
    }
  ) {}

  ngOnInit(): void {
  }
  closeDialog() {
    this.dialogRef.close();
    // this._location.back();
  }
}
