import { Component,  OnInit } from '@angular/core';

@Component({
  selector: 'app-synchronisation',
  templateUrl: './synchronisation.component.html',
  styleUrls: ['./synchronisation.component.css']
})
export class SynchronisationComponent implements OnInit {
  heatDetails:object = {}
  ngOnInit(): void {
    
      this.heatDetails = {
        compDetail: 'Sync',
        newPageUrl: 'dashboard/animal-breeding/et/new-syncronization',
        apiType:'apiUrlBreedingModule',
        apiUrl:'animalbreeding/search/getSearchDetails?searchCriteria=',
        isHistory:false,
        isAdd:true,
        isCheckbox:true,
        isAction:false,
        isBreed:true,
        tableHeading:'animalBreeding.registered_female_animal'
      }
     
  }

  
}
