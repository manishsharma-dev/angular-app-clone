import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { VaccinationDetails } from '../models/vacc-details.model';
import { CampaignList } from '../models/campaign-list.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vaccination-dialog',
  templateUrl: './vaccination-dialog.component.html',
  styleUrls: ['./vaccination-dialog.component.css']
})
export class VaccinationDialogComponent implements OnInit {
  batchno: number;
  disease: string;
  vaccName: string;
  details: any;
  withCamapign: any;

  constructor(private dialogRef: MatDialogRef<VaccinationDialogComponent>,
    private _location: Location, private router: Router, @Inject(MAT_DIALOG_DATA) public data: {
      dataKey(dataKey: any): unknown;
      dataKeyForDetails: any;
      supervisorName: string;
      transactionId: number;
      title: string;
    }) { }

  ngOnInit(): void {
    this.details = this.data.dataKey;
    this.withCamapign = this.data.dataKeyForDetails
    this.batchno = this.withCamapign.batchNumber;
    this.disease = this.withCamapign.diseaseDesc;
    this.vaccName = this.withCamapign.vaccineName;
  }
  closeDialog() {
    this.dialogRef.close();
    window.location.reload()
  }
}
