import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-calving',
  templateUrl: './calving.component.html',
  styleUrls: ['./calving.component.css']
})
export class CalvingComponent implements OnInit {

  calvingDetails:object ={}
  constructor( public dialog: MatDialog,) { }

  ngOnInit(): void {
    this.calvingDetails = {
      compDetail: 'Calving',
      newPageUrl: './dashboard/animal-breeding/calving/new-calving',
      apiType:'apiUrlBreedingModule',
      apiUrl:'animalbreeding/search/getSearchDetails?searchCriteria=',
      isHistory:false,
      isBreed:true,
      tableHeading:'animalBreeding.registered_female_animal',
      name:'animalBreeding.calving'
    }
   
   
  }
}
