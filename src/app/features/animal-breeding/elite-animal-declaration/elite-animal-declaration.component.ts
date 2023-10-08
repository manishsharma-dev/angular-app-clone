import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { MasterConfig } from 'src/app/shared/master.config';
import { OtpDialogComponent } from 'src/app/shared/otp-dialog/otp-dialog.component';
import { TehsilList } from 'src/app/shared/shareService/model/tehsil.model';
import { VillageList } from 'src/app/shared/shareService/model/village.model';
import {
  MembershipNumberValidation,
  TagIdSearchValidation,
} from 'src/app/shared/utility/validation';
import { AnimalMasterList } from '../../animal-health/animal-treatment/models/master.model';
import { HealthService } from '../../animal-health/health.service';
import { AnimalManagementService } from '../../animal-management/animal-registration/animal-management.service';
import { AddDetailsDialogComponent } from '../../animal-management/owner-registration/add-details-dialog/add-details-dialog.component';
import { EditOwnerDetailsComponent } from '../../animal-management/owner-registration/edit-owner-details/edit-owner-details.component';
import { CommonData } from '../../animal-management/owner-registration/models-owner-reg/common-data.model';
import { RegisterOwner } from '../../animal-management/owner-registration/models-owner-reg/register-owner.model';
import { InstitutionName } from '../../animal-management/owner-registration/models-owner-reg/village-institution-name';
import { OwnerDetailsService } from '../../animal-management/owner-registration/owner-details.service';
import { EliteAnimalService } from './elite-animal.service';
import { OwnerData } from 'src/app/shared/shareService/model/owner.detail';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { animalBreedingPRConfig } from 'src/app/shared/animal-breeding-pr.config';
import { OwnerServiceService } from 'src/app/shared/shareService/owner-detail-service/owner-service.service';
import {
  OwnerType,
  SearchValue,
} from 'src/app/shared/common-search-box/common-search-box.component';
import { TranslatePipe } from '@ngx-translate/core';
import { PrService } from '../../performance-recording/pr.service';
import { SearchResponse } from '../../performance-recording/growth-monitoring/models/search-response.model';
export interface AnimalData {
  species: string;
  sex: string;
  ageInMonths: any;
  tagId: number;
  pregnancyStatus: string;
  milkingStatus: string;
  breed: string;
  animalStatus?: string;
  animalStatusCd?: number;
  ageInDays?: string;
}
@Component({
  selector: 'app-elite-animal-declaration',
  templateUrl: './elite-animal-declaration.component.html',
  styleUrls: ['./elite-animal-declaration.component.css'],
  providers: [TranslatePipe],
})
export class EliteAnimalDeclarationComponent implements OnInit {
  orgId: number = null;
  ownerTypeCd = OwnerType.individual;
  masterConfig = MasterConfig;
  isTableVisible: boolean = false;
  isAnimalTabVisible: boolean = false;
  ownerDetailsSection: boolean = false;
  animalDetailsSection: boolean = false;
  additionalDetailsCounter: number = 0;
  errorMessage: string = '';
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
  private paginator!: MatPaginator;
  private paginator2!: MatPaginator;
  private sort!: MatSort;
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
    'Status',
    'Elite',
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
    'currentLactationNo',
    'isElite',
    'animalCategory',
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
  tableDataSource = new MatTableDataSource<any>();
  tableDataSourceOwner = new MatTableDataSource<OwnerData>();
  selectedAnimal: AnimalData;
  minAgeofAnimal: number;
  currentServerDate = sessionStorage.getItem('serverCurrentDateTime');
  searchValue: SearchValue;
  ownerInfoForm!: FormGroup;
  ownerDataSource = [];

  constructor(
    public dialog: MatDialog,
    // private _formBuilder: FormBuilder,
    private ownerDS: OwnerDetailsService,
    private router: Router,
    private route: ActivatedRoute,
    // private animalMS: AnimalManagementService,
    private eliteAnimalService: EliteAnimalService,
    private healthService: HealthService,
    private dataService: DataServiceService,
    private prService: PrService,
    private translatePipe: TranslatePipe
  ) {}

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.tableDataSource.sort = ms;
  }

  @ViewChild('paginatorRef') set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  @ViewChild('animalPaginator') set matPaginator2(mp: MatPaginator) {
    this.paginator2 = mp;
    this.setDataSourceAttributes();
  }
  setDataSourceAttributes() {
    this.tableDataSource.paginator = this.paginator2;
    this.tableDataSource.sort = this.sort;
    this.tableDataSourceOwner.paginator = this.paginator;
    this.tableDataSourceOwner.sort = this.sort;
  }
  ngOnInit(): void {
    this.getMinAge(animalBreedingPRConfig.MinAgeInmonths);
  }

  searchResults(searchValue: SearchValue) {
    this.resetValue(false);
    this.searchValue = searchValue;

    // sample id search

    this.isLoadingSpinner = true;
    this.errorMessage = '';
    this.prService.getSearchDetails(searchValue).subscribe(
      (data) => {
        this.ownerDataSource = data;

        if (this.ownerDataSource.length === 1) {
          this.showOwnerDetails(this.ownerDataSource[0]);
        } else if (this.ownerDataSource.length > 1) {
          this.isTableVisible = true;
        }
        this.isLoadingSpinner = false;
      },
      (err) => (this.isLoadingSpinner = false)
    );
  }
  showOwnerDetails(owner: SearchResponse | any) {
    this.ownerDetailsByID = owner;
    this.isTableVisible = false;
    this.ownerDetailsSection = true;
    this.animalDetailsSection = true;
    this.ownerTypeCd = owner.ownerTypeCd ?? OwnerType.organization;
    if (this.ownerTypeCd === OwnerType.organization) {
      this.orgId = owner?.orgId;
    }
    if (this.ownerDetailsByID?.animalsList?.length) {
      this.tableDataSource.data = this.ownerDetailsByID?.animalsList.map(
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

  animalSelected(event: Event, animal: AnimalData) {
    this.selectedAnimalId = +(event.target as HTMLSelectElement).value;
    this.selectedAnimal = animal;
  }

  routing(section, queryParams) {
    console.log(this.selectedAnimal);
    let title = '';
    if (
      this.selectedAnimal?.ageInMonths < this.minAgeofAnimal ||
      this.selectedAnimal?.ageInDays
    ) {
      this.healthService.handleError({
        title: 'Alert',
        message:
          'Animal age is less than 10 months, so transaction can not be done.',
        primaryBtnText: 'OK',
      });
      return;
    }

    if (this.ownerDetailsByID.registrationStatus != '1') {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: 'Owner is not active',
          message: 'New transaction cannot be created.',
          primaryBtnText: 'OK',
          icon: 'assets/images/alert.svg',
        },
        width: '500px',
      });
    } else {
      switch (this.selectedAnimal.animalStatusCd) {
        case 1:
          this.router.navigate(
            [`dashboard/animal-breeding/elite-animal/${section}`],
            {
              queryParams: queryParams,
            }
          );
          return;

        case 3:
          title = 'Animal is dead.';
          break;
        default:
          title = 'Animal is not active';
          break;
      }

      this.healthService.handleError({
        title,
        message: 'New transaction cannot be created.',
        primaryBtnText: 'OK',
      });
    }
  }

  checkSearchValidity() {
    this.healthService.handleError({
      title: 'No data found!',
      message: 'Please register the owner.',
      primaryBtnText: 'Ok',
    });
    this.isTableVisible = false;
    this.ownerDetailsSection = false;
    this.animalDetailsSection = false;
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
    dialogRef.afterClosed().subscribe((res) => {
      if (this.ownerDS.geteditDetailsFlag()) {
        this.searchResults(this.searchValue);
        this.ownerDS.seteditDetailsFlag(false);
      }
    });
  }

  addInfoDialog() {
    const dialogRef = this.dialog.open(AddDetailsDialogComponent, {
      data: {
        ownerId: this.ownerDetailsByID?.ownerId,
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
    return new Date(this.currentServerDate).toISOString().split('T')[0];
  }

  getPastDate(): string {
    var tempDate = new Date(this.currentServerDate);
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
    this.orgId = null;
    if (resetAll) {
      this.ownerTypeCd = OwnerType.individual;
      this.router.navigate(['.'], { relativeTo: this.route });
    }
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

  dateFormatChange(date: String) {
    return date.split('-').reverse().join('-');
  }

  getWords(monthCount: any) {
    return monthCount ? this.eliteAnimalService.getWords(monthCount) : null;
  }

  formatDate(date) {
    if (date) {
      return moment(new Date(date)).format('DD/MM/YYYY');
    }
    return null;
  }

  getParsedDate(date: string) {
    return moment(date).format('LT') + ' ' + moment(date).format('DD/MM/YYYY');
  }
  backToOwnerListing(): void {
    this.isTableVisible = true;
    this.animalDetailsSection = false;
    this.ownerDetailsSection = false;
  }
  private getMinAge(age_type: string): void {
    this.dataService.getDefaultConfig(age_type).subscribe((data: any) => {
      this.minAgeofAnimal = parseInt(data?.defaultValue);
    });
  }

  get ownerType() {
    return OwnerType;
  }
}
