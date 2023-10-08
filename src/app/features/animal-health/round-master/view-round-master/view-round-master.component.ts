import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HealthService } from '../../health.service';
import { RoundMasterService } from '../round-master.service';
import { ViewRoundMaster } from '../models/viewRoundMaster.model';
import moment from 'moment';


@Component({
  selector: 'app-view-round-master',
  templateUrl: './view-round-master.component.html',
  styleUrls: ['./view-round-master.component.css']
})
export class ViewRoundMasterComponent implements OnInit {
  step = 0;
  isLoadingSpinner = false;
  prescriptionRes!: ViewRoundMaster;
  dataEntryEndDate!:string;
  toDate!: string;
  fromDate!: string;
  newStringstateName: string;
  newStringDiseaseName: string;
  newStringRemarks: string;


  constructor(
    private roundService: RoundMasterService,
    @Inject(MAT_DIALOG_DATA)
    public data: { roundNo: number; stateCd: number ; diseaseCd:number},
    private healthService: HealthService
  ) {}

  ngOnInit(): void {
    this.viewReports();
  }
  setStep(step: number) {
    this.step = step;
  }

  viewReports() {
    this.isLoadingSpinner = true;

    this.roundService
      .viewRoundService(this.data.roundNo, this.data.stateCd ,this.data.diseaseCd).subscribe((res) => {
        if (this.healthService.isErrorResponse(res)) {
          return;
        }
        this.isLoadingSpinner = false;
        // this.prescriptionRes = res;
        for(let prescriptionRes of  res){
          this.prescriptionRes = prescriptionRes.roundNo;
          this.fromDate = moment(new Date(prescriptionRes.fromDate)).format('DD/MM/YYYY') ==
          'Invalid date'
          ? ''
          : moment(new Date(prescriptionRes.fromDate)).format('DD/MM/YYYY'); prescriptionRes.fromDate;
          this.toDate = moment(new Date(prescriptionRes.toDate)).format('DD/MM/YYYY') ==
          'Invalid date'
          ? ''
          : moment(new Date(prescriptionRes.toDate)).format('DD/MM/YYYY');
          this.dataEntryEndDate = moment(new Date(prescriptionRes.dataEntryEndDate)).format('DD/MM/YYYY') ==
          'Invalid date'
          ? ''
          : moment(new Date(prescriptionRes.dataEntryEndDate)).format('DD/MM/YYYY');
          

          this.newStringstateName = prescriptionRes.stateName;
          this.newStringDiseaseName = prescriptionRes.diseaseDesc;
          this.newStringRemarks = prescriptionRes.remarks;
       
        }
     
        // let array = res.locationDetailsResponseDto;
        // const ids = array.map((obj) => obj.villageName).join(',');
        // this.newStringvillageName = ids;
        // const ids2 = array.map((obj) => obj.tehsilName).join(',');
        // this.newStringtehsilName = ids2;
        // const ids3 = array.map((obj) => obj.districtName).join(',');
        // this.newStringdistrictName = ids3;
      });
  }
}

