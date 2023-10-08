import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-previous-results',
  templateUrl: './previous-results.component.html',
  styleUrls: ['./previous-results.component.css']
})
export class PreviousResultsComponent implements OnInit {
  isLoadingSpinner: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

}
