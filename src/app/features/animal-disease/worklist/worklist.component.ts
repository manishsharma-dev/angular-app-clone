import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';import { FIRService } from '../../animal-health/fir/fir.service';
import { FirListForUser } from '../../animal-health/fir/models/firListForUser.model';
import { ActionFormComponent } from './action-form/action-form.component';

@Component({
  selector: 'app-worklist',
  templateUrl: './worklist.component.html',
  styleUrls: ['./worklist.component.css'],
})
export class WorklistComponent implements OnInit {
  isLoadingSpinner = false;
  private paginator!: MatPaginator;
  isReportingTabVisible: boolean = true;
  activeTab = 'FIR';
  toggleOn = true;
  dataSourceFIR = new MatTableDataSource<FirListForUser>();
  firstIncidenceDateDisplay: string;
  
  columnsToDisplayFIR: string[] = [
    'position',
    'firID',
    'firstIncidenceDate',
    'symptoms',
    'disease',
    'village',
    'action',
  ];
  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private firService: FIRService,
    public dialog: MatDialog,
  ) {}
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSourceFIR.sort = this.sort;
  }

  @ViewChild('paginatorRef') set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  setDataSourceAttributes() {
    this.dataSourceFIR.paginator = this.paginator;
  }
  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
  ngOnInit(): void {
    const todo$ = this.firService
      .getFirListForUser()
      .pipe(catchError((err) => of(null)));
    this.isLoadingSpinner = true;
    forkJoin([todo$]).subscribe(
      ([firReportsRes]) => {
        this.isLoadingSpinner = false;

        this.dataSourceFIR.data = firReportsRes ?? [];
        this.firstIncidenceDateDisplay = this.formatDate(
          firReportsRes.firstIncidenceDate
        );
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
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  formatDate(date: string) {
    return moment(date).format('DD/MM/YYYY');
  }

  viewWorkList(firId: number) {
    const dialogRef = this.dialog.open(ActionFormComponent, {
      data: {
        firId,
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
