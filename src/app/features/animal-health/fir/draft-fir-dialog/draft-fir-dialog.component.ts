import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Location } from '@angular/common';
@Component({
  selector: 'app-draft-fir-dialog',
  templateUrl: './draft-fir-dialog.component.html',
  styleUrls: ['./draft-fir-dialog.component.css']
})
export class DraftFirDialogComponent implements OnInit {
  constructor(private dialogRef: MatDialogRef<DraftFirDialogComponent>, private _location: Location,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      final_report: string;
      title: string;
      sub_title: string;
      followDateMessage: string;
      followDate: string;
      firID: number;
      supervisorName: string;
      table_header: any;
      table_value: any;
    }) { }

  ngOnInit(): void {

  }

  closeDialog() {
    sessionStorage.setItem('firActiveTab', '1');
    this.dialogRef.close();
    this._location.back();
  }

}
