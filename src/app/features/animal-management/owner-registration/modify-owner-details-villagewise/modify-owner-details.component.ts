import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/shared/user/user.service';
import { InstitutionName } from './../models-owner-reg/village-institution-name';
import { CommonData } from './../models-owner-reg/common-data.model';
import {
  TehsilList,
  UserAddressList,
} from './../../../../shared/shareService/model/tehsil.model';
import { OtpDialogComponent } from './../../../../shared/otp-dialog/otp-dialog.component';
import { SnackBarMessage } from 'src/app/shared/snack-bar';
import { Component, OnInit, ViewChild } from '@angular/core';
import { EditOwnerDetailsComponent } from '../edit-owner-details/edit-owner-details.component';
import { AddDetailsDialogComponent } from '../add-details-dialog/add-details-dialog.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OwnerDetailsService } from '../owner-details.service';
import { MatDialog } from '@angular/material/dialog';
import {
  SearchValidation,
  TagIdSearchValidation,
} from '../../../../shared/utility/validation';
import { DatePipe } from '@angular/common';
import { OwnerData } from '../models-owner-reg/get-owner-details.model';
import {
  AnimalRegistrationList,
  CompleteOwnerDetails,
} from '../models-owner-reg/get-ownerby-ownerID.model';
import { RegisterOwner } from '../models-owner-reg/register-owner.model';
import { StateList } from '../../../../shared/shareService/model/state.model';
import { CountryService } from '../../../../shared/shareService/country-service.service';
import { DistrictList } from '../../../../shared/shareService/model/district.model';
import { VillageList } from '../../../../shared/shareService/model/village.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MasterConfig } from 'src/app/shared/master.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AppService } from 'src/app/shared/shareService/app.service';
import { AnimalManagementService } from '../../animal-registration/animal-management.service';
import { AnimalResult } from '../../animal-registration/models-animal-reg/tagId-search.model';
import { ViewOrganizationComponent } from '../../animal-registration/view-organization/view-organization.component';

@Component({
  selector: 'app-modify-owner-details',
  templateUrl: './modify-owner-details.component.html',
  styleUrls: ['./modify-owner-details.component.css'],
  providers: [DatePipe, TranslatePipe],
})
export class ModifyOwnerDetailsVillageWiseComponent implements OnInit {
  masterConfig = MasterConfig;
  stateList: StateList[] = [];
  isTableVisible: boolean = false;
  districtList: DistrictList[] = [];
  tehsilList: TehsilList[] = [];
  addressList: UserAddressList[] = [];
  villageList: VillageList[] = [];
  langData: string = '';
  ownerDetailsSection: boolean = false;
  isOwnerActive = true;
  errorMessage: string = '';
  searchForm!: FormGroup;
  ownerDetailsRecord: OwnerData[] = [];
  ownerDetailsByID!: CompleteOwnerDetails;
  clickedOwnerMobNo: number = 0;
  currentDate: string = '';
  ownerRegistrationFlag: boolean = false;
  isLoadingSpinner: boolean = false;
  ownerData!: RegisterOwner;
  ownerDetailsLength: number = 0;
  institutionList: CommonData[] = [];
  villageInstitutionNames: InstitutionName[] = [];
  private paginator!: MatPaginator;
  private sort!: MatSort;
  isOwnerVerified: boolean = false;
  formInitialValue: {} = {};
  individualOwner: boolean = true;
  isOrgTabVisible = false;
  searchBy: string = 'individual';
  checkboxSelected: boolean = false;
  animalPageIndex = 0;
  animalPageSize = 10;
  animalsCount = 0;
  displayedColumns: string[] = [
    'sNo',
    'tagId',
    'taggingDate',
    'category',
    'sex',
    'age',
    'status',
  ];
  displayedColumnsOwners: string[] = [
    'sNo',
    'ownerId',
    'ownerName',
    'ownerMobileNo',
    'ownerDateOfBirth',
    'ownerGender',
    'villageName',
    'action',
  ];
  tableDataSource = new MatTableDataSource<AnimalRegistrationList>();
  tableDataSourceOwners = new MatTableDataSource<OwnerData>();
  constructor(
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private countryService: CountryService,
    private ownerDS: OwnerDetailsService,
    private datePipe: DatePipe,
    private userService: UserService,
    private route: Router,
    private translatePipe: TranslatePipe,
    private appService: AppService,
    private animalMS: AnimalManagementService
  ) {}

  @ViewChild(MatSort) set matSort(matSort: MatSort) {
    this.sort = matSort;
    this.setDataSourceAttributes();
  }

  @ViewChild(MatPaginator) set matPaginator(matPag: MatPaginator) {
    this.paginator = matPag;
    this.setDataSourceAttributes();
  }

  ngOnInit(): void {
    this.searchForm = this._formBuilder.group({
      optRadio: [this.searchBy],
      searchValue: ['', [Validators.required, TagIdSearchValidation]],
      ownerAddressCityVillageCd: [null],
    });
    this.isOwnerVerified = this.ownerDS.getOwnerVerifiedFlag();
    this.getVillage();
  }

  onSelectingSearchBy(event: Event) {
    this.searchBy = (event.target as HTMLInputElement)?.value;
    this.animalPageIndex = 0;
    this.animalPageSize = 10;
    this.animalsCount = 0;
    // this.resetForm();
    // this.resetNonIndividualForm();
    this.ownerDetailsSection = false;
    this.isTableVisible = false;
    this.errorMessage = '';
    if (this.searchBy == 'individual') {
      this.individualOwner = true;
    } else {
      this.individualOwner = false;
    }
  }

  setDataSourceAttributes() {
    this.tableDataSource.paginator = this.paginator;
    this.tableDataSource.sort = this.sort;
    this.tableDataSourceOwners.paginator = this.paginator;
    this.tableDataSourceOwners.sort = this.sort;
  }

  spaceRestict(event: KeyboardEvent) {
    if (
      (event.target as HTMLInputElement)?.selectionStart === 0 &&
      event.code === 'Space'
    ) {
      event.preventDefault();
    }
  }

  getDetailsByTagID(searchValue: string) {
    this.errorMessage = '';
    this.isLoadingSpinner = true;
    this.animalMS
      .getDetailsByTagID(
        searchValue,
        this.searchForm?.get('ownerAddressCityVillageCd')?.value
          ? this.searchForm?.get('ownerAddressCityVillageCd')?.value
          : undefined
      )
      .subscribe(
        (searchResult: AnimalResult) => {
          this.isLoadingSpinner = false;
          this.ownerDetailsByID = searchResult.ownerDetails;
          this.animalsCount = 1;
          this.isOwnerActive =
            this.ownerDetailsByID.registrationStatus == '2' ? false : true;
          // var animalList = <AnimalRegistrationList>{};
          // for (let key of this.animalKeys) {
          //   animalList[key] = searchResult[key];
          // }
          // this.tableDataSource = new MatTableDataSource([animalList]);
          this.isTableVisible = false;
          if (searchResult.ownerDetails.ownerId) {
            this.searchForm.patchValue({
              optRadio: String(searchResult.ownerDetails.ownerId).startsWith(
                '1'
              )
                ? 'individual'
                : 'nonIndividual',
            });
            this.searchBy =
              searchResult.ownerDetails?.ownerTypeCd === 1
                ? 'individual'
                : 'nonIndividual';
            this.ownerDetailsSection = true;
            // this.animalDetailsSection = true;
            this.isOrgTabVisible = false;
          } else {
            this.isOrgTabVisible = true;
            this.searchForm.patchValue({ optRadio: 'organization' });
            // this.searchBy = 'organization';
            this.isOrgTabVisible = true;
            this.ownerDetailsSection = false;
          }
        },
        (error) => {
          this.isLoadingSpinner = false;
          this.isTableVisible = false;
          this.ownerDetailsSection = false;
          // this.animalDetailsSection = false;
        }
      );
  }

  getOwnerDetailsByID(ownerId: string) {
    this.isLoadingSpinner = true;
    this.ownerDS
      .getOwnerByOwnerID(
        ownerId,
        this.searchBy == 'nonIndividual' ? true : false,
        this.animalPageIndex,
        this.animalPageSize
      )
      .subscribe(
        (data) => {
          this.ownerDetailsByID = data;
          this.animalsCount = data.animalsCount;
          this.isLoadingSpinner = false;
          this.tableDataSource = new MatTableDataSource(
            this.ownerDetailsByID.animalsList
          );
          this.clickedOwnerMobNo = this.ownerDetailsByID?.ownerMobileNo;
          this.isTableVisible = false;
          this.ownerDetailsSection = true;
          this.isOwnerActive =
            this.ownerDetailsByID.registrationStatus == '2' ? false : true;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
  }

  get searchInfo() {
    return this.searchForm.controls;
  }

  searchResults(searchValue: string) {
    this.animalPageIndex = 0;
    this.animalPageSize = 10;
    this.animalsCount = 0;
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      if (this.searchForm.get('searchValue').invalid) {
        if (
          !isNaN(Number(this.searchForm.get('searchValue')?.value)) &&
          this.searchForm.get('searchValue')?.value.length > 0
        ) {
          if (this.searchForm.get('searchValue')?.value.length > 10) {
            this.errorMessage = this.translatePipe.transform(
              'errorMsg.check_field'
            );
          } else {
            this.errorMessage = this.translatePipe.transform(
              'errorMsg.mobile_start'
            );
          }
        } else if (this.searchForm.get('searchValue')?.value.length == 0) {
          this.errorMessage = this.translatePipe.transform(
            'errorMsg.enter_value'
          );
        } else {
          this.errorMessage = this.translatePipe.transform(
            'errorMsg.owner_name_err'
          );
        }
      } else {
        this.errorMessage = '';
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
        this.isLoadingSpinner = true;
        this.errorMessage = '';
        this.tableDataSourceOwners.data = [];
        this.ownerDS
          .getOwnerByMobile(
            searchValue,
            this.searchBy == 'nonIndividual' ? true : false,
            this.searchForm?.get('ownerAddressCityVillageCd')?.value
              ? this.searchForm?.get('ownerAddressCityVillageCd')?.value
              : undefined
          )
          .subscribe(
            (data) => {
              this.isLoadingSpinner = false;
              this.tableDataSourceOwners.data = data;
              this.ownerDetailsRecord = data;
              this.ownerDetailsLength = this.ownerDetailsRecord.length;
              if (this.ownerDetailsRecord.length > 1) {
                this.isTableVisible = true;
                this.ownerDetailsSection = false;
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

  checkSearchValidity() {
    if (this.searchForm?.get('ownerAddressCityVillageCd')?.value) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translatePipe.transform('common.info_label'),
          icon: 'assets/images/info.svg',
          message: this.translatePipe.transform(
            'errorMsg.no_owner_inside_area'
          ),
          primaryBtnText: this.translatePipe.transform('common.ok_string'),
        },
        panelClass: 'common-info-dialog',
      });
    } else {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translatePipe.transform('common.info_label'),
          icon: 'assets/images/info.svg',
          message: this.translatePipe.transform('errorMsg.no_owner_found'),
          primaryBtnText: this.translatePipe.transform('common.ok_string'),
        },
        panelClass: 'common-info-dialog',
      });
    }

    if (
      this.searchForm.get('searchValue')?.value.length == 10 &&
      !isNaN(Number(this.searchForm.get('searchValue')?.value))
    ) {
    } else if (isNaN(Number(this.searchForm.get('searchValue')?.value))) {
    }
    this.isTableVisible = false;
    this.ownerDetailsSection = false;
  }

  editOwnerDialog(isView?: boolean) {
    const dialogRef = this.dialog.open(EditOwnerDetailsComponent, {
      data: {
        ownerData: this.ownerDetailsByID,
        redirectLink: '/dashboard/owner/ownersearchinvillage',
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
        link: '/dashboard/owner/ownersearchinvillage',
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

  addInfoDialog() {
    const dialogRef = this.dialog.open(AddDetailsDialogComponent, {
      data: {
        ownerData: this.ownerDetailsByID,
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
      if (this.ownerDS.getAddDetailsFlag()) {
        this.getOwnerDetailsByID(this.ownerDetailsByID?.ownerId);
        this.ownerDS.setAddDetailsFlag(false);
      }
    });
  }

  resetValue() {
    this.searchForm.patchValue({ searchValue: '' });
    this.errorMessage = '';
    this.isTableVisible = false;
    this.ownerRegistrationFlag = false;
    this.ownerDetailsSection = false;
    if (this.isOrgTabVisible) {
      this.isOrgTabVisible = false;
      this.searchForm.patchValue({ optRadio: 'individual' });
      this.ownerDetailsByID.ownerTypeCd === 1;
    }
  }

  searchInOwners(event: Event) {
    const filterOwnerValue = (event.target as HTMLInputElement).value;
    this.tableDataSourceOwners.filter = filterOwnerValue.trim().toLowerCase();
    if (this.tableDataSourceOwners.paginator) {
      this.tableDataSourceOwners.paginator.firstPage();
    }
  }

  searchInTable(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
    if (this.tableDataSource.paginator) {
      this.tableDataSource.paginator.firstPage();
    }
  }

  dateFormatChange(date: String) {
    if (date) {
      date = date.substring(0, 10);
      return date.split('-').reverse().join('/');
    }
    return '-';
  }

  calculateAge(months: number) {
    const year = Math.floor(months / 12);
    const month = months % 12;
    return String(year) + 'Y' + ' ' + String(month) + 'M';
  }

  getVillage() {
    this.isLoadingSpinner = true;
    this.countryService.fetchAddress().subscribe(
      (res: any) => {
        this.isLoadingSpinner = false;
        this.villageList = res;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  // onCheckboxChange(event: Event) {
  //   if ((event.target as HTMLInputElement)?.checked) {
  //     this.checkboxSelected = true;
  //     this.isTableVisible = false;
  //     this.ownerDetailsSection = false;
  //   } else {
  //     this.checkboxSelected = false;
  //   }

  //   if (this.checkboxSelected) {
  //     this.searchForm.addControl(
  //       'ownerAddressStateCd',
  //       this._formBuilder.control('', Validators.required)
  //     );
  //     this.searchForm.addControl(
  //       'ownerAddressDistrictCd',
  //       this._formBuilder.control('', Validators.required)
  //     );
  //     this.searchForm.addControl(
  //       'ownerAddressTehsilCd',
  //       this._formBuilder.control('', Validators.required)
  //     );
  //     this.searchForm.addControl(
  //       'ownerAddressCityVillageCd',
  //       this._formBuilder.control(null, Validators.required)
  //     );
  //   } else {
  //     this.searchForm?.removeControl('ownerAddressStateCd');
  //     this.searchForm?.removeControl('ownerAddressDistrictCd');
  //     this.searchForm?.removeControl('ownerAddressTehsilCd');
  //     this.searchForm?.removeControl('ownerAddressCityVillageCd');
  //   }
  // }

  // findInvalidControls() {
  //   const controls = this.ownerInfoForm.controls;
  //   for (const name in controls) {
  //     if (controls[name].invalid) {
  //     }
  //   }
  // }
}
