import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-view-user-all-dealloc',
  templateUrl: './view-user-all-dealloc.component.html',
  styleUrls: ['./view-user-all-dealloc.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ViewUserAllDeallocComponent implements OnInit {

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
    private dialogRef: MatDialogRef<ViewUserAllDeallocComponent>) { }

  ngOnInit(): void {
    this.dialogRef.updateSize('800px');
  }

}
