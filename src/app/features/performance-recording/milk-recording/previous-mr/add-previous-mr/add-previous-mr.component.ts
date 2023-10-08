import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { switchMap } from 'rxjs/operators';
import { SuccessDialogComponent } from 'src/app/features/animal-breeding/success-dialog/success-dialog.component';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { getSessionData } from 'src/app/shared/shareService/storageData';
import {
  AlphaNumericSpecialValidation,
  NumericValidation,
} from 'src/app/shared/utility/validation';
import { animalBreedingValidations } from 'src/app/shared/validatator';
import { decimalWithLengthValidation } from '../../../../../shared/utility/decimalWithLengthValidator';
import { PrService } from '../../../pr.service';

@Component({
  selector: 'app-add-previous-mr',
  templateUrl: './add-previous-mr.component.html',
  styleUrls: ['./add-previous-mr.component.css'],
  providers: [TranslatePipe],
})
export class AddPreviousMRComponent implements OnInit {
  cmnValidation = animalBreedingValidations.common;
  activeTab = 'Morning';
  isLoadingSpinner: boolean = false;
  addMilkRecordingForm: FormGroup;
  selectedTimeZone: string = 'AM';
  selectedWeightType: string = 'Kg';
  showAdditionalInfo: boolean = false;
  historyDetail: any;
  aiDetails: any = {};
  fetchAnimalInfo: any;
  recordingDetails: any;
  mrTime: any;
  bodyConditionScore = Array.from({ length: 9 }, (_, i) => i + 1);
  breedingMinDate: number = 30;
  getAdditionalDetailsPermission = [];
  constructor(
    private _fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private prService: PrService,
    public dialog: MatDialog,
    private dataService: DataServiceService,
    private translatePipe: TranslatePipe
  ) {}

  ngOnInit(): void {
    this.fetchAnimalInfo = JSON.parse(sessionStorage.getItem('storageData'));
    this.aiDetails['tagId'] = this.route.snapshot.queryParams['tagId'];
    if (!this.aiDetails['tagId']) {
      this.router.navigate(['/not-found']);
    }

    this.initAddMRForm();
    this.historyDetail = {
      compDetail: 'AR',
      newPageUrl: 'add-previous-mr',
      apiType: 'apiUrlBreedingModule',
      apiUrl: 'animalbreeding/history/getBreedingHistory?tagId=',
      animalDetail: this.aiDetails,
      isHistory: false,
    };
    this.getCommonMasterDetail();
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
    this.formControls.mrDate.enable();
    const formValue = {
      ...this.addMilkRecordingForm.value,
    };
    formValue.milkVolume =
      this.selectedWeightType == 'Lt'
        ? this.convertLtToKg(formValue.milkVolume)
        : formValue.milkVolume;
    formValue.tagId = this.aiDetails.tagId;
    this.prService
      .updateMRRecord(formValue)
      .pipe(
        switchMap((res: any) => {
          return this.dialog
            .open(SuccessDialogComponent, {
              data: {
                transaction_id: `${res?.data?.mrId}`,
                title: this.translatePipe.transform(
                  'performanceRecording.milk_recording_updated_successfully'
                ),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
                secondaryBtnText: 'Cancel',
                icon: 'assets/images/info.svg',
              },
              panelClass: 'common-info-dialog',
            })
            .afterClosed();
        })
      )
      .subscribe(
        (res) => {
          this.router.navigateByUrl(
            '/dashboard/performance-recording/milk-recording/previous-mr'
          );
          this.isLoadingSpinner = false;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
  }
  verifyPortNumber(event: Event): void {}
  get minDate() {
    return moment(this.prService.currentDate)
      .subtract(this.breedingMinDate, 'days')
      .format('YYYY-MM-DD');
  }

  get today() {
    return moment(this.prService.currentDate).format('YYYY-MM-DD');
  }

  get formControls() {
    return this.addMilkRecordingForm.controls;
  }
  changeWeightType(event: Event) {
    this.selectedWeightType = event.target['value'];
  }
  detectTimer(event: Event): void {
    const divideTime = event.target['value'].split(':');
    const getHour = divideTime[0];
    const detectDayTime = getHour < 12 ? 1 : getHour < 18 ? 2 : 3;
    const filterRecord = this.recordingDetails.filter(
      (obj) => obj.cd == detectDayTime
    );
    this.fetchMRRecord(filterRecord[0]);
  }

  fetchMRRecord(param: any): void {
    const data = JSON.parse(sessionStorage.getItem('storageData'));
    const mrRecord = data?.data;
    this.formControls.mrDate.setValue(mrRecord?.mrDate);
    this.formControls.gpsCordinates.setValue(mrRecord?.gpsCordinates);
    this.formControls.recordNumber.setValue(mrRecord?.recordNo);
    const morningData = mrRecord.milkRecordingForRecordNo.filter(
      (m) => m.recordingPeriod === 1
    );
    const afternoonData = mrRecord.milkRecordingForRecordNo.filter(
      (m) => m.recordingPeriod === 2
    );
    const eveningData = mrRecord.milkRecordingForRecordNo.filter(
      (m) => m.recordingPeriod === 3
    );

    if (param && param['value'] == 'Morning') {
      this.addMilkRecordingForm.patchValue({
        recordingPeriod: param['cd'],
        milkVolume:
          mrRecord?.morningYield && mrRecord?.morningYield != 'null'
            ? mrRecord?.morningYield
            : '',
        mrTime: moment(morningData[0].mrDate)
          .subtract(330, 'minute')
          .format('HH:mm'),
        teatsFunctionalNo:
          morningData.length && morningData[0].teatsFunctionalNo,
        bodyConditionScore:
          morningData.length && morningData[0].bodyConditionScore,
        mastitisTreated: morningData.length && morningData[0].mastitisTreated,
        calfSuckling: morningData.length && morningData[0].calfSuckling,
      });
      this.activeTab =
        mrRecord?.morningYield && mrRecord?.morningYield != 'null'
          ? param['value']
          : '';
    } else if (param && param['value'] == 'Afternoon') {
      this.addMilkRecordingForm.patchValue({
        recordingPeriod: param['cd'],
        milkVolume:
          mrRecord?.afternoonYield && mrRecord?.afternoonYield != 'null'
            ? mrRecord?.afternoonYield
            : '',
        mrTime: moment(afternoonData[0].mrDate)
          .subtract(330, 'minute')
          .format('HH:mm'),
        teatsFunctionalNo:
          afternoonData.length && afternoonData[0].teatsFunctionalNo,
        bodyConditionScore:
          afternoonData.length && afternoonData[0].bodyConditionScore,
        mastitisTreated:
          afternoonData.length && afternoonData[0].mastitisTreated,
        calfSuckling: afternoonData.length && afternoonData[0].calfSuckling,
      });
      this.activeTab =
        mrRecord?.afternoonYield && mrRecord?.afternoonYield != 'null'
          ? param['value']
          : '';
    } else {
      this.addMilkRecordingForm.patchValue({
        recordingPeriod: param['cd'],
        milkVolume:
          mrRecord?.eveningYield && mrRecord?.eveningYield != 'null'
            ? mrRecord?.eveningYield
            : '',
        mrTime: moment(eveningData[0].mrDate)
          .subtract(330, 'minute')
          .format('HH:mm'),
        teatsFunctionalNo:
          eveningData.length && eveningData[0].teatsFunctionalNo,
        bodyConditionScore:
          eveningData.length && eveningData[0].bodyConditionScore,
        mastitisTreated: eveningData.length && eveningData[0].mastitisTreated,
        calfSuckling: eveningData.length && eveningData[0].calfSuckling,
      });
      this.activeTab =
        mrRecord?.eveningYield && mrRecord?.eveningYield != 'null'
          ? param['value']
          : '';
    }
  }
  isMRRecordAvailable(record: object) {
    let isRecordDisable: boolean = false;
    const data = JSON.parse(sessionStorage.getItem('storageData'));
    const mrRecord = data?.data;
    const recordTime = record['value'];

    if (recordTime == 'Morning') {
      isRecordDisable =
        mrRecord.morningYield && mrRecord?.morningYield != 'null'
          ? false
          : true;
    } else if (recordTime == 'Afternoon') {
      isRecordDisable =
        mrRecord.afternoonYield && mrRecord?.afternoonYield != 'null'
          ? false
          : true;
    } else {
      isRecordDisable =
        mrRecord.eveningYield && mrRecord?.eveningYield != 'null'
          ? false
          : true;
    }

    return isRecordDisable;
  }

  private initAddMRForm(): void {
    this.addMilkRecordingForm = this._fb.group({
      mrRecordDate: [
        { value: this.today, disabled: true },
        [Validators.required],
      ],
      mrDate: [
        { value: this.today, disabled: true },
        { validators: [Validators.required], updateOn: 'blur' },
      ],
      swsPortNumber: ['', [AlphaNumericSpecialValidation]],
      mrTime: ['', [Validators.required]],
      recordingPeriod: [{ value: '', disabled: true }, [Validators.required]],
      gpsCordinates: [{ value: '', disabled: true }],
      milkVolume: [
        '',
        [
          Validators.required,
          // Validators.maxLength(2),
          decimalWithLengthValidation(4, 2),
          Validators.min(0),
        ],
      ],
      teatsFunctionalNo: [
        { value: null, disabled: true },
        [Validators.maxLength(1), NumericValidation],
      ],
      bodyConditionScore: [{ value: null, disabled: true }],
      mastitisTreated: [{ value: null, disabled: true }],
      calfSuckling: [{ value: null, disabled: true }],
      recordNumber: [null],
    });
  }

  private getCommonMasterDetail(): void {
    this.isLoadingSpinner = true;
    const data = JSON.parse(sessionStorage.getItem('storageData'));
    const mrRecord = data?.data;
    this.prService.getCommonMaster('recording_period').subscribe(
      (data) => {
        this.isLoadingSpinner = false;
        this.recordingDetails = data;
        this.activeTab =
          mrRecord.morningYield && mrRecord?.morningYield != 'null'
            ? 'Morning'
            : mrRecord.afternoonYield && mrRecord?.afternoonYield != 'null'
            ? 'Afternoon'
            : mrRecord.eveningYield && mrRecord?.eveningYield != 'null'
            ? 'Evening'
            : '';
        const getActiveRecord = this.recordingDetails.filter(
          (obj) => obj.value == this.activeTab
        );
        this.fetchMRRecord(getActiveRecord[0]);
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

  goBack() {
    this.router.navigateByUrl(
      '/dashboard/performance-recording/milk-recording/previous-mr'
    );
  }

  onReset() {
    this.addMilkRecordingForm.patchValue({
      milkVolume: null,
      swsPortNumber: null,
      // teatsFunctionalNo: null,
      // bodyConditionScore: null,
      // mastitisTreated: null,
      // calfSuckling: null,
    });

    this.addMilkRecordingForm.get('milkVolume').markAsUntouched();
    this.addMilkRecordingForm.get('swsPortNumber').markAsUntouched();
    // this.addMilkRecordingForm.get('teatsFunctionalNo').markAsUntouched();
    // this.addMilkRecordingForm.get('bodyConditionScore').markAsUntouched();
    // this.addMilkRecordingForm.get('mastitisTreated').markAsUntouched();
    // this.addMilkRecordingForm.get('calfSuckling').markAsUntouched();
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
}
