import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { StatusDialogComponent } from 'src/app/features/animal-breeding/artificial-insemination/status-dialog/status-dialog.component';
import { CalvingStatusDialogComponent } from 'src/app/features/animal-breeding/calving/calving-status-dialog/calving-status-dialog.component';
import { VerifyAdditionalDetailsComponent } from 'src/app/features/animal-breeding/calving/verify-additional-details/verify-additional-details.component';
import { ModifyAnimalDetailsComponent } from 'src/app/features/animal-breeding/modify-animal-details/modify-animal-details.component';
import { AnimalDetailService } from 'src/app/features/animal-management/animal-registration/animal-details/animal-detail.service';
import { AnimalDetails } from 'src/app/features/animal-management/animal-registration/models-animal-reg/animal-details.model';
import { OrgList } from 'src/app/features/animal-management/animal-registration/models-animal-reg/org-list.model';
import { ViewOrganizationComponent } from 'src/app/features/animal-management/animal-registration/view-organization/view-organization.component';
import { RegisterOwner } from 'src/app/features/animal-management/owner-registration/models-owner-reg/register-owner.model';
import { GrowthMonitoringService } from 'src/app/features/performance-recording/growth-monitoring/growth-monitoring.service';
import { TypingService } from 'src/app/features/performance-recording/typing/typing.service';
import { ConfirmationDeleteDialogComponent } from '../confirmation-delete-dialog/confirmation-delete-dialog.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MasterConfig } from '../master.config';
import { DataServiceService } from '../shareService/data-service.service';
import {
  AdditionDetails,
  AdditionInfo,
  AnimalRegistrationList,
  OwnerData,
  OwnerDetails,
} from '../shareService/model/owner.detail';
import { OwnerServiceService } from '../shareService/owner-detail-service/owner-service.service';
import { SnackBarMessage } from '../snack-bar';
import { TagIdSearchValidation } from '../utility/validation';
import { animalBreedingPRConfig } from '../animal-breeding-pr.config';
import { TranslatePipe } from '@ngx-translate/core';
import {
  OwnerType,
  SearchValue,
} from '../common-search-box/common-search-box.component';

@Component({
  selector: 'app-common-search',
  templateUrl: './common-search.component.html',
  styleUrls: ['./common-search.component.css'],
  providers: [TranslatePipe],
})
export class CommonSearchComponent implements OnInit {
  orgID: number = null;
  masterConfig = MasterConfig;
  [x: string]: any;
  @Input() componentDetail: any = {};
  isTableVisible: boolean = false;
  ownerInfoForm!: FormGroup;
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
  private paginator!: MatPaginator;
  // private paginator2!: MatPaginator;
  private sort!: MatSort;
  selectedAnimalId: number;
  selectedTagId: number;
  ownerId: any;
  isElite: string;
  animalpregnancyStatus: string;
  ownerData!: RegisterOwner;
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
  ];
  gmColumns = [
    'radio',
    '#',
    'tagId',
    'species',
    'breed',
    'age',
    'sex',
    'action',
  ];
  ownerSearchResult: string[] = [
    'sNo',
    'ownerId',
    'ownerName',
    'ownerMobileNo',
    'ownerDateOfBirth',
    'ownerGender',
    'villageName',
    'arrow',
  ];
  tableDataSource = new MatTableDataSource<AnimalRegistrationList>();
  tableDataSourceOwner = new MatTableDataSource<OwnerData>();
  searchBy: string = 'individual';
  latestBreeding: Array<{}>;
  animalData: any = [];
  noOfActiveAnimals: number = 0;
  animalDetail: any = [];
  villageCd: number;
  orgValue?: number;
  userInformation: any;
  minAgeofAnimal: any;
  searchValue: SearchValue;
  ownerTypeCd = OwnerType.individual;
  totalRows = 0;
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  constructor(
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private translatePipe: TranslatePipe,
    private ownerService: OwnerServiceService,
    private router: Router,
    private route: ActivatedRoute,
    private typingService: TypingService,
    private gmService: GrowthMonitoringService,
    private animalDS: AnimalDetailService,
    private dataService: DataServiceService
  ) {}
  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }
  // @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
  //   this.paginator = mp;
  //   this.setDataSourceAttributes();
  // }

  @ViewChild('paginatorRef') set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  @ViewChild(MatPaginator,{static:false})
  paginator2!: MatPaginator;

  // @ViewChild('animalPaginator') set matPaginator2(mp: MatPaginator) {
  //   this.paginator2 = mp;
  //   this.setDataSourceAttributes();
  // }

  ngOnInit(): void {
    this.getOrg();
    this.initSearchForm();
    this.addActionColumn();
    this.searchIfOwnerRegistered();
    this.searchIfAnimalRegistered();
    this.checkIfViewedandEdited();
    this.loggedUserInfo();
    if (this.componentDetail['compDetail'] === 'Calving')
      this.getMinAge(animalBreedingPRConfig.minAgeForCalvings);
    else this.getMinAge(animalBreedingPRConfig.MinAgeInmonths);
  }

  setDataSourceAttributes() {
    // this.tableDataSource.paginator = this.paginator2;
    this.tableDataSource.sort = this.sort;
    this.tableDataSourceOwner.paginator = this.paginator;
    this.tableDataSourceOwner.sort = this.sort;
  }

  getOwnerDetailsByID(ownerDetail: any) { 
    this.noOfActiveAnimals = 0;
    this.ownerDetailsByID = ownerDetail;
    this.ownerId = this.ownerDetailsByID?.ownerId;
    this.totalRows = ownerDetail?.animalsCount
    this.tableDataSource = new MatTableDataSource(
      this.ownerDetailsByID?.animalsList
    );
    this.isTableVisible = false;
    this.ownerDetailsSection = true;
    this.animalDetailsSection = true;
    this.villageCd = this.ownerDetailsByID?.ownerAddressCityVillageCd;
    if (this.ownerId) {
      this.ownerTypeCd = this.ownerDetailsByID?.ownerTypeCd;
      this.ownerDetailsSection = true;
      this.animalDetailsSection = true;
    } else {
      this.ownerTypeCd = OwnerType.organization;
      this.orgID = ownerDetail?.orgId;
      this.isOrgTabVisible = true;
      // this.searchForm.patchValue({ optRadio: 'organization' });
      // this.searchBy = 'organization';
      this.animalDetailsSection = true;
    }
  }

  get searchInfo() {
    return this.searchForm.controls;
  }

  searchResults(searchObj: SearchValue,isPaginator?:boolean) {
    this.searchValue = searchObj;
    this.isLoadingSpinner = true;
    this.errorMessage = '';
    this.isTableVisible = false;
    this.ownerDetailsSection = false;
    this.animalDetailsSection = false;
    this.animalData = [];
    this.isLoadingSpinner = true;
    this.errorMessage = '';
    // this.putQueryParam(this.searchValue?.searchValue);
    const moduleType =
      this.componentDetail['compDetail'] == 'ET'
        ? this.componentDetail['compDetail']
        : '';
      this.searchValue.pageNo = isPaginator ? this.currentPage : 0
      this.searchValue.itemPerPage = this.pageSize
    if (this.componentDetail['compDetail'] === 'GM') {
      this.gmService.getGMSearchDetails(this.searchValue).subscribe(
        (data) => {
          this.isLoadingSpinner = false;
          if (data && Object.keys(data[0]).length > 0)
            this.setOwnerInformation(data,isPaginator);
          else this.checkSearchValidity();
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    } else {
      
      this.ownerService
        .searchOwnerDetails(this.searchValue, this.componentDetail, moduleType)
        .subscribe(
          (data) => {
            this.isLoadingSpinner = false;
            if (data && Object.keys(data[0]).length > 0)
              this.setOwnerInformation(data,isPaginator);
            else this.checkSearchValidity();
          },
          (error) => {
            this.isLoadingSpinner = false;
          }
        );
    }
  }

  animalSelected(event: Event, element: any) {
    if (element.animalStatusCd != 1) {
      (event.target as HTMLInputElement).checked = false;
      this.confirmtionDialoug('errorMsg.animal_not_active', 'Ok');
    } else if (
      this.componentDetail['compDetail'] == 'ET' &&
      element.eligibleForEt == 'N'
    ) {
      (event.target as HTMLInputElement).checked = false;
      this.confirmtionDialoug('errorMsg.not_eligible_for_et', 'Ok');
      this.selectedTagId = null;
      this.isElite = null;
      this.animalData = [];
    } else if (
      this.componentDetail['compDetail'] == 'Heat Transaction' &&
      element.pregnancyStatus == 'Y'
    ) {
      this.confirmtionDialoug('errorMsg.animal_is_pregnant', 'ok');
    } else {
      this.selectedAnimalId = +(event.target as HTMLSelectElement).value;
      this.selectedTagId = element.tagId;
      this.isElite = element.isElite;
      this.animalData = element;
    }
  }

  checkSearchValidity() {
    this.confirmtionDialoug('errorMsg.register_owner', 'Ok');
    if (
      this.searchValue?.searchValue?.length == 10 &&
      !isNaN(Number(this.searchValue?.searchValue))
    ) {
      this.ownerInfoForm.patchValue({
        ownerMobileNo: this.searchValue?.searchValue,
        ownerFirstName: '',
      });
    } else if (isNaN(Number(this.searchValue?.searchValue))) {
      this.ownerInfoForm.patchValue({
        ownerFirstName: this.searchValue?.searchValue,
        ownerMobileNo: '',
      });
    }
    this.isTableVisible = false;
    this.ownerDetailsSection = false;
    this.animalDetailsSection = false;
    this.isOrgTabVisible = false;
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  resetValue() {
    // this.searchForm.reset();
    this.ownerTypeCd = OwnerType.individual;
    this.ownerRegistrationFlag = false;
    this.ownerDetailsSection = false;
    this.animalDetailsSection = false;
    this.isTableVisible = false;
    this.orgID = null;
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

  addNewPage(is_scope?: boolean) {
    if (this.componentDetail['compDetail'] == 'GM') {
      const selectedAnimal: AnimalDetails = this.tableDataSource.data.find(
        (a) => a.animalId === this.selectedAnimalId
      ) as any;

      if (
        (selectedAnimal.sex === 'F' &&
          (!is_scope || is_scope == undefined || is_scope == null) &&
          (typeof selectedAnimal.milkingStatus === 'undefined' ||
            selectedAnimal.milkingStatus === null)) ||
        typeof selectedAnimal.breedAndExoticLevels === 'undefined' ||
        selectedAnimal.breedAndExoticLevels === null ||
        selectedAnimal.breedAndExoticLevels?.length === 0
      ) {
        this.addAnimalAdditionalDetails(true);
        return;
      }

      if (
        (selectedAnimal.sex === 'M' && selectedAnimal.ageInMonths > 36) ||
        (selectedAnimal.sex === 'F' &&
          // !isNaN(+selectedAnimal.numberCalvings) &&
          selectedAnimal.milkingStatus !== 'NA')
      ) {
        this.confirmtionDialoug('errorMsg.not_eleible_gm', 'Ok');
        // this.snackBarMessage(`Animal is not eligible for Growth Monitoring`);
      } else {
        this.navigateAddPage(null, this.componentDetail['newPageUrl']);
      }
    } else if (this.componentDetail['compDetail'] == 'Typing') {
      this.navigateAddPage(null, this.componentDetail['newPageUrl']);
    } else if (
      this.animalData?.ageInMonths < this.minAgeofAnimal ||
      this.animalData?.ageInDays ||
      !this.animalData?.ageInMonths
    ) {
      const mesg =
        this.translatePipe.transform('errorMsg.animal_age_less') +
        this.minAgeofAnimal +
        ' ' +
        this.translatePipe.transform('animalBreeding.months_age');

      this.confirmtionDialoug(mesg, 'Ok');
    } else {
      if (this.componentDetail['isBreed']) {
        if (
          this.userInformation?.aiCenterName.length === 0 &&
          this.componentDetail['compDetail'] == 'AI'
        )
          this.confirmtionDialoug(`errorMsg.no_ai_center`, 'Ok');
        else this.CheckBreedingHistory(is_scope);
      } else this.navigateAddPage(null, this.componentDetail['newPageUrl']);
    }
  }

  checkAllBoxes(event: Event) {
    this.animalDetail.length = 0;
    this.animalData.length = 0;
    if ((event.target as HTMLInputElement)?.checked) {
      for (var i = 0; i < this.tableDataSource.filteredData.length; i++) {
        this.animalData.push(this.tableDataSource.filteredData[i]);
      }
    }
  }

  onCheckboxChange(event: Event, clickedAnimalData: object) {
    if ((event.target as HTMLInputElement).checked) {
      if (
        clickedAnimalData['ageInMonths'] < this.minAgeofAnimal ||
        typeof clickedAnimalData['ageInMonths'] === 'undefined' ||
        clickedAnimalData['ageInMonths'] === null
      ) {
        (event.target as HTMLInputElement).checked = false;

        const mesg =
          this.translatePipe.transform('errorMsg.animal_age_less') +
          this.minAgeofAnimal +
          ' ' +
          this.translatePipe.transform('animalBreeding.months_age');

        this.confirmtionDialoug(mesg, 'Ok');
      } else if (
        this.componentDetail['compDetail'] == 'Sync' &&
        clickedAnimalData['pregnancyStatus'] == 'Y'
      ) {
        (event.target as HTMLInputElement).checked = false;

        this.confirmtionDialoug('errorMsg.animal_is_pregnant', 'ok');
      } else {
        this.animalData?.push(clickedAnimalData);
      }
    } else {
      this.animalData?.forEach((value, index) => {
        if (value == clickedAnimalData) {
          this.animalData.splice(index, 1);
        }
      });
    }
  }

  checkIfInSelectedList(data: any) {
    if (this.animalData?.length > 0) {
      return this.animalData?.includes(data);
    } else {
      return false;
    }
  }

  addNewPageWithCheckbox(): void {
    this.animalData = this.animalData.filter(
      (elm) =>
        elm?.pregnancyStatus &&
        elm?.breed &&
        elm?.currentLactationNo >= 0 &&
        elm.milkingStatus
    );

    sessionStorage.setItem('animalData', JSON.stringify(this.animalData));

    this.navigateAddPage(null, this.componentDetail['newPageUrl']);
  }

  addAnimalAdditionalDetails(isView?: boolean) {
    let animalData: any;

    if (Array.isArray(this.animalData)) {
      animalData =
        this.animalData && this.animalData?.length > 0
          ? this.animalData[0]
          : '';
    } else {
      animalData = this.animalData;
    }

    if (animalData) {
      const dialogRef = this.dialog.open(ModifyAnimalDetailsComponent, {
        data: {
          animalData: animalData,
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
        if (res && isView) {
          const checkMilkingStatus = res?.milkingStatus
          if (checkMilkingStatus == 2 && this.componentDetail['compDetail'] == 'Calving'){
            this.changeMilkingStatus();
          }else this.addNewPage(true)  
        };
        const isTagIdAvailable = this.route.snapshot.queryParams['ownerId'];
        if (isTagIdAvailable && !isView && res) {
          // this.searchForm.get('searchValue').setValue(isTagIdAvailable);
          this.searchResults(isTagIdAvailable);
        }
      });
    } else {
      this.confirmtionDialoug(`errorMsg.select_tag_first`, 'Ok');
    }
  }

  searchInOwners(event: Event) {
    const filterOwnerValue = (event.target as HTMLInputElement).value;
    this.tableDataSourceOwner.filter = filterOwnerValue.trim().toLowerCase();
    if (this.tableDataSourceOwner.paginator) {
      this.tableDataSourceOwner.paginator.firstPage();
    }
  }

  backToOwnerListing(): void {
    this.isTableVisible = true;
    this.animalDetailsSection = false;
    this.ownerDetailsSection = false;
  }

  private navigateAddPage(param: any, routeparam: string): void {
    const queryParams: any = {
      tagId: this.selectedTagId,
      isAILinked: param?.isCalving,
    };

    if (this.componentDetail.compDetail === 'GM') {
      queryParams.animalId = this.selectedAnimalId;
      delete queryParams.tagId;
      this.router.navigate([routeparam], {
        queryParams,
      });
    } else if (this.componentDetail.compDetail === 'Typing') {
      if (typeof this.animalData.currentLactationNo === 'undefined') {
        this.addAnimalAdditionalDetails();
        return;
      }
      this.isLoadingSpinner = true;
      this.typingService
        .getAssociatedCalvingBeforeTyping(this.selectedTagId)
        .subscribe(
          (res) => {
            this.isLoadingSpinner = false;
            if (res?.msg) {
              this.dialog
                .open(ConfirmationDialogComponent, {
                  data: {
                    primaryBtnText: 'Yes',
                    secondaryBtnText: 'No',
                    title: 'Alert',
                    message: res.msg,
                    icon: 'assets/images/alert.svg',
                  },
                  panelClass: 'common-info-dialog',
                })
                .afterClosed()
                .subscribe((res) => {
                  if (res) {
                    this.router.navigate([routeparam], {
                      queryParams,
                    });
                  }
                });
            } else {
              this.router.navigate([routeparam], {
                queryParams,
              });
            }
          },
          () => (this.isLoadingSpinner = false)
        );
    } else {
      if (this.componentDetail.compDetail === 'AI') {
        this.dataService.getCurrentServeDate().subscribe(
          (data: any) => {
            sessionStorage.setItem('serverCurrentDateTime', data.message);
          },
          (error) => {
            console.log(error);
          }
        );
      }
      queryParams.approvalReasonCd =
        this.componentDetail.compDetail === 'AI' ||
        this.componentDetail.compDetail === 'ET'
          ? param?.data?.aiPregnancyReason
          : null;
      this.router.navigate([routeparam], {
        queryParams,
      });
    }
  }

  getOwnerUpdated(isUdate?: any): void {
    if (isUdate) this.initSearchForm();
  }

  onSelectingSearchBy(event: Event) {
    this.searchBy = (event.target as HTMLInputElement)?.value;
    this.animalDetailsSection = false;
    this.ownerDetailsSection = false;
    this.isOrgTabVisible = false;
    this.animalData = [];
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

  setSearchParams(owner: any) {
    if (owner?.ownerId) {
      this.getOwnerDetailsByID(owner?.ownerId);
    } else {
      this.getOwnerDetailsByID(String(owner?.orgId));
      this.orgValue = +owner?.orgId;
    }
  }

  searchIfOwnerRegistered() {
    if (this.animalDS?.getAnimalRegFlag()) {
      var owner = this.animalDS?.getOwnerData();
      this.setSearchParams(owner);
      this.animalDS?.setAnimalRegFlag(false);
    }
  }

  searchIfAnimalRegistered() {
    var parent = this.animalDS?.getParentComponent();
    if (parent == 'animalReg') {
      var ownerData = JSON.parse(sessionStorage.getItem('ownerData') || '');
      this.setSearchParams(ownerData);
      this.animalDS?.setParentComponent('');
    }
  }

  checkIfViewedandEdited() {
    if (this.animalDS?.getIfAlreadySearched()) {
      var ownerData = JSON.parse(sessionStorage.getItem('ownerData') || '');
      this.setSearchParams(ownerData);
      this.animalDS?.setIfAlreadySearched(false);
    }
  }

  getOrgDetails() {
    if (this.orgValue != 0 && String(this.orgValue).startsWith('2')) {
      this.isLoadingSpinner = true;
      const moduleType =
        this.componentDetail['compDetail'] == 'ET'
          ? this.componentDetail['compDetail']
          : '';

      this.ownerService
        .searchOwnerDetails(
          String(this.orgValue),
          this.componentDetail,
          moduleType
        )
        .subscribe(
          (data) => {
            this.isLoadingSpinner = false;
            if (data && Object.keys(data[0]).length > 0)
              this.setOwnerInformation(data);
            else this.checkSearchValidity();
          },
          (error) => {
            this.isLoadingSpinner = false;
          }
        );
    } else if (this.orgValue == undefined) {
      this.confirmtionDialoug(`errorMsg.select_org`, 'Ok');
    } else {
      this.isOrgTabVisible = false;
      this.animalDetailsSection = false;
      this.confirmtionDialoug(`errorMsg.not_valid_org`, 'Ok');
    }
  }

  private initSearchForm(): void {
    const isTagIdAvailable = this.route.snapshot.queryParams['ownerId'];

    if (this.componentDetail['compDetail'] == 'ET') {
      const secondToLast = this.displayedColumns.length - 1;
      this.displayedColumns.splice(secondToLast, 0, 'eligibleForEt');
    }

    this.animalData.length = 0;
  }

  private setOwnerInformation(data: any,paginator?:boolean): void {
    this.tableDataSourceOwner = new MatTableDataSource(data);
    this.ownerDetailsRecord = data;
    this.ownerDetailsLength = this.ownerDetailsRecord?.length;
    this.selectedAnimalId = undefined;

    if (this.ownerDetailsRecord.length > 1) {
      this.isTableVisible = true;
      this.ownerDetailsSection = false;
      this.animalDetailsSection = false;
    } else if (this.ownerDetailsRecord.length == 1) {
      const ownerDetails = this.ownerDetailsRecord[0]
      if(ownerDetails && ownerDetails?.animalsList && 
         ownerDetails?.animalsList?.length > 0 ){
          this.isTableVisible = false;
          this.getOwnerDetailsByID(this.ownerDetailsRecord[0]);
          this.changePaginatorIndex(paginator)  
         }else{
          this.searchValue.searchValue = ownerDetails?.ownerId
          this.searchResults(this.searchValue,false);
         }
      
    } else {
      this.checkSearchValidity();
    }
  }

  private CheckBreedingHistory(is_scope?: boolean): void {
    this.isLoadingSpinner = true;
    const lactNo = this.animalData?.currentLactationNo >= 0 ? false : true;
    this.ownerService.getAnimalHistory(this.selectedTagId).subscribe(
      (data: any) => {
        const animalHistoryDetail = data;
        const breedingDetail = animalHistoryDetail?.breedingHistoryList;
        const latestBreeding =
          breedingDetail?.length > 0 ? breedingDetail[0] : null;
        this.isLoadingSpinner = false;
        const lastBreedingDate =
          latestBreeding && latestBreeding?.lastBreedingDate
            ? moment(new Date(latestBreeding?.lastBreedingDate))
            : null;
        const totalMonthForBreed = moment().diff(lastBreedingDate, 'months');
        if (
          (!is_scope || is_scope == undefined || is_scope == null) &&
          ((lactNo && this.animalData?.milkingStatus !== 'NA') ||
            !this.animalData?.pregnancyStatus ||
            !this.animalData?.breed ||
            !this.animalData?.milkingStatus)
        ) {
          this.addAnimalAdditionalDetails(true);
        } else {
          if (
            totalMonthForBreed &&
            totalMonthForBreed >= 24 &&
            this.milkingStatus !== 'NA'
          ) {
            const dialogInfo = {
              title: 'errorMsg.last_two_year_breeding_activity',
              animal_id: this.selectedAnimalId,
              isBreedingActivity: true,
              tagId: this.selectedTagId,
              lactationNo: this.animalData?.currentLactationNo,
              animalAge: this.animalData?.ageInMonths,
              moduleType: this.componentDetail['compDetail'],
            };
            this.pregnancyStatusDialog(dialogInfo);
          } else if (
            this.animalData?.pregnancyStatus == 'Y' &&
            (this.componentDetail['compDetail'] == 'AI' ||
              this.componentDetail['compDetail'] == 'ET')
          ) {
            const dialogInfo = {
              title: 'errorMsg.animal_marked_preg',
              animal_id: this.selectedAnimalId,
              isBreedingActivity: false,
              tagId: this.selectedTagId,
              lactationNo: this.animalData?.currentLactationNo,
              animalAge: this.animalData?.ageInMonths,
              moduleType: this.componentDetail['compDetail'],
            };

            this.pregnancyStatusDialog(dialogInfo);
          } else if (
            this.componentDetail['compDetail'] == 'Calving' &&
            this.animalData?.pregnancyStatus != 'Y'
          )
            this.confirmtionDialoug(
              `animalBreeding.commonLabel.animal_not_preg`,
              'Ok'
            );
          else if (
            this.componentDetail['compDetail'] == 'Calving' &&
            this.animalData?.milkingStatus == 'In Milk'
          )
            this.changeMilkingStatus();
          else this.navigateAddPage(null, this.componentDetail['newPageUrl']);
        }
      },

      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  private putQueryParam(id: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ownerId: id },
      queryParamsHandling: 'merge', // remove to replace all query params by provided
    });
  }

  private changeMilkingStatus() {
    this.dialog
      .open(CalvingStatusDialogComponent, {
        data: {
          title: 'animalBreeding.commonLabel.animal_in_milk_status',
          animal_id: this.selectedAnimalId,
        },
        width: '620px',
        panelClass: 'makeItMiddle',
      })
      .afterClosed()
      .subscribe((data) => {
        if (data && data?.data == 3)
          this.navigateAddPage(null, this.componentDetail['newPageUrl']);
        else if (data) this.initSearchForm();
      });
  }

  private pregnancyStatusDialog(data: AdditionInfo): void {
    this.dialog
      .open(StatusDialogComponent, {
        data: data,
        width: '500px',
        panelClass: 'makeItMiddle',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          const route = res?.isCalving
            ? this.componentDetail['calvingPageUrl']
            : this.componentDetail['newPageUrl'];
          this.navigateAddPage(res, route);
        }
      });
  }

  private addActionColumn() {
    if (this.componentDetail['isAction'] != false) {
      const lastColumn = this.displayedColumns.length;
      this.displayedColumns.splice(lastColumn, 0, 'action');
    }
  }

  private getOrg() {
    this.animalDS.getOrgs().subscribe((data: OrgList[]) => {
      this.orgsList = data;
    });
  }

  private confirmtionDialoug(message: string, button: string): void {
    this.dialog
      .open(ConfirmationDeleteDialogComponent, {
        data: {
          id: '',
          title: 'common.alert',
          message: message,
          icon: 'assets/images/alert.svg',
          primaryBtnText: 'common.ok',
        },
        panelClass: 'common-alert-dialog',
      })
      .afterClosed();
  }

  private loggedUserInfo(): void {
    this.dataService._getUserDetailsByUserId().subscribe((data) => {
      this.userInformation = data;
    });
  }

  private getMinAge(age_type: string): void {
    this.dataService.getDefaultConfig(age_type).subscribe((data: any) => {
      this.minAgeofAnimal = parseInt(data?.defaultValue);
    });
  }

  get ownerType() {
    return OwnerType;
  }
  ngAfterViewInit() {
    this.tableDataSource.paginator = this.paginator2;
  }
  pageChanged(event: PageEvent) {
    console.log({ event });
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
      this.searchResults(this.searchValue,true);
  }
  private changePaginatorIndex(isPaginator){
    if(!isPaginator)
          setTimeout(() => {
            this.paginator2.pageIndex = 0;
           }, 0);
  }
}
