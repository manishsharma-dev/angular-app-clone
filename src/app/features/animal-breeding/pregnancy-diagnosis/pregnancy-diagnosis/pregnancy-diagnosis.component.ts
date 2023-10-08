import { Component, OnInit } from '@angular/core';
import { PDDetails } from '../model/pd-detail.model';

@Component({
  selector: 'app-pregnancy-diagnosis',
  templateUrl: './pregnancy-diagnosis.component.html',
  styleUrls: ['./pregnancy-diagnosis.component.css']
})
export class PregnancyDiagnosisComponent implements OnInit {

  pdDetails:any
  
  constructor( ) { }

  ngOnInit(): void {
    this.pdDetails = {
      compDetail: 'PD',
      newPageUrl: './dashboard/animal-breeding/pregnancy-diagnosis/new-pd',
      apiType:'apiUrlBreedingModule',
      apiUrl:'animalbreeding/search/getSearchDetails?searchCriteria=',
      isBreed:true,
      tableHeading:'animalBreeding.registered_female_animal',
      name:'animalBreeding.pd'
    }

   
  }

 
}
