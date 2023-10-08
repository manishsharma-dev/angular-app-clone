import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { filter, switchMap } from 'rxjs/operators';
import { AddDetailsDialogComponent } from 'src/app/features/animal-management/owner-registration/add-details-dialog/add-details-dialog.component';
import { EditOwnerDetailsComponent } from 'src/app/features/animal-management/owner-registration/edit-owner-details/edit-owner-details.component';
import { CommonData } from 'src/app/features/animal-management/owner-registration/models-owner-reg/common-data.model';
import { RegisterOwner } from 'src/app/features/animal-management/owner-registration/models-owner-reg/register-owner.model';
import { InstitutionName } from 'src/app/features/animal-management/owner-registration/models-owner-reg/village-institution-name';
import { OwnerDetailsService } from 'src/app/features/animal-management/owner-registration/owner-details.service';
import {
  OwnerType,
  SearchValue,
} from 'src/app/shared/common-search-box/common-search-box.component';
import { MasterConfig } from 'src/app/shared/master.config';
import { OtpDialogComponent } from 'src/app/shared/otp-dialog/otp-dialog.component';
import { OwnerDetails } from 'src/app/shared/shareService/model/owner.detail';
import { TehsilList } from 'src/app/shared/shareService/model/tehsil.model';
import { VillageList } from 'src/app/shared/shareService/model/village.model';
import { ViewOrganizationComponent } from '../../animal-management/animal-registration/view-organization/view-organization.component';
import { OwnerData } from '../../animal-management/owner-registration/models-owner-reg/get-owner-details.model';
import { HealthService } from '../health.service';
import { SaveInDraftResponse } from '../post-mortem/models/saveInDraftResponse.model';
import { TreatmentResponseDialogComponent } from '../treatment-response-dialog/treatment-response-dialog.component';
import { AnimalTreatmentService } from './animal-treatment.service';
import { AnimalMasterList } from './models/master.model';
import { BreadcrumbLink } from 'src/app/shared/common-breadcrumb/common-breadcrumb.component';

export interface AnimalData {
  species: string;
  sex: string;
  ageInMonths: number | string;
  tagId: number;
  pregnancyStatus: string;
  milkingStatus: string;
  breed: string;
  animalStatus?: string;
  animalStatusCd?: number;
  ownerId?: string;
}

@Component({
  selector: 'app-animal-treatment',
  templateUrl: './animal-treatment.component.html',
  styleUrls: ['./animal-treatment.component.css'],
  providers: [TranslatePipe],
})
export class AnimalTreatmentComponent implements OnInit {
  breadcrumbLinks: BreadcrumbLink[] = [
    { label: 'animalTreatmentSurgery.animal_health', link: '/dashboard' },
    {
      label: 'animalTreatmentSurgery.animal_treatment_surgery',
      // link: ['animal-treatment-surgery'],
    },
  ];

  masterConfig = MasterConfig;
  ownerTypeCd = OwnerType.individual;
  individualOwner: boolean = true;
  isTableVisible: boolean = false;
  tehsilList: TehsilList[] = [];
  villageList: VillageList[] = [];
  langData: string = '';
  isAnimalTabVisible: boolean = false;
  ownerInfoForm!: FormGroup;
  ownerDetailsSection: boolean = false;
  animalDetailsSection: boolean = false;
  additionalDetailsCounter: number = 0;
  errorMessage: string = '';
  cities: string[] = [];
  ownerDetailsRecord: any[] = [];
  ownerDetailsByID!: any;
  clickedOwnerName: string = '';
  clickedOwnerMobNo: number = 0;
  clickedOwnerFather: string = '';
  currentDate: string = '';
  ownerRegistrationFlag: boolean = false;
  isLoadingSpinner: boolean = false;
  ownerData!: RegisterOwner;
  ownerDetailsLength: number = 0;
  institutionList: CommonData[] = [];
  villageInstitutionNames: InstitutionName[] = [];
  selectedAnimalId: number = null;
  ownerId?: number;
  noOfActiveAnimals = 0;
  showDraft = false;
  draftColumns = ['#', 'tagId', 'creationDate', 'openDraft'];
  draftDataSource: SaveInDraftResponse[] = [];
  animalPageIndex = 0;
  animalPageSize = 5;
  animalsCount = 0;

  displayedColumns: string[] = [
    'radio',
    'tagId',
    'taggingDate',
    'species',
    'animalCategory',
    'breedDesc',
    'sex',
    'ageInMonths',
    'pregnancyStatus',
    'milkingStatus',
    'animalStatus',
    'history',
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
  tableDataSource = new MatTableDataSource<any>();
  selectedAnimal: AnimalData;
  isOwnerActive = true;
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
  tableDataSourceOwner = new MatTableDataSource<OwnerData>();
  searchObj: SearchValue;

  constructor(
    public dialog: MatDialog,
    private ownerDS: OwnerDetailsService,
    private treatmentService: AnimalTreatmentService,
    private router: Router,
    private route: ActivatedRoute,
    private healthService: HealthService,
    private translatePipe: TranslatePipe
  ) { }

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.tableDataSource.sort = ms;
  }

  @ViewChild('animalPaginator') animalPaginator: MatPaginator;

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        filter((params) => params.keys.length === 0),
        switchMap(() => {
          this.isLoadingSpinner = true;
          return this.healthService.getDraftTransactionDetails();
        })
      )
      .subscribe(
        (res) => {
          this.isLoadingSpinner = false;
          if (this.healthService.isErrorResponse(res)) return;
          this.showDraft = true;
          this.draftDataSource = res;
        },
        (err) => (this.isLoadingSpinner = false)
      );
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
  //             animal.breedAndExoticLevels.length > 1
  //               ? 'Cross Breed'
  //               : animal.breedAndExoticLevels &&
  //                 animal.breedAndExoticLevels.length
  //               ? animal.breedAndExoticLevels[0].breed
  //               : 'NA';
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
        this.animalsCount = 1;
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

  animalSelected(event: Event, animal: AnimalData) {
    this.selectedAnimalId = +(event.target as HTMLSelectElement).value;
    this.selectedAnimal = animal;
  }

  routingNewCase(section, queryParams) {
    let title = '';
    if (
      !this.ownerDetailsByID.orgType &&
      this.ownerDetailsByID.registrationStatus != '1'
    ) {
      this.dialog.open(TreatmentResponseDialogComponent, {
        data: {
          title: this.translatePipe.transform('common.info_label'),
          icon: 'assets/images/info.svg',
          message: this.translatePipe.transform(
            'animalTreatmentSurgery.owner_is_not_active_new_transaction_cannot_be_created'
          ),
          primaryBtnText: this.translatePipe.transform('common.ok_string'),
        },
        panelClass: 'common-info-dialog',
        width: '500px',
      });
    } else {
      switch (this.selectedAnimal.animalStatusCd) {
        case 1:
          this.router.navigate(
            [`dashboard/animal-treatment-surgery/${section}`],
            {
              queryParams: queryParams,
            }
          );
          return;

        case 3:
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

      this.healthService.handleError({
        title,
        message: this.translatePipe.transform(
          'animalTreatmentSurgery.new_transaction_cannot_be_created'
        ),
        primaryBtnText: this.translatePipe.transform('common.ok_string'),
      });
    }
  }

  routingFollowup(section, route) {
    this.router.navigate([
      `dashboard/animal-treatment-surgery/${section}`,
      route,
    ]);
  }

  checkSearchValidity() {
    this.healthService.handleError({
      title: this.translatePipe.transform('common.info_label'),
      message: this.translatePipe.transform(
        'animalTreatmentSurgery.no_data_found_please_register_the_owner'
      ),
      primaryBtnText: this.translatePipe.transform('common.ok_string'),
    });
    this.isTableVisible = false;
    this.ownerDetailsSection = false;
    this.animalDetailsSection = false;
  }

  spaceRestict(event: KeyboardEvent) {
    if (
      ((event.target as HTMLInputElement)?.selectionStart === 0 &&
        event.code === 'Space') ||
      ((event.target as HTMLInputElement)?.selectionEnd === 10 &&
        event.code === 'Space')
    ) {
      event.preventDefault();
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
    this.healthService.viewAnimalHistory(element, 2);
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

  getToday(): string {
    return new Date(sessionStorage.getItem('serverCurrentDateTime'))
      .toISOString()
      .split('T')[0];
  }

  getPastDate(): string {
    var tempDate = new Date(sessionStorage.getItem('serverCurrentDateTime'));
    tempDate.setFullYear(tempDate.getFullYear() - 150);
    this.currentDate = tempDate.toISOString().split('T')[0];
    return this.currentDate;
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
      this.router.navigate(['.'], { relativeTo: this.route });
      this.ownerTypeCd = OwnerType.individual;
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
    return date.split('-').reverse().join('-');
  }

  getWords(monthCount: any) {
    return monthCount ? this.treatmentService.getWords(monthCount) : null;
  }

  formatDate(date: string) {
    if (date) {
      return moment(new Date(date)).format('DD/MM/YYYY');
    }
    return null;
  }

  getParsedDate(date: string) {
    return moment(date).format('LT') + ' ' + moment(date).format('DD/MM/YYYY');
  }

  onOpenDraft(draft: { tagId: number; draftId: number; animalId: number }) {
    this.router.navigate(['newcase'], {
      relativeTo: this.route,
      queryParams: { animalId: draft.animalId, loadDraft: true },
    });
  }

  searchInOwners(event: Event) {
    const filterOwnerValue = (event.target as HTMLInputElement).value;
    this.tableDataSourceOwner.filter = filterOwnerValue.trim().toLowerCase();
    if (this.tableDataSourceOwner.paginator) {
      this.tableDataSourceOwner.paginator.firstPage();
    }
  }

  onPageAnimalPageChange(event: PageEvent) {
    this.animalPageIndex = event.pageIndex;
    this.animalPageSize = event.pageSize;
    this.showOwnerDetails(this.ownerDetailsByID?.ownerId);
  }

  backToOwnerList() {
    this.selectedAnimal = null;
    this.tableDataSource.data = [];
    this.isAnimalTabVisible = false;
    this.ownerDetailsSection = false;
    this.animalDetailsSection = false;
    this.isTableVisible = true;
  }

  get ownerType() {
    return OwnerType;
  }
}
