import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-campaign-creation-dialog',
  templateUrl: './campaign-creation-dialog.component.html',
  styleUrls: ['./campaign-creation-dialog.component.css']
})

export class CampaignCreationDialogComponent implements OnInit {

  constructor(public dialog: MatDialog, private dialogRef: MatDialogRef<CampaignCreationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:{
      campaignId: number;
      campaignType:number;
      title: string;
    
      }) { }

  ngOnInit(): void {


  }

  closeDialog(){
    // this.dialogRef.close();
    window.location.reload()
  }
  
 
}
