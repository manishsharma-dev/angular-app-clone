import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-embryo-transfer',
  templateUrl: './embryo-transfer.component.html',
  styleUrls: ['./embryo-transfer.component.css']
})
export class EmbryoTransferComponent implements OnInit {

  embryoTransferDetails:object = {}
  constructor( public dialog: MatDialog,) { }

  ngOnInit(): void {
    this.embryoTransferDetails = {
      compDetail: 'ET',
      newPageUrl: './dashboard/animal-breeding/et/new-embryo-transfer',
      apiType:'apiUrlBreedingModule',
      apiUrl:'animalbreeding/search/getSearchDetails?searchCriteria=',
      isHistory:false,
      isBreed:true,
      tableHeading:'animalBreeding.registered_female_animal',
      name:'animalBreeding.et'
    }
   
   
  }

}
