import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-gm-success-dialog',
  templateUrl: './gm-success-dialog.component.html',
  styleUrls: ['./gm-success-dialog.component.css'],
})
export class GmSuccessDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      transaction_id: string;
      title: string;
      currentGrowthRate: string;
      targetedWeeks: string;
      growthRate: string;
      targetedGrowthRate18Months: string;
      targetedGrowthRate24Months: string;
    }
  ) {}

  ngOnInit(): void {}

  closeDialog() {}
}
