import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-view-org-details',
  templateUrl: './view-org-details.component.html',
  styleUrls: ['./view-org-details.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ViewOrgDetailsComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA)
  public data: {
    id: number;
    title: string;
    message: string;
    icon: string;
    statusData: number;
    primaryBtnText: string;
    secondaryBtnText: string;
    colour: string

  },
    private dialogRef: MatDialogRef<ViewOrgDetailsComponent>) { }

  ngOnInit(): void {

    this.dialogRef.updateSize('600');
  }
}
