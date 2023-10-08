import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { CommonData } from 'src/app/features/animal-management/owner-registration/models-owner-reg/common-data.model';
import { OwnerData } from 'src/app/features/animal-management/owner-registration/models-owner-reg/get-owner-details.model';
import { OwnerDetails } from 'src/app/shared/shareService/model/owner.detail';
import { RegisterOwner } from 'src/app/features/animal-management/owner-registration/models-owner-reg/register-owner.model';
import { InstitutionName } from 'src/app/features/animal-management/owner-registration/models-owner-reg/village-institution-name';
import { OwnerDetailsService } from 'src/app/features/animal-management/owner-registration/owner-details.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { MasterConfig } from 'src/app/shared/master.config';
import { OtpDialogComponent } from 'src/app/shared/otp-dialog/otp-dialog.component';
import { CountryService } from 'src/app/shared/shareService/country-service.service';
import { DistrictList } from 'src/app/shared/shareService/model/district.model';
import { StateList } from 'src/app/shared/shareService/model/state.model';
import { TehsilList } from 'src/app/shared/shareService/model/tehsil.model';
import { VillageList } from 'src/app/shared/shareService/model/village.model';
import { AnimalManagementService } from '../../animal-management/animal-registration/animal-management.service';
import { ViewOrganizationComponent } from '../../animal-management/animal-registration/view-organization/view-organization.component';
import { EditOwnerDetailsComponent } from '../../animal-management/owner-registration/edit-owner-details/edit-owner-details.component';
import { AnimalTreatmentService } from '../animal-treatment/animal-treatment.service';
import { HealthService } from '../health.service';
import { FirstAidService } from './first-aid.service';
import { TagIdSearchValidation } from 'src/app/shared/utility/validation';
import {
  OwnerType,
  SearchValue,
} from 'src/app/shared/common-search-box/common-search-box.component';
import { AnimalMasterList } from '../animal-treatment/models/master.model';

export interface AnimalData {
  species: string;
  sex: string;
  ageInMonths: number | string;
  tagId: number;
  pregnancyStatus: string;
  milkingStatus: string;
  breed: string;
  animalStatusCd?: number;
}
@Component({
  selector: 'app-first-aid',
  templateUrl: './first-aid.component.html',
  styleUrls: ['./first-aid.component.css'],
  providers: [TranslatePipe],
})
export class FirstAidComponent implements OnInit {
  masterConfig = MasterConfig;
  tableDataSource = new MatTableDataSource<any>();
  searchBy: string = 'individual';
  submitted = false;
  isAnimalTabVisible: boolean = false;
  individualOwner: boolean = true;
  stateList: StateList[] = [];
  isTableVisible: boolean = false;
  districtList!: DistrictList[];
  tehsilList: TehsilList[] = [];
  villageList: VillageList[] = [];
  langData: string = '';
  ownerInfoForm!: FormGroup;
  ownerDetailsSection: boolean = false;
  ownerRegistrationFlag: boolean = false;
  ownerTypeCd = OwnerType.individual;
  animalDetailsSection: boolean = false;
  additionalDetailsCounter: number = 0;
  errorMessage: string = '';
  searchForm!: FormGroup;
  cities: string[] = [];
  ownerDetailsRecord: OwnerData[] = [];
  ownerDetailsByID!: any;
  clickedOwnerName: string = '';
  clickedOwnerMobNo: number = 0;
  clickedOwnerFather: string = '';
  currentDate: string = '';
  isLoadingSpinner: boolean = false;
  ownerData!: RegisterOwner;
  ownerDetailsLength: number = 0;
  institutionList: CommonData[] = [];
  villageInstitutionNames: InstitutionName[] = [];
  private paginator!: MatPaginator;
  private searchOwnerPaginator!: MatPaginator;
  private sort!: MatSort;
  selectedAnimalId = null;
  ownerId?: number;
  noOfActiveAnimals = 0;
  selectedAnimal: AnimalData;
  tableDataSourceOwner = new MatTableDataSource<OwnerData>();
  ownerSearchResult: string[] = [
    'sNo',
    'ownerId',
    'ownerName',
    'ownerMobileNo',
    'gender',
    'ownerDateOfBirth',
    'villageName',
    // 'arrow',
  ];
  animalKeys: string[] = [
    'taggingDate',
    'tagId',
    'species',
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
    'pregnancyStatus',
    'milkingStatus',
    'animalCategory',
  ];
  displayedColumns: string[] = [
    'radio',
    'sr_no',
    'tagId',
    'category',
    'animalCategory',
    'breedDesc',
    'sex',
    'ageInMonths',
    'pregnancyStatus',
    'milkingStatus',
    'status',
    'history',
  ];
  Finaldata: { selectedAnimalId: any; 3: any };
  showDraft = false;
  searchObj: SearchValue;
  animalPageIndex = 0;
  animalPageSize = 5;
  animalsCount = 0;
  constructor(
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private countryService: CountryService,
    private ownerDS: OwnerDetailsService,
    private router: Router,
    private route: ActivatedRoute,
    private animalMS: AnimalManagementService,
    private fristService: FirstAidService,
    private treatmentService: AnimalTreatmentService,
    private healthService: HealthService,
    private readonly translateService: TranslateService,
    private translatePipe: TranslatePipe
  ) { }

  // @ViewChild(MatSort) set matSort(ms: MatSort) {
  //   this.sort = ms;
  //   this.setDataSourceAttributes();
  // }
  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.tableDataSource.sort = ms;
  }
  @ViewChild('paginatorRef') paginatorRef: MatPaginator;

  // @ViewChild('SearchOwnerpaginatorRef') set ownerMatPaginator(
  //   mp: MatPaginator
  // ) {
  //   this.searchOwnerPaginator = mp;
  //   this.setDataSourceAttributes();
  // }

  ngOnInit(): void {
    // this.searchForm = this._formBuilder.group({
    //   optRadio: [this.searchBy],
    //   searchValue: ['', [Validators.required, TagIdSearchValidation]],
    // });
    this.route.queryParams.subscribe((params) => {
      if (params['ownerId']) {
        this.ownerId = params['ownerId'];
        this.showOwnerDetails(params['ownerId']);
      }
    });
  }

  onPageAnimalPageChange(event: PageEvent) {
    this.animalPageIndex = event.pageIndex;
    this.animalPageSize = event.pageSize;
    this.showOwnerDetails(this.ownerDetailsByID?.ownerId);
  }

  // setDataSourceAttributes() {
  //   this.tableDataSource.paginator = this.paginator;
  //   this.tableDataSource.sort = this.sort;

  //   // Search Owner List
  //   this.tableDataSourceOwner.paginator = this.searchOwnerPaginator;
  //   this.tableDataSourceOwner.sort = this.sort;
  // }

  searchInOwners(event: Event) {
    const filterOwnerValue = (event.target as HTMLInputElement).value;
    this.tableDataSourceOwner.filter = filterOwnerValue.trim().toLowerCase();
    if (this.tableDataSourceOwner.paginator) {
      this.tableDataSourceOwner.paginator.firstPage();
    }
  }

  calculateAge(months: number) {
    const year = Math.floor(months / 12);
    const month = months % 12;
    return String(year) + 'Y' + ' ' + String(month) + 'M';
  }

  searchResults(searchObj: SearchValue) {
    this.resetValue(false);
    this.searchObj = searchObj;

    this.isLoadingSpinner = true;
    this.errorMessage = '';

    if (
      !isNaN(+this.searchObj.searchValue) &&
      (this.searchObj.searchValue.length === 8 ||
        this.searchObj.searchValue.length === 11 ||
        this.searchObj.searchValue.length === 12)
    ) {
      this.getDetailsByTagID(this.searchObj.searchValue);
    } else {
      this.ownerDS
        .getOwnerByMobile(
          this.searchObj.searchValue,
          searchObj?.ownerType === OwnerType.nonIndividual
        )
        .subscribe(
          (res) => {
            this.isLoadingSpinner = false;

            if (!(res instanceof Array) || res?.length === 0) {
              this.healthService.handleError({
                title: this.translatePipe.transform('common.info_label'),
                message: this.translatePipe.transform(
                  'animalTreatmentSurgery.no_data_found_please_register_the_owner'
                ),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
              });
              return;
            }
            this.showDraft = false;

            if (res.length === 1) {
              this.showOwnerDetails(<any>res[0]?.ownerId);
            } else {
              this.isTableVisible = true;
              this.ownerDetailsRecord = res;
            }
          },
          () => (this.isLoadingSpinner = false)
        );
    }
  }

  showOwnerDetails(ownerId: number | string) {
    this.isLoadingSpinner = true;
    this.healthService
      .getOwnerDetailsPageWise(
        ownerId,
        this.searchObj.ownerType,
        this.animalPageIndex,
        this.animalPageSize
      )
      .subscribe(
        (res) => {
          this.ownerDetailsByID = res;
          this.isTableVisible = false;
          this.ownerDetailsSection = true;
          this.animalDetailsSection = true;
          this.tableDataSource.data = res?.animalsList ?? [];
          this.isLoadingSpinner = false;
          this.animalsCount = res.animalsCount;
        },
        () => (this.isLoadingSpinner = false)
      );
  }

  getDetailsByTagID(searchValue: string) {
    this.noOfActiveAnimals = 0;
    this.isLoadingSpinner = true;
    this.healthService.getDetailsByTagID(searchValue.trim()).subscribe(
      (searchResult: any) => {
        this.isLoadingSpinner = false;
        this.ownerDetailsByID = searchResult.ownerDetails;
        var animalList: any = <AnimalMasterList>{};
        for (let key of this.animalKeys) {
          animalList[key] = searchResult[key];
        }
        if (searchResult?.animalId) {
          if (
            searchResult.isLoanOnAnimal &&
            !searchResult?.animalStatus?.includes('Sold')
          ) {
            this.noOfActiveAnimals += 1;
          }
        }
        if (animalList.ageInMonths) {
          animalList.ageInMonths = this.getWords(animalList.ageInMonths);
        } else if (animalList.ageInDays) {
          animalList.ageInMonths = `${animalList.ageInDays}D`;
        }
        if (searchResult.ownerDetails.ownerId) {
          this.ownerTypeCd = searchResult?.ownerDetails.ownerTypeCd;
          this.ownerDetailsSection = true;
          this.isAnimalTabVisible = true;
        } else {
          this.ownerTypeCd = OwnerType.organization;
          this.ownerDetailsSection = true;

          this.isAnimalTabVisible = true;
        }
        animalList['breedDesc'] =
          animalList.breedAndExoticLevels &&
            animalList.breedAndExoticLevels.length > 1
            ? 'Cross Breed'
            : animalList.breedAndExoticLevels &&
              animalList.breedAndExoticLevels.length
              ? animalList.breedAndExoticLevels[0].breed
              : 'NA';
        this.tableDataSource.data = [animalList];
        this.isTableVisible = false;
        this.ownerDetailsSection = true;
        this.animalDetailsSection = true;
        this.isAnimalTabVisible = true;
      },
      (error) => {
        this.isLoadingSpinner = false;
        this.tableDataSource.data = [];
        this.isTableVisible = false;
        this.ownerDetailsSection = false;
        this.animalDetailsSection = false;
        this.isAnimalTabVisible = false;
      }
    );
  }

  getWords(monthCount: any) {
    return monthCount ? this.treatmentService.getWords(monthCount) : null;
  }

  // getOwnerDetailsByID(ownerId: string) {
  //   if (ownerId == null) {
  //     return;
  //   }
  //   this.isLoadingSpinner = true;
  //   this.ownerDS.getOwnerByOwnerID(ownerId).subscribe(
  //     (data) => {
  //       this.ownerDetailsByID = data;
  //       this.isLoadingSpinner = false;
  //       if (
  //         this.ownerDetailsByID.animalsList &&
  //         this.ownerDetailsByID.animalsList.length
  //       ) {
  //         for (let animal of this.ownerDetailsByID.animalsList) {
  //           if (animal.ageInMonths) {
  //             animal.ageInMonths = this.getWords(animal.ageInMonths);
  //           } else if (animal.ageInDays) {
  //             animal.ageInMonths = `${animal.ageInDays}D`;
  //           }

  //           animal['breedDesc'] =
  //             animal.breedAndExoticLevels &&
  //               animal.breedAndExoticLevels.length > 1
  //               ? 'Cross Breed'
  //               : animal.breedAndExoticLevels &&
  //                 animal.breedAndExoticLevels.length
  //                 ? animal.breedAndExoticLevels[0].breed
  //                 : 'NA';
  //         }
  //       }
  //       this.tableDataSource.data = this.ownerDetailsByID.animalsList;
  //       this.clickedOwnerName =
  //         this.ownerDetailsByID.ownerFirstName +
  //         ' ' +
  //         this.ownerDetailsByID?.ownerMiddleName +
  //         ' ' +
  //         this.ownerDetailsByID.ownerLastName;
  //       this.clickedOwnerMobNo = this.ownerDetailsByID?.ownerMobileNo;

  //       this.isTableVisible = false;
  //       this.ownerDetailsSection = true;
  //       this.animalDetailsSection = true;
  //     },
  //     () => {
  //       this.isLoadingSpinner = false;
  //       this.tableDataSource.data = [];
  //       this.isTableVisible = false;
  //       this.ownerDetailsSection = false;
  //       this.animalDetailsSection = false;
  //       this.isAnimalTabVisible = false;
  //     }
  //   );
  // }

  checkSearchValidity() {
    this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: this.translateService.instant('common.info_label'),
        message: this.translateService.instant('errorMsg.no_owner_found'),
        primaryBtnText: this.translateService.instant('common.ok_string'),
        icon: 'assets/images/info.svg',
      },
      panelClass: 'common-info-dialog',
    });
    this.searchForm.reset();
    this.isTableVisible = false;
    this.ownerDetailsSection = false;
    this.animalDetailsSection = false;
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
          'Owner Id:' +
          (actionPerformed == 'registration'
            ? String(this.ownerData?.ownerId)
            : String(this.ownerDetailsByID?.ownerId)),
        heading:
          actionPerformed == 'registration'
            ? this.translatePipe.transform(
              'animalTreatmentSurgery.owner_registered_successfully'
            )
            : this.translatePipe.transform('animalTreatmentSurgery.owner_ver'),
        message: this.translatePipe.transform(
          'animalTreatmentSurgery.activate_account'
        ),
        link: '/dashboard/animal-treatment-surgery',
        name: 'ownerRegistrationSuccess',
        otp: '1234',
        ownerMobileNo:
          actionPerformed == 'registration'
            ? this.ownerInfoForm.get('ownerMobileNo')?.value
            : String(this.ownerDetailsByID?.ownerMobileNo),
      },
      width: '500px',
    });
    dialogRef.componentInstance.onClosed.subscribe(() => {
      if (this.ownerDS.getOwnerRegFlag()) {
        this.showOwnerDetails(
          actionPerformed == 'registration'
            ? this.ownerData?.ownerId
            : this.ownerDetailsByID?.ownerId
        );
        this.ownerDS.setOwnerRegFlag(false);
      }
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (this.ownerDS.getOwnerRegFlag()) {
        this.showOwnerDetails(
          actionPerformed == 'registration'
            ? this.ownerData?.ownerId
            : this.ownerDetailsByID?.ownerId
        );
        this.ownerDS.setOwnerRegFlag(false);
      }
    });
  }

  formatDate(date) {
    if (date) {
      return moment(new Date(date)).format('DD/MM/YYYY');
    }
    return null;
  }

  dateFormatChange(date: String) {
    date = date.substring(0, 10);
    return date.split('-').reverse().join('/');
  }

  // getWords(monthCount) {
  //   return this.treatmentService.getWords(monthCount);
  // }
  searchInTable(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
    if (this.tableDataSource.paginator) {
      this.tableDataSource.paginator.firstPage();
    }
  }
  resetValue(resetAll = true) {
    // this.searchForm.reset();
    this.ownerRegistrationFlag = false;
    this.ownerDetailsSection = false;
    this.animalDetailsSection = false;
    this.isAnimalTabVisible = false;
    this.isTableVisible = false;
    this.errorMessage = '';
    this.ownerDetailsRecord = [];
    this.tableDataSource.paginator = null;
    this.animalPageIndex = 0;
    this.animalPageSize = 5;
    this.animalsCount = 0;
    if (resetAll) {
      this.ownerTypeCd = OwnerType.individual;
      this.router.navigate(['.'], { relativeTo: this.route });
    }
  }

  get ownerType() {
    return OwnerType;
  }

  animalSelected(event: Event, animal: AnimalData) {
    this.selectedAnimalId = +(event.target as HTMLSelectElement).value;
    this.selectedAnimal = animal;
  }

  firstAidSubmit(section, queryParams) {
    let title = '';
    if (
      !this.ownerDetailsByID.orgType &&
      this.ownerDetailsByID.registrationStatus != '1'
    ) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'firstAid.new_transaction_cannot_be_created'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          icon: 'assets/images/info.svg',
        },
        panelClass: 'common-info-dialog',
      });
    } else {
      switch (this.selectedAnimal.animalStatusCd) {
        case 1:
          if (this.selectedAnimalId) {
            sessionStorage.setItem(
              'animalID',
              JSON.stringify(this.selectedAnimalId)
            );
          }
          this.router.navigate([
            '/dashboard/first-aid/add-first-aid',
            this.selectedAnimalId,
          ]);

          return;

        case 2:
          title = this.translatePipe.transform(
            'animalTreatmentSurgery.animal_is_dead'
          );
          break;
        default:
          title = this.translatePipe.transform(
            'animalTreatmentSurgery.animal_is_not_active'
          );
          break;
      }

      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'firstAid.new_transaction_cannot_be_created'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          icon: 'assets/images/info.svg',
        },
        panelClass: 'common-info-dialog',
      });
    }
  }

  editOwnerDialog(isView?: boolean) {
    const dialogRef = this.dialog.open(EditOwnerDetailsComponent, {
      data: {
        ownerData: this.ownerDetailsByID,
        redirectLink: '/dashboard/animal-treatment-surgery',
        isView: isView ? true : false,
      },
      width: '500px',
      height: '100vh',
      panelClass: 'custom-dialog-container',
      position: {
        right: '0px',
        top: '0px',
      },
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

  viewAnimalHistory(element) {
    this.healthService.viewAnimalHistory(element, 5);
  }
}
