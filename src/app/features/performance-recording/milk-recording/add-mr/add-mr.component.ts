import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { ModifyAnimalDetailsComponent } from 'src/app/features/animal-breeding/modify-animal-details/modify-animal-details.component';
import { RegisterOwner } from 'src/app/features/animal-management/owner-registration/models-owner-reg/register-owner.model';
import { MasterConfig } from 'src/app/shared/master.config';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import {
  AnimalRegistrationList,
  OwnerDetails,
} from 'src/app/shared/shareService/model/owner.detail';
import { SnackBarMessage } from 'src/app/shared/snack-bar';
import { TagIdSearchValidation } from 'src/app/shared/utility/validation';
import { PrService } from '../../pr.service';
import { StopRecordingDialougComponent } from '../stop-recording-dialoug/stop-recording-dialoug.component';
import { Subscription } from 'rxjs';
import {
  getDecryptedProjectData,
  getSessionData,
} from 'src/app/shared/shareService/storageData';
import { AnimalDetailService } from 'src/app/features/animal-management/animal-registration/animal-details/animal-detail.service';
import { ViewOrganizationComponent } from 'src/app/features/animal-management/animal-registration/view-organization/view-organization.component';
import { OwnerType } from 'src/app/shared/common-search-box/common-search-box.component';
const frequencyTable = [
  { value: 'Daily', key: 5 },
  { value: 'Current Week', key: 2 },
  { value: 'Weekly', key: 1 },
  { value: 'Fortnightly', key: 4 },
  { value: 'Monthly', key: 3 },
];
@Component({
  selector: 'app-add-mr',
  templateUrl: './add-mr.component.html',
  styleUrls: ['./add-mr.component.css'],
  providers: [TranslatePipe],
})
export class AddMRComponent implements OnInit, OnDestroy {
  ownerType = OwnerType.individual;
  masterConfig = MasterConfig;
  isTableVisible: boolean = false;
  ownerDetailsSection: boolean = false;
  animalDetailsSection: boolean = false;
  errorMessage: string = '';
  searchForm!: FormGroup;
  ownerDetailsRecord: any;
  ownerDetailsByID!: OwnerDetails;
  currentDate: string = '';
  ownerRegistrationFlag: boolean = false;
  isLoadingSpinner: boolean = false;
  ownerDetailsLength: number = 0;
  // private paginator!: MatPaginator;
  private sort!: MatSort;
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
  orgsList = [];
  displayedColumns: string[] = [
    'radio',
    '#',
    'tagId',
    'species',
    'animalCategory',
    'breed',
    'age',
    'pregnancyStatus',
    'milkingStatus',
    'locationNo',
    'elite',
    'action',
  ];
  tableDataSource = new MatTableDataSource<AnimalRegistrationList>();
  latestBreeding: any;
  animalData: any = [];
  noOfActiveAnimals: number = 0;
  animalDetail: any = [];
  userProjects = [];
  projectId: any;
  typedFrequency = frequencyTable;
  totalRows = 0;
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  constructor(
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private prService: PrService,
    private router: Router,
    private route: ActivatedRoute,
    private translatePipe: TranslatePipe,
    private dataService: DataServiceService,
    private animalDS: AnimalDetailService
  ) { }

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }
  @ViewChild(MatPaginator, { static: false })
  paginator!: MatPaginator;
  // @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
  //   this.paginator = mp;
  //   this.setDataSourceAttributes();
  // }

  ngOnInit(): void {
    const ownerDetail =
      this.route.snapshot.queryParamMap.get('ownerDetail') &&
        sessionStorage.getItem('ownerDetail')
        ? JSON.parse(sessionStorage.getItem('ownerDetail'))
        : null;
    this.animalDS.getOrgs().subscribe((data) => {
      this.orgsList = data;
    });
    this.initSearchForm();

    if (ownerDetail) this.setOwnerInformation(ownerDetail);
    // this.getOwnerDetailsByID(this.ownerDetailsRecord[0])
    this.userProjects = JSON.parse(sessionStorage.getItem('user')).userProject;
    this.detectStorageforProject();
    this.detectProject();
  }

  setDataSourceAttributes() {
    // this.tableDataSource.paginator = this.paginator;
    this.tableDataSource.sort = this.sort;
  }

  getOwnerDetailsByID(ownerDetail: any) {
    this.noOfActiveAnimals = 0;
    if (ownerDetail?.ownerTypeCd === OwnerType.individual) {
      this.ownerType = OwnerType.individual;
    } else if (ownerDetail?.ownerTypeCd === OwnerType.nonIndividual) {
      this.ownerType = OwnerType.nonIndividual;
    } else {
      this.ownerType = OwnerType.organization;
      this.searchForm?.get('searchValue')?.setValue(ownerDetail?.orgId);
    }
    this.ownerDetailsByID = ownerDetail;

    if (ownerDetail?.animalsList?.length) {
      // this.tableDataSource.data = this.ownerDetailsByID.animalsList;
      this.tableDataSource = new MatTableDataSource(
        this.ownerDetailsByID?.animalsList
      );
    } else {
      this.tableDataSource.data = [];
    }
    this.isTableVisible = false;
    this.ownerDetailsSection = true;
    this.animalDetailsSection = true;
    this.totalRows = ownerDetail?.animalsCount
  }

  get searchInfo() {
    return this.searchForm.controls;
  }

  searchResults(searchValue: string, isValidate = true, isPaginator?: boolean) {
    if (this.searchForm.invalid && isValidate) {
      this.searchForm.markAllAsTouched();
      if (!isNaN(Number(searchValue)) && searchValue.length > 0) {
        if (searchValue.length > 10) {
          this.errorMessage = 'errorMsg.check_field';
        } else {
          this.errorMessage = 'errorMsg.mobile_start';
        }
      } else if (searchValue.length == 0) {
        this.errorMessage = 'errorMsg.enter_value';
      } else {
        if (!isNaN(Number(searchValue.toString().slice(2)))) {
          this.errorMessage = 'errorMsg.invalid_onwerId';
        } else {
          this.errorMessage = 'errorMsg.owner_name_err';
        }
      }
      return;
    } else {
      // if (searchValue?.length === 15) {
      //   if (
      //     this.ownerType === OwnerType.individual &&
      //     !searchValue?.startsWith('1')
      //   ) {
      //     this.errorMessage = 'common.indvOwnerId';
      //     return;
      //   } else if (
      //     this.ownerType === OwnerType.nonIndividual &&
      //     !searchValue?.startsWith('3')
      //   ) {
      //     this.errorMessage = 'common.nonIndvOwnerId';
      //     return;
      //   }
      // }
      this.isLoadingSpinner = true;
      this.errorMessage = '';
      const reqObj: any = {}
      reqObj.searchValue = searchValue
      reqObj.ownerType = this.ownerType
      reqObj.pageNo = isPaginator ? this.currentPage : 0
      reqObj.itemPerPage = this.pageSize
      this.prService
        .getSearchDetails(reqObj)
        .subscribe(
          (data) => {
            this.isLoadingSpinner = false;
            this.router.navigateByUrl(
              '/dashboard/performance-recording/milk-recording/add-mr?ownerDetail=' +
              searchValue
            );
            this.setOwnerInformation({
              data,
              // ownerType: this.ownerType,
              isPaginator
            });
          },
          (error) => {
            this.isLoadingSpinner = false;
          }
        );
    }
  }

  animalSelected(event: Event, animal_detail: any) {
    this.animalData = null;
    this.selectedTagId = undefined;
    if (
      animal_detail &&
      animal_detail['milkingStatus'] == 'In Milk' &&
      animal_detail?.animalStatusCd === 1
    ) {
      this.selectedTagId = +(event.target as HTMLSelectElement).value;
      this.animalData = animal_detail;
    } else {
      if (animal_detail?.animalStatusCd !== 1) {
        new SnackBarMessage(this._snackBar).onSucessMessage(
          this.translatePipe.transform('errorMsg.animal_not_active'),
          this.translatePipe.transform('common.ok_string'),
          'center',
          'top',
          'red-snackbar'
        );
      } else if (animal_detail['milkingStatus'] !== 'In Milk') {
        new SnackBarMessage(this._snackBar).onSucessMessage(
          this.translatePipe.transform('errorMsg.animal_is_not_in_milk'),
          this.translatePipe.transform('common.ok_string'),
          'center',
          'top',
          'red-snackbar'
        );
      }
    }
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
      this.searchForm.get('searchValue')?.value?.length == 10 &&
      !isNaN(Number(this.searchForm.get('searchValue')?.value))
    ) {
      this.ownerInfoForm.patchValue({
        ownerMobileNo: this.searchForm.get('searchValue')?.value,
        ownerFirstName: '',
      });
    } else if (isNaN(Number(this.searchForm.get('searchValue')?.value))) {
      this.ownerInfoForm.patchValue({
        ownerFirstName: this.searchForm.get('searchValue')?.value,
        ownerMobileNo: '',
      });
    }
    this.isTableVisible = false;
    this.ownerDetailsSection = false;
    this.animalDetailsSection = false;
  }

  getToday(): string {
    return this.prService.currentDate.toDate().toISOString().split('T')[0];
  }

  resetValue() {
    this.router.navigateByUrl(
      '/dashboard/performance-recording/milk-recording/add-mr'
    );
    this.searchForm.reset({ frequency: 'Weekly' });
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
  addAnimalAdditionalDetails(isView?: boolean) {
    if (this.animalData) {
      const dialogRef = this.dialog.open(ModifyAnimalDetailsComponent, {
        data: {
          animalData: this.animalData,
        },
        width: '500px',
        height: '100vh',
        panelClass: 'custom-dialog-container',
        position: {
          right: '0px',
          top: '0px',
        },
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (res) this.addNewPage();
      });
    } else {
      const snackbarType = this.translatePipe.transform(
        'errorMsg.select_tag_first'
      );
      this.snackBarMessage(snackbarType);
    }
  }

  addNewPage() {
    if (
      typeof this.animalData.currentLactationNo === 'undefined' ||
      this.animalData.currentLactationNo === null ||
      !this.animalData?.pregnancyStatus ||
      !this.animalData?.breed ||
      !this.animalData?.milkingStatus
    ) {
      this.addAnimalAdditionalDetails();
      return;
    }
    this.router.navigate(
      ['./dashboard/performance-recording/milk-recording/add-mr-form'],
      {
        queryParams: {
          tagId: this.selectedTagId,
        },
      }
    );
    const storageData = { type: 'selectedAnimal', Id: this.animalData };
    sessionStorage.setItem('storageData', JSON.stringify(storageData));
  }
  gotoHistoryScreen(tagId: any): void {
    this.router.navigate(
      ['./dashboard/performance-recording/milk-recording/view-history'],
      { queryParams: { tagId: tagId } }
    );
  }
  stopRecording(): void {
    this.dialog
      .open(StopRecordingDialougComponent, {
        data: {
          animal_id: this.animalData.animalId,
        },
        width: '500px',
        panelClass: 'makeItMiddle',
      })
      .afterClosed()
      .subscribe(() => {
        const isSearchKeyAvailable = sessionStorage.getItem('searchKey')
          ? sessionStorage.getItem('searchKey')
          : '';
        if (isSearchKeyAvailable) this.searchResults(isSearchKeyAvailable);
      });
  }

  viewOrgDetailsDialog() {
    const dialog = this.dialog.open(ViewOrganizationComponent, {
      data: { orgData: this.ownerDetailsByID },
      width: '500px',
      height: '100vh',
      panelClass: 'custom-dialog-container',
      position: {
        right: '0px',
        top: '0px',
      },
    });
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

  private snackBarMessage(message: string): void {
    new SnackBarMessage(this._snackBar).onSucessMessage(
      message,
      this.translatePipe.transform('common.ok_string'),
      'center',
      'top',
      'red-snackbar'
    );
  }

  private setOwnerInformation(data: any, paginator?: boolean): void {
    this.ownerDetailsRecord = data;

    sessionStorage.setItem('ownerDetail', JSON.stringify(data));
    this.ownerDetailsLength = this.ownerDetailsRecord?.data?.length;
    this.selectedTagId = undefined;
    if (this.ownerDetailsRecord?.data?.length > 1) {
      this.isTableVisible = true;
      this.ownerDetailsSection = false;
      this.animalDetailsSection = false;
    } else if (this.ownerDetailsRecord?.data?.length == 1) {
      this.isTableVisible = false;
      const ownerDetails = this.ownerDetailsRecord?.data[0]
      if(ownerDetails && ownerDetails?.animalsList && 
         ownerDetails?.animalsList?.length > 0 ){
          this.isTableVisible = false;
          this.getOwnerDetailsByID(ownerDetails);
          this.changePaginatorIndex(paginator)
         }else{
          const searchValue = ownerDetails?.ownerId
          this.searchResults(searchValue, true, false);
         }
    } else {
      this.checkSearchValidity();
    }
  }
  private initSearchForm(): void {
    this.searchForm = this._formBuilder.group({
      searchValue: [null, [Validators.required, TagIdSearchValidation]],
      projectId: [{ value: this.projectId, disabled: true }],
      frequency: [''],
    });
  }
  getSelectedProjectId(): void {
    this.isLoadingSpinner = true;
    const currentSection = getSessionData('subModuleCd');
    let getPermission = [];
    this.isLoadingSpinner = true;
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

  backToOwnerList() {
    this.isTableVisible = true;
    this.ownerDetailsSection = false;
    this.animalDetailsSection = false;
  }

  get ownerTypeValue() {
    return OwnerType;
  }
  ngAfterViewInit() {
    this.tableDataSource.paginator = this.paginator;
  }
  pageChanged(event: PageEvent) {
    console.log({ event });
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.searchResults(this.searchForm.get("searchValue").value, true, true);
  }
  private changePaginatorIndex(isPaginator) {
    if (!isPaginator)
      setTimeout(() => {
        this.paginator.pageIndex = 0;
      }, 0);
  }
}
