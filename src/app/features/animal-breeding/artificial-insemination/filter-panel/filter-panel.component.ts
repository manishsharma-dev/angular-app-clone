import { Component, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-filter-panel',
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.css']
})
export class FilterPanelComponent implements OnInit {
  filterList =['Category/Species', 'Breed', 'Age' ,'Pregnancy Status','Milking Status','Elite']
  filterData:any = {}
  filterType:any = 'Category/Species'
  constructor() { }

  ngOnInit(): void {
    this.filterData = {
      isElite:null
    }
  }
  toggleCampaign(value: boolean) {
    this.filterData.isElite = value;
  }


}
