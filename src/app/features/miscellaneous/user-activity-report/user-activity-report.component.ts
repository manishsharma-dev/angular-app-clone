import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelpdeskService } from '../../helpdesk/helpdesk.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserReportDialogComponent } from './user-report-dialog/user-report-dialog.component';
import { UserActivityReportService } from './user-activity-report.service';
import { TreatmentResponseDialogComponent } from '../../animal-health/treatment-response-dialog/treatment-response-dialog.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { animalHealthValidations } from 'src/app/shared/validatator';
import moment from 'moment';
import { HealthService } from '../../animal-health/health.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-user-activity-report',
  templateUrl: './user-activity-report.component.html',
  styleUrls: ['./user-activity-report.component.css'],
  providers: [TranslatePipe]
})
export class UserActivityReportComponent implements OnInit {
  userReportform: FormGroup;
  itemForm: FormGroup;
  validationMsg = animalHealthValidations.campaignCreation;
  moduleCd: number;
  isLoadingSpinner = false;
  private withpaginator!: MatPaginator;
  private sort!: MatSort;
  public isShowError: string = '';
  fromMinDate: any;
  fromMaxDate: any;
  toMinDate: any;
  toMaxDate: any;
  masterMinDate;
  masterMaxDate;
  activityDisplayedColumns = [
    'sr_no',
    'subModuleName',
    'transactionIdCount',
    'action',
  ];
  dataSource = new MatTableDataSource([]);
  moduleCode: any;
  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private _helpdeskService: HelpdeskService,
    private translatePipe: TranslatePipe,
    private userReportService: UserActivityReportService,
    public formBuilder: FormBuilder,
    private healthService: HealthService,
    private readonly translateService: TranslateService,
  ) { }

  @ViewChild('withpaginatorRef') set matPaginator(mp: MatPaginator) {
    this.withpaginator = mp;
    this.setDataSourceAttributes();
  }
  ngOnInit(): void {
    this.itemForm = this.formBuilder.group({
      selectedSubModuleCd: [[0], [Validators.required]],
      fromDate: [sessionStorage.getItem('serverCurrentDateTime'), [Validators.required]],
      toDate: [this.today ? moment(this.today) : moment(), [Validators.required],
      ],
    });
    this.getMasterData();
    this.formChangeEvent();
  }
  formChangeEvent() {
    this.itemForm.get('selectedSubModuleCd').valueChanges.subscribe(data => {
      if (data && data.length && data.includes(0)) {
        if (data.length > 1) {
          let selectedSubModuleCd = data;
          const index = selectedSubModuleCd.indexOf(0);
          if (index == 0) {
            selectedSubModuleCd.splice(index, 1);
          }
          else {
            selectedSubModuleCd = [0]
          }
          this.itemForm.get('selectedSubModuleCd').patchValue(selectedSubModuleCd);
        }
      }
    });
    this.itemForm.get('fromDate').valueChanges.subscribe((fromDate) => {
      if (fromDate && moment(fromDate).isValid() &&
        moment(fromDate).isBetween(moment(this.masterMinDate), moment(this.masterMaxDate), undefined, "[]"))
        this.toMinDate = moment(fromDate).format('YYYY-MM-DD');
    })
    this.itemForm.get('toDate').valueChanges.subscribe((toDate) => {
      if (toDate && moment(toDate).isValid() &&
        moment(toDate).isBetween(moment(this.masterMinDate), moment(this.masterMaxDate), undefined, "[]"))
        this.fromMaxDate = moment(toDate).format('YYYY-MM-DD');
    })
  }

  get today() {
    return moment(sessionStorage.getItem('serverCurrentDateTime')).format('YYYY-MM-DD');
  }

  getMasterData() {
    const formValue = this.itemForm.getRawValue();
    const getSubModuleList = this._helpdeskService.getSubmoduleList(0);
    const getDateConfigReq = this.healthService
      .getDefaultConfig("userReportAllowedNoOfDays")
    this.isLoadingSpinner = true;
    forkJoin([getSubModuleList, getDateConfigReq]).subscribe(
      ([getSubModuleListRes, getDateConfigRes]: any) => {
        let module = {};
        this.moduleCode = getSubModuleListRes?.filter((entries) => {
          if (module[entries.subModuleCd]) {
            return false;
          }
          module[entries.subModuleCd] = true;
          return true;
        })
        this.moduleCode.unshift({
          subModuleCd: 0,
          subModuleName: "All"
        })
        //if (this.moduleCode && this.moduleCode.length) this.selectAllForDropdownItems(this.moduleCode);
        this.itemForm.patchValue({
          fromDate: moment(this.today).subtract(getDateConfigRes.defaultValue, 'days')
        })
        this.fromMinDate = moment(this.today).subtract(getDateConfigRes.defaultValue, 'days');
        this.masterMinDate = moment(this.today).subtract(getDateConfigRes.defaultValue, 'days');
        this.fromMaxDate = moment(this.today);
        this.toMinDate = moment(this.today).subtract(getDateConfigRes.defaultValue, 'days');
        this.toMaxDate = moment(this.today);
        this.masterMaxDate = moment(this.today);
        this.getModuleList();
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  getModuleList() {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }
    this.isLoadingSpinner = true;
    const formValue = this.itemForm.getRawValue();
    const req = {
      subModuleCodes: formValue.selectedSubModuleCd,
      fromDate: moment(formValue.fromDate).format('YYYY-MM-DD'),
      toDate: moment(formValue.toDate).format('YYYY-MM-DD'),
    }
    this._helpdeskService.getUserActivityList(req).subscribe((getUserActivityListRes: any) => {
      var userActivityList = getUserActivityListRes.data ? getUserActivityListRes.data : getUserActivityListRes;
      if (formValue.selectedSubModuleCd.includes(0) && getUserActivityListRes.length) {
        userActivityList.length && userActivityList.unshift({
          subModuleCd: 0,
          subModuleName: "All",
          transactionIdCount: getUserActivityListRes.reduce((accumulator, currentObject) => {
            return accumulator + currentObject.transactionIdCount
          }, 0)
        })
      }
      this.dataSource.data = userActivityList ?? [];
      this.isLoadingSpinner = false;
    }, err => {
      this.isLoadingSpinner = false;
    })
  }

  selectAllForDropdownItems(items: any[]) {
    let allSelect = items => {
      items.forEach(element => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };

    allSelect(items);
  }
  //view-more//
  openDialog(subModuleCd: number, subModuleName: string): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }
    const formValue = this.itemForm.getRawValue();
    const dialogRef = this.dialog.open(UserReportDialogComponent, {
      width: '900px',
      height: '90vh',
      panelClass: 'custom-dialog-container',
      data: {
        fromDate: moment(formValue.fromDate).format('YYYY-MM-DD'),
        toDate: moment(formValue.toDate).format('YYYY-MM-DD'),
        subModuleCd,
        subModuleName
      },
      disableClose: true
    });
  }
  setDataSourceAttributes() {
    this.dataSource.paginator = this.withpaginator;
    this.dataSource.sort = this.sort;
  }
  filterData(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

  }
  get f() {
    return this.itemForm.controls;
  }
  downloadFinalReport() {
    if (this.itemForm.invalid || this.isShowError) {
      this.itemForm.markAllAsTouched();
      return;
    }
    const formValue = this.itemForm.getRawValue();
    let req = {
      subModuleCodes: formValue.selectedSubModuleCd,
      fromDate: moment(formValue.fromDate).format('YYYY-MM-DD'),
      toDate: moment(formValue.toDate).format('YYYY-MM-DD')
    }
    this.isLoadingSpinner = true;
    this.userReportService.downloadGeoTransactionSummary(req).subscribe(
      (res: any) => {
        this.isLoadingSpinner = false;
        const blob = new Blob([res.body], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const popUp = window.open(url, '_blank');
        this.itemForm.reset();
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
}
