import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SaveDialogComponent } from 'src/app/features/animal-breeding/pregnancy-diagnosis/save-dialog/save-dialog.component';
import { PrService } from '../../pr.service';
import { Location } from '@angular/common';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';
import { MasterConfig } from 'src/app/shared/master.config';
import { TranslatePipe } from '@ngx-translate/core';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { getDecryptedProjectData, getSessionData } from 'src/app/shared/shareService/storageData';

export interface TableData {
  lastMRNo: number;
  lastMRDate: string;
  tagId: number;
  species: string;
  calvingDate?: string;
  animalId: number;
  afternoonTime: string;
  eveningTime: string;
  morningTime: string;
  mrDate: string;
  mrScheduleId: number;
  mrStopFlag: string;
  mrStopReason: number;
  projectId: string;
  remarks: string;
  scheduleFrequency: number;
}

enum TIME_SLOT {
  Morning,
  afternoon,
  Evening,
}
const frequencyTable = [
  {value:'Daily' , key:5},
  {value:'Current Week' , key:2},
  {value:'Weekly' , key:1},
  {value:'Fortnightly' , key:4},
  {value:'Monthly' , key:3}
]

@Component({
  selector: 'app-create-schedule',
  templateUrl: './create-schedule.component.html',
  styleUrls: ['./create-schedule.component.css'],
  providers: [TranslatePipe],
})
export class CreateScheduleComponent implements OnInit {
  masterConfig = MasterConfig;
  data: TableData[] = [];
  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  displayColumns = [
    'sr_no',
    'lastMRDate',
    'lastMRNo',
    'tagId',
    'species',
    'calvingDate',
    'mrDate',
    'morningTime',
    'afternoonTime',
    'eveningTime',
    'remarks',
    'action'
  ];
  rows: FormArray = this._fb.array([]);
  form: FormGroup = this._fb.group({ sync: this.rows });
  isLoadingSpinner: boolean = false;
  isLinear = false;
  addEmbryoMasterForm: FormGroup;
  currentDate = sessionStorage.getItem('serverCurrentDateTime')
  ownerId: number;
  scheduleUpto: any;
  drugList = [];
  startDate: any;
  isEdit: boolean = false;
  timeSlot = TIME_SLOT;
  animalData: any;
  projectId: any
  userDetails: any
  projectName: any
  frequency:number
  typedFrequency = frequencyTable
  constructor(
    private _fb: FormBuilder,
    private prService: PrService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private location: Location,
    private translatePipe: TranslatePipe,
    private dataService: DataServiceService
  ) { }

  ngOnInit(): void {
    this.animalData = JSON.parse(sessionStorage.getItem('animalData'));
    this.isEdit = this.route.snapshot.queryParams['isEdit'];
    if (this.isEdit)
      this.displayColumns = this.displayColumns.filter(
        (el) => el !== 'lastMRDate' && el !== 'lastMRNo'
      );

    // this.setScheduleAccordingFrequency()
    this.getAnimalTableData(this.animalData);
    this.userDetails = this.dataService._fetchLoggedUserDatails();
    this.detectStorageforProject();
    this.detectProject();
  }
  get today() {
    return moment(this.currentDate).format('YYYY-MM-DD');
  }

  saveMRScheduleDetail(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoadingSpinner = true;

    const formValue = {
      ...this.form.value,
    };
    const formParseValue = formValue?.sync?.map((p) =>
      p.mrDate ? { ...p, mrDate: moment(p.mrDate).format('YYYY-MM-DD'),startDate:this.startDate ,projectId :this.projectId } : p
    );
    this.prService[this.isEdit ? 'updateMRSchedule' : 'createMRSchedule'](
      formParseValue
    )
      .pipe(
        switchMap((res: any) => {
          return this.dialog
            .open(SaveDialogComponent, {
              data: {
                title: res?.msg?.msgDesc,
                // transaction_id: res
              },
              width: '500px',
            })
            .afterClosed();
        })
      )
      .subscribe(
        (res) => {
          this.isLoadingSpinner = false;
          this.gotoPreviousScreen();
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
  }
  addRow(d?: TableData, noUpdate?: boolean) {
    const row = this._fb.group({
      animalId: [d?.animalId, []],
      lastMRNo: [d?.lastMRNo],
      lastMRDate: [d?.lastMRDate],
      tagId: [d?.tagId, []],
      species: [d?.species, []],
      calvingDate: [d?.calvingDate, []],
      mrDate: [
        { value: d?.mrDate, disabled: this.isEdit && d?.mrDate < this.today },
        [],
      ],
      afternoonTime: [d?.afternoonTime, []],
      eveningTime: [d?.eveningTime, []],
      morningTime: [d?.morningTime, []],
      mrScheduleId: [d?.mrScheduleId, []],
      mrStopFlag: [d?.mrStopFlag, []],
      mrStopReason: [d?.mrStopReason, []],
      projectId: [d?.projectId, []],
      remarks: [d?.remarks, []],
      scheduleFrequency: [d?.scheduleFrequency, []],
      modifiedBy: 'Test',
      createdBy: 'Test',
      startDate: this.startDate,
    });
    this.rows.push(row);
    if (!noUpdate) {
      this.updateView();
    }
  }
  updateView() {
    this.dataSource.next(this.rows.controls);
  }
  get currentTime() {
    return moment(this.currentDate).format('HH:mm');
  }
  gotoPreviousScreen(): void {
    // this.router.navigate(['./dashboard/performance-recording/mr-schedule/create-mr'], {
    //   queryParams: { ownerId: this.ownerId },
    // });
    this.location.back();
  }
  getDate(date: string) {
    let dateFormat: any;
    if (date) {
      dateFormat = date.split(',');
    }
    return dateFormat?.length > 0
      ? moment(dateFormat[0]).format('YYYY-MM-DD')
      : '';
  }
  removeSireDetail(i: number): void {
    const arr = this.form.get('sync') as FormArray;
    if (arr.length === 1) this.gotoPreviousScreen();
    (this.form.get('sync') as FormArray).removeAt(i);
    this.updateView();
  }
  detectTimer(event: Event, time_slot: number, index: number): void {
    const divideTime = event.target['value'].split(':');
    const getHour = divideTime[0];
    const detectDayTime = getHour < 12 ? 0 : getHour < 18 ? 1 : 2;
    const slotInRange = detectDayTime == time_slot ? true : false;
    if (!slotInRange) {
      this.alertDialog(
        this.translatePipe.transform(
          'performanceRecording.please_select_correct_time_slot'
        ),
        index,
        time_slot
      );
    }
    // else
  }

  private alertDialog(alert: string, index, slot): void {
    this.dialog
      .open(ConfirmationDeleteDialogComponent, {
        data: {
          id: '',
          title: this.translatePipe.transform('common.alert_string'),
          message: alert,
          icon: 'assets/images/alert.svg',
          primaryBtnText: this.translatePipe.transform('common.ok_string'),
        },
        panelClass: 'common-alert-dialog',
      })
      .afterClosed()
      .subscribe(() => {
        const timeSlot =
          slot == 0
            ? 'morningTime'
            : slot == 1
              ? 'afternoonTime'
              : 'eveningTime';
        this.rows
          .at(index)
          .get(timeSlot)
          .reset(
            this.animalData[index]['morningTime']
              ? this.animalData[index]['morningTime']
              : null
          );
      });
  }

  private getAnimalTableData(data: any): void {
    if (data && data?.length > 0) {
      this.ownerId = data[0].ownerId;
      // this.startDate = data[0]?.nextMRDate
      //   ? this.getDate(data[0]?.nextMRDate)
      //   : this.startDate;
      // this.scheduleUpto = moment(this.startDate)
      //   .add(6, 'days')
      //   .format('YYYY-MM-DD');
      data.forEach((element) => {
        const syncObj = {
          animalId: element?.animalId,
          tagId: element?.tagId,
          species: element?.species,
          lastMRNo: element?.lastMRNo,
          lastMRDate: element?.lastMRDate,
          calvingDate: element?.calvingDate,
          mrDate: this.getDate(element?.nextMRDate),
          afternoonTime: element?.afternoonTime,
          eveningTime: element?.eveningTime,
          morningTime: element?.morningTime,
          mrScheduleId: element?.mrScheduleId,
          mrStopFlag: element?.mrStopFlag,
          mrStopReason: element?.mrStopReason,
          projectId: this.projectId,
          remarks: element?.registrationRemarks,
          scheduleFrequency: 0,
        };
        this.addRow(syncObj);
      });
    }
  }

  ngOnDestroy() {
    sessionStorage.removeItem('animalData');
  }
  detectProject(): void {
    this.dataService.fetchProjectInfo.subscribe((projectID) => {
      if (projectID != '0' && projectID) {
        this.projectId = projectID;
        this.getSelectedProjectId()
        this.projectName = this.userDetails?.userProject?.filter(project => project?.projectId == this.projectId)

      } else {
        this.projectId = null;
        this.addEmbryoMasterForm.reset()
      }
    });
  }


  detectStorageforProject(): void {
    this.projectId = getDecryptedProjectData('AESSHA256storageProjectData')?.id;
    if (this.projectId == '0' || !this.projectId) {
      this.projectId = null;
      this.addEmbryoMasterForm.reset()
    }
    else {
      this.getSelectedProjectId()
      this.projectName = this.userDetails?.userProject?.filter(project => project?.projectId == project)
    }
  }

  getSelectedProjectId(): void {
    const currentSection = getSessionData('subModuleCd');
    let getPermission = [];
    this.isLoadingSpinner = true
    this.dataService._getProjectDetail(this.projectId).subscribe(
      (data: any) => {
        this.isLoadingSpinner = false;
        getPermission = data?.activityCd?.filter(
          (obj) => obj.activityCd == currentSection?.subModuleCd
        );
        const activityPermissionList =
          getPermission && getPermission?.length > 0
            ? getPermission[0].activityParameterList
            : [];
        const frequencyDetails =
          activityPermissionList && activityPermissionList.length > 0
            ? activityPermissionList.filter((obj) => obj.parameterCd == 5)
            : [];
           const freq = this.typedFrequency.filter(value=>value?.value == frequencyDetails[0]?.parameterValue)
            this.frequency = freq?.length  > 0 ? freq[0]?.key : 3
           const getScheduleDates =  this.dataService._setScheduleAccordingFrequency(this.frequency)
           this.startDate = getScheduleDates?.startDate
           this.scheduleUpto = getScheduleDates?.scheduleUpto
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
}
