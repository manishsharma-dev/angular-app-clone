import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-view-test-plan-details',
  templateUrl: './view-test-plan-details.component.html',
  styleUrls: ['./view-test-plan-details.component.css'],
})
export class ViewTestPlanDetailsComponent implements OnInit {
  step = 1;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {}

  setStep(step: number) {
    if (this.step === step) {
      this.step = -1;
    } else {
      this.step = step;
    }
  }
}
