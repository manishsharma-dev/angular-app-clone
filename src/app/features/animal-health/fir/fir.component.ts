import { MatPaginator } from '@angular/material/paginator';
import { IntimationReportService } from './../intimation-report/intimation-report.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DraftFirDialogComponent } from './draft-fir-dialog/draft-fir-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { AfterViewInit, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import moment from 'moment';
import { setEncryptedData } from 'src/app/shared/shareService/storageData';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { FIRService } from './fir.service';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FirListForUser } from './models/firListForUser.model';
import { IntimationListRes } from '../intimation-report/models/intimation-list-response.model';
import { ViewIntimationReportComponent } from '../intimation-report/view-intimation-report/view-intimation-report.component';
import { ActionFormComponent } from '../../animal-disease/worklist/action-form/action-form.component';
import { MasterConfig } from 'src/app/shared/master.config';

export interface PeriodicElementFIR {
  firID: number;
  firstIncidenceDate: string;
  symptoms: string;
  disease: string;
  village: string;
  status: string;
}

@Component({
  selector: 'app-fir',
  templateUrl: './fir.component.html',
  styleUrls: ['./fir.component.css'],
})
export class FIRComponent implements OnInit {
  masterConfig = MasterConfig;
  private paginator!: MatPaginator;
  private firpaginator!: MatPaginator;

  private sort!: MatSort;
  dataSourceIntimationReports = new MatTableDataSource<IntimationListRes>();
  selectedIntimationId = null;
  isLoadingSpinner = false;
  isReportingTabVisible: boolean = true;
  activeTab = 'INTIMATION-reports';
  selectedVillage;
  selectTehsil;
  toggleOn = true;
  columnsToDisplay: string[] = [
    'select',
    'intimationId',
    'firstIntimationDateDisplay',
    'symptomDetailsDesc',
    'VillageDetailsDesc',
    'action',
  ];
  dataSourceFIR = new MatTableDataSource<FirListForUser>();
  columnsToDisplayFIR: string[] = [
    // 'position',
    'firId',
    'firstIncidenceDateDisplay',
    'symptomDetails',
    'diseaseDetails',
    'affectedAnimals',
    'villageDetails',
    'status',
    'action',
  ];
  options: any;

  selectedVillages = [];
  selectedTeshil = [];
  noOfBoxes: number = 0;
  firstIncDetails: IntimationListRes[] = [];
  listResponse: IntimationListRes[] = [];

  constructor(
    public dialog: MatDialog,
    private intimationReportService: IntimationReportService,
    private firService: FIRService,
    private router: Router,
    private intimationService: IntimationReportService
  ) {}

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild('paginatorRef') set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  @ViewChild('firpaginatorRef') set firmatPaginator(mp: MatPaginator) {
    this.firpaginator = mp;
    this.setDataSourceAttributes();
  }
  setDataSourceAttributes() {
    this.dataSourceIntimationReports.paginator = this.paginator;
    this.dataSourceIntimationReports.sort = this.sort;

    this.dataSourceFIR.paginator = this.firpaginator;
  }

  ngOnInit(): void {
    if (sessionStorage.getItem('firActiveTab')) {
      this.activeTab = 'fir-rep';
    } else {
      this.activeTab = 'INTIMATION-reports';
    }
    sessionStorage.removeItem('firActiveTab');
    const todo1$ = this.intimationReportService
      .getIntimationReportListForUser()
      .pipe(catchError((err) => of(null)));
    const todo2$ = this.firService
      .getFirListForUser()
      .pipe(catchError((err) => of(null)));
    this.isLoadingSpinner = true;
    forkJoin([todo1$, todo2$]).subscribe(
      ([intimationReportsRes, firReportsRes]) => {
        this.isLoadingSpinner = false;
        this.listResponse = intimationReportsRes ?? [];

        for (let data of this.listResponse) {
          data['symptomDetailsDesc'] = data.intimationReportSymptomDetails
            .map((a) => a.symptomDesc)
            ?.join(',');
          data['VillageDetailsDesc'] = data.intimationReportVillageDetails
            .map((a) => a.villageName)
            ?.join(',');
        }

        this.dataSourceIntimationReports.data = intimationReportsRes ?? [];
        firReportsRes = firReportsRes ?? [];
        for (let data of firReportsRes) {
          data['symptomDetails'] = data.intimationReportSymptomDetails
            .map((a) => a.symptomDesc)
            ?.join(',');
          data['villageDetails'] = data.intimationReportVillageDetails
            .map((a) => a.villageName)
            ?.join(',');
          data['diseaseDetails'] = data.intimationReportDiseaseDetails
            .map((a) => a.diseaseDesc)
            ?.join(',');
        }
        this.dataSourceFIR.data = firReportsRes ?? [];
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  searchInTable(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceIntimationReports.filter = filterValue.trim().toLowerCase();
    if (this.dataSourceIntimationReports.paginator) {
      this.dataSourceIntimationReports.paginator.firstPage();
    }
  }

  searchFIRTable(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceFIR.filter = filterValue.trim().toLowerCase();
    if (this.dataSourceFIR.paginator) {
      this.dataSourceFIR.paginator.firstPage();
    }
  }
  formatDate(date: string) {
    return moment(date).format('DD/MM/YYYY');
  }

  dateFormatChange(date: String) {
    date = date.substring(0, 10);
    return date.split('-').reverse().join('/');
  }
  //CheckBox value starts
  isElementDisabled(element: IntimationListRes) {
    return element?.firId != null;
  }

  isElementSelected(element: IntimationListRes) {
    return !!this.firstIncDetails.find(
      (e) => element.intimationId === e.intimationId
    );
  }

  isAllSelected() {
    const tableData = this.dataSourceIntimationReports.filteredData.filter(
      (element) => !this.isElementDisabled(element)
    );

    return (
      tableData &&
      tableData?.length &&
      tableData.length === this.firstIncDetails.length
    );
  }

  onElementSelected(event: Event, element: IntimationListRes) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.firstIncDetails.push(element);
    } else {
      const index = this.firstIncDetails.findIndex(
        (e) => e.intimationId === element.intimationId
      );

      this.firstIncDetails.splice(index, 1);
    }
  }

  onSelectAll(event: Event) {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.checked) {
      this.firstIncDetails =
        this.dataSourceIntimationReports.filteredData.filter(
          (e) => !this.isElementDisabled(e)
        );

      if (this.firstIncDetails.length === 0) {
        inputElement.checked = false;
      }
    } else {
      this.firstIncDetails.length = 0;
    }
  }
  //CheckBox value end

  selectAllForDropdownItems(items: any[]) {
    let allSelect = (items) => {
      items.forEach((element) => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };

    allSelect(items);
  }

  intimationReportsDialog() {
    const dialogRef = this.dialog.open(DraftFirDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((res) => {});
  }
  mergeSubmit(section) {
    const firstIncDetailsList = this.firstIncDetails;
    const mergeData = {
      id: firstIncDetailsList,
      type: 'firstIncSelected',
    };
    sessionStorage.setItem('mergeData', JSON.stringify(mergeData));
    this.router.navigate([
      '/dashboard/first-incidence-report/fir-details-form',
    ]);
  }
  createSubmit(section) {
    const firstIncDetailsList = this.firstIncDetails;
    // const storageData = {
    //   id: firstIncDetailsList,
    //   type: 'firstIncSelected'
    // }
    // setEncryptedData(storageData, "AESSHA256firstIncDetails");
    const mergeData = {
      id: firstIncDetailsList,
      type: 'firstIncSelected',
    };
    sessionStorage.setItem('mergeData', JSON.stringify(mergeData));
    this.router.navigate([
      '/dashboard/first-incidence-report/fir-details-form',
    ]);
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

  viewWorkList(firId: number, status: string) {
    const dialogRef = this.dialog.open(ActionFormComponent, {
      data: {
        firId,
        status,
      },
      width: '600px',
      height: '100vh',
      panelClass: 'custom-dialog-container',
      position: {
        right: '0px',
        top: '0px',
      },
    });
  }
}
