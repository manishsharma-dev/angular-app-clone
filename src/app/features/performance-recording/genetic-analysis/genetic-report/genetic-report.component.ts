import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';
import { AnimalTreatmentService } from 'src/app/features/animal-health/animal-treatment/animal-treatment.service';
import { MilkSampleDetails } from '../../milk-sampling/models/sample-details.model';
import { PrService } from '../../pr.service';

@Component({
  selector: 'app-genetic-report',
  templateUrl: './genetic-report.component.html',
  styleUrls: ['./genetic-report.component.css'],
})
export class GeneticReportComponent implements OnInit {
  isLoadingSpinner = false;
  results = [
    {
      resultsFor: 'Parentage Verification',
      data: { Result: 'Positive', 'Lab Name': 'Lab One' },
    },
    {
      resultsFor: 'Breed Purity',
      data: { 'Exotic Blood Level': 'HF 50% ; Jer 50%', 'Lab Name': 'Lab One' },
    },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: MilkSampleDetails['labTesting'],
    private treatmentService: AnimalTreatmentService,
    private prService: PrService
  ) {}

  ngOnInit(): void {}

  getAnimalAge(dob: string) {
    const monthCount = moment(this.prService.currentDate).diff(
      moment(dob),
      'months'
    );

    return this.treatmentService.getWords(monthCount);
  }

  downloadReport(data: any) {}
}
