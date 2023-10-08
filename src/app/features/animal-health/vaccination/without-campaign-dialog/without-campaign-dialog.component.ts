import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-without-campaign-dialog',
  templateUrl: './without-campaign-dialog.component.html',
  styleUrls: ['./without-campaign-dialog.component.css']
})
export class WithoutCampaignDialogComponent implements OnInit {
  batchno: number;
  disease: string;
  vaccName: string;
  details: any;
  constructor(
    private _location: Location, private router: Router, @Inject(MAT_DIALOG_DATA) public data: {
      diseaseDesc: string;
      VaccineName: string;
      batchno: number;
      dataKey: any;
      transactionId: number;
      title: string;
      supervisorName: string;

    },

    private dialogRef: MatDialogRef<WithoutCampaignDialogComponent>) { }

  ngOnInit(): void {
    this.details = this.data.dataKey;
  }
  closeDialog() {
    this.dialogRef.close();
    window.location.reload()
  }
}
