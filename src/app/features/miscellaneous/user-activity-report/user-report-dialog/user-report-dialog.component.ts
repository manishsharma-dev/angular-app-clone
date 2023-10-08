import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { UserActivityReportService } from '../user-activity-report.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { TreatmentResponseDialogComponent } from 'src/app/features/animal-health/treatment-response-dialog/treatment-response-dialog.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { GetGeoTransactionSummary } from '../models/getGeoTransaction.model';
import { HealthService } from 'src/app/features/animal-health/health.service';
import { MatPaginator } from '@angular/material/paginator';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { animalHealthValidations } from 'src/app/shared/validatator';

@Component({
  selector: 'app-user-report-dialog',
  templateUrl: './user-report-dialog.component.html',
  styleUrls: ['./user-report-dialog.component.css'],
  providers: [TranslatePipe]
})
export class UserReportDialogComponent implements OnInit, AfterViewInit {
  validationMsg = animalHealthValidations.campaignCreation;
  userReportForm: FormGroup;
  isLoadingSpinner: boolean = false;
  transactionSummary: boolean = false;
  public isShowError: string = '';
  campaignIdMessage: GetGeoTransactionSummary[] = [];
  Successmessage: GetGeoTransactionSummary[] = [];
  campaignTypeMessage: GetGeoTransactionSummary[] = [];
  dataSource = new MatTableDataSource([]);
  fromMinDate: any;
  fromMaxDate: any;
  toMinDate: any;
  toMaxDate: any;
  reportListData = [];
  totalData: number = 0;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  activityDisplayedColumns = [
    'sr_no',
    'subModuleName',
    'animalId',
    'tagId',
    'ownerId',
    'creationDate'
  ];
  itemsPerPage: number = 10;

  @ViewChild('paginator') paginator: MatPaginator;
  masterMinDate: any;
  masterMaxDate: any;
  constructor(
    private userReportService: UserActivityReportService, private readonly translateService: TranslateService,
    private healthService: HealthService,
    private translatePipe: TranslatePipe, public formBuilder: FormBuilder, public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA)
    public data: { fromDate: any, toDate: any, subModuleCd: number, subModuleName: string }
  ) { }
  ngOnInit(): void {
    this.userReportForm = this.formBuilder.group({
      fromDate: [this.data.fromDate, [Validators.required]],
      toDate: [this.data.toDate, [Validators.required],
      ],
    });
    this.getConfigDateData();
    this.formChangeEvent();
  }

  formChangeEvent() {
    this.userReportForm.get('fromDate').valueChanges.subscribe((fromDate) => {
      if (fromDate &&
        moment(fromDate).isBetween(moment(this.masterMinDate), moment(this.masterMinDate), undefined, "[]"))
        this.toMinDate = moment(fromDate).format('YYYY-MM-DD');
    })
    this.userReportForm.get('toDate').valueChanges.subscribe((toDate) => {
      if (toDate &&
        moment(toDate).isBetween(moment(this.masterMinDate), moment(this.masterMinDate), undefined, "[]"))
        this.fromMaxDate = moment(toDate).format('YYYY-MM-DD');;
    })
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.paginator.page
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingSpinner = true;
          return this.getReportDetail$(
            this.paginator.pageIndex,
            this.paginator.pageSize
          ).pipe(catchError(() => observableOf(null)));
        }),
        map((response: any) => {
          if (response == null) return [];
          this.totalData = response.numberOfRecords;
          this.isLoadingSpinner = false;
          return response.geoTransactionData;
        })
      )
      .subscribe((res) => {
        this.reportListData = res || [];
        this.dataSource = new MatTableDataSource(this.reportListData);
      });
  }

  getReportDetail$(pageNumber: Number, pageSize: Number) {
    const formValue = this.userReportForm.getRawValue();
    const req = {
      subModuleCode: this.data.subModuleCd,
      fromDate: moment(formValue.fromDate).format('YYYY-MM-DD'),
      toDate: moment(formValue.toDate).format('YYYY-MM-DD'),
      pageNo: pageNumber,
      itemPerPage: pageSize
    }
    return this.userReportService.getGeoTransactionDetails(req);
  }

  get f() {
    return this.userReportForm.controls;
  }

  getConfigDateData() {
    this.healthService
      .getDefaultConfig("userReportAllowedNoOfDays").subscribe((getDateConfigRes: any) => {
        this.fromMinDate = moment(this.today).subtract(getDateConfigRes.defaultValue, 'days');
        this.fromMaxDate = moment(this.today);
        this.masterMinDate = moment(this.today).subtract(getDateConfigRes.defaultValue, 'days');
        this.masterMaxDate = moment(this.today);
        this.toMinDate = moment(this.today).subtract(getDateConfigRes.defaultValue, 'days');
        this.toMaxDate = moment(this.today);
        const req = {
          subModuleCode: this.data.subModuleCd,
          fromDate: moment(this.data.fromDate).format('YYYY-MM-DD'),
          toDate: moment(this.data.toDate).format('YYYY-MM-DD'),
          pageNo: 0,
          itemPerPage: this.itemsPerPage
        }
        //this.getUserReportDetail(req);
      })
  }

  get today() {
    return moment(sessionStorage.getItem('serverCurrentDateTime')).format('YYYY-MM-DD');
  }



  userReportSubmit(): void {
    if (this.userReportForm.invalid || this.isShowError) {
      this.userReportForm.markAllAsTouched();
      return;
    }
    const formattedDateStart = moment(this.userReportForm.value.fromDate).format("YYYY-MM-DD") == 'Invalid date' ? '' : moment(this.userReportForm.value.fromDate).format("YYYY-MM-DD");
    const formattedDateEnd = moment(this.userReportForm.value.toDate).format("YYYY-MM-DD") == 'Invalid date' ? '' : moment(this.userReportForm.value.toDate).format("YYYY-MM-DD");

    this.ngAfterViewInit();

    // let data = {
    //   subModuleCodes: [this.data.subModuleCd],
    //   fromDate: formattedDateStart,
    //   toDate: formattedDateEnd

    // }
    // this.isLoadingSpinner = true;
    // this.userReportService.getGeoTransactionSummary(data).subscribe((res) => {
    //   this.transactionSummary = true;

    //   this.dataSource.data = res ?? [];
    //   this.Successmessage = res;
    //   this.campaignIdMessage = res;
    //   this.campaignTypeMessage = res;
    //   this.isLoadingSpinner = false;


    // }, err => this.isLoadingSpinner = false);
  }

  getUserReportDetail(req: any) {
    this.isLoadingSpinner = true;
    this.userReportService.getGeoTransactionDetails(req).subscribe((res: any) => {
      this.reportListData = res.geoTransactionData || [];
      this.dataSource.data = res.geoTransactionData || [];
      this.dataSource.paginator = this.paginator;
      this.totalData = res.numberOfRecords;
      this.isLoadingSpinner = false;
    }, err => {
      this.isLoadingSpinner = false;
    });
  }

  downloadMyFile() {
    const formValue = this.userReportForm.getRawValue();
    if (!formValue.fromDate) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'userReport.fromDate'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
      return;
    } else if (!formValue.toDate) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'userReport.toDate'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
      return;
    }

    let data = {
      subModuleCode: this.data.subModuleCd,
      fromDate: moment(formValue.fromDate).format('YYYY-MM-DD'),
      toDate: moment(this.data.toDate).format('YYYY-MM-DD'),
      pageNo: this.paginator.pageIndex,
      itemPerPage: this.paginator.pageSize
    }
    this.isLoadingSpinner = true;
    this.userReportService.downloadGeoTransactionDetailList(data).subscribe(
      (res: any) => {
        this.isLoadingSpinner = false;
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
}
function observableOf(arg0: null): any {
  throw new Error('Function not implemented.');
}

