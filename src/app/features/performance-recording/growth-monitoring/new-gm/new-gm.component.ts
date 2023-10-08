import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { forkJoin } from 'rxjs';
import { distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { HealthService } from 'src/app/features/animal-health/health.service';
import { AnimalDetailService } from 'src/app/features/animal-management/animal-registration/animal-details/animal-detail.service';
import { animalBreedingPRConfig } from 'src/app/shared/animal-breeding-pr.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { decimalNumberValidation } from 'src/app/shared/utility/validation';
import { animalBreedingValidations } from 'src/app/shared/validatator';
import { decimalWithLengthValidation } from '../../../../shared/utility/decimalWithLengthValidator';
import { GmSuccessDialogComponent } from '../gm-success-dialog/gm-success-dialog.component';
import { GrowthMonitoringService } from '../growth-monitoring.service';
import { GrowthHistoryRes } from '../models/animal-growth-history-res.model';
import { SaveGmReq } from '../models/save-gm-req.model';
import { lengthGirthValidator } from '../lengthGirthValidator';
import { PrService } from '../../pr.service';
import { SaveDialogComponent } from 'src/app/features/animal-breeding/pregnancy-diagnosis/save-dialog/save-dialog.component';

@Component({
  selector: 'app-new-gm',
  templateUrl: './new-gm.component.html',
  styleUrls: ['./new-gm.component.css'],
  providers: [TranslatePipe],
})
export class NewGmComponent implements OnInit {
  cmnValidation = animalBreedingValidations.common;
  validationMsg = animalBreedingValidations.gm;
  isLoadingSpinner = false;
  animal!: any;
  gmForm: FormGroup;
  history: GrowthHistoryRes['animalGrowthResponseList'][0];
  historyLength = 0;
  minDate = '';

  constructor(
    private healthService: HealthService,
    private animalMgmtService: AnimalDetailService,
    private gmService: GrowthMonitoringService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private dialog: MatDialog,
    private dataService: DataServiceService,
    private translatePipe: TranslatePipe,
    private prService: PrService
  ) {}

  ngOnInit(): void {
    this.getData();

    this.gmForm = this.fb.group(
      {
        recordDate: [
          {
            value: moment(this.prService.currentDate).format('DD/MM/YYYY'),
            disabled: true,
          },
        ],
        gmDate: [
          moment(this.prService.currentDate),
          { validators: [Validators.required], updateOn: 'blur' },
        ],
        length: [
          null,
          [
            Validators.min(0.01),
            Validators.required,
            decimalWithLengthValidation(4, 2),
          ],
        ],
        girth: [
          null,
          [
            Validators.min(0.01),
            Validators.required,
            decimalWithLengthValidation(4, 2),
          ],
        ],
        weight: [
          { value: null, disabled: true },
          [decimalNumberValidation, Validators.min(0.01), Validators.required],
        ],
      },
      { validators: [lengthGirthValidator] }
    );

    this.gmForm
      .get('gmDate')
      .valueChanges.pipe(
        filter(() => !!this.animal?.taggingDate),
        distinctUntilChanged()
      )
      .subscribe((res) => {
        const selectedDate = moment(res);

        const taggingDate = moment(this.animal?.taggingDate);

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
            .subscribe(() => this.gmForm.get('gmDate').reset());
        }
      });

    const weightControl = this.gmForm.get('weight');

    this.gmForm.valueChanges
      .pipe(filter(() => this.gmForm.valid))
      .subscribe((value) => {
        if (
          !isNaN(parseFloat(value.length)) &&
          !isNaN(parseFloat(value.girth))
        ) {
          const result = (value.girth * value.girth * value.length) / 660;
          weightControl.setValue(result.toFixed(2), { emitEvent: false });
        }
      });
  }

  getData() {
    this.isLoadingSpinner = true;
    this.route.queryParamMap
      .pipe(
        switchMap((params) =>
          this.animalMgmtService.getAnimalDetails(params.get('animalId'))
        ),
        switchMap((res) => {
          this.animal = res;
          return forkJoin([
            this.gmService.animalGrowthHistory(res.tagId),
            this.dataService.getDefaultConfig(
              animalBreedingPRConfig.backdate.GrowthMonitoringBackdate
            ),
          ]);
        })
      )
      .subscribe(
        (res) => {
          this.isLoadingSpinner = false;
          if (res[0]?.animalGrowthResponseList.length) {
            this.historyLength = res[0].animalGrowthResponseList.length;
            this.history = res[0]?.animalGrowthResponseList[0];
          }
          this.minDate = moment(this.prService.currentDate)
            .subtract(res[1].defaultValue, 'days')
            .format('YYYY-MM-DD');
        },
        () => (this.isLoadingSpinner = false)
      );
  }

  onWeightChange() {
    const lengthControl = this.gmForm.get('length');
    const girthControl = this.gmForm.get('girth');
    // lengthControl.disable();
    // girthControl.disable();
    // lengthControl.reset();
    // girthControl.reset();
  }

  onSubmit() {
    const formValue = this.gmForm.getRawValue();

    if (this.gmForm.invalid) {
      this.gmForm.markAllAsTouched();
      return;
    }

    // if (!formValue.weight) {
    //   this.gmForm.setErrors({ weightRequired: true });
    //   return;
    // }

    const reqObj: SaveGmReq = {
      animalId: this.animal.animalId,
      gmRecordDate: moment(this.prService.currentDate).format('YYYY-MM-DD'),
      tagId: this.animal.tagId,
      gmDate: moment(formValue.gmDate).format('YYYY-MM-DD'),
      girth: formValue.girth,
      length: formValue.length,
      weight: formValue.weight,
    };

    this.isLoadingSpinner = true;
    this.gmService.saveGmDetails(reqObj).subscribe(
      (res) => {
        let dialogRef;

        if (res?.msg?.msgCode === 3046) {
          this.isLoadingSpinner = false;
          dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            data: {
              title: this.translatePipe.transform('common.info_label'),
              icon: 'assets/images/info.svg',
              message:res?.msg?.msgDesc,
                // this.translatePipe.transform(
                //   'animalDetails.transaction-success-supervisor'
                // ) + String(res?.msg?.msgDesc),
              primaryBtnText:
                this.translatePipe.transform('common.ok_string'),
            },
            panelClass: 'common-info-dialog',
          });
        } else {
          dialogRef = this.dialog.open(GmSuccessDialogComponent, {
            data: {
              transaction_id: res.data.gmId,
              title: 'GM Details have been submitted successfully',
              currentGrowthRate: res.data.growthRate,
              targetedWeeks: res.data.targetedWeeks,
              targetedGrowthRate18Months:
                res.data.tragetedGrowthRate18Months ??
                res.data.targetedGrowthRate18Months,
              targetedGrowthRate24Months:
                res.data.tragetedGrowthRate24Months ??
                res.data.targetedGrowthRate24Months,
              // weightTime: res,
              // growthRate: res.growthRate,
            },
            disableClose: true,
          });
        }
        dialogRef?.afterClosed()?.subscribe(() => {
          this.router.navigate(['..', 'view-history'], {
            relativeTo: this.route,
            queryParams: {
              tagId: this.animal.tagId,
            },
          });
        });
      },
      () => (this.isLoadingSpinner = false)
    );
  }

  getAnimalAge(ageInMonths: number) {
    return this.healthService.getWords(ageInMonths);
  }

  goBack() {
    this.location.back();
  }

  onReset() {
    this.gmForm.reset({
      recordDate: moment(this.prService.currentDate).format('DD/MM/YYYY'),
    });
    // this.gmForm.get('length').enable();
    // this.gmForm.get('girth').enable();
    // this.gmForm.get('weight').enable();
  }

  get today() {
    return moment(this.prService.currentDate).format('YYYY-MM-DD');
  }

  isControlValid(control: string) {
    return (
      (this.gmForm.get(control).dirty && this.gmForm.get(control).invalid) ||
      this.gmForm.get(control).touched
    );
  }
}
