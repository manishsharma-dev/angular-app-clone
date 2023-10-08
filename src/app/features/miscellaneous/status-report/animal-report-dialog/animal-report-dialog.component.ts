import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import moment from 'moment';
import { AnimalTreatmentService } from 'src/app/features/animal-health/animal-treatment/animal-treatment.service';
import { CommonMaster } from 'src/app/features/animal-health/animal-treatment/models/common-master.model';
import { HealthService } from 'src/app/features/animal-health/health.service';
import { AnimalDetails } from 'src/app/features/animal-health/models/animal.model';
import { AnimalManagementService } from 'src/app/features/animal-management/animal-registration/animal-management.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { StatusReportService } from '../status-report.service';

@Component({
  selector: 'app-animal-report-dialog',
  templateUrl: './animal-report-dialog.component.html',
  styleUrls: ['./animal-report-dialog.component.css'],
  providers: [TranslatePipe],
})
export class AnimalReportDialogComponent implements OnInit {
  isLoading = false;
  form: FormGroup;
  currentDate = moment();
  modules: CommonMaster[] = [];
  historyArray = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialog: MatDialog,
    private readonly healthService: HealthService,
    private readonly translatePipe: TranslatePipe,
    private readonly statusReportService: StatusReportService,
    private readonly treatmentService: AnimalTreatmentService,
    private readonly animalMgmtService: AnimalManagementService,
    @Inject(MAT_DIALOG_DATA) public readonly data: IDialogData
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getData();
  }

  getData() {
    this.isLoading = true;
    forkJoin([
      this.animalMgmtService
        .getCurrentDate()
        .pipe(map((res) => moment(new Date(res.value)))),
      this.healthService.getCommonMaster('animal_status_report'),
    ]).subscribe(
      ([date, modules]) => {
        this.isLoading = false;
        this.currentDate = date;
        this.modules = modules;
        this.initForm();
        this.getHistoryData(this.form.get('moduleCd').value);
      },
      () => (this.isLoading = false)
    );
  }

  getHistoryData(moduleCd: number) {
    console.log(moduleCd);
  }

  initForm() {
    this.form = this.fb.group({
      moduleCd: this.fb.control(1),
      fromDate: this.fb.control(moment(this.currentDate).subtract(1, 'y')),
      toDate: this.fb.control(this.currentDate),
    });

    this.form.get('moduleCd').valueChanges.subscribe((value: number) => {
      this.getHistoryData(value);
    });

    this.form
      .get('fromDate')
      .valueChanges.pipe(distinctUntilChanged())
      .subscribe((value: moment.Moment) => {});

    this.form
      .get('toDate')
      .valueChanges.pipe(distinctUntilChanged())
      .subscribe((value: moment.Moment) => {});
  }

  viewPrescription(caseId: number, followUpNo: number) {
    this.treatmentService
      .downloadPrescription({
        caseId,
        followUpNo,
      })
      .subscribe(
        (res: any) => {
          this.isLoading = false;
          const blob = new Blob([res.body], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const popUp = window.open(url, '_blank');
          if (popUp == null || typeof popUp == 'undefined') {
            this.dialog.open(ConfirmationDialogComponent, {
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
}

interface IDialogData {
  animal: AnimalDetails;
}
