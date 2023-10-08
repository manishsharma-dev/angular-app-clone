
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-artificial-insemination',
  templateUrl: './artificial-insemination.component.html',
  styleUrls: ['./artificial-insemination.component.css']
})
export class ArtificialInseminationComponent implements OnInit {

  aiDetails:object = {}
  constructor( public dialog: MatDialog,) { }

  ngOnInit(): void {
    this.aiDetails = {
      compDetail: 'AI',
      newPageUrl: './dashboard/animal-breeding/artificial-insemination/newai',
      apiType:'apiURL',
      apiUrl:'animalbreeding/search/getSearchDetails?searchCriteria=',
      isHistory:false,
      calvingPageUrl:'./dashboard/animal-breeding/calving/new-calving',
      isBreed:true,
      tableHeading:'animalBreeding.registered_female_animal',
      name:'animalBreeding.ai'
    }
   
   
  }
 
}