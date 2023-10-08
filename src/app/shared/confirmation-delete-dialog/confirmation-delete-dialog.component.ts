import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'confirmation-delete-dialog',
  templateUrl: './confirmation-delete-dialog.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./confirmation-delete-dialog.component.css'],

})
export class ConfirmationDeleteDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      id:number
      title: string;
      message: string;
      icon:string
      primaryBtnText: string;
      secondaryBtnText: string;
      colour: string
    },
    
    private dialogRef: MatDialogRef<ConfirmationDeleteDialogComponent>
  ) {}

  ngOnInit(): void {
    this.dialogRef.updateSize('400px');
    console.log(this.data.colour, 'data');
  }

 
}
