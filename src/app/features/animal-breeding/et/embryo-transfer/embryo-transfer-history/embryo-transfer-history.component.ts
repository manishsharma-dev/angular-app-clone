import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { AnimalHistory } from '../../../artificial-insemination/ai-model/ai-details.model';

@Component({
  selector: 'app-embryo-transfer-history',
  templateUrl: './embryo-transfer-history.component.html',
  styleUrls: ['./embryo-transfer-history.component.css']
})
export class EmbryoTransferHistoryComponent implements OnInit {
  isLoadingSpinner:boolean =false
  historyDetail:any
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

      return true
    })
    this.historyDetail = {
      compDetail: 'ET',
      newPageUrl: './dashboard/animal-breeding/et/new-embryo-transfer',
      tagId:this.tagId,
      isHistory:true,
      isBreed:true,
      name:'animalBreeding.et'
   
    }
  }

}
