import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-additional-detail',
  templateUrl: './additional-detail.component.html',
  styleUrls: ['./additional-detail.component.css']
})
export class AdditionalDetailComponent implements OnInit {
  selector: string = '.tabs-nav-list';
  scrollOffset = 150;
  isLoadingSpinner:boolean =  false
  activeTab:string = 'Bulk/Semen Details'
  additionalParameter:string[] = [
    'Bulk/Semen Details',
    'Sire Details',
    'Dam Details',
    'Sires Sire Details',
    'Dams Sire Details',
    'Sires Dam Details',
    'Dams Dam Details'
  ]
  constructor() { }

  ngOnInit(): void {
    console.log(this.additionalParameter)
  }

  fetchAdditionalRecord(param:string):void{

  }
  onScroll() {
    this.scrollOffset += 150;
  }

}
