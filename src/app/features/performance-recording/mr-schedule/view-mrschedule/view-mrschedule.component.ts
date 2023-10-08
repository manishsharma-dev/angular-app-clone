import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { OwnerDetails } from 'src/app/features/animal-health/models/animal.model';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';
import { MasterConfig } from 'src/app/shared/master.config';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { getDecryptedProjectData, getSessionData } from 'src/app/shared/shareService/storageData';
import { animalBreedingValidations } from 'src/app/shared/validatator';
import { PrService } from '../../pr.service';


const frequencyTable = [
  {value:'Daily' , key:5},
  {value:'Current Week' , key:2},
  {value:'Weekly' , key:1},
  {value:'Fortnightly' , key:4},
  {value:'Monthly' , key:3}
]


@Component({
  selector: 'app-view-mrschedule',
  templateUrl: './view-mrschedule.component.html',
  styleUrls: ['./view-mrschedule.component.css'],
  providers: [TranslatePipe],
})
export class ViewMRScheduleComponent implements OnInit {
  cmnValidations = animalBreedingValidations.common;
  masterConfig = MasterConfig;
  searchForm!: FormGroup;
  isLoadingSpinner: boolean = false;
  statesList = [];
  districtList = [];
  villageList = [];
  selectedVillages = [];
  tehsilList = [];
  ownerDetailsRecord: any;
  ownerDetailsByID!: OwnerDetails;
  displayedColumns: string[] = [
    'radio',
    'sNo',
    'tagNo',
    'species',
    'calvingDate',
    'village',
    'ownersName',
    'nextMRDate',
    'time',
  ];
  tableDataSource = new MatTableDataSource<any>();
  animalDetail: any = [];
  noOfBoxes: number = 0;
  isMRList = [];
  serverDate =  sessionStorage.getItem('serverCurrentDateTime')
  currentDate = new Date(sessionStorage.getItem('serverCurrentDateTime'));
  nextDate: string;
  userDetails:any
  projectId:any
  typedFrequency = frequencyTable
  frequency:number
  getScheduleDates:any
  constructor(
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private prService: PrService,
    private router: Router,
    private dataService:DataServiceService,
  ) {}

  ngOnInit(): void {
    this.currentDate.setDate(
      this.currentDate.getDate() +
        ((1 + 7 - this.currentDate.getDay()) % 7 || 7)
    );
    this.userDetails = this.dataService._fetchLoggedUserDatails();
    this.initScheduleForm();
    this.detectStorageforProject()
    this.detectProject()
  }

  get today() {
    return moment(this.serverDate).format('YYYY-MM-DD');
  }

  selectAllForDropdownItems(items: any[]) {
    let allSelect = (items) => {
      items.forEach((element) => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };

    allSelect(items);
  }
  //CheckBox value starts
  onCheckboxChange(event, element: any) {
    if (event.target.checked) {
      this.animalDetail.push(element);
    } else {
      this.animalDetail.forEach((value, index) => {
        if (value.reportsID === element.reportsID)
          this.animalDetail.splice(index, 1);
      });
    }
    this.noOfBoxes = this.animalDetail.length;
  }

  checkIfInSelectedList(element: any) {
    return this.animalDetail ? this.animalDetail.includes(element) : [];
  }

  searchInTable(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
    if (this.tableDataSource.paginator) {
      this.tableDataSource.paginator.firstPage();
    }
  }
  getMRList() {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
    if (!this.projectId) {
      this.alertDialog('animalBreeding.commonLabel.select_project');
      return;
    }
    this.isLoadingSpinner = true;
    const mrDate =
      // '2023-02-17'
      moment(this.searchForm.get('startDate').value).format('YYYY-MM-DD');
    
    this.prService.viewMRScheduleList(mrDate, this.projectId).subscribe(
      (data: any) => {
        this.isLoadingSpinner = false;
        this.tableDataSource = new MatTableDataSource(data);
        this.tableDataSource.data = [...this.tableDataSource.data];
        this.isMRList = data;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  onClickingRemoveWithOutCampaign(element) {
    this.animalDetail.forEach((value, index) => {
      if (value.tagId === element.tagId) this.animalDetail.splice(index, 1);
    });
  }
  createSchedule(): void {
    this.router.navigate(
      ['./dashboard/performance-recording/mr-schedule/create-schedule'],
      { queryParams: { isEdit: true } }
    );
    sessionStorage.setItem('animalData', JSON.stringify(this.animalDetail));
  }
  myFilter = (d: Date | null): boolean => {
    let enableFlag = false;
    if (d) {
      const currentDate :any = moment(this.currentDate).format('YYYY-MM-DD');

      const date: any = moment(d).format('YYYY-MM-DD');
      if (date == currentDate || date == this.getScheduleDates?.startDate) {
        // You can use any other comparison operator used by date object
        enableFlag = true;
        return true;
      }
    }

    return enableFlag;
  };

  detectDateChange(event: string) {
    this.searchForm.get('startDate').setValue(event);
    this.getMRList();
  }
  isDisabled(mr_date: string) {
    let disable = false;
    if (mr_date) {
      const getDate = mr_date.split(',');
      const dateConversion = moment(getDate[0]).format('YYYY-MM-DD');
      disable = this.today > dateConversion ? true : false;
    }
    return disable;
  }
  get formControls() {
    return this.searchForm.controls;
  }

  private initScheduleForm(): void {
    this.searchForm = this._formBuilder.group({
      projectType: [{value:this.projectId,disabled:true}, [Validators.required]],
      frequency: [{ value: '', disabled: true }],
      startDate: ['', [Validators.required]],
    });
   
  }
  detectProject(): void {
    this.dataService.fetchProjectInfo.subscribe((projectID) => {
      if (projectID != '0' && projectID) {
        this.projectId = projectID;
        this.searchForm.get('projectType').patchValue(projectID);
        this.getSelectedProjectId()
      } else {
        this.projectId = null;
        this.isMRList = []
        this.searchForm.reset()
        this.alertDialog('animalBreeding.commonLabel.select_project');
      }
    });
  }


  detectStorageforProject(): void {
    this.projectId = getDecryptedProjectData('AESSHA256storageProjectData')?.id;

    if (this.projectId == '0' || !this.projectId) {
      this.projectId = null
      this.isMRList = []
     this.searchForm.reset()
    }
    else  {
      this.getSelectedProjectId()
    }
  }
  private alertDialog(message: string): void {
    this.dialog
      .open(ConfirmationDeleteDialogComponent, {
        data: {
          id: '',
          title:'common.alert_string',
          message: message,
          icon: 'assets/images/alert.svg',
          primaryBtnText: 'common.ok',
        },
        panelClass: 'common-alert-dialog',
      })
      .afterClosed();
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
            if(frequencyDetails?.length > 0){
              const freq = this.typedFrequency.filter(value=>value?.value == frequencyDetails[0]?.parameterValue)
              this.frequency = freq?.length  > 0 ? freq[0]?.key : 3
              this.searchForm.get("frequency").setValue(freq[0]?.value)
           
            }else{
              this.frequency = 3
              this.searchForm.get("frequency").setValue('Monthly')
            }
           this.getScheduleDates =  this.dataService._setScheduleAccordingFrequency(this.frequency)
          
           this.searchForm.get("startDate").setValue(this.getScheduleDates?.startDate)
           this.getMRList();
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
}
