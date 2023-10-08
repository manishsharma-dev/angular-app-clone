import { IntimationReportDetails } from './../models/intimation-report-details.model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import moment from 'moment';

@Component({
  selector: 'app-view-intimation-report',
  templateUrl: './view-intimation-report.component.html',
  styleUrls: ['./view-intimation-report.component.css'],
})
export class ViewIntimationReportComponent implements OnInit {
  speciesImpacted: {
    speciesName: string;
    runSeqNo: number;
    sourceOriginId: number;
    interimReportNo: number;
    sourceOriginCd: number;
    speciesCd: number;
    noOfAnimals: number;
    noOfAnimalsDied: number;
    isLatest: string;
    modifiedBy: string;
    createdBy: string;
  }[] = [];

  villages = new Set<
    IntimationReportDetails['intimationReportAreaMappingDetailsDesc'][0]['villageName']
  >();

  tehsils = new Set<
    IntimationReportDetails['intimationReportAreaMappingDetailsDesc'][0]['tehsilName']
  >();

  districts = new Set<
    IntimationReportDetails['intimationReportAreaMappingDetailsDesc'][0]['districtName']
  >();

  constructor(@Inject(MAT_DIALOG_DATA) public data: IntimationReportDetails) {}

  ngOnInit(): void {
    this.speciesImpacted = this.data.intimationReportSpeciesImpacted.map(
      (species) => {
        const sp = this.data.speciesImpacted.find(
          (s) => s.speciesCd === species.speciesCd
        );
        return { ...sp, speciesName: species.speciesName };
      }
    );

    for (const area of this.data.intimationReportAreaMappingDetailsDesc) {
      this.villages.add(area.villageName);
      this.tehsils.add(area.tehsilName);
      this.districts.add(area.districtName);
    }
  }

  formatDate(date: string) {
    return moment(date).format('DD/MM/YYYY');
  }
}
