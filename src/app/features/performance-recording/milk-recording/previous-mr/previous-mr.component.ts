import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { RegisterOwner } from 'src/app/features/animal-management/owner-registration/models-owner-reg/register-owner.model';
import { MasterConfig } from 'src/app/shared/master.config';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { OwnerDetails } from 'src/app/shared/shareService/model/owner.detail';
import {
  getDecryptedProjectData,
  getSessionData,
} from 'src/app/shared/shareService/storageData';
import { SnackBarMessage } from 'src/app/shared/snack-bar';
import { TagIdSearchValidation } from 'src/app/shared/utility/validation';
import { animalBreedingValidations } from 'src/app/shared/validatator';
import { PrService } from '../../pr.service';

export interface TableData {
  afternoonYield: string;
  daysInMilk: string;
  eveningYield: string;
  morningYield: string;
  mrDate: string;
  recordNo: number;
  totalYield: string;
}
const frequencyTable = [
  { value: 'Daily', key: 5 },
  { value: 'Current Week', key: 2 },
  { value: 'Weekly', key: 1 },
  { value: 'Fortnightly', key: 4 },
  { value: 'Monthly', key: 3 },
];
@Component({
  selector: 'app-previous-mr',
  templateUrl: './previous-mr.component.html',
  styleUrls: ['./previous-mr.component.css'],
  providers: [TranslatePipe],
})
export class PreviousMRComponent implements OnInit, OnDestroy {
  masterConfig = MasterConfig;
  cmnValidation = animalBreedingValidations.common;
  isTableVisible: boolean = false;
  ownerDetailsSection: boolean = false;
  animalDetailsSection: boolean = false;
  errorMessage: string = '';
  searchForm!: FormGroup;
  ownerDetailsRecord: any;
  ownerDetailsByID!: OwnerDetails;
  clickedOwnerName: string = '';
  clickedOwnerMobNo: number = 0;
  clickedOwnerFather: string = '';
  currentDate: string = '';
  ownerRegistrationFlag: boolean = false;
  isLoadingSpinner: boolean = false;
  ownerDetailsLength: number = 0;
  private paginator!: MatPaginator;
  private sort!: MatSort;
  selectedAnimalId: number;
  selectedTagId: number;
  ownerId: any;
  isElite: any;
  ageInMonths: any;
  animalSex: any;
  animalpregnancyStatus: any;
  species: any;
  currentLactationNo: any;
  milkingStatus: any;
  ownerData!: RegisterOwner;
  ownerInfoForm!: FormGroup;
  displayedColumns: string[] = [
    '#',
    'tagId',
    'species',
    'animalCategory',
    'mrDate',
    'ownerName',
    'village',
    'yield',
    'totalYield',
    'action',
  ];
  tableDataSource = new MatTableDataSource<TableData>();
  latestBreeding: any;
  animalData: any = [];
  noOfActiveAnimals: number = 0;
  animalDetail: any = [];
  previousMRList: Array<[]>;
  breedingMinDate: number = 30;
  projectId: any;
  userProjects = [];
  typedFrequency = frequencyTable;
  constructor(
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private prService: PrService,
    private router: Router,
    private translatePipe: TranslatePipe,
    private dataService: DataServiceService
  ) {}

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  ngOnInit(): void {
    const ownerDetail = sessionStorage.getItem('ownerDetail')
      ? JSON.parse(sessionStorage.getItem('ownerDetail'))
      : null;
    this.searchForm = this._formBuilder.group({
      tagId: ['', [Validators.required, TagIdSearchValidation]],
      fromDate: [
        this.previousDay,
        { validators: [Validators.required], updateOn: 'blur' },
      ],
      toDate: [
        this.today,
        { validators: [Validators.required], updateOn: 'blur' },
      ],
      projectId: [{ value: this.projectId, disabled: true }],
      frequency: [''],
    });
    this.searchForm.get('fromDate').valueChanges.subscribe((value) => {
      this.searchForm.get('toDate').reset();
    });

    this.userProjects = JSON.parse(sessionStorage.getItem('user')).userProject;

    this.detectStorageforProject();
    this.detectProject();
  }

  setDataSourceAttributes() {
    this.tableDataSource.paginator = this.paginator;
    this.tableDataSource.sort = this.sort;
  }

  get searchInfo() {
    return this.searchForm.controls;
  }

  searchResults() {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    } else {
      this.isLoadingSpinner = true;
      this.errorMessage = '';
      const formValue = {
        ...this.searchForm.value,
      };
      formValue.toDate = moment(formValue?.toDate).format('YYYY-MM-DD');
      formValue.fromDate = moment(formValue?.fromDate).format('YYYY-MM-DD');
      delete formValue.projectType;
      delete formValue.frequency;
      this.prService.getPreviousMRHistory(formValue).subscribe(
        (data) => {
          this.isLoadingSpinner = false;
          this.previousMRList = data;

          // this.setOwnerInformation(data)
          this.tableDataSource.data =
            this.previousMRList['mrHistoryList'] ?? [];

          this.animalDetailsSection = true;
        },
        () => (this.isLoadingSpinner = false)
      );
    }
  }

  animalSelected(event: Event, element: any) {
    this.selectedAnimalId = +(event.target as HTMLSelectElement).value;
    this.selectedTagId = element.tagId;
    this.animalData = element;
  }

  checkSearchValidity() {
    new SnackBarMessage(this._snackBar).onSucessMessage(
      this.translatePipe.transform('errorMsg.no_owner_found'),
      this.translatePipe.transform('common.ok_string'),
      'right',
      'top',
      'red-snackbar'
    );
    if (
      this.searchForm.get('tagId')?.value.length == 10 &&
      !isNaN(Number(this.searchForm.get('tagId')?.value))
    ) {
      this.ownerInfoForm.patchValue({
        ownerMobileNo: this.searchForm.get('tagId')?.value,
        ownerFirstName: '',
      });
    } else if (isNaN(Number(this.searchForm.get('tagId')?.value))) {
      this.ownerInfoForm.patchValue({
        ownerFirstName: this.searchForm.get('tagId')?.value,
        ownerMobileNo: '',
      });
    }
    this.isTableVisible = false;
    this.ownerDetailsSection = false;
    this.animalDetailsSection = false;
  }

  // Form Functions

  getToday(): string {
    return this.prService.currentDate.toDate().toISOString().split('T')[0];
  }

  resetValue() {
    this.searchForm.reset();
    this.ownerRegistrationFlag = false;
    this.ownerDetailsSection = false;
    this.animalDetailsSection = false;
  }

  searchInTable(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
    if (this.tableDataSource.paginator) {
      this.tableDataSource.paginator.firstPage();
    }
  }

  formatDate(date) {
    if (date) {
      return moment(new Date(date)).format('DD/MM/YYYY');
    }
    return null;
  }

  editMRRecord(record: object, tagId: number) {
    if (
      !this.previousMRList['animalResponse'] ||
      this.previousMRList['animalResponse']['milkingStatus'] !== 'In Milk' ||
      this.previousMRList['animalResponse'].animalStatusCd !== 1
    ) {
      if (this.previousMRList['animalResponse'].animalStatusCd !== 1) {
        new SnackBarMessage(this._snackBar).onSucessMessage(
          this.translatePipe.transform('errorMsg.animal_not_active'),
          this.translatePipe.transform('common.ok_string'),
          'center',
          'top',
          'red-snackbar'
        );
      } else if (
        this.previousMRList['animalResponse']['milkingStatus'] !== 'In Milk'
      ) {
        new SnackBarMessage(this._snackBar).onSucessMessage(
          this.translatePipe.transform('errorMsg.animal_is_not_in_milk'),
          this.translatePipe.transform('common.ok_string'),
          'center',
          'top',
          'red-snackbar'
        );
      }
      return;
    }

    this.router.navigate(
      ['./dashboard/performance-recording/milk-recording/add-previous-mr'],
      {
        queryParams: {
          tagId: tagId,
        },
      }
    );
    const storageData = { type: 'selectedAnimal', data: record };
    sessionStorage.setItem('storageData', JSON.stringify(storageData));
  }
  get minDate() {
    return moment(this.prService.currentDate)
      .subtract(this.breedingMinDate, 'days')
      .format('YYYY-MM-DD');
  }

  get today() {
    return moment(this.prService.currentDate).format('YYYY-MM-DD');
  }
  get previousDay() {
    return moment(this.prService.currentDate)
      .subtract(1, 'day')
      .format('YYYY-MM-DD');
  }
  detectProject(): void {
    this.dataService.fetchProjectInfo.subscribe((projectID) => {
      if (projectID != '0' && projectID) {
        this.projectId = projectID;
        this.searchForm.get('projectId').patchValue(projectID);
        this.getSelectedProjectId();
      } else {
        this.projectId = null;
        this.searchForm.get('projectId').reset();
        this.searchForm.get('frequency').reset();
      }
    });
  }

  detectStorageforProject(): void {
    this.projectId = getDecryptedProjectData('AESSHA256storageProjectData')?.id;

    if (this.projectId == '0' || !this.projectId) {
      this.projectId = null;
      this.searchForm.get('frequency').reset();
    } else this.getSelectedProjectId();
  }
  getSelectedProjectId(): void {
    this.isLoadingSpinner = true;
    const currentSection = getSessionData('subModuleCd');
    let getPermission = [];
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
        const isfrequency =
          frequencyDetails && frequencyDetails?.length > 0
            ? frequencyDetails[0]?.parameterValue
            : 'Monthly';
        const freq = this.typedFrequency.filter(
          (value) => value?.value == isfrequency
        );
        this.searchForm.get('frequency').setValue(freq[0]?.value);
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  ngOnDestroy(): void {
    // this.projectSub.unsubscribe();
  }
}
