import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { ArtificialInseminationService } from 'src/app/features/animal-breeding/artificial-insemination/artificial-insemination.service';
import { HealthService } from 'src/app/features/animal-health/health.service';
import { animalBreedingPRConfig } from 'src/app/shared/animal-breeding-pr.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { MasterConfig } from 'src/app/shared/master.config';
import { AppService } from 'src/app/shared/shareService/app.service';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import {
  getSessionData,
  setEncryptedData,
} from 'src/app/shared/shareService/storageData';
import {
  AlphaNumericSpecialValidation,
  NumericValidation,
} from 'src/app/shared/utility/validation';
import { animalBreedingValidations } from 'src/app/shared/validatator';
import { decimalWithLengthValidation } from '../../../../../shared/utility/decimalWithLengthValidator';
import { PrService } from '../../../pr.service';
import { MrSubmitDialogComponent } from '../../mr-submit-dialog/mr-submit-dialog.component';
import { UpdateCalvingDateDialogComponent } from '../../update-calving-date-dialog/update-calving-date-dialog.component';
import { MaxTimeValidation } from '../max-time.validator';

@Component({
  selector: 'app-add-milk-recording',
  templateUrl: './add-milk-recording.component.html',
  styleUrls: ['./add-milk-recording.component.css'],
  providers: [TranslatePipe],
})
export class AddMilkRecordingComponent implements OnInit {
  cmnValidation = animalBreedingValidations.common;
  isLoadingSpinner: boolean = false;
  addMilkRecordingForm: FormGroup;
  selectedTimeZone: string = 'AM';
  selectedWeightType: string = 'Kg';
  showAdditionalInfo: boolean = false;
  historyDetail: any;
  aiDetails: any = {};
  fetchAnimalInfo: any;
  animal: any;
  recordingDetails: any;
  mrTime: any;
  bodyConditionScore = Array.from({ length: 9 }, (_, i) => i + 1);
  breedingMinDate: number = 30;
  submitRes: any;
  getAdditionalDetailsPermission = [];
  minDate = '';
  constructor(
    private _fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private prService: PrService,
    public dialog: MatDialog,
    private healthService: HealthService,
    private appService: AppService,
    private dataService: DataServiceService,
    private translatePipe: TranslatePipe,
    private aiService: ArtificialInseminationService
  ) {}

  ngOnInit(): void {
    this.isLoadingSpinner = true;
    this.route.queryParams.subscribe((params) => {
      const tagId = params.tagId;

      this.healthService.getDetailsByTagID(tagId).subscribe((res) => {
        this.fetchAnimalInfo = { id: res };
        this.aiDetails = { tagId };
        this.animal = res;
        this.isLoadingSpinner = false;

        if (this.animal?.lastCalvingDate == null) {
          this.updateCalvingDetails();
        }
      });
    });
    this.dataService
      .getDefaultConfig(animalBreedingPRConfig.backdate.MRBackdate)
      .subscribe((res) => {
        this.minDate = moment(this.prService.currentDate)
          .subtract(res.defaultValue, 'days')
          .format('YYYY-MM-DD');
      });

    this.historyDetail = {
      compDetail: 'AR',
      newPageUrl: 'newai',
      apiType: 'apiUrlBreedingModule',
      apiUrl: 'history/getBreedingHistory?tagId=',
      // animalDetail: this.aiDetails,
      isHistory: false,
    };

    this.initAddMRForm();

    this.getCommonMasterDetail();
    this.getLocation();
    this.getProjectID();
  }
  submitMilkRecording(): void {
    if (this.addMilkRecordingForm.invalid) {
      this.addMilkRecordingForm.markAllAsTouched();
      return;
    }
    this.isLoadingSpinner = true;
    this.formControls.mrRecordDate.enable();
    this.formControls.recordingPeriod.enable();
    // this.formControls.gpsCordinates.enable()
    const formValue = {
      ...this.addMilkRecordingForm.getRawValue(),
    };
    formValue.milkVolume =
      this.selectedWeightType == 'Lt'
        ? this.convertLtToKg(formValue.milkVolume)
        : formValue.milkVolume;
    formValue.animalId = this.animal.animalId;
    formValue.tagId = this.aiDetails.tagId;
    formValue.createdBy = 'Test';
    formValue.projectId = 'Project One';
    formValue.mrRecordDate = moment(this.prService.currentDate).format(
      'YYYY-MM-DD'
    );
    formValue.mrDate = moment(
      new Date(
        moment(formValue.mrDate).format('YYYY-MM-DD') + ' ' + formValue.mrTime
      )
    )
      .add(5, 'hour')
      .add(30, 'minute');

    this.prService
      .registerNewMR(formValue)
      .pipe(
        switchMap((res) => {
          this.submitRes = res;
          if(res && (res?.msg?.msgCode == 3046)){
            return this.dialog
            .open(ConfirmationDialogComponent, {
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
            })
            .afterClosed()
          }else{
            return this.dialog
            .open(MrSubmitDialogComponent, {
              data: {
                id: res.data.mrId,
                samplingAllowed: this.appService.isRoutePermission(
                  '/performance-recording/milk-sampling/sample-list',
                  MasterConfig.isAdd
                ),
                res: res,
              },
              disableClose: true,
            })
            .afterClosed();
          }

         
        }
        )
      )
      .subscribe(
        (res) => {
          this.isLoadingSpinner = false;
          if (res) {
            setEncryptedData(
              { id: { ...this.submitRes.data } },
              'selectedMrSample'
            );
            this.router.navigateByUrl(
              '/dashboard/performance-recording/milk-sampling/add-sample'
            );
          } else {
            this.router.navigateByUrl(
              '/dashboard/performance-recording/milk-recording/add-mr'
            );
          }
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
  }
  verifyPortNumber(event: Event): void {}

  get today() {
    return moment(this.prService.currentDate);
  }

  get formControls() {
    return this.addMilkRecordingForm.controls;
  }
  changeWeightType(event: Event) {
    this.selectedWeightType = event.target['value'];
  }
  detectTimer(res: string): void {
    if (!res) {
      return;
    }

    const divideTime = res.split(':');
    const getHour = +divideTime[0];
    const detectDayTime = getHour < 12 ? 1 : getHour < 16 ? 2 : 3;
    this.formControls.recordingPeriod.setValue(detectDayTime);
  }
  private initAddMRForm(): void {
    this.addMilkRecordingForm = this._fb.group(
      {
        mrRecordDate: [
          {
            value: moment(this.prService.currentDate).format('DD/MM/YYYY'),
            disabled: true,
          },
          [Validators.required],
        ],
        mrDate: [
          this.today,
          { validators: [Validators.required], updateOn: 'blur' },
        ],
        swsPortNumber: [null, [AlphaNumericSpecialValidation]],
        mrTime: [
          moment(this.prService.currentDate).format('HH:mm'),
          [Validators.required],
        ],
        recordingPeriod: [
          { value: null, disabled: true },
          [Validators.required],
        ],
        milkVolume: [
          null,
          {
            validators: [
              Validators.required,
              // Validators.maxLength(2),
              decimalWithLengthValidation(4, 2),
              Validators.min(0),
            ],
            updateOn: 'blur',
          },
        ],
        gpsCordinates: [{ value: null, disabled: true }],
        teatsFunctionalNo: [null, [Validators.maxLength(1), NumericValidation]],
        bodyConditionScore: [null],
        mastitisTreated: ['NA'],
        calfSuckling: ['NA'],
      },
      { validators: [MaxTimeValidation] }
    );
    this.detectTimer(moment(this.prService.currentDate).format('HH:mm'));
    this.addMilkRecordingForm.get('mrTime').valueChanges.subscribe((res) => {
      this.detectTimer(res);
    });

    this.addMilkRecordingForm
      .get('mrDate')
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
            .subscribe(() => this.addMilkRecordingForm.get('mrDate').reset());
        }
      });

    this.addMilkRecordingForm.valueChanges
      .pipe(
        filter((value) => value.mrDate != null && value.milkVolume != null),
        distinctUntilKeyChanged('milkVolume'),
        switchMap((value) => {
          const req = {
            mrDate: value?.mrDate?.format('YYYY-MM-DD'),
            milkVolume: value?.milkVolume,
            animalId: this.animal.animalId,
            tagId: this.animal.tagId,
            scheduleFrequency: 1,
          };
          this.isLoadingSpinner = true;
          return this.prService.getWarningMessage(req).pipe(
            catchError((e) => {
              this.isLoadingSpinner = false;
              return of(e);
            }),
            take(1)
          );
        }),
        switchMap((res) => {
          this.isLoadingSpinner = false;
          if (res?.msgDesc) {
            return this.dialog
              .open(ConfirmationDialogComponent, {
                data: {
                  title: this.translatePipe.transform('common.info_label'),
                  message: res?.msgDesc,
                  primaryBtnText: this.translatePipe.transform('common.yes'),
                  secondaryBtnText: this.translatePipe.transform('common.no'),
                  icon: 'assets/images/alert.svg',
                },
                panelClass: 'common-info-dialog',
              })
              .afterClosed();
          } else {
            return of();
          }
        })
      )
      .subscribe(
        (res) => {
          if (!res) {
            this.addMilkRecordingForm
              .get('milkVolume')
              .patchValue(null, { emitEvent: false });
          }
        },
        () => (this.isLoadingSpinner = false),
        () => (this.isLoadingSpinner = false)
      );
  }

  private getCommonMasterDetail(): void {
    this.isLoadingSpinner = true;
    this.prService.getCommonMaster('recording_period').subscribe(
      (data) => {
        this.isLoadingSpinner = false;
        this.recordingDetails = data;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  private convertLtToKg(value: number) {
    const density = 1.035;

    const kg = value * density;

    return kg;
  }
  private getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: any) => {
        if (position) {
          const lat = this.getDMS(position.coords.latitude, 'lat');
          const lng = this.getDMS(position.coords.longitude, 'long');
          const cord = lat + ',' + lng;
          this.formControls.gpsCordinates.patchValue(cord);
        }
      });
    } else {
      alert(
        this.translatePipe.transform(
          'errorMsg.geolocation_is_not_supported_by_this_browser'
        )
      );
    }
  }

  private truncate(n) {
    return n > 0 ? Math.floor(n) : Math.ceil(n);
  }

  private getDMS(dd, longOrLat) {
    let hemisphere = /^[WE]|(?:lon)/i.test(longOrLat)
      ? dd < 0
        ? 'W'
        : 'E'
      : dd < 0
      ? 'S'
      : 'N';

    const absDD = Math.abs(dd);
    const degrees = this.truncate(absDD);
    const minutes = this.truncate((absDD - degrees) * 60);
    const seconds = (
      (absDD - degrees - minutes / 60) *
      Math.pow(60, 2)
    ).toFixed(2);

    let dmsArray = [degrees, minutes, seconds, hemisphere];
    return `${dmsArray[0]}°${dmsArray[1]}'${dmsArray[2]}" ${dmsArray[3]}`;
  }

  get currentTime() {
    return moment(this.prService.currentDate).format('HH:mm');
  }

  goBack() {
    this.router.navigate(
      ['/dashboard/performance-recording/milk-recording/add-mr'],
      { queryParams: { ownerDetail: this.animal.tagId } }
    );
  }

  onReset() {
    this.addMilkRecordingForm.reset({
      mrRecordDate: moment(this.prService.currentDate).format('DD/MM/YYYY'),
      // mrDate: this.today,
      // mrTime: moment(this.prService.currentDate).format('HH:mm'),
    });
  }
  getProjectID(): void {
    const currentSection = getSessionData('subModuleCd');
    let getPermission = [];
    this.dataService.fetchProjectInfo.subscribe((projectID) => {
      if (projectID) {
        this.isLoadingSpinner = true;
        this.dataService._getProjectDetail(projectID).subscribe(
          (data: any) => {
            this.isLoadingSpinner = false;
            getPermission = data?.activityCd?.filter(
              (obj) => obj.activityCd == currentSection?.subModuleCd
            );
            const activityPermissionList =
              getPermission && getPermission?.length > 0
                ? getPermission[0].activityParameterList
                : [];
            this.getAdditionalDetailsPermission =
              activityPermissionList && activityPermissionList.length > 0
                ? activityPermissionList.filter((obj) => obj.parameterCd == 4)
                : [];
          },
          (error) => {
            this.isLoadingSpinner = false;
          }
        );
      }
    });
  }

  updateCalvingDetails() {
    this.dialog
      .open(UpdateCalvingDateDialogComponent, {
        data: this.animal,
        panelClass: 'dry-off-dialog',
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        switchMap((value) => {
          if (value == null) {
            this.goBack();
            return of(false);
          }

          const reqObj = {
            animalId: this.animal?.animalId,
            lastCalvingDate: moment(value?.calvingDate).format('YYYY-MM-DD'),
          };
          this.isLoadingSpinner = true;
          return this.aiService.updateAnimalDetails(reqObj);
        }),
        filter((res) => !!res)
      )
      .subscribe(() => {
        this.isLoadingSpinner = false;
        this.ngOnInit();
      });
  }
}
