import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { MasterConfig } from 'src/app/shared/master.config';
import { SnackBarMessage } from 'src/app/shared/snack-bar';
import { AnimalData } from '../../animal-health/animal-treatment/animal-treatment.component';
import { HealthService } from '../../animal-health/health.service';
import { TreatmentResponseDialogComponent } from '../../animal-health/treatment-response-dialog/treatment-response-dialog.component';
import { ViewOrganizationComponent } from '../../animal-management/animal-registration/view-organization/view-organization.component';
import { AddDetailsDialogComponent } from '../../animal-management/owner-registration/add-details-dialog/add-details-dialog.component';
import { EditOwnerDetailsComponent } from '../../animal-management/owner-registration/edit-owner-details/edit-owner-details.component';
import { CommonData } from '../../animal-management/owner-registration/models-owner-reg/common-data.model';
import { RegisterOwner } from '../../animal-management/owner-registration/models-owner-reg/register-owner.model';
import { InstitutionName } from '../../animal-management/owner-registration/models-owner-reg/village-institution-name';
import { OwnerDetailsService } from '../../animal-management/owner-registration/owner-details.service';
import { GrowthMonitoringService } from '../growth-monitoring/growth-monitoring.service';
import { SearchResponse } from '../growth-monitoring/models/search-response.model';
import { MilkSamplingService } from '../milk-sampling/milk-sampling.service';
import { SearchValidation } from '../search-validator';
import { GeneticReportComponent } from './genetic-report/genetic-report.component';
import { PrService } from '../pr.service';
import {
  OwnerType,
  SearchValue,
} from 'src/app/shared/common-search-box/common-search-box.component';

@Component({
  selector: 'app-genetic-analysis',
  templateUrl: './genetic-analysis.component.html',
  styleUrls: ['./genetic-analysis.component.css'],
  providers: [TranslatePipe],
})
export class GeneticAnalysisComponent implements OnInit {
  // orgsList = [];
  // isOwnerIndividual = true;
  masterConfig = MasterConfig;
  isOwnersListVisible: boolean = false;
  isOwnerDetailsSectionVisible: boolean = false;
  isAnimalListVisible: boolean = false;
  //districtList!: DistrictList[];
  isAnimalTabVisible: boolean = false;
  additionalDetailsCounter: number = 0;
  errorMessage: string = '';
  cities: string[] = [];
  ownerDataSource = new MatTableDataSource<SearchResponse>([]);
  ownerDetails!: SearchResponse;
  clickedOwnerName: string = '';
  clickedOwnerMobNo: number = 0;
  clickedOwnerFather: string = '';
  currentDate: string = '';
  isLoadingSpinner: boolean = false;
  ownerData!: RegisterOwner;
  ownerDetailsLength: number = 0;
  institutionList: CommonData[] = [];
  villageInstitutionNames: InstitutionName[] = [];
  selectedAnimalId: number = null;
  ownerId?: number;
  noOfActiveAnimals = 0;
  ownerType = OwnerType.individual;

  isSampleIdSearchTableVisible = false;
  displayedColumns: string[] = [
    'radio',
    '#',
    'tagId',
    'species',
    'animalCategory',
    'breedDesc',
    'ageInMonths',
    'pregnancyStatus',
    'milkingStatus',
    'currentLactationNo',
    'isElite',
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
    'animalStatusCd',
    'animalStatus',
    'animalId',
    'animalName',
    'pregnancyStatus',
    'milkingStatus',
    'animalCategory',
  ];
  animalListDataSource = new MatTableDataSource<any>();
  selectedAnimal: AnimalData;

  sampleList = [];

  ownerColumns = [
    'sNo',
    'ownerId',
    'ownerName',
    'ownerMobileNo',
    'ownerDateOfBirth',
    'ownerGender',
    'villageName',
    'arrow',
  ];
  searchValue: SearchValue;
  orgId: number = null;

  @ViewChild('paginatorRef') set paginator(p: MatPaginator) {
    this.ownerDataSource.paginator = p;
  }

  @ViewChild(MatSort) set sort(s: MatSort) {
    this.ownerDataSource.sort = s;
  }

  @ViewChild('animalPaginator') set animalListPaginator(p: MatPaginator) {
    this.animalListDataSource.paginator = p;
  }

  @ViewChild(MatSort) set animalListSort(s: MatSort) {
    this.animalListDataSource.sort = s;
  }

  constructor(
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private ownerDS: OwnerDetailsService,
    private router: Router,
    private route: ActivatedRoute,
    private milkSamplingService: MilkSamplingService,
    private healthService: HealthService,
    private _snackBar: MatSnackBar,
    private translatePipe: TranslatePipe,
    private gmService: GrowthMonitoringService,
    private prService: PrService
  ) {}

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.animalListDataSource.sort = ms;
  }

  @ViewChild('animalPaginator') set animalPaginator(mp: MatPaginator) {
    this.animalListDataSource.paginator = mp;
  }

  ngOnInit(): void {}

  showOwnerDetails(owner: SearchResponse | any) {
    this.ownerDetails = owner;
    this.isOwnersListVisible = false;
    this.isOwnerDetailsSectionVisible = true;
    this.isAnimalListVisible = true;
    this.ownerType = owner.ownerTypeCd ?? OwnerType.organization;
    if (this.ownerType === OwnerType.organization) {
      this.orgId = owner.orgId;
    }
    if (this.ownerDetails?.animalsList?.length) {
      this.animalListDataSource.data = this.ownerDetails?.animalsList.map(
        (animal) => ({
          ...animal,
          breedDesc: this.getAnimalBreed(animal),
        })
      );
    }
  }

  getAnimalBreed(animal: SearchResponse['animalsList'][0]) {
    return animal.breedAndExoticLevels && animal.breedAndExoticLevels.length > 1
      ? 'Cross Breed'
      : animal.breedAndExoticLevels && animal.breedAndExoticLevels.length
      ? animal.breedAndExoticLevels[0].breed
      : '--';
  }

  searchResults(searchValue: SearchValue) {
    this.resetValue(false);
    const regex = new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z0-9]+$');
    this.searchValue = searchValue;

    // sample id search
    if (
      regex.test(searchValue?.searchValue) &&
      searchValue?.searchValue?.length === 12
    ) {
      this.searchBySampleId(searchValue?.searchValue);
    } else {
      this.isLoadingSpinner = true;
      this.errorMessage = '';
      this.gmService.getGMSearchDetails(searchValue).subscribe(
        (data) => {
          this.ownerDataSource.data = data;

          if (this.ownerDataSource.data.length === 1) {
            this.showOwnerDetails(this.ownerDataSource.data[0]);
          } else if (this.ownerDataSource.data.length > 1) {
            this.isOwnersListVisible = true;
          }
          this.isLoadingSpinner = false;
        },
        (err) => (this.isLoadingSpinner = false)
      );
    }
  }

  getDetailsByTagID(searchValue: SearchValue) {
    this.noOfActiveAnimals = 0;
    this.isLoadingSpinner = true;
    this.gmService.getGMSearchDetails(searchValue).subscribe(
      (searchResult: any) => {
        this.isLoadingSpinner = false;
        if (!searchResult.length) {
          return;
        }
        if (!searchResult[0]?.animalsList?.length) {
          return;
        }
        this.ownerDetails = searchResult[0];
        var animalList: any = this.ownerDetails?.animalsList[0] ?? [];

        if (searchResult?.animalId) {
          if (
            searchResult.isLoanOnAnimal &&
            !searchResult?.animalStatus?.includes('Sold')
          ) {
            this.noOfActiveAnimals += 1;
          }
        }
        animalList.ageInMonths = this.getWords(animalList.ageInMonths);
        animalList['breedDesc'] =
          animalList.breedAndExoticLevels &&
          animalList.breedAndExoticLevels.length > 1
            ? 'Cross Breed'
            : animalList.breedAndExoticLevels &&
              animalList.breedAndExoticLevels.length
            ? animalList.breedAndExoticLevels[0].breed
            : '--';
        this.animalListDataSource.data = [animalList];
        this.isOwnersListVisible = false;
        this.isOwnerDetailsSectionVisible = true;
        this.isAnimalListVisible = true;
        this.isAnimalTabVisible = true;
      },
      (error) => {
        this.isLoadingSpinner = false;
        this.animalListDataSource.data = [];
        this.isOwnersListVisible = false;
        this.isOwnerDetailsSectionVisible = false;
        this.isAnimalListVisible = false;
        this.isAnimalTabVisible = false;

        this.isOwnersListVisible = false;
      }
    );
  }

  searchBySampleId(sampleId) {
    this.isLoadingSpinner = true;
    this.milkSamplingService.getMilkSampleDetails([sampleId]).subscribe(
      (res) => {
        this.isLoadingSpinner = false;
        this.isAnimalListVisible = false;
        this.isOwnerDetailsSectionVisible = false;
        for (const sample of res) {
          if (
            (sample?.labTesting &&
              sample?.labTesting?.breedingExaminationType !== 2) ||
            (sample?.onspotTesting &&
              sample?.onspotTesting?.breedingExaminationType !== 2)
          ) {
            this.dialog.open(ConfirmationDialogComponent, {
              data: {
                title: 'Incorrect SampleID',
                message:
                  'Sample ID does not exist, please enter the correct sample ID.',
                icon: 'assets/images/info.svg',
                primaryBtnText: 'Ok',
              },
              panelClass: 'common-info-dialog',
            });
            return;
          }
        }
        if (res[0].labTesting) {
          const sample = res[0].labTesting;
          this.sampleList = [
            {
              ...sample,
              sampleId: sample.sampleId,
              tagId: sample.tagId,
              testDate: sample.sampleCollectionDate,
              testType: 'Lab Testing',
              examinationType: 'Genetic Analysis',
            },
          ];
        }
        this.isSampleIdSearchTableVisible = true;
      },
      () => (this.isLoadingSpinner = false)
    );
  }

  animalSelected(event: Event, animal: AnimalData) {
    this.selectedAnimalId = +(event.target as HTMLSelectElement).value;
    this.selectedAnimal = animal;
  }

  routingNewCase(section, queryParams) {
    let title = '';
    if (
      !this.ownerDetails.orgType &&
      this.ownerDetails.registrationStatus != '1'
    ) {
      this.dialog.open(TreatmentResponseDialogComponent, {
        data: {
          title: 'Info',
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
            [
              `/dashboard/performance-recording/genetic-analysis/add-genomic-sample`,
            ],
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

      new SnackBarMessage(this._snackBar).onSucessMessage(
        title +
          this.translatePipe.transform(
            'animalTreatmentSurgery.new_transaction_cannot_be_created'
          ),
        this.translatePipe.transform('common.ok_string'),
        'center',
        'top',
        'red-snackbar'
      );
    }
  }

  checkSearchValidity() {
    this.healthService.handleError({
      title: this.translatePipe.transform('common.info_label'),
      message: this.translatePipe.transform(
        'animalTreatmentSurgery.no_data_found_please_register_the_owner'
      ),
      primaryBtnText: 'Ok',
    });
    this.isOwnersListVisible = false;
    this.isOwnerDetailsSectionVisible = false;
    this.isAnimalListVisible = false;
  }

  // Form Functions
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
        ownerData: this.ownerDetails,
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
    dialogRef.afterClosed().subscribe((res) => {
      if (this.ownerDS.geteditDetailsFlag()) {
        this.searchResults(this.searchValue);
        this.ownerDS.seteditDetailsFlag(false);
      }
    });
  }

  viewOrgDetailsDialog() {
    const dialog = this.dialog.open(ViewOrganizationComponent, {
      data: { orgData: this.ownerDetails },
      width: '500px',
      height: '100vh',
      panelClass: 'custom-dialog-container',
      position: {
        right: '0px',
        top: '0px',
      },
    });
  }

  addInfoDialog() {
    const dialogRef = this.dialog.open(AddDetailsDialogComponent, {
      data: {
        ownerId: this.ownerDetails?.ownerId,
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
      this.additionalDetailsCounter += 1;
      if (this.ownerDS.getAddDetailsFlag()) {
        this.searchResults(this.searchValue);
        this.ownerDS.setAddDetailsFlag(false);
      }
    });
  }

  getToday(): string {
    return this.prService.currentDate.toDate().toISOString().split('T')[0];
  }

  getPastDate(): string {
    var tempDate = this.prService.currentDate.toDate();
    tempDate.setFullYear(tempDate.getFullYear() - 150);
    this.currentDate = tempDate.toISOString().split('T')[0];
    return this.currentDate;
  }

  resetValue(resetAll = true) {
    this.isOwnerDetailsSectionVisible = false;
    this.isAnimalListVisible = false;
    this.isAnimalTabVisible = false;
    this.isOwnersListVisible = false;
    this.isSampleIdSearchTableVisible = false;
    this.errorMessage = '';
    this.orgId = null;
    if (resetAll) {
      this.router.navigate(['.'], { relativeTo: this.route });
    }
  }

  backToOwnerListing(): void {
    this.isOwnersListVisible = true;
    this.isOwnerDetailsSectionVisible = false;
    this.isAnimalListVisible = false;
    this.isAnimalTabVisible = false;
    this.isSampleIdSearchTableVisible = false;
  }

  searchInTable(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.animalListDataSource.filter = filterValue.trim().toLowerCase();
    if (this.animalListDataSource.paginator) {
      this.animalListDataSource.paginator.firstPage();
    }
  }

  getWords(monthCount: any) {
    return monthCount ? this.healthService.getWords(monthCount) : null;
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

  onUpdateSample() {
    this.searchResults(this.searchValue);
  }

  viewReport(element: any) {
    this.dialog.open(GeneticReportComponent, {
      data: element,
      position: {
        right: '0px',
        top: '0px',
      },
      width: '600px',
      height: '100vh',
      panelClass: 'custom-dialog-container',
    });
  }

  backToOwnerList() {
    this.isOwnersListVisible = true;
    this.isOwnerDetailsSectionVisible = false;
    this.isAnimalListVisible = false;
  }
}
