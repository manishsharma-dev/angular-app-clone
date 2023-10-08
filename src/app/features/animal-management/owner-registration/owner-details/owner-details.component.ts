import { TranslatePipe } from '@ngx-translate/core';
import { AffiliationData } from './../models-owner-reg/affiliation-data.model';
import { RegistrationPreviewComponent } from './../registration-preview/registration-preview.component';
import { ConfigValues } from './../models-owner-reg/config-data.model';
import { AnimalManagementService } from './../../animal-registration/animal-management.service';
import { Subscription, forkJoin, of } from 'rxjs';
import {
  AddressValidationFormat,
  AlphaNumericSpecialValidation,
  AlphaNumericValidation,
  PanCardValidation,
  PinCodeValidation,
  SpecialNameValidation,
  TagIdSearchValidation,
} from './../../../../shared/utility/validation';
import { Router } from '@angular/router';
import { UserService } from 'src/app/shared/user/user.service';
import { InstitutionName } from './../models-owner-reg/village-institution-name';
import { CommonData } from './../models-owner-reg/common-data.model';
import {
  FLWVillages,
  TehsilList,
} from './../../../../shared/shareService/model/tehsil.model';
import { OtpDialogComponent } from './../../../../shared/otp-dialog/otp-dialog.component';
import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import { EditOwnerDetailsComponent } from '../edit-owner-details/edit-owner-details.component';
import { AddDetailsDialogComponent } from '../add-details-dialog/add-details-dialog.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OwnerDetailsService } from '../owner-details.service';
import { MatDialog } from '@angular/material/dialog';
import {
  AadhaarValidation,
  MembershipNumberValidation,
  MobileValidation,
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
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { existingAadhaarValidator } from '../../../../shared/utility/directives/unique-email.directive';
import { Error, ErrorMessage } from '../models-owner-reg/error-message.model';
import { OwnerResponseDialogComponent } from '../owner-response-dialog/owner-response-dialog.component';
import { AnimalResult } from '../../animal-registration/models-animal-reg/tagId-search.model';
import { ViewOrganizationComponent } from '../../animal-registration/view-organization/view-organization.component';
import { AnimalManagementConfig } from 'src/app/shared/animal-management.config';
import { MasterConfig } from 'src/app/shared/master.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AppService } from 'src/app/shared/shareService/app.service';
import moment from 'moment';
import { encryptText } from 'src/app/shared/shareService/storageData';
import { OrgList } from '../../animal-registration/models-animal-reg/org-list.model';
import { AnimalDetailService } from '../../animal-registration/animal-details/animal-detail.service';
import { catchError } from 'rxjs/operators';
@Component({
  selector: 'app-owner-details',
  templateUrl: './owner-details.component.html',
  styleUrls: ['./owner-details.component.css'],
  providers: [DatePipe, TranslatePipe],
})
export class OwnerDetailsComponent implements OnInit, OnDestroy {
  masterConfig = MasterConfig;
  stateList: StateList[] = [];
  isTableVisible: boolean = false;
  districtList: DistrictList[] = [];
  tehsilList: TehsilList[] = [];
  addressList: FLWVillages[] = [];
  villageList: VillageList[] = [];
  langData: string = '';
  isOwnerActive = true;
  ownerInfoForm!: FormGroup;
  nonIndividualOwnerInfoForm!: FormGroup;
  individualOwner: boolean = true;
  nonIndividualOwner: boolean = false;
  ownerDetailsSection: boolean = false;
  aadhaarErrorMessage = '';
  panErrorMessage = '';
  animalDetailsSection: boolean = false;
  villageSelected = '';
  isOrgTabVisible = false;
  errorMessage: string = '';
  searchForm!: FormGroup;
  ownerDetailsRecord: OwnerData[] = [];
  ownerDetailsByID!: CompleteOwnerDetails;
  clickedOwnerMobNo: number = 0;
  dateToday: Date;
  ownerRegistrationFlag: boolean = false;
  isLoadingSpinner: boolean = false;
  ownerData!: RegisterOwner;
  ownerDetailsLength: number = 0;
  institutionList = [];
  selectedVillageInstName = '';
  selectedVillageInstType = '';
  villageInstitutionNames: InstitutionName[] = [];
  private paginator!: MatPaginator;
  private animalPaginator!: MatPaginator;
  private sort!: MatSort;
  isOwnerVerified: boolean = false;
  fatherNameLength = 0;
  ownerNameLength = 0;
  categorySelected = '';
  typeCategorySelected = '';
  ownerCategory: CommonData[] = [];
  ownerTypeCategory: CommonData[] = [];
  subscription: Subscription;
  affiliationData: AffiliationData[];
  formInitialValue: {} = {};
  formInitialValueNonInd: {} = {};
  agencyList = [];
  ownerAge: ConfigValues = AnimalManagementConfig?.ownerAge;
  ownerName: ConfigValues = AnimalManagementConfig?.ownerNameLength;
  ownerAddress: ConfigValues = AnimalManagementConfig?.ownerAddress;
  searchBy: string = 'individual';
  orgValue?: number;
  orgsList!: OrgList[];
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
    'sNo',
    'animalName',
    'tagId',
    'taggingDate',
    'species',
    'animalCategory',
    'sex',
    'ageInMonths',
    'animalStatus',
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
  selectedAgency = '';
  constructor(
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private countryService: CountryService,
    private ownerDS: OwnerDetailsService,
    private animalMS: AnimalManagementService,
    private datePipe: DatePipe,
    private userService: UserService,
    private route: Router,
    private el: ElementRef,
    private translatePipe: TranslatePipe,
    private appService: AppService,
    private animalDS: AnimalDetailService
  ) {}

  @ViewChild(MatSort) set matSort(matSort: MatSort) {
    this.sort = matSort;
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
    this.getCommonAPIData();
    this.ownerAge = AnimalManagementConfig?.ownerAge;
    this.ownerName = AnimalManagementConfig?.ownerNameLength;
    this.ownerAddress = AnimalManagementConfig?.ownerAddress;
    this.getInitialPageData();
    this.searchForm = this._formBuilder.group({
      optRadio: [this.searchBy],
      searchValue: ['', [Validators.required, TagIdSearchValidation]],
    });

    this.ownerInfoForm = this._formBuilder.group({
      aadhaarNumber: ['', [Validators.required, AadhaarValidation]],
      ownerMobileNo: ['', [Validators.required, MobileValidation]],
      ownerName: ['', [Validators.required, SpecialNameValidation]],
      fatherName: ['', [Validators.required, SpecialNameValidation]],
      ownerDateOfBirth: ['', Validators.required],
      ownerGender: ['', Validators.required],
      ownerAddressCityVillageCd: [null, Validators.required],
      ownerAddressTehsilCd: ['', Validators.required],
      ownerAddressDistrictCd: ['', Validators.required],
      ownerAddressStateCd: ['', Validators.required],
      affiliatedAgencyUnionOrPc: ['false'],
      villageInstitutionType: [''],
      villageInstitutionCode: [],
      membershipNumber: ['', AlphaNumericSpecialValidation],
      ownerAddressPincode: [{ value: '', disabled: true }],
      ownerAddress: ['', AddressValidationFormat],
      agencyName: [''],
      isCategoryVerified: [false],
      ownerCastCategoryCd: ['', Validators.required],
    });
    this.formInitialValue = this.ownerInfoForm.value;
    this.isOwnerVerified = this.ownerDS.getOwnerVerifiedFlag();
    this.subscription = this.ownerDS.navItem.subscribe((value: number) => {
      this.initialPageState(value);
    });

    // non idividual form
    this.nonIndividualOwnerInfoForm = this._formBuilder.group({
      panNumber: [
        '',
        [Validators.required, PanCardValidation],
        // ,
        // [existingAadhaarValidator(this.userService)],
      ],
      ownerMobileNo: ['', [Validators.required, MobileValidation]],
      ownerName: ['', [Validators.required, SpecialNameValidation]],
      dateOfIncorporation: ['', Validators.required],
      ownerTypeCategoryCd: ['', Validators.required],
      ownerAddress: ['', AddressValidationFormat],
      ownerAddressCityVillageCd: [null, Validators.required],
      ownerAddressTehsilCd: ['', Validators.required],
      ownerAddressDistrictCd: ['', Validators.required],
      ownerAddressStateCd: ['', Validators.required],
      ownerAddressPincode: [{ value: '', disabled: true }],
      affiliatedAgencyUnionOrPc: ['false'],
      villageInstitutionType: [''],
      villageInstitutionCode: [],
      agencyName: [''],
      membershipNumber: ['', AlphaNumericSpecialValidation],
    });
    this.formInitialValueNonInd = this.nonIndividualOwnerInfoForm.value;
    this.checkIfViewedandEdited();
    this.searchIfAnimalRegistered();
  }

  getInitialPageData() {
    this.isLoadingSpinner = true;
    forkJoin({
      date: this.animalMS.getCurrentDate().pipe(catchError((err) => of(null))),
      ownerCat: this.ownerDS
        .getCommonData('owner_category')
        .pipe(catchError((err) => of(null))),
      instData: this.ownerDS
        .getCommonData('village_institution')
        .pipe(catchError((err) => of(null))),
      flwVillages: this.countryService
        .fetchAddress()
        .pipe(catchError((err) => of(null))),
    }).subscribe(({ date, ownerCat, instData, flwVillages }) => {
      this.dateToday = new Date(date.value);
      this.ownerCategory = ownerCat;
      this.institutionList = instData;
      this.addressList = flwVillages;
      this.populateAddressDropdowns(this.addressList);
      this.isLoadingSpinner = false;
    });
  }

  validateAadhaar(event: Event) {
    this.aadhaarErrorMessage = '';
    const aadhaar = (event.target as HTMLInputElement).value;
    if (aadhaar.length == 12) {
      this.isLoadingSpinner = true;
      this.aadhaarErrorMessage = '';
      this.userService.getAadhaar(aadhaar).subscribe(
        (data) => {
          this.isLoadingSpinner = false;
          if (!data) {
            this.aadhaarErrorMessage = 'Aadhaar Already exists';
            // this.dialog
            //   .open(OwnerResponseDialogComponent, {
            //     data: {
            //       title:
            //         this.translatePipe.transform('animalDetails.warning') +
            //         ' !',
            //       message: this.translatePipe.transform(
            //         'errorMsg.adhaar_exist'
            //       ),
            //       primaryBtnText: this.translatePipe.transform(
            //         'animalDetails.register_anyWay'
            //       ),
            //       secondaryBtnText:
            //         this.translatePipe.transform('common.cancel'),
            //     },
            //     width: '380px',
            //   })
            //   .afterClosed()
            //   .subscribe((res: boolean) => {
            //     if (res) {
            //       this.aadhaarErrorMessage = '';
            //     }
            //   });
            // this.dialog.open(ConfirmationDialogComponent, {
            //   data: {
            //     title: this.translatePipe.transform('common.info_label'),
            //     icon: 'assets/images/info.svg',
            //     message: this.translatePipe.transform('errorMsg.adhaar_exist'),
            //     primaryBtnText: this.translatePipe.transform('common.ok_string'),
            //   },
            //   panelClass: 'common-info-dialog',
            // });
          }
        },
        (error) => {
          this.aadhaarErrorMessage = 'Invalid Aadhaar';
          this.isLoadingSpinner = false;
        }
      );
    }
  }

  validatePAN(event: Event) {
    this.panErrorMessage = '';
    const pan = (event.target as HTMLInputElement).value;
    if (pan.length == 10) {
      this.isLoadingSpinner = true;
      this.panErrorMessage = '';
      this.animalMS.validatePAN(pan).subscribe(
        (data) => {
          this.isLoadingSpinner = false;
          if (!data) {
            this.panErrorMessage = 'PAN Already exists';
          }
        },
        (error) => {
          this.panErrorMessage = 'Invalid PAN';
          this.isLoadingSpinner = false;
        }
      );
    }
  }

  getCurrentDate() {
    this.isLoadingSpinner = true;
    this.animalMS.getCurrentDate().subscribe(
      (date) => {
        this.dateToday = new Date(date.value);
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  getCommonAPIData() {
    this.isLoadingSpinner = true;
    this.ownerDS.getCommonData('owner_category').subscribe((ownerCat) => {
      this.ownerCategory = ownerCat;
    });
    this.ownerDS
      .getCommonData('owner_type_category_cd')
      .subscribe((ownerType) => {
        this.ownerTypeCategory = ownerType;
      });
    this.ownerDS.getCommonData('village_institution').subscribe((instData) => {
      this.institutionList = instData;
    });
    this.isLoadingSpinner = false;
  }

  initialPageState(value: number) {
    this.isTableVisible = false;
    this.ownerDetailsSection = false;
    this.isOrgTabVisible = false;
    this.animalDetailsSection = false;
    this.ownerInfoForm.reset(this.formInitialValue);
  }

  onPageAnimalPageChange(event: PageEvent) {
    this.animalPageIndex = event.pageIndex;
    this.animalPageSize = event.pageSize;
    this.getOwnerDetailsByID(this.ownerDetailsByID?.ownerId);
  }

  setDataSourceAttributes() {
    this.tableDataSource.paginator = this.animalPaginator;
    this.tableDataSource.sort = this.sort;
    this.tableDataSourceOwners.paginator = this.paginator;
    this.tableDataSourceOwners.sort = this.sort;
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
      // this.isAnimalTabVisible = false;
    }
  }

  get searchInfo() {
    return this.searchForm.controls;
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
          this.isLoadingSpinner = false;
          this.ownerDetailsByID = data;
          this.animalsCount = data.animalsCount;
          this.tableDataSource = new MatTableDataSource(
            this.ownerDetailsByID.animalsList
          );
          this.clickedOwnerMobNo = this.ownerDetailsByID?.ownerMobileNo;
          this.isOwnerActive =
            this.ownerDetailsByID.registrationStatus == '2' ? false : true;
          this.isTableVisible = false;
          this.ownerDetailsSection = true;
          this.isOrgTabVisible = false;
          this.animalDetailsSection = true;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
  }

  getDetailsByTagID(searchValue: string) {
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
          this.ownerDetailsSection = true;
          this.animalDetailsSection = true;
          this.isOrgTabVisible = false;
        } else {
          this.isOrgTabVisible = true;
          this.searchForm.patchValue({ optRadio: 'organization' });
          // this.searchBy = 'organization';
          this.isOrgTabVisible = true;
          this.ownerDetailsSection = false;
          this.animalDetailsSection = true;
        }
      },
      (error) => {
        this.isLoadingSpinner = false;
        this.isTableVisible = false;
        this.ownerDetailsSection = false;
        this.animalDetailsSection = false;
      }
    );
  }

  searchResults(searchValue: string) {
    this.ownerInfoForm.reset(this.formInitialValue);
    this.nonIndividualOwnerInfoForm.reset(this.formInitialValueNonInd);
    this.animalPageIndex = 0;
    this.animalPageSize = 10;
    this.animalsCount = 0;
    this.tableDataSourceOwners.filter = '';
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      this.ownerInfoForm.patchValue({ firstName: '', mobileNo: '' });
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
        this.tableDataSourceOwners.data = [];
        this.ownerDS
          .getOwnerByMobile(
            searchValue,
            this.searchBy == 'nonIndividual' ? true : false
          )
          .subscribe(
            (data: OwnerData[]) => {
              this.tableDataSourceOwners.data = data;
              this.ownerDetailsRecord = data;
              this.isLoadingSpinner = false;
              if (this.ownerDetailsRecord.length > 1) {
                this.isTableVisible = true;
                this.ownerDetailsSection = false;
                this.isOrgTabVisible = false;
                this.animalDetailsSection = false;
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
    this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: this.translatePipe.transform('common.info_label'),
        icon: 'assets/images/info.svg',
        message: this.translatePipe.transform('errorMsg.no_owner_found'),
        primaryBtnText: this.translatePipe.transform('common.ok_string'),
      },
      panelClass: 'common-info-dialog',
    });
    if (
      this.searchForm.get('searchValue')?.value.length == 10 &&
      !isNaN(Number(this.searchForm.get('searchValue')?.value))
    ) {
      this.ownerInfoForm.patchValue({
        ownerMobileNo: this.searchForm.get('searchValue')?.value,
        ownerName: '',
      });
    } else if (isNaN(Number(this.searchForm.get('searchValue')?.value))) {
      this.ownerInfoForm.patchValue({
        ownerName: this.searchForm.get('searchValue')?.value,
        ownerMobileNo: '',
      });
    }
    this.isTableVisible = false;
    this.ownerDetailsSection = false;
    this.isOrgTabVisible = false;
    this.animalDetailsSection = false;
  }

  // Form Functions
  spaceRestict(event: KeyboardEvent) {
    if (
      (event.target as HTMLInputElement)?.selectionStart === 0 &&
      event.code === 'Space'
    ) {
      event.preventDefault();
    }
  }

  editOwnerDialog(isView?: boolean) {
    const dialogRef = this.dialog.open(EditOwnerDetailsComponent, {
      data: {
        ownerData: this.ownerDetailsByID,
        villageInstType: this.institutionList,
        affiliationData: this.affiliationData,
        redirectLink: '/dashboard/owner/ownersearch',
        isView: isView ? true : false,
        isIndividual: this.ownerDetailsByID.ownerTypeCd === 1,
        // panNumber: this.nonIndividualOwnerInfoForm.value.panNumber,
        // dateOfIncorporation:
        //   this.nonIndividualOwnerInfoForm.value.dateOfIncorporation
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

  addInfoDialog() {
    const dialogRef = this.dialog.open(AddDetailsDialogComponent, {
      data: {
        ownerData: this.ownerDetailsByID,
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

  openOtpDialog(actionPerformed: string) {
    const dialogRef = this.dialog.open(OtpDialogComponent, {
      data: {
        isDisplayIcon: actionPerformed == 'registration' ? false : true,
        ownerId:
          actionPerformed == 'registration'
            ? this.ownerData?.ownerId
            : this.ownerDetailsByID?.ownerId,
        header:
          this.translatePipe.transform('common.owner_id') +
          ':' +
          (actionPerformed == 'registration'
            ? String(this.ownerData?.ownerId)
            : String(this.ownerDetailsByID?.ownerId)),
        heading:
          actionPerformed == 'registration'
            ? this.translatePipe.transform(
                'animalDetails.owner_register.owner_registered_successfully'
              )
            : this.translatePipe.transform(
                'animalDetails.owner_register.owner_ver'
              ),
        message: this.translatePipe.transform(
          'animalDetails.owner_register.activate_account'
        ),
        link: '/dashboard/owner/ownersearch',
        name: 'ownerRegistrationSuccess',
        otp: '1234',
        ownerMobileNo:
          actionPerformed == 'registration'
            ? this.ownerInfoForm.get('ownerMobileNo')?.value ||
              this.nonIndividualOwnerInfoForm.get('ownerMobileNo')?.value
            : String(this.ownerDetailsByID?.ownerMobileNo),
      },
      width: '500px',
    });
    dialogRef.componentInstance.onClosed.subscribe(() => {
      if (this.ownerDS.getOwnerRegFlag()) {
        this.getOwnerDetailsByID(
          actionPerformed == 'registration'
            ? this.ownerData?.ownerId
            : this.ownerDetailsByID?.ownerId
        );
        this.ownerDS.setOwnerRegFlag(false);
      }
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (this.ownerDS.getOwnerRegFlag()) {
        this.getOwnerDetailsByID(
          actionPerformed == 'registration'
            ? this.ownerData?.ownerId
            : this.ownerDetailsByID?.ownerId
        );
        this.ownerDS.setOwnerRegFlag(false);
      }
    });
  }

  populateVillageInstName(event: Event) {
    const selectedType = +(event.target as HTMLInputElement)?.value;
    let tempType = this.institutionList.filter(
      (data) => +data.cd == selectedType
    );
    this.selectedVillageInstType = tempType[0].value;
    this.ownerInfoForm.patchValue({ villageInstitutionCode: null });
    this.nonIndividualOwnerInfoForm.patchValue({
      villageInstitutionCode: null,
    });
    this.affiliationData.filter((crrRecord) => {
      if (crrRecord.villageInstitutionType == selectedType) {
        this.villageInstitutionNames = [
          ...this.villageInstitutionNames,
          {
            villageInstitutionCd: crrRecord.villageInstitutionCd,
            villageInstitutionName: crrRecord.villageInstitutionName,
          },
        ];
      }
    });
  }

  get ownerInfo() {
    return this.ownerInfoForm.controls;
  }

  get nonIndOwnerInfo() {
    return this.nonIndividualOwnerInfoForm.controls;
  }

  get affiliatedAgencyDetails() {
    return (this.ownerInfoForm.controls.affiliatedAgency as FormGroup).controls;
  }

  getPastDate(year: number) {
    var tempDate = new Date(this.dateToday);
    tempDate.setFullYear(tempDate.getFullYear() - year);
    return tempDate;
  }

  resetValue() {
    this.searchForm.patchValue({ searchValue: '' });
    this.errorMessage = '';
    this.isTableVisible = false;
    this.ownerRegistrationFlag = false;
    this.ownerDetailsSection = false;
    this.animalDetailsSection = false;
    this.isOrgTabVisible = false;
    this.tableDataSourceOwners.filter = '';
  }

  resetForm() {
    this.ownerInfoForm.reset({
      affiliatedAgencyUnionOrPc: 'false',
      ownerAddressCityVillageCd: null,
      ownerAddressTehsilCd: '',
      ownerAddressDistrictCd: '',
      ownerAddressStateCd: '',
      villageInstitutionType: '',
      ownerGender: '',
      agencyName: '',
      ownerCastCategoryCd: '',
      isCategoryVerified: false,
    });
  }

  onSelectingCategory(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.categorySelected = this.ownerCategory.filter(
      (crrEle) => crrEle.cd == value
    )[0].value;
  }

  onSelectingTypeCategory(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.typeCategorySelected = this.ownerTypeCategory.filter(
      (crrEle) => crrEle.cd == value
    )[0].value;
  }

  onSelectingRadioButton(event: Event) {
    this.villageInstitutionNames = [];
    this.ownerInfoForm.get('agencyName').disable();
    this.loadRecordsForAgency();
    if ((event.target as HTMLInputElement)?.value == 'true') {
      this.ownerInfoForm
        .get('villageInstitutionType')
        ?.addValidators([Validators.required]);
      this.ownerInfoForm
        .get('villageInstitutionCode')
        ?.addValidators([Validators.required]);
      this.ownerInfoForm
        .get('membershipNumber')
        ?.addValidators([Validators.required, MembershipNumberValidation]);
    } else {
      this.ownerInfoForm.get('villageInstitutionType')?.clearValidators();
      this.ownerInfoForm.get('villageInstitutionCode')?.clearValidators();
      this.ownerInfoForm.get('membershipNumber')?.clearValidators();
      this.ownerInfoForm.get('villageInstitutionType')?.markAsUntouched();
      this.ownerInfoForm.get('villageInstitutionCode')?.markAsUntouched();
      this.ownerInfoForm.get('membershipNumber')?.markAsUntouched();
      this.ownerInfoForm.patchValue({
        villageInstitutionType: '',
        villageInstitutionCode: null,
        membershipNumber: '',
        agencyName: '',
      });
    }
    this.ownerInfoForm.get('villageInstitutionType')?.updateValueAndValidity();
    this.ownerInfoForm.get('villageInstitutionCode')?.updateValueAndValidity();
    this.ownerInfoForm.get('membershipNumber')?.updateValueAndValidity();
  }

  validateForm() {
    //this.findInvalidControls();
    const formValue = this.ownerInfoForm.value;
    formValue.ownerDateOfBirth = moment(formValue.ownerDateOfBirth).format(
      'YYYY-MM-DD'
    );
    if (this.ownerInfoForm.invalid) {
      this.ownerInfoForm.markAllAsTouched();
      const controls = this.ownerInfoForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          const invalidControl = this.el.nativeElement.querySelector(
            '[formcontrolname="' + name + '"]'
          );
          invalidControl.focus();
        }
      }

      return;
    } else if (
      this.ownerInfoForm.valid &&
      !this.aadhaarErrorMessage &&
      this.ownerNameLength >= this.ownerName?.rangeLowerValue &&
      this.fatherNameLength >= this.ownerName?.rangeLowerValue
    ) {
      this.previewOwnerAndRegister(formValue);
    }
  }

  validateNonIndividualForm() {
    //this.findInvalidControls();
    const formValue = this.nonIndividualOwnerInfoForm.value;
    formValue.dateOfIncorporation = moment(
      formValue.dateOfIncorporation
    ).format('YYYY-MM-DD');
    if (this.nonIndividualOwnerInfoForm.invalid) {
      this.nonIndividualOwnerInfoForm.markAllAsTouched();
      const controls = this.nonIndividualOwnerInfoForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          const invalidControl = this.el.nativeElement.querySelector(
            '[formcontrolname="' + name + '"]'
          );
          invalidControl.focus();
        }
      }

      return;
    } else if (
      this.nonIndividualOwnerInfoForm.valid &&
      !this.panErrorMessage &&
      this.ownerNameLength >= this.ownerName?.rangeLowerValue
    ) {
      this.previewNonIndOwnerAndRegister(formValue);
    }
  }

  previewOwnerAndRegister(formValue) {
    const dialogRef = this.dialog.open(RegistrationPreviewComponent, {
      data: {
        ownerData: this.ownerInfoForm.getRawValue(),
        village: this.villageSelected,
        tehsil: this.tehsilList[0].tehsilName,
        distt: this.districtList[0].districtName,
        state: this.stateList[0].stateName,
        villageInstType: this.selectedVillageInstType,
        villageInstname: this.selectedVillageInstName,
        agencyName: this.selectedAgency,
        ownerDob: formValue.ownerDateOfBirth,
        selectedCategory: this.categorySelected,
      },
      width: '500px',
      height: '100vh',
      panelClass: 'custom-dialog-container',
      position: {
        right: '0px',
        top: '0px',
      },
    });
    dialogRef.afterClosed().subscribe((isReg?: boolean) => {
      if (isReg) {
        this.isLoadingSpinner = true;
        const formValue = this.ownerInfoForm.value;
        formValue.ownerMobileNo = encryptText(formValue.ownerMobileNo);
        formValue.aadhaarNumber = encryptText(formValue.aadhaarNumber);
        formValue.ownerDateOfBirth = encryptText(formValue.ownerDateOfBirth);
        this.ownerDS.registerOwnerDetails(this.ownerInfoForm.value).subscribe(
          (data: RegisterOwner) => {
            this.isLoadingSpinner = false;
            this.ownerData = data;
            this.openOtpDialog('registration');
          },
          (error: ErrorMessage) => {
            this.isLoadingSpinner = false;
            if (error.error) {
              let errorObj = error.error;
              if ((errorObj as Error).errorCode == 1061) {
                this.dialog
                  .open(OwnerResponseDialogComponent, {
                    data: {
                      title:
                        this.translatePipe.transform('animalDetails.warning') +
                        '!',
                      message:
                        this.translatePipe.transform(
                          'animalDetails.owner_similar_name'
                        ) + '!',
                      primaryBtnText: this.translatePipe.transform(
                        'animalDetails.register_anyWay'
                      ),
                      secondaryBtnText:
                        this.translatePipe.transform('common.cancel'),
                    },
                  })
                  .afterClosed()
                  .subscribe((res: boolean) => {
                    if (res) {
                      this.isLoadingSpinner = true;
                      let ownerData = JSON.parse(
                        JSON.stringify(this.ownerInfoForm.value)
                      );
                      ownerData.ownerMobileNo = encryptText(
                        ownerData.ownerMobileNo
                      );
                      ownerData.aadhaarNumber = encryptText(
                        ownerData.aadhaarNumber
                      );
                      ownerData.ownerDateOfBirth = encryptText(
                        ownerData.ownerDateOfBirth
                      );
                      ownerData['invalidateUuid'] = true;
                      this.ownerDS.registerOwnerDetails(ownerData).subscribe(
                        (data) => {
                          this.isLoadingSpinner = false;
                          this.ownerData = data;
                          this.openOtpDialog('registration');
                        },
                        (error) => {
                          this.isLoadingSpinner = false;
                        }
                      );
                    }
                  });
              }
            }
          }
        );
      } else {
      }
    });
  }

  previewNonIndOwnerAndRegister(formValue) {
    const dialogRef = this.dialog.open(RegistrationPreviewComponent, {
      data: {
        ownerData: this.nonIndividualOwnerInfoForm.getRawValue(),
        village: this.villageSelected,
        tehsil: this.tehsilList[0].tehsilName,
        distt: this.districtList[0].districtName,
        state: this.stateList[0].stateName,
        villageInstType: this.selectedVillageInstType,
        villageInstname: this.selectedVillageInstName,
        agencyName: this.selectedAgency,
        dateOfIncorporation: formValue.dateOfIncorporation,
        selectedCategory: this.typeCategorySelected,
      },
      width: '500px',
      height: '100vh',
      panelClass: 'custom-dialog-container',
      position: {
        right: '0px',
        top: '0px',
      },
    });
    dialogRef.afterClosed().subscribe((isReg?: boolean) => {
      if (isReg) {
        this.isLoadingSpinner = true;
        const formValue = this.nonIndividualOwnerInfoForm.value;
        formValue.ownerMobileNo = encryptText(formValue.ownerMobileNo);
        formValue.panNumber = encryptText(formValue.panNumber);
        formValue.dateOfIncorporation = encryptText(
          formValue.dateOfIncorporation
        );
        this.ownerDS
          .registerNonIndividualOwnerDetails(
            this.nonIndividualOwnerInfoForm.value
          )
          .subscribe(
            (data: RegisterOwner) => {
              this.isLoadingSpinner = false;
              this.ownerData = data;
              this.openOtpDialog('registration');
            },
            (error: ErrorMessage) => {
              this.isLoadingSpinner = false;
              if (error.error) {
                let errorObj = error.error;
                if ((errorObj as Error).errorCode == 1061) {
                  this.dialog
                    .open(OwnerResponseDialogComponent, {
                      data: {
                        title: this.translatePipe.transform(
                          'animalDetails.warning' + '!'
                        ),
                        message: this.translatePipe.transform(
                          'animalDetails.owner_similar_name' + '!'
                        ),
                        primaryBtnText: this.translatePipe.transform(
                          'animalDetails.register_anyWay'
                        ),
                        secondaryBtnText:
                          this.translatePipe.transform('common.cancel'),
                      },
                    })
                    .afterClosed()
                    .subscribe((res: boolean) => {
                      if (res) {
                        this.isLoadingSpinner = true;
                        let ownerData = JSON.parse(
                          JSON.stringify(this.nonIndividualOwnerInfoForm.value)
                        );
                        ownerData.ownerMobileNo = encryptText(
                          ownerData.ownerMobileNo
                        );
                        ownerData.panNumber = encryptText(ownerData.panNumber);
                        ownerData.dateOfIncorporation = encryptText(
                          ownerData.dateOfIncorporation
                        );
                        // ownerData.aadhaarNumber = encryptText(ownerData.aadhaarNumber);
                        // ownerData.ownerDateOfBirth = encryptText(
                        //   ownerData.ownerDateOfBirth
                        // );
                        // ownerData['invalidateUuid'] = true;
                        this.ownerDS
                          .registerNonIndividualOwnerDetails(ownerData)
                          .subscribe(
                            (data) => {
                              this.isLoadingSpinner = false;
                              this.ownerData = data;
                              this.openOtpDialog('registration');
                            },
                            (error) => {
                              this.isLoadingSpinner = false;
                            }
                          );
                      }
                    });
                }
              }
            }
          );
      } else {
      }
    });
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

  passOwnerData() {
    this.route.navigateByUrl('/dashboard/animal/addanimal');
    sessionStorage.setItem('ownerData', JSON.stringify(this.ownerDetailsByID));
  }

  onSelectingVillage(village: VillageList) {
    this.isLoadingSpinner = true;
    this.tehsilList = [];
    this.districtList = [];
    this.stateList = [];
    // ownerAddressPincode: ['test', PinCodeValidation]
    if (village) {
      const selectedRegion = this.addressList.filter((value) => {
        return value.villageCd == village.villageCode;
      });
      this.villageSelected = selectedRegion[0].villageName;
      this.populateAddressDropdowns(selectedRegion, true);
      this.isLoadingSpinner = false;
    } else {
      this.ownerInfoForm.patchValue({
        ownerAddressTehsilCd: '',
        ownerAddressDistrictCd: '',
        ownerAddressStateCd: '',
        ownerAddressPincode: '',
      });
      this.nonIndividualOwnerInfoForm.patchValue({
        ownerAddressTehsilCd: '',
        ownerAddressDistrictCd: '',
        ownerAddressStateCd: '',
        ownerAddressPincode: '',
      });
      this.isLoadingSpinner = false;
    }
  }

  populateAddressDropdowns(
    addressList: FLWVillages[],
    fullAddressFlag?: boolean
  ) {
    for (let obj of addressList) {
      if (fullAddressFlag) {
        this.stateList.push({
          stateCode: obj.stateCd,
          stateName: obj.stateName,
        });
        this.districtList.push({
          districtCode: obj.districtCd,
          districtName: obj.districtName,
        });
        this.tehsilList.push({
          tehsilCode: obj.tehsilCd,
          tehsilName: obj.tehsilName,
        });
        this.ownerInfoForm.patchValue({
          ownerAddressStateCd: obj.stateCd,
          ownerAddressDistrictCd: obj.districtCd,
          ownerAddressTehsilCd: obj.tehsilCd,
          ownerAddressPincode: obj.pinCd,
        });
        this.nonIndividualOwnerInfoForm.patchValue({
          ownerAddressStateCd: obj.stateCd,
          ownerAddressDistrictCd: obj.districtCd,
          ownerAddressTehsilCd: obj.tehsilCd,
          ownerAddressPincode: obj.pinCd,
        });
      } else {
        // populating village

        let crrVillage = {
          villageCode: obj.villageCd,
          villageName: obj.villageName,
        };
        if (
          !this.villageList.some(
            (village) => village.villageCode == crrVillage.villageCode
          )
        )
          this.villageList = [...this.villageList, crrVillage];
      }
    }
  }

  onSelectingVillageInstName(event) {
    this.selectedVillageInstName = event?.villageInstitutionName;
    if (this.selectedVillageInstName) {
      this.affiliationData.filter((crrData) => {
        if (crrData.villageInstitutionCd == event.villageInstitutionCd) {
          this.agencyList.push({
            cd: crrData.agencyCd,
            value: crrData.agencyName,
          });
          this.ownerInfoForm.patchValue({ agencyName: crrData.agencyCd });
          this.nonIndividualOwnerInfoForm.patchValue({
            agencyName: crrData.agencyCd,
          });
          this.selectedAgency = crrData.agencyName;
          return;
        }
      });
    } else {
      this.ownerInfoForm.patchValue({ agencyName: '' });
      this.nonIndividualOwnerInfoForm.patchValue({ agencyName: '' });
    }
  }

  // findInvalidControls() {
  //   const controls = this.ownerInfoForm.controls;
  //   for (const name in controls) {
  //     if (controls[name].invalid) {
  //       console.log('Invalid COntrols', name);
  //     }
  //   }
  // }

  countCharacters(enteredString: String, param?: String) {
    const len = enteredString.trim().replace(/\s+/g, ' ').length;
    if (param != undefined && param == 'fatherName') {
      this.fatherNameLength = len;
    } else {
      this.ownerNameLength = len;
    }
  }

  loadRecordsForAgency() {
    this.villageInstitutionNames = [];
    this.institutionList = [];
    this.isLoadingSpinner = true;
    this.ownerDS.getRecordsForAgency().subscribe((data) => {
      this.affiliationData = data;
      this.filterAffiliationData(this.affiliationData);
      this.isLoadingSpinner = false;
    });
  }

  filterAffiliationData(affiliationData: AffiliationData[]) {
    if (Array.isArray(affiliationData)) {
      affiliationData?.filter((crrVal) => {
        let crrType = {
          cd: crrVal.villageInstitutionType,
          value: crrVal.villageInstitutionTypeName,
        };
        if (!this.institutionList.some((inst) => inst.cd == crrType.cd)) {
          this.institutionList.push(crrType);
        }
      });
    }
  }

  avoidSpecialChar(event: any) {
    let key;
    key = event.charCode;
    return (key > 47 && key < 58) || key == 45 || key == 46;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onSelectingSearchBy(event: Event) {
    this.searchBy = (event.target as HTMLInputElement)?.value;
    this.resetForm();
    this.resetNonIndividualForm();
    this.animalDetailsSection = false;
    this.ownerDetailsSection = false;
    this.isOrgTabVisible = false;
    this.isTableVisible = false;
    this.errorMessage = '';
    this.animalPageIndex = 0;
    this.animalPageSize = 10;
    this.animalsCount = 0;
    if (this.searchBy == 'individual') {
      this.individualOwner = true;
      this.nonIndividualOwner = false;
    } else {
      this.individualOwner = false;
      this.nonIndividualOwner = true;
    }

    // this.isAnimalTabVisible = false;
    // this.isOwnerTabVisible = false;
    // this.isOrgTabVisible = false;
  }

  onSelectingRadioButtonForNonIndividual(event: Event) {
    this.villageInstitutionNames = [];
    this.nonIndividualOwnerInfoForm.get('agencyName').disable();
    this.loadRecordsForAgency();
    if ((event.target as HTMLInputElement)?.value == 'true') {
      this.nonIndividualOwnerInfoForm
        .get('villageInstitutionType')
        ?.addValidators([Validators.required]);
      this.nonIndividualOwnerInfoForm
        .get('villageInstitutionCode')
        ?.addValidators([Validators.required]);
      this.nonIndividualOwnerInfoForm
        .get('membershipNumber')
        ?.addValidators([Validators.required, MembershipNumberValidation]);
    } else {
      this.nonIndividualOwnerInfoForm
        .get('villageInstitutionType')
        ?.clearValidators();
      this.nonIndividualOwnerInfoForm
        .get('villageInstitutionCode')
        ?.clearValidators();
      this.nonIndividualOwnerInfoForm
        .get('membershipNumber')
        ?.clearValidators();
      this.nonIndividualOwnerInfoForm
        .get('villageInstitutionType')
        ?.markAsUntouched();
      this.nonIndividualOwnerInfoForm
        .get('villageInstitutionCode')
        ?.markAsUntouched();
      this.nonIndividualOwnerInfoForm
        .get('membershipNumber')
        ?.markAsUntouched();
      this.nonIndividualOwnerInfoForm.patchValue({
        villageInstitutionType: '',
        villageInstitutionCode: null,
        membershipNumber: '',
        agencyName: '',
      });
    }
    this.nonIndividualOwnerInfoForm
      .get('villageInstitutionType')
      ?.updateValueAndValidity();
    this.nonIndividualOwnerInfoForm
      .get('villageInstitutionCode')
      ?.updateValueAndValidity();
    this.nonIndividualOwnerInfoForm
      .get('membershipNumber')
      ?.updateValueAndValidity();
  }

  get nonIndividualownerInfo() {
    return this.nonIndividualOwnerInfoForm.controls;
  }

  resetNonIndividualForm() {
    this.nonIndividualOwnerInfoForm.reset({
      panNumber: '',
      affiliatedAgencyUnionOrPc: 'false',
      ownerAddressCityVillageCd: null,
      ownerAddressTehsilCd: '',
      ownerAddressDistrictCd: '',
      ownerAddressStateCd: '',
      villageInstitutionType: '',
      ownerName: '',
      agencyName: '',
      isCategoryVerified: false,
      ownerTypeCategoryCd: '',
    });
  }
}
