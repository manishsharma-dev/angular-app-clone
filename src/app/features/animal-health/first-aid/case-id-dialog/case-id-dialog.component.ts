import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Location } from '@angular/common';
@Component({
  selector: 'app-case-id-dialog',
  templateUrl: './case-id-dialog.component.html',
  styleUrls: ['./case-id-dialog.component.css']
})
export class CaseIDDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<CaseIDDialogComponent>, private _location: Location,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      message: string;
      caseID: number;
      primaryBtnText: string;
      secondaryBtnText: string;
      supervisorName: string;
    }) { }

  ngOnInit(): void {
  }
  closeDialog() {
    this.dialogRef.close();
    this._location.back();
  }

}
