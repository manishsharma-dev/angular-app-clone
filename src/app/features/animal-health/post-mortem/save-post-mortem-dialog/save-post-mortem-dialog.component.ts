import { Location } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SavePostMortemResponse } from '../models/save-postmortem-response.model';

@Component({
  selector: 'app-save-post-mortem-dialog',
  templateUrl: './save-post-mortem-dialog.component.html',
  styleUrls: ['./save-post-mortem-dialog.component.css'],
})
export class SavePostMortemDialogComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<SavePostMortemDialogComponent>,
    private _location: Location,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      postMortemId: number;
      table_header: any;
      table_value: SavePostMortemResponse['sampleDetails'];
    }
  ) {}

  ngOnInit(): void {}

  closeDialog() {
    this.dialogRef.close();
    this._location.back();
  }
}
