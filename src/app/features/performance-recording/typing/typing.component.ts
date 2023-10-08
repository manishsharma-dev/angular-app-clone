import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-typing',
  templateUrl: './typing.component.html',
  styleUrls: ['./typing.component.css'],
})
export class TypingComponent implements OnInit {
  typingDetails = {
    compDetail: 'Typing',
    newPageUrl: './dashboard/performance-recording/typing/new-typing',
    apiType: 'apiUrlBreedingModule',
    apiUrl: 'animalbreeding/search/getSearchDetails?searchCriteria=',
    // name: 'animalBreeding.ai',
    tableHeading: 'animalDetails.list_of_registered_animals',
    isAction: false,
    name: 'performanceRecording.typing',
  };

  constructor() {}

  ngOnInit(): void {}
}
