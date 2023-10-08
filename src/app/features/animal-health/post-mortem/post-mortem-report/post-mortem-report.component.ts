import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';
import { HealthService } from '../../health.service';

@Component({
  selector: 'app-post-mortem-report',
  templateUrl: './post-mortem-report.component.html',
  styleUrls: ['./post-mortem-report.component.css'],
})
export class PostMortemReportComponent implements OnInit {
  sampleDetails = SAMPLE;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private healthService: HealthService
  ) {}

  ngOnInit(): void {}

  downloadReport() {}

  getAnimalAge(months: string) {
    return this.healthService.getWords(months);
  }

  formatDate(date: string) {
    return moment(date).format('DD/MM/YYYY');
  }
}

const SAMPLE = [
  {
    sampleID: '10452867',
    sampleType: 'Blood',
    Result: '-',
  },
];
