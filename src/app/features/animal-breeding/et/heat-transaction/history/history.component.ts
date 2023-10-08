import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { EtService } from '../../et.service';
import { Location } from '@angular/common';
import { HeatDetails, HeatHistory } from '../../et.model';
import { MasterConfig } from 'src/app/shared/master.config';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  masterConfig = MasterConfig
  @Input() historyDetail: any
  animalHistoryDetail: HeatHistory
  dataSource = new MatTableDataSource<HeatDetails>();
  @Output() ownerDetail = new EventEmitter();
  isLoadingSpinner: boolean = false;
  columnsToDisplay: string[] = [
    'currentLactationNo','heatDate', 'timeSlot', 'heatType','eligibleForEtFlag',   'remarks'
  ];
  tagId: number
  heatType: Array<{}>
  constructor( private route: ActivatedRoute,
    private router: Router, private etService: EtService,private location:Location) { }

  ngOnInit(): void {
    this.tagId = this.route.snapshot.queryParams['tagId']
    this.getAnimalHistoryDetail(this.tagId)
   this.getHeatType()
  }
  getAnimalHistoryDetail(id: any): void {
    this.isLoadingSpinner = true
    this.etService.getHeatTransactionHistory(id).subscribe((data: HeatHistory) => {
      this.animalHistoryDetail = data
       const heatDetail = this.animalHistoryDetail?.heatDetailsResponseList
      let latestHeatDetail = heatDetail?.length > 0 ? this.historyDetail ? heatDetail.splice(0, 1)  : heatDetail : []
      this.dataSource = new MatTableDataSource(
        latestHeatDetail

      );
      this.ownerDetail.emit(this.animalHistoryDetail)
      this.isLoadingSpinner = false

    },
      error => {
        this.isLoadingSpinner = false
      }
    )
  }
  redirectionCheck(): void {
    this.router.navigate(['/not-found']);
  }

  goBack() {
    this.location.back()
  }
  private getHeatType(): void {
    this.isLoadingSpinner = true
    this.etService.getHeatType(this.tagId).subscribe((data: any) => {
      this.isLoadingSpinner = false
      this.heatType = data

    },
      error => {
        this.isLoadingSpinner = false
      }
    )
  }


}
