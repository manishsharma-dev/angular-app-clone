import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { AnimalDetailService } from 'src/app/features/animal-management/animal-registration/animal-details/animal-detail.service';
import { AnimalData } from '../../animal-treatment/animal-treatment.component';
import { AnimalTreatmentService } from '../../animal-treatment/animal-treatment.service';
import { DiseaseTestingService } from '../disease-testing.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { HealthService } from '../../health.service';
import { MatPaginator } from '@angular/material/paginator';
import { TreatmentResponseDialogComponent } from '../../treatment-response-dialog/treatment-response-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ViewReportComponent } from '../../animal-treatment/view-report/view-report.component';
import { ReportDialogComponent } from '../report-dialog/report-dialog.component';
import { UpdateLabSampleComponent } from '../update-lab-sample/update-lab-sample.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-previous-testing-results',
  templateUrl: './previous-testing-results.component.html',
  styleUrls: ['./previous-testing-results.component.css'],
  providers: [TranslatePipe],
})
export class PreviousTestingResultsComponent implements OnInit, AfterViewInit {
  dataSourceFIR = new MatTableDataSource<PreviousDiseaseTestModel>([]);
  columnsToDisplayFIR: string[] = [
    'srNo',
    'sampleID',
    'dateOfTesting',
    'onSpotTestDesc',
    'sampleTypeDesc',
    'diseaseCdDesc',
    'action',
  ];
  animalTagId: string;
  animal: AnimalData;
  isLoadingSpinner: boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(
    private route: ActivatedRoute,
    private diseaseService: DiseaseTestingService,
    private router: Router,
    private treatmentService: AnimalTreatmentService,
    private animalMgmtService: AnimalDetailService,
    private _liveAnnouncer: LiveAnnouncer,
    private healthService: HealthService,
    public dialog: MatDialog,
    private translatePipe: TranslatePipe
  ) { }

  ngOnInit(): void {
    this.isLoadingSpinner = true;
    this.route.params
      .pipe(
        switchMap((params: any) => {
          this.animalTagId = params['tagId'];

          return this.animalMgmtService.getAnimalDetails(this.animalTagId);
        })
      )
      .subscribe((data) => {
        this.animal = data;
        this.getPreviousResults(this.animal.tagId);
      });
  }

  getPreviousResults(tagId) {
    const req = {
      tagId: tagId,
    };
    this.dataSourceFIR.data = [];
    this.diseaseService.getPreviousTestResults(req).subscribe(
      (res: any) => {
        if (res.errorCode) {
          this.isLoadingSpinner = false;
          this.dataSourceFIR.data = [];
          this.healthService.handleError({
            title: this.translatePipe.transform('intimation.no_data_found'),
            message: res.message,
            primaryBtnText: this.translatePipe.transform('common.ok_string'),
          });
          return;
        }
        res.length &&
          res.forEach((element) => {
            if (element.labTestingDetails)
              this.dataSourceFIR.data.push(...element.labTestingDetails);
            if (element.onSpotDetails)
              this.dataSourceFIR.data.push(...element.onSpotDetails);
          });
        this.dataSourceFIR.sort = this.sort;
        this.dataSourceFIR.paginator = this.paginator;
        this.isLoadingSpinner = false;
        //this.dataSourceFIR.data = res;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  ngAfterViewInit() {
    //this.dataSourceFIR.sort = this.sort;
  }

  getAnimalAge(ageInMonths: string | number) {
    return this.treatmentService.getWords(ageInMonths);
  }

  manageDiagnostics(selectedCase: PreviousDiseaseTestModel) {
    switch (selectedCase.samplingStatus) {
      case 1:
        this.updateResult(selectedCase);
        break;
      case 2:
        this.viewReport(selectedCase);
        break;
    }
  }

  updateResult(list: any) {
    this.isLoadingSpinner = true;
    this.isLoadingSpinner = false;
    const dialogRef = this.dialog.open(ReportDialogComponent, {
      position: {
        right: '0px',
        top: '0px',
      },
      data: {
        animalTagId: this.animalTagId,
        data: list,
      },
      width: '600px',
      height: '100vh',
      panelClass: 'custom-dialog-container',
    });
    dialogRef.afterClosed().subscribe((res: boolean) => {
      if (!res) {
        return;
      }
      this.dialog.open(TreatmentResponseDialogComponent, {
        data: {
          title: this.translatePipe.transform('common.info_label'),
          icon: 'assets/images/info.svg',
          message: this.translatePipe.transform(
            'animalTreatmentSurgery.diagnostics_results_saved_successfully'
          ),
          primaryBtnText: this.translatePipe.transform('common.ok_string'),
          secondaryBtnText: '',
        },
        panelClass: 'common-info-dialog',
      });
      //this.getCurrentRoute();
      this.getPreviousResults(this.animal.tagId);
    });
  }

  viewReport(selectedCase: PreviousDiseaseTestModel) {
    // this.isLoadingSpinner = true;
    // this.treatmentService
    //   .getTreatmentDetails(selectedCase.caseId, selectedCase.followUpNo)
    //   .subscribe((response: any) => {
    //     this.isLoadingSpinner = false;
    //     const dialogRef = this.dialog.open(ViewReportComponent, {
    //       position: {
    //         right: '0px',
    //         top: '0px',
    //       },
    //       data: response,
    //       width: '600px',
    //       height: '100vh',
    //       panelClass: 'custom-dialog-container',
    //     });
    //     dialogRef.afterClosed().subscribe((res: boolean) => {
    //       if (!res) {
    //         return;
    //       }
    //       this.dialog.open(TreatmentResponseDialogComponent, {
    //         data: {
    //           title: 'Success',
    //           message: 'Diagnostics results saved successfully',
    //           primaryBtnText: this.translatePipe.transform('common.ok_string'),
    //           secondaryBtnText: '',
    //         },
    //       });
    //       this.getCurrentRoute();
    //     });
    //   });
  }

  updateLab(element, flag) {
    if (flag == 1) {
      const dialogRef = this.dialog.open(UpdateLabSampleComponent, {
        position: {
          right: '0px',
          top: '0px',
        },
        data: {
          animalTagId: this.animalTagId,
          data: [element],
          viewFlag: false,
        },
        width: '600px',
        height: '100vh',
        panelClass: 'custom-dialog-container',
      });
      dialogRef.afterClosed().subscribe((res: boolean) => {
        if (!res) {
          return;
        }
        this.dialog.open(TreatmentResponseDialogComponent, {
          data: {
            title: this.translatePipe.transform('common.info_label'),
            icon: 'assets/images/info.svg',
            message: this.translatePipe.transform(
              'animalTreatmentSurgery.lab_results_saved_successfully'
            ),
            primaryBtnText: this.translatePipe.transform('common.ok_string'),
            secondaryBtnText: '',
          },
          panelClass: 'common-info-dialog',
        });
        //this.getCurrentRoute();
        this.getPreviousResults(this.animal.tagId);
      });
    } else {
      const dialogRef = this.dialog.open(UpdateLabSampleComponent, {
        position: {
          right: '0px',
          top: '0px',
        },
        data: {
          animalTagId: this.animalTagId,
          data: [element],
          viewFlag: true,
        },
        width: '600px',
        height: '100vh',
        panelClass: 'custom-dialog-container',
      });
      dialogRef.afterClosed().subscribe((res: boolean) => {
        if (!res) {
          return;
        }
        //this.getCurrentRoute();
        //this.getPreviousResults(this.animal.tagId);
      });
    }
  }

  isLabPending(element) {
    return element.sampleExaminationDetails.some(
      (sample) => sample.samplingStatus == 1
    );
  }

  goBack() {
    this.router.navigate(['../..'], {
      relativeTo: this.route,
      queryParams: { ownerId: this.animal.ownerId },
    });
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}

export interface PeriodicElementFIR {
  firID: number;
  firstIncidenceDate: string;
  symptoms: string;
  disease: string;
  village: string;
}

const ELEMENT_DATA_FIR: PeriodicElementFIR[] = [
  {
    firID: 10001,
    firstIncidenceDate: '01/01/2022',
    village: 'Ambe, Aradika',
    symptoms: 'Cold, Fibrous Udder',
    disease: 'Stomatitis,Parotitis',
  },
  {
    firID: 10002,
    firstIncidenceDate: '01/01/2022',
    village: 'Ajmer',
    symptoms: 'Cold, Fibrous Udder',
    disease: 'Stomatitis',
  },
  {
    firID: 10002,
    firstIncidenceDate: '01/01/2022',
    village: 'Ajmer',
    symptoms: 'Cold, Fibrous Udder',
    disease: 'Stomatitis',
  },
];

// Generated by https://quicktype.io

export interface PreviousDiseaseTestModel {
  sampleId: string;
  runSeqNo: number;
  courierId: null;
  diseaseCd: number;
  finalSampleResultValue: string;
  followUpNo: number;
  initialSampleResultValue: string;
  labCd: null;
  labCharges: null;
  modeOfTransport: null;
  onSpotTestCd: number;
  poolNoOfAnimals: null;
  receiptNo: null;
  sampleBarCd: null;
  sampleCollectionDate: string;
  sampleExaminationSubtypeCd: null;
  sampleExaminationTypeCd: null;
  sampleReport: null;
  sampleResult: number;
  sampleResultRecievedDate: null;
  sampleType: number;
  samplingStatus: number;
  sourceOriginCd: number;
  sourceOriginId: number;
  testImageUrl1: null;
  testImageUrl2: null;
  testRemarks: null;
  testingLocation: number;
  diseaseDesc: string;
  modeOfTransportDesc: null;
  onSpotTestDesc: string;
  sampleExaminationTypeCdDesc: null;
  sampleExaminationSubtypeCdDesc: null;
  sampleResultDesc: string;
  sampleTypeDesc: string;
  samplingStatusDesc: string;
  testingLocationDesc: string;
  labCdDesc: null;
}
