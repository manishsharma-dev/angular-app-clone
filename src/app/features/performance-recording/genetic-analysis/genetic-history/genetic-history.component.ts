import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-genetic-history',
  templateUrl: './genetic-history.component.html',
  styleUrls: ['./genetic-history.component.css'],
})
export class GeneticHistoryComponent implements OnInit {
  isLoadingSpinner = false;
  tagId: number;
  historyDetail: object;

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (!params['tagId']) {
        // this.router.navigate(['/not-found']);
        return false;
      }
      this.tagId = params['tagId'];

      return true;
    });
    this.historyDetail = {
      compDetail: 'GA',
      newPageUrl:
        './dashboard/performance-recording/genetic-analysis/add-genomic-sample',
      tagId: this.tagId,
      isHistory: true,
      isBreed: false,
      name: 'performanceRecording.genetic_analysis',
      columns: [
        'sampleId',
        'sampleRecordDate',
        'sampleCollectionDate',
        'breedingSampleTypeName',
        'breedingExaminationSubtypeName',
        'labName',
        'sampleResult',
      ],
    };
  }
}
