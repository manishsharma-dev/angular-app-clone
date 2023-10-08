import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TranslatePipe } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { MasterConfig } from 'src/app/shared/master.config';
import { TreatmentResponseDialogComponent } from '../treatment-response-dialog/treatment-response-dialog.component';
import { FinalReportComponent } from './final-report/final-report.component';
import { InterimReportComponent } from './interim-report/interim-report.component';
import { GetActiveOutBreakList } from './models/getActiveOutbreakDetails.model';
import { OutBreakDiseaseService } from './outbreak-disease.service';
import { UpdateResultComponent } from './update-result/update-result.component';

@Component({
  selector: 'app-outbreak-disease-reporting',
  templateUrl: './outbreak-disease-reporting.component.html',
  styleUrls: ['./outbreak-disease-reporting.component.css'],
  providers: [TranslatePipe],
})
export class OutbreakDiseaseReportingComponent implements OnInit {
  masterConfig = MasterConfig;
  isLoadingSpinner: boolean = false;
  outbreakId!: number;
  dataSource!: any;
  dataSourceClosed!: any;
  finalReportData: any;
  searchText;
  constructor(
    private dialog: MatDialog,
    private outBreakService: OutBreakDiseaseService,
    private translatePipe: TranslatePipe
  ) {}

  ngOnInit(): void {
    const todo$ = this.outBreakService
      .getActiveOutbreak()
      .pipe(catchError((err) => of(null)));
    this.isLoadingSpinner = true;
    forkJoin([todo$]).subscribe(
      ([OutbreakRes]) => {
        this.isLoadingSpinner = false;

        // for (let data of OutbreakRes) {
        //   this.finalReportData= data.finalReport;
        // }
        const tempClosed = OutbreakRes?.filter(
          (t) => t.outbreakDetail.finalReport === 'N'
        );
        if (tempClosed && tempClosed.length) {
          const groupedCases = tempClosed.reduce(
            (group: any, currentCase: any) => {
              const { outbreakId } = currentCase.outbreakDetail;

              if (!group[outbreakId]) {
                group[outbreakId] = {
                  expanded: false,
                  outbreakId: currentCase.outbreakDetail.outbreakId,
                  cases: [],
                };
              }

              group[outbreakId].cases.push(currentCase);
              return group;
            },
            {} as { [caseId: number]: any }
          );

          const arr: any[] = [];

          for (const outbreakId in groupedCases) {
            arr.push(groupedCases[outbreakId]);
          }
          arr.sort((a, b) => {
            return b['cases'][0]['outbreakDetail'][
              'firstIncidenceDate'
            ].localeCompare(
              a['cases'][0]['outbreakDetail']['firstIncidenceDate']
            );
          });
          this.dataSource = arr;
        }
        const tempData = OutbreakRes.filter(
          (t) => t.outbreakDetail.finalReport === 'Y'
        );
        if (tempData && tempData.length) {
          const groupedCases = tempData.reduce(
            (group: any, currentCase: any) => {
              const { outbreakId } = currentCase.outbreakDetail;

              if (!group[outbreakId]) {
                group[outbreakId] = {
                  expanded: false,
                  outbreakId: currentCase.outbreakDetail.outbreakId,
                  cases: [],
                };
              }

              group[outbreakId].cases.push(currentCase);
              return group;
            },
            {} as { [caseId: number]: any }
          );

          const arr: any[] = [];

          for (const outbreakId in groupedCases) {
            arr.push(groupedCases[outbreakId]);
          }
          arr.sort((a, b) => {
            return b['cases'][0]['outbreakDetail'][
              'firstIncidenceDate'
            ].localeCompare(
              a['cases'][0]['outbreakDetail']['firstIncidenceDate']
            );
          });
          this.dataSourceClosed = arr;
        }

        for (let data of OutbreakRes ?? []) {
          data['villageDetails'] = data.areaMappingDetails
            .map((a) => a.villageName)
            ?.join(',');
        }
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  dateFormatChange(date: String) {
    date = date.substring(0, 10);
    return date.split('-').reverse().join('/');
  }

  searchInTable(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  toggleExpandRow(index: number) {
    this.dataSource[index].expanded = !this.dataSource[index].expanded;
  }

  toggleExpandRowClosed(index: number) {
    this.dataSourceClosed[index].expanded =
      !this.dataSourceClosed[index].expanded;
  }

  viewReport(outbreakId: number) {
    this.isLoadingSpinner = true;
    this.outBreakService.downloadFinalOutBreakReport(outbreakId).subscribe(
      (res: any) => {
        this.isLoadingSpinner = false;
        // const fileName = res.headers
        //   .get('Content-Disposition')
        //   .split('; ')[1]
        //   .split('=')[1];
        const blob = new Blob([res.body], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const popUp = window.open(url, '_blank');
        if (popUp == null || typeof popUp == 'undefined') {
          this.dialog.open(TreatmentResponseDialogComponent, {
            data: {
              title: this.translatePipe.transform('errorMsg.popup_blocked'),
              icon: 'assets/images/info.svg',
              message: this.translatePipe.transform(
                'errorMsg.please_disable_your_popup_blocker_and_click_the_view_link_again'
              ),
              primaryBtnText: this.translatePipe.transform('common.ok_string'),
            },
            panelClass: 'common-info-dialog',
          });
        } else {
          popUp.focus();
        }
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  viewInterimReport(outbreakId: number, interimReportNo: number) {
    this.isLoadingSpinner = true;
    this.outBreakService
      .downloadInterimReport(outbreakId, interimReportNo)
      .subscribe(
        (res: any) => {
          this.isLoadingSpinner = false;
          // const fileName = res.headers
          //   .get('Content-Disposition')
          //   .split('; ')[1]
          //   .split('=')[1];
          const blob = new Blob([res.body], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const popUp = window.open(url, '_blank');
          if (popUp == null || typeof popUp == 'undefined') {
            this.dialog.open(TreatmentResponseDialogComponent, {
              data: {
                title: this.translatePipe.transform('errorMsg.popup_blocked'),
                icon: 'assets/images/info.svg',
                message: this.translatePipe.transform(
                  'errorMsg.please_disable_your_popup_blocker_and_click_the_view_link_again'
                ),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
              },
              panelClass: 'common-info-dialog',
            });
          } else {
            popUp.focus();
          }
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
  }

  viewFinalReport(data2: any) {
    const dialogRef = this.dialog.open(FinalReportComponent, {
      data: {
        data2,
      },
      position: {
        right: '0px',
        top: '0px',
      },
      width: '50vw',
      height: '100vh',
      panelClass: 'custom-dialog-container',
    });
    dialogRef.afterClosed().subscribe((res) => {});
  }

  openUpdateResult(data1: any) {
    const dialogRef = this.dialog.open(UpdateResultComponent, {
      position: {
        right: '0px',
        top: '0px',
      },
      width: '45vw',
      height: '100vh',
    });
    dialogRef.afterClosed().subscribe((res) => {});
  }

  navigateToNewFollowUp() {}
}
