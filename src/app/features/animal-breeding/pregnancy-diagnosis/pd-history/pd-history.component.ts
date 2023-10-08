import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimalHistory, HistoryDetail, PDHistorytModel } from '../model/pd-detail.model';
import { PregnancyDiagnosisService } from '../pregnancy-diagnosis.service';

@Component({
  selector: 'app-pd-history',
  templateUrl: './pd-history.component.html',
  styleUrls: ['./pd-history.component.css']
})
export class PdHistoryComponent implements OnInit {
 isLoadingSpinner:boolean = false
 historyDetail:object = {}
 tagId:number
  constructor(
              private route: ActivatedRoute,
             )
     { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (!params['tagId']) {
        // this.router.navigate(['/not-found']);
        return false;
      }
     
      this.tagId= params['tagId']
      return true
    })
    this.historyDetail = {
      compDetail: 'PD',
      newPageUrl: './dashboard/animal-breeding/pregnancy-diagnosis/new-pd',
      tagId:this.tagId,
      isHistory:true,
      isBreed:true,
      name:'animalBreeding.pd'
    }
   
  
  }
  

}
