import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { Village } from 'src/app/features/animal-health/intimation-report/models/village.model';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';
import { MasterConfig } from 'src/app/shared/master.config';
import { CountryService } from 'src/app/shared/shareService/country-service.service';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { OwnerDetails } from 'src/app/shared/shareService/model/owner.detail';
import { getDecryptedProjectData, getSessionData } from 'src/app/shared/shareService/storageData';
import { onlyNumberValidation } from 'src/app/shared/utility/validation';
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
  selector: 'app-schedule-list',
  templateUrl: './schedule-list.component.html',
  styleUrls: ['./schedule-list.component.css'],
  providers: [TranslatePipe],
})


export class ScheduleListComponent implements OnInit {
  cmnValidations = animalBreedingValidations.common;
  masterConfig = MasterConfig;
  searchForm!: FormGroup;
  animalForm!: FormGroup;
  isLoadingSpinner: boolean = false;
  statesList: Village[] = [];
  districtList: Village[] = [];
  villageList: Village[] = [];
  tehsilList: Village[] = [];
  villages: Village[] = [];
  userAssignedStates :Village[] = []
  selectedVillages = [];
  ownerDetailsRecord: any;
  ownerDetailsByID!: OwnerDetails;
  displayedColumns: string[] = [
    'radio',
    'sNo',
    'lastMRDate',
    'lastMRNo',
    'tagNo',
    'species',
    'calvingDate',
    'village',
    'ownersName',
    'scheduled',
    'action',
  ];
  tableDataSource = new MatTableDataSource<any>();
  animalDetail: any = [];
  noOfBoxes: number = 0;
  isMRList: any;
  private sort!: MatSort;
  currentDate = sessionStorage.getItem('serverCurrentDateTime')
  userDetails:any;
  projectId:number | string
  typedFrequency = frequencyTable
  frequency:number 
  projectLocation :any
  totalRows = 0;
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  constructor(
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private prService: PrService,
    private router: Router,
    private translatePipe: TranslatePipe,
    private dataService:DataServiceService
  ) {}

  ngOnInit(): void {
    this.initScheduleForm();
    this.initAddAnimalForm();
    this.getCountryList();
    this.userDetails = this.dataService._fetchLoggedUserDatails();
    this.detectStorageforProject();
    this.detectProject();
  }

  get today() {
    return moment(this.currentDate).format('YYYY-MM-DD');
  }
  get prevousDate() {
    return moment(this.currentDate).subtract('M',1).format('YYYY-MM-DD');
  }

  @ViewChild(MatPaginator,{static:false})
  paginator!: MatPaginator;

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  setDataSourceAttributes() {
    // this.tableDataSource.paginator = this.paginator;
    this.tableDataSource.sort = this.sort;
  }

  // @ViewChild('paginatorRef') set matPaginator(mp: MatPaginator) {
  //   this.paginator = mp;
  //   this.setDataSourceAttributes();
  // }

  getCountryList() {
    this.isLoadingSpinner = true;

    this.prService.getVillagesByUser().subscribe(
      (response) => {
        this.villages = response;
        for (const area of response) {
          if (
            this.statesList.findIndex(
              (state) => state.stateCd === area.stateCd
            ) === -1
          ) {
            this.statesList = [...this.statesList, area];
            this.userAssignedStates =  this.statesList
          }
        }
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  getDistrictDetails(value: any): void {
    this.tehsilList.length = 0;
    this.villageList.length = 0;

    this.searchForm.get('districtCd')?.reset();

    this.searchForm.get('tehsilCd')?.reset();
    this.searchForm.get('villageCd')?.reset();
    if (value == null) {
      return;
    }
    // this.isLoadingSpinner = true;

    this.districtList = this.villages.filter(
      (district, index, self) =>
        district.stateCd === value.stateCd &&
        self.findIndex((v) => v.districtCd === district.districtCd) === index
    );
     this.mapProjectLocation('districtsCd')
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
  getTehsilDetails(value: any): void {
    this.villageList.length = 0;
    this.searchForm.get('tehsilCd')?.reset();
    this.searchForm.get('villageCd')?.reset();
    if (value == null) {
      return;
    }
    // this.isLoadingSpinner = true;
    this.tehsilList = this.villages.filter(
      (tehsil, index, self) =>
        tehsil.districtCd === value.districtCd &&
        self.findIndex((v) => v.tehsilCd === tehsil.tehsilCd) === index
    );
  }
  getVillagesDetails(value: any): void {
    this.villageList.length = 0;
    this.searchForm.get('villageCd')?.reset();
    if (value == null) {
      return;
    }

    // this.isLoadingSpinner = true;

    this.villageList = this.villages.filter(
      (village, index, self) =>
        village.tehsilCd === value.tehsilCd &&
        self.findIndex((v) => v.villageCd === village.villageCd) === index
    );
  }
  addAnimal() {
    const tagId = this.animalForm.get('tagId').value;
    this.isLoadingSpinner = true;
    this.prService.addAnimalCreateMRSchedule(tagId).subscribe(
      (data: any) => {
        this.isLoadingSpinner = false;
        if (data && data?.animalId) {
          const selectedAnimal = this.tableDataSource.data.find(
            (a) => a.tagId === data?.tagId
          ) as any;
          if (typeof selectedAnimal === 'undefined') {
            this.tableDataSource.data.push(data);
            this.tableDataSource._updateChangeSubscription();
          } else
            this.alertDialog(
              this.translatePipe.transform(
                'performanceRecording.animal_already_added'
              )
            );
        }
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  searchMRList() {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
    if (!this.projectId) {
      this.alertDialog('animalBreeding.commonLabel.select_project');
      return;
    }
    this.isLoadingSpinner = true;
    const formValue = {
      ...this.searchForm.value,
    };
   
    const villageObj = 
    {
      villageCodes:this.getVillageCode(),
      startDate:moment(formValue.startDate).format('YYYY-MM-DD'),
      pageNo : this.currentPage,
      itemPerPage : this.pageSize
    }
    this.prService[formValue.isPreviousRecord ?
                          'cloneMRScheduleList' : 'getMRScheduleList']
                          (villageObj).subscribe(
      (data: any) => {
        this.isLoadingSpinner = false;
        this.totalRows = data && data?.length > 4 ? 
        this.totalRows = this.totalRows + this.pageSize * 2
         : this.totalRows = this.pageSize * 2
        this.tableDataSource = new MatTableDataSource(data);
        this.isMRList = data;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  getVillageCode() {
    const villCd = this.searchForm.get('villageCd').value;
    let villageCodes: any = '';
    if (villCd && villCd?.length > 0) {
      villCd.forEach((element, index) => {
        villageCodes =
          villageCodes +
          `villageCodes=${element}${index != villCd?.length - 1 ? '&' : ''}`;
      });
    }
    return villageCodes;
  }
  onClickingRemoveWithOutCampaign(element) {
    this.animalDetail.forEach((value, index) => {
      if (value.tagId === element.tagId) this.animalDetail.splice(index, 1);
    });
  }
  createSchedule(): void {
    sessionStorage.setItem('animalData', JSON.stringify(this.animalDetail));
    this.router.navigate([
      './dashboard/performance-recording/mr-schedule/create-schedule',
    ]);

  }
  get formControls() {
    return this.searchForm.controls;
  }
  get animalformControls() {
    return this.animalForm.controls;
  }
  
  detectProject(): void {
    this.dataService.fetchProjectInfo.subscribe((projectID) => {
      if (projectID != '0' && projectID) {
        this.projectId = projectID;
        this.searchForm.get('projectType').patchValue(projectID);
        this.resetLocation()
        this.getSelectedProjectId()
      } else {
        this.projectId = null;
        this.statesList = this.userAssignedStates
        this.searchForm.get("frequency").reset()
        this.searchForm.get("fromDate").reset()
        this.resetLocation()
        
      }
    });
  }


  detectStorageforProject(): void {
    this.projectId = getDecryptedProjectData('AESSHA256storageProjectData')?.id;
    if (this.projectId == '0' ||  !this.projectId) {
      this.projectId = null
      this.statesList = this.userAssignedStates
       this.searchForm.get("frequency").reset()
       this.searchForm.get("fromDate").reset()
       this.resetLocation()
       
    }
    else {
      this.resetLocation()
      this.getSelectedProjectId()

    }
  }
 
  private initScheduleForm(): void {
    this.searchForm = this._formBuilder.group({
      projectType: [{value:this.projectId,disabled:true}, [Validators.required]],
      frequency: [''],
      fromDate: [
        { value: moment(this.currentDate), disabled: true },
        [Validators.required],
      ],
      villageCd: [null, [Validators.required]],
      stateCd: [null, [Validators.required]],
      districtCd: [null, [Validators.required]],
      tehsilCd: [null, [Validators.required]],
      isPreviousRecord:[false],
      startDate:[this.today, { updateOn: 'blur',
      validators: [
        Validators.required,
      ],}]
    });
  }

  private initAddAnimalForm(): void {
    this.animalForm = this._formBuilder.group({
      tagId: [
        '',
        [
          Validators.minLength(12),
          Validators.maxLength(12),
          onlyNumberValidation,
        ],
      ],
    });
  }
  private alertDialog(message: string): void {
    this.dialog
      .open(ConfirmationDeleteDialogComponent, {
        data: {
          id: '',
          title: this.translatePipe.transform('common.alert_string'),
          message: message,
          icon: 'assets/images/alert.svg',
          primaryBtnText: this.translatePipe.transform('common.cancel'),
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
        this.projectLocation = data?.projectLocationMap
         this.mapProjectLocation('stateCd')
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
           const getScheduleDates =  this.dataService._setScheduleAccordingFrequency(this.frequency)
           this.searchForm.get("fromDate").setValue(getScheduleDates?.startDate)
           this.isLoadingSpinner = false
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  mapProjectLocation(type:string){
  //  const projectLocation = location
   this.statesList = this.userAssignedStates
   if(this.projectLocation && this.projectLocation?.length > 0 && this.projectId && this.projectId != '0'){
    switch (type) {
      case 'stateCd':
        const projectState = this.projectLocation.map(function (val) {
          return val[type]})
         const state =  this.statesList.filter(function(obj) {
            return projectState.some(function(obj2) {
                return obj[type] == obj2;
            });
          });
          this.statesList = state
        break;
        case 'districtsCd':
          const projectDistrict = this.projectLocation.map(function (val) {
            return val[type]})
            const mergeDistrict = Array.prototype.concat.apply([], projectDistrict);
            const district =  this.districtList.filter(function(obj) {
              return mergeDistrict.some(function(obj2) {
                  return obj?.districtCd == obj2;
              });
            });
            this.districtList = district
          break
      default:
        this.statesList = this.userAssignedStates
        break;
    }
   }
  
  }
  resetLocation(){
    const location = ['stateCd','districtCd','tehsilCd','villageCd']
    location.forEach(val=>{
      this.formControls[val].reset()
    })
    this.districtList = []
    this.tehsilList = []
    this.villageList = []
  }
  pageChanged(event: PageEvent) {
    console.log({ event });
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.searchMRList();
  }
 
}
