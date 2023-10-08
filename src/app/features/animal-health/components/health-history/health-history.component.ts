import {
  Component,
  Inject,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import moment, { Moment } from 'moment';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { HealthService } from 'src/app/features/animal-health/health.service';
import { AnimalManagementService } from 'src/app/features/animal-management/animal-registration/animal-management.service';
import {
  AnimalTransactions,
  StatusReport,
} from 'src/app/features/miscellaneous/status-report/models/status-report.model';
import { AnimalTreatmentService } from '../../animal-treatment/animal-treatment.service';
import { CommonMaster } from '../../animal-treatment/models/common-master.model';
import { AnimalDetails } from '../../models/animal.model';
import { TreatmentResponseDialogComponent } from '../../treatment-response-dialog/treatment-response-dialog.component';
import { StatusReportService } from 'src/app/features/miscellaneous/status-report/status-report.service';

@Component({
  selector: 'app-health-history',
  templateUrl: './health-history.component.html',
  styleUrls: ['./health-history.component.css'],
  providers: [TranslatePipe],
})
export class HealthHistoryComponent implements OnInit {
  isLoading = false;
  form: FormGroup;
  currentDate = this.healthService.currentDate;
  modules: CommonMaster[] = [];
  historyArray: any[] = [];
  statusReport: StatusReport;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialog: MatDialog,
    private readonly translatePipe: TranslatePipe,
    private readonly healthService: HealthService,
    private readonly statusReportService: StatusReportService,
    private readonly treatmentService: AnimalTreatmentService,
    @Inject(MAT_DIALOG_DATA) public readonly data: IDialogData
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getData();
  }

  initForm() {
    this.form = this.fb.group({
      animalHistoryCd: this.fb.control(this.data.animalHistoryCd),
      fromDate: this.fb.control(moment(this.currentDate).subtract(1, 'y')),
      toDate: this.fb.control(this.currentDate),
    });
  }

  getData() {
    this.isLoading = true;
    const commonMasterKey =
      this.data.parent === 'health'
        ? 'animal_health_history'
        : 'animal_status_report';

    this.healthService.getCommonMaster(commonMasterKey).subscribe(
      (modules) => {
        this.isLoading = false;
        this.modules = modules;

        this.initForm();
        this.getHistoryData();
      },
      () => (this.isLoading = false)
    );
  }

  getHistoryData() {
    this.isLoading = true;
    const formValue = this.form.value as FormValue;

    const api =
      this.data.parent === 'health'
        ? this.healthService.getAnimalHealthHistory(
            this.data?.animalData?.animalId,
            formValue.animalHistoryCd,
            moment(formValue.fromDate).format('YYYY-MM-DD'),
            moment(formValue.toDate).format('YYYY-MM-DD')
          )
        : this.statusReportService.getStatusReport(
            this.data?.animalData?.animalId,
            formValue.animalHistoryCd,
            moment(formValue.fromDate).format('YYYY-MM-DD'),
            moment(formValue.toDate).format('YYYY-MM-DD')
          );

    api.subscribe(
      (report) => {
        this.isLoading = false;
        this.statusReport = report;

        if (
          moment(this.healthService.currentDate)
            .subtract(1, 'y')
            .isBefore(this.birthDate) &&
          moment(this.form.get('fromDate').value).isBefore(this.birthDate)
        ) {
          this.form.get('fromDate').patchValue(this.birthDate);
        }
        this.filterByDateRange();
      },
      () => (this.isLoading = false)
    );
  }

  downloadHistory() {
    this.isLoading = true;
    this.healthService.downloadAnimalReportFile(this.statusReport).subscribe(
      (res: any) => {
        this.isLoading = false;
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
        this.isLoading = false;
      }
    );
  }

  filterByDateRange() {
    if (
      !this.statusReport?.transactions ||
      !this.statusReport?.transactions?.length
    ) {
      this.historyArray = [];
      return;
    }

    const arr = this.groupByDate(this.statusReport.transactions);
    this.historyArray = this.groupByService(arr);
  }

  groupByDate(statusReportTransactions: StatusReport['transactions']) {
    const groupedData = statusReportTransactions?.reduce((map, t) => {
      if (map.has(t.transactionData.date)) {
        map.get(t.transactionData.date).data.push(t.transactionData);
      } else {
        map.set(t.transactionData.date, {
          date: t.transactionData.date,
          data: [t.transactionData],
        });
      }

      return map;
    }, new Map<string, { date: string; data: AnimalTransactions[] }>());

    return Array.from(groupedData.values());
  }

  groupByService(obj: { date: string; data: AnimalTransactions[] }[]) {
    return obj.map((transaction) => {
      const groupMap = transaction.data.reduce((map, t) => {
        if (map.has(t.service)) {
          map.get(t.service).data.push(t);
        } else {
          map.set(t.service, { service: t.service, data: [t] });
        }

        return map;
      }, new Map<string, { service: string; data: AnimalTransactions[] }>());

      return Array.from(groupMap.values());
    });
  }

  onChange(control: keyof FormValue) {
    this.getHistoryData();
    // switch (control) {
    //   case 'animalHistoryCd':
    //     break;
    //   case 'fromDate':
    //   case 'toDate':
    //     this.filterByDateRange();
    // }
  }

  // getEntries(obj: object) {
  //   return Object.entries(obj)
  //     .filter((e) => e[1] && e[1] !== 'null')
  //     .sort((a, b) => a[0].localeCompare(b[0]));
  // }

  getTitleCase(text: string) {
    return text
      .replace(/([A-Z])/g, (match) => ` ${match}`)
      .replace(/^./, (match) => match.toUpperCase())
      .trim();
  }

  viewPrescription(caseId: number, followUpNo: number) {
    this.isLoading = true;
    this.treatmentService
      .downloadPrescription({
        caseId: caseId,
        followUpNo: followUpNo,
      })
      .subscribe(
        (res: any) => {
          this.isLoading = false;
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
          this.isLoading = false;
        }
      );
  }

  get birthDate() {
    return moment(this.data?.animalData?.dateOfBirth);
  }
}

interface IDialogData {
  animalData: AnimalDetails;
  flag: number;
  animalHistoryCd: number;
  parent: 'status-report' | 'health';
  ownerDetails?: AnimalDetails['ownerDetails'];
}

export interface FormValue {
  animalHistoryCd: number;
  fromDate: Date | moment.Moment;
  toDate: Date | moment.Moment;
}
