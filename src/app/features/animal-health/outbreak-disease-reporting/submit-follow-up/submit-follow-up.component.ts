import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Location } from '@angular/common';

@Component({
  selector: 'app-submit-follow-up',
  templateUrl: './submit-follow-up.component.html',
  styleUrls: ['./submit-follow-up.component.css'],
})
export class SubmitFollowUpComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<SubmitFollowUpComponent>,
    private _location: Location,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      finalReport: string;
      title: string;
      sub_title: string;
      followDateMessage: string;
      followDate: string;
      outbreakStatus: string;
      outbreakId: number;
    }
  ) {}

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close();
    this._location.back();
  }
}
