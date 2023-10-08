import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';



@Component({
  selector: 'app-heat-transaction',
  templateUrl: './heat-transaction.component.html',
  styleUrls: ['./heat-transaction.component.css']
})
export class HeatTransactionComponent implements OnInit {
 
  heatDetails:object ={}
  constructor( public dialog: MatDialog,) { }

  ngOnInit(): void {
    this.heatDetails = {
      compDetail: 'Heat Transaction',
      newPageUrl: './dashboard/animal-breeding/et/add-heat-transaction',
      apiType:'apiUrlBreedingModule',
      apiUrl:'animalbreeding/search/getSearchDetails?searchCriteria=',
      isHistory:false,
      isAdd:true,
      historyURL:'../ht-history',
      isBreed:true,
      tableHeading:'animalBreeding.registered_female_animal',
      name:'animalBreeding.heat_transaction'
    }
   
   
  }
}
