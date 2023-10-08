import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { forkJoin, of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  switchMap,
} from 'rxjs/operators';
import { animalBreedingPRConfig } from 'src/app/shared/animal-breeding-pr.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { AlphaNumericSpecialValidation } from 'src/app/shared/utility/validation';
import { SaveDialogComponent } from '../../../pregnancy-diagnosis/save-dialog/save-dialog.component';
import { EtService } from '../../et.service';

@Component({
  selector: 'app-add-heat-transaction',
  templateUrl: './add-heat-transaction.component.html',
  styleUrls: ['./add-heat-transaction.component.css'],
  providers: [TranslatePipe],
})
export class AddHeatTransactionComponent implements OnInit {
  currentDate = sessionStorage.getItem('serverCurrentDateTime');
  addHeatTransactionForm!: FormGroup;
  isLoadingSpinner: boolean = false;
  isbullId: boolean = false;
  historyDetail: object = {};
  commonDetail: Array<{}>;
  heatType: string;
  countHeatType: Array<{}>;
  recordingPeriod: Array<{}>;
  breedingMinDate = '';
  tagId: number;
  ownerDetails: any;
  constructor(
    private _fb: FormBuilder,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private etService: EtService,
    private dataService: DataServiceService,
    private translatePipe: TranslatePipe
  ) {}

  get today() {
    return moment(this.currentDate).format('YYYY-MM-DD');
  }
  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        filter((params) => {
          if (!params['tagId']) {
            this.router.navigate(['/not-found']);
            return false;
          }

          this.tagId = params['tagId'];

          return true;
        }),
        switchMap(() =>
          forkJoin([
            this.etService
              .getCommonMaster('heat_type')
              .pipe(catchError((err) => of(null))),

            this.dataService
              .getDefaultConfig(animalBreedingPRConfig.backdate.ETHeatBackdate)
              .pipe(catchError((err) => of(null))),
          ])
        )
      )
      .subscribe(([heatType, config]) => {
        this.commonDetail = heatType;
        this.breedingMinDate = moment(this.currentDate)
          .subtract(config.defaultValue, 'days')
          .format('YYYY-MM-DD');
        this.getHeatType();
      });
    this.initHeatTransactionForm();
    this.getCommonMasterDetail();

    this.historyDetail = {
      compDetail: 'HT',
      newPageUrl: 'newai',
      apiType: 'apiUrlBreedingModule',
      apiUrl: 'animalbreeding/history/getBreedingHistory?tagId=',
      tagId: this.tagId,
      isHistory: false,
      heatType: this.heatType,
      name: 'animalBreeding.heat_transaction',
    };
  }
  submitHeatTransaction(): void {
    if (this.addHeatTransactionForm.invalid) {
      this.addHeatTransactionForm.markAllAsTouched();
      return;
    }
    this.isLoadingSpinner = true;
    this.formControls.heatType.enable();
    this.formControls.heatRecordDate.enable();
    const formValue = {
      ...this.addHeatTransactionForm.value,
    };
    formValue.animalId = this.ownerDetails?.animalId;
    formValue.heatDate = moment(formValue.heatDate).format('YYYY-MM-DD');
    formValue.tagId = this.tagId;
    this.etService
      .saveHeatTransaction(formValue)
      .pipe(
        switchMap((res: any) => {
          return this.dialog
            .open(SaveDialogComponent, {
              data: {
                title: res?.msg?.msgDesc,
                transaction_id: res?.data?.etHeatId ?? res?.etHeatId,
              },
              width: '500px',
              panelClass: 'makeItMiddle',
            })
            .afterClosed();
        })
      )
      .subscribe(
        (res) => {
          this.addHeatTransactionForm.reset({
            heatRecordDate:
              this.addHeatTransactionForm.get('heatRecordDate').value,
            heatDate: this.addHeatTransactionForm.get('heatDate').value,
          });
          this.goBack();
          this.isLoadingSpinner = false;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
  }
  get formControls() {
    return this.addHeatTransactionForm.controls;
  }
  getOwnerId(param: any) {
    this.ownerDetails = param?.animalResponse;
  }

  goBack() {
    this.router.navigate(['./dashboard/animal-breeding/et/heat-transaction'], {
      queryParams: { ownerId: this.ownerDetails?.ownerId },
    });
  }
  private initHeatTransactionForm(): void {
    this.addHeatTransactionForm = this._fb.group({
      heatRecordDate: [
        { value: this.today, disabled: true },
        Validators.required,
      ],
      heatDate: [
        this.today,
        { updateOn: 'blur', validators: [Validators.required] },
      ],
      heatType: ['', [Validators.required]],
      remarks: ['', AlphaNumericSpecialValidation],
      heatNo: [null],
      modifiedBy: ['TEST'],
      etHeatId: [null],
      createdBy: ['TEST'],
      timeSlot: [1, [Validators.required]],
      eligibleForEtFlag: [null, [Validators.required]],
    });

    this.addHeatTransactionForm
      .get('heatDate')
      .valueChanges.pipe(
        filter(() => !!this.ownerDetails?.taggingDate),
        distinctUntilChanged()
      )
      .subscribe((res) => {
        const selectedDate = moment(res);

        const taggingDate = moment(this.ownerDetails?.taggingDate);

        if (selectedDate.isBefore(taggingDate)) {
          this.dialog
            .open(ConfirmationDialogComponent, {
              data: {
                title: this.translatePipe.transform('common.info_label'),
                message: this.translatePipe.transform(
                  'performanceRecording.please_select_date_after_animal_tagging_date'
                ),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
                icon: 'assets/images/alert.svg',
              },
              panelClass: 'common-info-dialog',
            })
            .afterClosed()
            .subscribe(() =>
              this.addHeatTransactionForm.get('heatDate').reset()
            );
        }
      });
  }

  private getHeatType(): void {
    this.isLoadingSpinner = true;
    this.etService.getHeatType(this.tagId).subscribe(
      (data: any) => {
        this.isLoadingSpinner = false;
        this.countHeatType = data;
        if (
          this.countHeatType &&
          this.countHeatType?.length > 0 &&
          this.countHeatType?.length < 2
        ) {
          this.formControls.heatType.setValue(data[0]?.cd);
          this.addHeatTransactionForm.patchValue({ heatType: data[0]?.cd });
          this.formControls.heatType.disable();
        } else {
        }
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  private getCommonMasterDetail(): void {
    this.etService.getCommonMaster('recording_period').subscribe(
      (data: any) => {
        this.isLoadingSpinner = false;
        this.recordingPeriod = data;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
}
