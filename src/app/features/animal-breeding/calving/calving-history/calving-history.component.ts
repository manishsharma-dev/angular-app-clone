import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimalHistory, HistoryDetail } from '../model/calving-detail.model';

@Component({
  selector: 'app-calving-history',
  templateUrl: './calving-history.component.html',
  styleUrls: ['./calving-history.component.css']
})
export class CalvingHistoryComponent implements OnInit {
  aiHistoryDisplayedColumns: string[] = ['aiLactationNumber','aiDate','bullId','pdDate','calvingDate','aiType','serviceType','status','actualAiNumber','aiDoneBy'];
  dataSource = new MatTableDataSource<AnimalHistory>();
  isLoadingSpinner:boolean =false
  historyDetail:object = {}
  tagId:number

  constructor(
              private route: ActivatedRoute
              )
     { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (!params['tagId']) {
        // this.router.navigate(['/not-found']);
        return false;
      }
      this.tagId = params['tagId']
     this.historyDetail = {
    compDetail: 'Calving',
    newPageUrl: './dashboard/animal-breeding/calving/new-calving',
    tagId:this.tagId,
    isHistory:true,
    isBreed:true,
    name:'animalBreeding.calving'
  }
      return true
    })
  
  }

}
