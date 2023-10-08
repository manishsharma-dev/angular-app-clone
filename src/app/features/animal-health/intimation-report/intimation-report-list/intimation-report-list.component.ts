import { MatPaginator } from '@angular/material/paginator';
import { IntimationListRes } from './../models/intimation-list-response.model';
import { IntimationReportService } from './../intimation-report.service';
import { ViewIntimationReportComponent } from './../view-intimation-report/view-intimation-report.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import moment from 'moment';
import { MatSort } from '@angular/material/sort';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { MasterConfig } from 'src/app/shared/master.config';

@Component({
  selector: 'app-intimation-report-list',
  templateUrl: './intimation-report-list.component.html',
  styleUrls: ['./intimation-report-list.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class IntimationReportListComponent implements OnInit {
  masterConfig = MasterConfig;
  isLoadingSpinner = false;
  dataSource = new MatTableDataSource([]);
  columnsToDisplay: string[] = [
    'intimationId',
    'firstIntimationDate',
    'symptomDesc',
    'diseaseDesc',
    'villageName',
    'edit',
  ];

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.dataSource.sort = ms;
  }

  @ViewChild('listPaginator') set Paginator(p: MatPaginator) {
    this.dataSource.paginator = p;
  }

  constructor(
    private dialog: MatDialog,
    private intimationService: IntimationReportService
  ) { }

  ngOnInit(): void {
    this.isLoadingSpinner = true;
    this.intimationService
      .getIntimationReportListForUser(
      )
      .subscribe(
        (res) => {
          this.isLoadingSpinner = false;
          if (!res || !res.length) {
            return;
          }
          this.dataSource.data = res.map((data) => ({
            ...data,
            firstIntimationDate: this.formatDate(data.firstIntimationDate),
            intimationReportDiseaseDetails: data.intimationReportDiseaseDetails
              .length
              ? data.intimationReportDiseaseDetails
                .map((d) => d.diseaseDesc)
                .join(', ')
              : 'NA',
            intimationReportSymptomDetails: data.intimationReportSymptomDetails
              .length
              ? data.intimationReportSymptomDetails
                .map((s) => s.symptomDesc)
                .join(', ')
              : 'NA',
            intimationReportVillageDetails: data.intimationReportVillageDetails
              .length
              ? data.intimationReportVillageDetails
                .map((v) => v.villageName)
                .join(', ')
              : 'NA',
          }));
        },
        () => (this.isLoadingSpinner = false)
      );
  }

  viewReportDialog(intimationReportId: number) {
    this.isLoadingSpinner = true;
    this.intimationService
      .viewIntimationReport(intimationReportId)
      .subscribe((res) => {
        this.isLoadingSpinner = false;

        this.dialog.open(ViewIntimationReportComponent, {
          data: res,
          width: '600px',
          height: '100vh',
          panelClass: 'custom-dialog-container',
          position: {
            right: '0px',
            top: '0px',
          },
        });
      });
  }

  searchInTable(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  formatDate(date: string) {
    return moment(date).format('DD/MM/YYYY');
  }
}
const ELEMENT_DATA = [
  {
    reportsID: 1234,
    firstIntimationDate: '12/04/2022',
    symptoms: 'Fever, Cold',
    disease: 'Stomatits',
    villages: 'Ambe, Aradka',
  },
];
