import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { Location } from '@angular/common';
import { bullDetail } from '../bull-master-model/bull-master.model';
import { BullMasterService } from '../bull-master.service';
import { MasterConfig } from 'src/app/shared/master.config';

@Component({
  selector: 'app-view-bull-master-detail',
  templateUrl: './view-bull-master-detail.component.html',
  styleUrls: ['./view-bull-master-detail.component.css']
})
export class ViewBullMasterDetailComponent implements OnInit {
  masterConfig= MasterConfig
  isLoadingSpinner:boolean = false
  bullId:string;
  bullDetails:bullDetail
  semenStationID:any
  stationName:any
  constructor(private bullMasterService :BullMasterService, private route: ActivatedRoute,
    private router: Router,private location:Location) { }

  ngOnInit(): void {
    this.bullId = this.route.snapshot.queryParams['bullId']
    this.stationName = JSON.parse(sessionStorage.getItem("semenName"))
    console.log(this.stationName)
    if (!this.bullId
    ) {
       this.router.navigate(['/not-found']);
      
    }else{
      this.getBullMasterDetail(this.bullId)
    }
  }

  formatDate(date: string) {
    if (date) {
      return moment(new Date(date)).format('DD/MM/YYYY');
    }
    return null;
  }

  getBullMasterDetail(bullId:string):void{
    this.isLoadingSpinner = true
    this.bullMasterService.getBullDetailsByID(bullId).subscribe(data=>{
      this.isLoadingSpinner = false
      this.bullDetails = data
      this.semenStationID =  this.bullDetails?.semenStationId
     
    },
    error =>{
      this.isLoadingSpinner = false
    }
    )
  }
  

  goBack():void{
    this.location.back()
  }
  // ngOnDestroy() {
  //   sessionStorage.removeItem("semenName")
  // }
}
