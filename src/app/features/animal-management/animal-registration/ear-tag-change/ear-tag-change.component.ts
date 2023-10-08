import { TranslatePipe } from '@ngx-translate/core';
import { TagIdSearchValidation } from './../../../../shared/utility/validation';
import { AnimalRegistrationList } from './../../owner-registration/models-owner-reg/get-ownerby-ownerID.model';
import { AnimalResult } from './../models-animal-reg/tagId-search.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AnimalDetailService } from './../animal-details/animal-detail.service';
import { EarTagChangeService } from '../../animal-registration/ear-tag-change/ear-tag-change.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { OwnerTransferService } from '../../owner-registration/owner-transfer/owner-transfer.service';
import { OwnerDetailsService } from '../../owner-registration/owner-details.service';
import { OwnerTransferDetailsEditComponent } from '../../owner-registration/owner-transfer-details-edit/owner-transfer-details-edit.component';
import { EditOwnerDetailsComponent } from '../../owner-registration/edit-owner-details/edit-owner-details.component';
import { AnimalTable } from '../models-animal-reg/animal-table.model';
import { SnackBarMessage } from '../../../../shared/snack-bar';
import { EarTagDialogComponent } from '../ear-tag-dialog/ear-tag-dialog.component';
import { AnimalManagementService } from '../animal-management.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { OrgList } from '../models-animal-reg/org-list.model';
import { OwnerData } from '../../owner-registration/models-owner-reg/get-owner-details.model';
import { CompleteOwnerDetails } from '../../owner-registration/models-owner-reg/get-ownerby-ownerID.model';
import { OtpDialogComponent } from 'src/app/shared/otp-dialog/otp-dialog.component';
import { ViewOrganizationComponent } from '../view-organization/view-organization.component';
import { AppService } from 'src/app/shared/shareService/app.service';
import { MasterConfig } from 'src/app/shared/master.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-ear-tag-change',
  templateUrl: './ear-tag-change.component.html',
  styleUrls: ['./ear-tag-change.component.css'],
  providers: [TranslatePipe],
})
export class EarTagChangeComponent implements OnInit {
  masterConfig = MasterConfig;
  animalDetail: string[] = [];
  noOfActiveAnimals: number = 0;
  ownerDetailsRecord: OwnerData[] = [];
  registeredAnimalRecord!: AnimalTable[];
  isOwnerTabVisible: boolean = false;
  isAnimalTabVisible: boolean = false;
  isTableVisible: boolean = false;
  clickedOwnerMobNo: number = 0;
  soldFlag: boolean = false;
  searchForm!: FormGroup;
  orgsList!: OrgList[];
  searchBy: string = 'individual';
  selectedOrgName: string = '';
  selectedOrgAddress: string = '';
  isOwnerActive = true;
  isLoadingSpinner: boolean = false;
  selectedOrgRegNo: string = '';
  isOrgTabVisible: boolean = false;
  errorMessage: string = '';
  ownerDetailsByID!: CompleteOwnerDetails;
  selectedOrg: string = '';
  animalId: string = '';
  animalIds: string[] = [];
  animalData: AnimalRegistrationList[] = [];
  ownerDetails!: OwnerData;
  private paginator!: MatPaginator;
  private animalPaginator!: MatPaginator;
  private sort!: MatSort;
  orgValue?: number;
  searchedBy: string = 'owner';
  currentOwnerId: string = '';
  individualOwner: boolean = true;
  animalPageIndex = 0;
  animalPageSize = 10;
  animalsCount = 0;
  animalKeys: string[] = [
    'taggingDate',
    'tagId',
    'species',
    'animalCategory',
    'speciesCd',
    'isLoanOnAnimal',
    'dateOfBirth',
    'ownerId',
    'registrationDate',
    'registrationStatus',
    'sex',
    'ageInMonths',
    'ageInDays',
    'animalStatusCd',
    'animalStatus',
    'animalId',
    'animalName',
  ];
  displayedColumns: string[] = [
    'cb',
    'sNo',
    'animalName',
    'tagId',
    'taggingDate',
    'species',
    'animalCategory',
    'sex',
    'ageInMonths',
    'animalStatus',
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

  constructor(
    private ownerTS: OwnerTransferService,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private ownerDS: OwnerDetailsService,
    private earTS: EarTagChangeService,
    private route: Router,
    private animalMS: AnimalManagementService,
    private animalDS: AnimalDetailService,
    private appService: AppService,
    private translatePipe: TranslatePipe
  ) {}

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild('paginatorRef') set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  @ViewChild('animalPaginatorRef') animalPaginatorRef: MatPaginator;

  ngOnInit(): void {
    this.animalDS.getOrgs().subscribe((data: OrgList[]) => {
      this.orgsList = data;
    });

    this.searchForm = this._formBuilder.group({
      optRadio: [this.searchBy],
      searchValue: ['', [Validators.required, TagIdSearchValidation]],
    });

    this.checkIfViewedandEdited();
    this.searchIfAnimalRegistered();
  }

  searchIfAnimalRegistered() {
    this.appService.getCurrentUrl(true);
    var parent = this.animalDS.getParentComponent();
    if (parent == 'animalReg') {
      var ownerData = JSON.parse(sessionStorage.getItem('ownerData') || '');
      this.setSearchParams(ownerData);
      this.animalDS.setParentComponent('');
    }
  }

  checkIfViewedandEdited() {
    if (this.animalDS.getIfAlreadySearched()) {
      var ownerData = JSON.parse(sessionStorage.getItem('ownerData') || '');
      this.setSearchParams(ownerData);
      this.animalDS.setIfAlreadySearched(false);
    }
  }

  setSearchParams(owner: CompleteOwnerDetails) {
    if (owner.ownerId) {
      this.getOwnerDetailsByID(owner.ownerId);
      this.searchForm.patchValue({ optRadio: 'individual' });
      this.searchBy = 'individual';
    } else {
      this.getOwnerDetailsByID(String(owner.orgId));
      this.searchForm.patchValue({ optRadio: 'organization' });
      this.orgValue = +owner.orgId;
      this.searchBy = 'organization';
    }
  }

  onPageAnimalPageChange(event: PageEvent) {
    this.animalPageIndex = event.pageIndex;
    this.animalPageSize = event.pageSize;
    this.animalData.length = 0;
    this.getOwnerDetailsByID(this.ownerDetailsByID?.ownerId);
  }

  setDataSourceAttributes() {
    this.tableDataSource.paginator = this.animalPaginator;
    this.tableDataSource.sort = this.sort;
    this.tableDataSourceOwner.paginator = this.paginator;
    this.tableDataSourceOwner.sort = this.sort;
  }

  openStatusMismatchDialog() {
    this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: this.translatePipe.transform('common.info_label'),
        icon: 'assets/images/info.svg',
        message: this.translatePipe.transform(
          'animalDetails.animal_status_mismatch'
        ),
        primaryBtnText: this.translatePipe.transform('common.ok_string'),
      },
      panelClass: 'common-info-dialog',
    });
  }

  ownershipDialog() {
    let animalLoaned = 0;
    for (let animal of this.animalData) {
      if (animal.isLoanOnAnimal) {
        animalLoaned += 1;
      }
    }
    let animalStatus = [this.animalData[0].animalStatusCd];
    for (let animal of this.animalData) {
      if (animalStatus[0] === 1) {
        if (animalStatus.indexOf(animal.animalStatusCd) == -1) {
          this.openStatusMismatchDialog();
          return;
        }
      } else {
        if (animal.animalStatusCd == 1) {
          this.openStatusMismatchDialog();
          return;
        }
      }
      animalStatus[0] = animal.animalStatusCd;
    }
    if (animalLoaned > 0) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translatePipe.transform('common.info_label'),
          icon: 'assets/images/info.svg',
          message:
            animalLoaned +
            ' ' +
            this.translatePipe.transform('errorMsg.loaned_animal'),
          primaryBtnText: this.translatePipe.transform('common.ok_string'),
        },
        panelClass: 'common-info-dialog',
      });
    } else {
      this.ownerTS.setAnimalIDs(this.animalIds);
      this.ownerTS.setAnimalData(this.animalData);
      const dialogRef = this.dialog.open(OwnerTransferDetailsEditComponent, {
        data: {
          oldOwnerId: this.ownerDetailsByID.ownerId
            ? this.ownerDetailsByID.ownerId
            : this.ownerDetailsByID.orgId,
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
        // this.animalData.length = 0;
        //   this.getOwnerDetailsByID(
        //     this.ownerDetailsByID.ownerId
        //       ? this.ownerDetailsByID.ownerId
        //       : this.ownerDetailsByID.orgId
        //   );
      });
      dialogRef.componentInstance.onClosed.subscribe(() => {
        this.appService.getCurrentUrl(true);
        this.animalData.length = 0;
        this.getOwnerDetailsByID(
          this.ownerDetailsByID.ownerId
            ? this.ownerDetailsByID.ownerId
            : this.ownerDetailsByID.orgId
        );
      });
    }
  }

  resetValue() {
    this.searchForm.patchValue({ searchValue: '' });
    this.errorMessage = '';
    this.isTableVisible = false;
    this.isAnimalTabVisible = false;
    this.isOwnerTabVisible = false;
    this.tableDataSourceOwner.filter = '';
  }

  editOwnerDialog(isView?: boolean) {
    const dialogRef = this.dialog.open(EditOwnerDetailsComponent, {
      data: {
        ownerData: this.ownerDetailsByID,
        redirectLink: '/dashboard/animal/eartagchange',
        isView: isView ? true : false,
        // isIndividual: this.individualOwner,
        isIndividual: this.ownerDetailsByID.ownerTypeCd === 1,
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
      this.appService.getCurrentUrl(true);
      if (this.ownerDS.geteditDetailsFlag()) {
        this.getOwnerDetailsByID(this.ownerDetailsByID?.ownerId);
        this.ownerDS.seteditDetailsFlag(false);
      }
    });
  }

  onSelectingSearchBy(event: Event) {
    this.searchBy = (event.target as HTMLInputElement)?.value;
    this.isAnimalTabVisible = false;
    this.isOwnerTabVisible = false;
    this.isOrgTabVisible = false;
    this.isTableVisible = false;
    this.errorMessage = '';
    this.animalPageIndex = 0;
    this.animalPageSize = 10;
    this.animalsCount = 0;
    if (this.searchBy == 'individual') {
      this.individualOwner = true;
    } else {
      this.individualOwner = false;
    }
  }

  checkAllBoxes(event: Event) {
    this.animalDetail.length = 0;
    this.animalData.length = 0;
    if ((event.target as HTMLInputElement)?.checked) {
      for (var i = 0; i < this.tableDataSource.filteredData.length; i++) {
        if (
          this.tableDataSource.filteredData[i].animalStatus.includes(
            'Active'
          ) &&
          !this.tableDataSource.filteredData[i].isLoanOnAnimal &&
          !this.tableDataSource.filteredData[i].fieldSubmittedforUpdate
        ) {
          this.animalData.push(this.tableDataSource.filteredData[i]);
        }
      }
    }
  }

  onCheckboxChange(event: Event, clickedAnimalData: AnimalRegistrationList) {
    if ((event.target as HTMLInputElement)?.checked) {
      this.animalData.push(clickedAnimalData);
    } else {
      this.animalData.forEach((value, index) => {
        if (value == clickedAnimalData) {
          this.animalData.splice(index, 1);
        }
      });
    }
  }

  checkIfInSelectedList(data: AnimalRegistrationList) {
    if (this.animalData.length > 0) {
      return this.animalData.includes(data);
    } else {
      return false;
    }
  }

  openOtpDialog() {
    const dialogRef = this.dialog.open(OtpDialogComponent, {
      data: {
        isDisplayIcon: true,
        ownerId: this.ownerDetailsByID?.ownerId,
        header:
          this.translatePipe.transform('common.owner_id') +
          ':' +
          String(this.ownerDetailsByID?.ownerId),
        heading: this.translatePipe.transform(
          'animalDetails.owner_register.owner_ver'
        ),
        message: this.translatePipe.transform(
          'animalDetails.owner_register.activate_account'
        ),
        link: '/dashboard/animal/animalsearch',
        name: 'ownerRegistrationSuccess',
        otp: '1234',
        ownerMobileNo: String(this.ownerDetailsByID?.ownerMobileNo),
      },
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((res) => {
      this.getOwnerDetailsByID(this.ownerDetailsByID?.ownerId);
    });
    dialogRef.componentInstance.onClosed.subscribe((res) => {
      this.getOwnerDetailsByID(this.ownerDetailsByID?.ownerId);
    });
  }

  openEarTagDialog() {
    const dialogRef = this.dialog.open(EarTagDialogComponent, {
      data: {
        tagNumber: this.animalData[0].tagId,
        animalId: this.animalData[0].animalId,
        taggingDate: this.animalData[0].taggingDate,
        registrationDate: this.animalData[0].registrationDate,
      },
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((res) => {
      this.appService.getCurrentUrl(true);
      if (this.earTS.getEarFlagStatus()) {
        this.isOwnerTabVisible = false;
        this.isAnimalTabVisible = false;
        this.isOrgTabVisible = false;
        this.getOwnerDetailsByID(this.currentOwnerId);
      }
      this.animalData.length = 0;
    });
  }

  searchResults(searchValue: string) {
    this.animalData = [];
    this.animalPageIndex = 0;
    this.animalPageSize = 10;
    this.animalsCount = 0;
    this.tableDataSourceOwner.filter = '';
    if (this.searchForm.invalid) {
      this.isTableVisible = false;
      this.isOwnerTabVisible = false;
      this.isAnimalTabVisible = false;
      this.searchForm.markAllAsTouched();
      if (!isNaN(Number(searchValue)) && searchValue.length > 0) {
        if (searchValue.length > 10) {
          this.errorMessage = this.translatePipe.transform(
            'errorMsg.check_field'
          );
        } else {
          this.errorMessage = this.translatePipe.transform(
            'errorMsg.mobile_start'
          );
        }
      } else if (searchValue.length == 0) {
        this.errorMessage = this.translatePipe.transform(
          'errorMsg.enter_value'
        );
      } else {
        this.errorMessage = this.translatePipe.transform(
          'errorMsg.owner_name_err'
        );
      }
      return;
    } else {
      if (
        (searchValue.length == 8 ||
          searchValue.length == 11 ||
          searchValue.length == 12) &&
        !isNaN(+searchValue)
      ) {
        this.getDetailsByTagID(searchValue);
      } else {
        this.errorMessage = '';
        this.isLoadingSpinner = true;
        this.tableDataSourceOwner.data = [];
        this.ownerDS
          .getOwnerByMobile(
            searchValue,
            this.searchBy == 'nonIndividual' ? true : false
          )
          .subscribe(
            (data: OwnerData[]) => {
              this.tableDataSourceOwner.data = data;
              this.ownerDetailsRecord = data;
              this.isLoadingSpinner = false;
              if (this.ownerDetailsRecord.length > 1) {
                this.isTableVisible = true;
                this.isOwnerTabVisible = false;
                this.isAnimalTabVisible = false;
              } else if (this.ownerDetailsRecord.length == 1) {
                this.isTableVisible = false;
                this.getOwnerDetailsByID(this.ownerDetailsRecord[0].ownerId);
              } else {
                this.checkSearchValidity();
              }
            },
            (error) => {
              this.isLoadingSpinner = false;
            }
          );
      }
    }
  }

  checkSearchValidity() {
    this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: this.translatePipe.transform('common.info_label'),
        icon: 'assets/images/info.svg',
        message: this.translatePipe.transform('errorMsg.no_owner_found'),
        primaryBtnText: this.translatePipe.transform('common.ok_string'),
      },
      panelClass: 'common-info-dialog',
    });
    this.isTableVisible = false;
    this.isOwnerTabVisible = false;
    this.isAnimalTabVisible = false;
  }

  getDetailsByTagID(searchValue: string) {
    this.noOfActiveAnimals = 0;
    this.errorMessage = '';
    this.isLoadingSpinner = true;
    this.animalMS.getDetailsByTagID(searchValue).subscribe(
      (searchResult: AnimalResult) => {
        this.isLoadingSpinner = false;
        this.ownerDetailsByID = searchResult.ownerDetails;
        this.animalsCount = 1;
        this.isOwnerActive =
          this.ownerDetailsByID.registrationStatus == '2' ? false : true;
        var animalList = <AnimalRegistrationList>{};
        for (let key of this.animalKeys) {
          animalList[key] = searchResult[key];
        }
        if (searchResult?.animalId) {
          if (
            searchResult.isLoanOnAnimal &&
            searchResult?.animalStatus?.includes('Active') &&
            !searchResult?.fieldSubmittedforUpdate
          ) {
            this.noOfActiveAnimals += 1;
          }
        }
        this.tableDataSource = new MatTableDataSource([animalList]);
        this.isTableVisible = false;
        if (searchResult.ownerDetails.ownerId) {
          this.searchForm.patchValue({
            optRadio:
              searchResult.ownerDetails?.ownerTypeCd === 1
                ? 'individual'
                : 'nonIndividual',
          });
          this.searchBy = String(searchResult.ownerDetails.ownerId).startsWith(
            '1'
          )
            ? 'individual'
            : 'nonIndividual';
          this.isOwnerTabVisible = true;
          this.isAnimalTabVisible = true;
        } else {
          this.isOrgTabVisible = true;
          this.searchForm.patchValue({ optRadio: 'organization' });
          this.searchBy = 'organization';
          this.isAnimalTabVisible = true;
        }
      },
      (error) => {
        this.isLoadingSpinner = false;
        this.isTableVisible = false;
        this.isOwnerTabVisible = false;
        this.isAnimalTabVisible = false;
      }
    );
  }

  getOwnerDetailsByID(ownerId: string) {
    this.noOfActiveAnimals = 0;
    this.isLoadingSpinner = true;
    this.currentOwnerId = ownerId;
    this.ownerDS
      .getOwnerByOwnerID(
        ownerId,
        this.searchBy == 'nonIndividual' ? true : false,
        this.animalPageIndex,
        this.animalPageSize
      )
      .subscribe(
        (data: CompleteOwnerDetails) => {
          this.isLoadingSpinner = false;
          this.ownerDetailsByID = data;
          this.animalsCount = data.animalsCount;
          // if (String(ownerId).startsWith('1')) {
          //   this.searchBy = 'individual';
          //   this.searchForm.patchValue({ optRadio: 'individual' });
          // } else if (String(ownerId).startsWith('3')) {
          //   this.searchBy = 'nonIndividual';
          //   this.searchForm.patchValue({ optRadio: 'nonIndividual' });
          // }
          this.isOwnerActive =
            this.ownerDetailsByID.registrationStatus == '2' ? false : true;
          this.tableDataSource = new MatTableDataSource(
            this.ownerDetailsByID.animalsList
          );
          this.isTableVisible = false;
          this.ownerTS.setOwnerName(
            this.ownerDetailsByID.ownerName
              ? this.ownerDetailsByID.ownerName
              : this.ownerDetailsByID.orgName
          );
          if (this.ownerDetailsByID?.orgId) {
            this.isOwnerTabVisible = false;
            this.isOrgTabVisible = true;
          } else {
            this.isOwnerTabVisible = true;
            this.isOrgTabVisible = false;
          }
          if (data.animalsList) {
            const animalList = data.animalsList;
            for (let i = 0; i < animalList.length; i++) {
              if (
                animalList[i].animalStatus.includes('Active') &&
                !animalList[i].isLoanOnAnimal &&
                !animalList[i].fieldSubmittedforUpdate
              ) {
                this.noOfActiveAnimals += 1;
              }
            }
          }
          this.isAnimalTabVisible = true;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
  }

  getOrgDetails() {
    if (this.orgValue != 0 && String(this.orgValue).startsWith('2')) {
      this.getOwnerDetailsByID(String(this.orgValue));
    } else if (this.orgValue == undefined) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translatePipe.transform('common.info_label'),
          icon: 'assets/images/info.svg',
          message: this.translatePipe.transform('animalDetails.select_org'),
          primaryBtnText: this.translatePipe.transform('common.ok_string'),
        },
        panelClass: 'common-info-dialog',
      });
    } else {
      this.isOrgTabVisible = false;
      this.isAnimalTabVisible = false;
    }
  }

  get searchInfo() {
    return this.searchForm.controls;
  }

  dateFormatChange(date: String) {
    if (date) {
      date = date.substring(0, 10);
      return date.split('-').reverse().join('/');
    }
    return '-';
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

  calculateAge(months: number) {
    const year = Math.floor(months / 12);
    const month = months % 12;
    return String(year) + 'Y' + ' ' + String(month) + 'M';
  }

  onViewEdit(animalClicked: AnimalRegistrationList) {
    sessionStorage.setItem('parentPage', this.route.url);
    sessionStorage.setItem('ownerData', JSON.stringify(this.ownerDetailsByID));
    this.animalDS.setAnimalId(String(animalClicked.animalId));
  }

  passOwnerData() {
    this.route.navigateByUrl('/dashboard/animal/addanimal');
    sessionStorage.setItem('ownerData', JSON.stringify(this.ownerDetailsByID));
  }

  searchInTable(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
    if (this.tableDataSource.paginator) {
      this.tableDataSource.paginator.firstPage();
    }
  }

  searchInOwners(event: Event) {
    const filterOwnerValue = (event.target as HTMLInputElement).value;
    this.tableDataSourceOwner.filter = filterOwnerValue.trim().toLowerCase();
    if (this.tableDataSourceOwner.paginator) {
      this.tableDataSourceOwner.paginator.firstPage();
    }
  }
}
