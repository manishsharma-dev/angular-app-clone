import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-growth-monitoring',
  templateUrl: './growth-monitoring.component.html',
  styleUrls: ['./growth-monitoring.component.css'],
})
export class GrowthMonitoringComponent implements OnInit {
  growthMonitoringDetails = {
    compDetail: 'GM',
    newPageUrl: './dashboard/performance-recording/growth-monitoring/new-gm',
    apiType: 'apiUrlBreedingModule',
    apiUrl: 'animalbreeding/search/getSearchDetails?searchCriteria=',
    tableHeading: 'animalDetails.list_of_registered_animals',
    isHistory: true,
    name: 'performanceRecording.growth_monitoring',
    // historyURL:
    //   './dashboard/performance-recording/growth-monitoring/gm-history',
  };

  constructor() {}

  ngOnInit(): void {}
}
