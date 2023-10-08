import { Species } from './../vaccination/models/ownerDetails.model';
import { DewormingDetailsComponent } from './deworming-details/deworming-details.component';
import { TreatmentResponseDialogComponent } from './../treatment-response-dialog/treatment-response-dialog.component';
import { AnimalRegistrationList } from './../../animal-management/owner-registration/models-owner-reg/get-ownerby-ownerID.model';
import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  Input,
  SimpleChanges,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { concat, iif, Observable, of, Subject, forkJoin } from 'rxjs';
import {
  tap,
  distinctUntilChanged,
  switchMap,
  catchError,
  map,
} from 'rxjs/operators';
import { AnimalTreatmentService } from '../animal-treatment/animal-treatment.service';
import { Unit } from '../animal-treatment/models/unit.model';
import { VaccinationService } from '../vaccination/vaccination.service';
import { DewormingService } from './deworming.service';
import { Animal } from './models/animal.model';
import { CampaignVillages } from './models/campaign-village.model';
import { Campaign } from './models/campaign.model';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EligibleAnimal } from '../vaccination/models/campaign-village.model';
import {
  ErrorResponse,
  ErrorResponseVacc,
} from '../animal-treatment/models/error-response.model';
import { AnimalsList } from '../vaccination/models/ownerDetails.model';
import { TagIdSearchValidation } from 'src/app/shared/utility/validation';
import { AnimalListWithout } from '../vaccination/models/animal.model';
import { ViewMoreDialogComponent } from './view-more-dialog/view-more-dialog.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import moment from 'moment';
import { DewormingDialogComponent } from './deworming-dialog/deworming-dialog.component';
import { OwnerDetailsService } from '../../animal-management/owner-registration/owner-details.service';

import { AnimalManagementService } from '../../animal-management/animal-registration/animal-management.service';
import { HealthService } from '../health.service';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { MatSort } from '@angular/material/sort';
import { MasterConfig } from 'src/app/shared/master.config';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { decimalWithLengthValidation } from 'src/app/shared/utility/decimalWithLengthValidator';
import { SearchValidation } from '../../performance-recording/search-validator';
export interface MedicineListModel {
  sr_no: string;
  tag_id: string;
  owner_name: string;
  category_species: string;
  sex: string;
  dob: string;
  tagging_date: string;
  age: string;
  village: string;
  health_history: string;
}

export interface MedicineList {
  dewormer_name: string;
  form: string;
  dewormer_content: string;
  unit: string;
  dose: number;
  route: string;
}

export type SearchValue = {
  searchValue: string;
  ownerType: OwnerType;
};

export enum OwnerType {
  individual = 1,
  nonIndividual = 2,
  organization = 3,
}

declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-deworming',
  templateUrl: './deworming.component.html',
  styleUrls: ['./deworming.component.css'],
  providers: [TranslatePipe],
})
export class DewormingComponent implements OnInit {
  searchBy: string = 'individual';
  @Input() ownerTypeCd: OwnerType = OwnerType.individual;
  @Input() orgId: number = null;
  validationMsg = animalHealthValidations.campaignCreation;
  masterConfig = MasterConfig;
  isLoadingSpinner = false;
  medicines!: Observable<any[]>;
  medcineInput$ = new Subject<string>();
  selectedMedicines = [];
  searchMedicine = new FormControl('', [Validators.required]);
  other_medicines: FormGroup;
  dewormingwithcampaignForm: FormGroup;
  selectedMedicine = [];
  otherMedicine = [];
  toAddMedicineList = [];
  getCampaignList: Campaign[] = [];
  search = '';
  campaigns = [];
  selectedCampaignSpeciesList: Campaign[] = [];
  selectedCampId: number = -1;
  campaignsVillages: CampaignVillages[] = [];
  selectVillage: CampaignVillages | null = null;
  dataSourceMedicineList = new MatTableDataSource();
  filterForm: FormGroup;
  totalAnimalCount: EligibleAnimal;
  isAndFilterTrue: boolean = false;
  MedicineListDisplayedColumns: string[] = [
    'dewormer_name',
    'dewormer_content',
    'unit',
    'dose',
    'form',
    'route',
  ];
  medicineLoading = false;

  spotTestingDisplayedColumns: string[] = [
    'checkbox',
    'sr_no',
    'tagId',
    'ownerName',
    'village',
    'category_species',
    'animalCategory',
    'sex',
    'dateOfBirth',
    'animalAge',
    'health_history',
  ];

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.dataSource.sort = ms;
  }
  dataSource = new MatTableDataSource<Animal>([]);

  withOutCampaign: boolean = false;
  isAnimalTableVisible: boolean = false;
  errorMessage = '';
  ownerDetailsRecord!: AnimalListWithout[];
  ownerDetailsByID: any;
  animalDetail: Animal[] = [];
  noOfBoxes: number = 0;
  isVisual = true;
  screenWidth: any = window.innerWidth;
  cellsShow: number;
  cellArrow: boolean;
  withoutCampaignForm: FormGroup;
  submitted = false;
  unitMaster: Unit[] = [];
  medicineTableForm: FormGroup;
  forms = [];
  routes = [];
  selectedMedicineRows: FormArray;
  ownerInfoForm: FormGroup;
  showVillage = true;
  campaignOrWithoutCampainFrom: FormGroup;
  animalDetailOnSearch: AnimalsList[] = [];
  noOfBoxesOnSearch: number = 0;
  animalListOnSearch: FormGroup;
  dewormerAnimalCount: number | null = null;
  searchForm!: FormGroup;
  noOfActiveAnimals = 0;
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
    'ownerVillageName',
    'ownerName',
    // 'animalCategory'
  ];

  DisplayedColumnsOnsearch: string[] = [
    'checkbox',
    'sr_no',
    'tag_id',
    'owner_name',
    'category_species',
    // 'animalCategory',
    'sex',
    'dob',
    'age',
    'village',
    'health_history',
  ];
  ownerListColumns = [
    'S.No.',
    'Owner_ID',
    'Owner_Name',
    'Mobile_Number',
    'gender',
    'DOB',
    'Village',
  ];
  isOwnerTableVisible = false;
  ownerDataSource = new MatTableDataSource();
  noAnimalRegistered = false;
  showAllCampaigns = false;
  isTagidSearch = false;
  individualOwner: boolean = true;
  animalPageIndex = 0;
  animalPageSize = 5;
  animalsCount = 0;
  constructor(
    private formBuilder: FormBuilder,
    private dewormingService: DewormingService,
    private treatmentService: AnimalTreatmentService,
    private vaccinationService: VaccinationService,
    public dialog: MatDialog,
    private ownerDS: OwnerDetailsService,
    private animalMS: AnimalManagementService,
    private healthService: HealthService,
    private readonly translateService: TranslateService,
    private translatePipe: TranslatePipe
  ) {
    this.getScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth >= 1024) {
      this.cellsShow = 3;
      this.cellArrow = true;
    } else if (this.screenWidth < 1024 && this.screenWidth >= 768) {
      this.cellsShow = 2;
      this.cellArrow = true;
    } else {
      this.cellsShow = 1;
      this.cellArrow = false;
    }
  }

  // @ViewChild('paginator') set matPaginator(mp: MatPaginator) {
  //   this.dataSource.paginator = mp;
  // }

  @ViewChild('paginator') paginator: MatPaginator;

  @ViewChild('ownerpaginator') set matOwnerPaginator(mp: MatPaginator) {
    this.ownerDataSource.paginator = mp;
  }
  ngOnInit(): void {
    this.searchForm = this.formBuilder.group(
      {
        ownerType: [this.searchBy],
        searchValue: [],
      },
      { validators: [SearchValidation(false, false)] }
    );

    this.animalListOnSearch = this.formBuilder.group({
      selected_tagId_OnSearch: this.formBuilder.array([]),
    });

    this.campaignOrWithoutCampainFrom = this.formBuilder.group({
      control: [false],
    });

    this.campaignOrWithoutCampainFrom
      .get('control')
      .valueChanges.subscribe((v) => (this.withOutCampaign = v));

    this.withoutCampaignForm = this.formBuilder.group({
      medicineControl: [null],
      dewormerNotFoundFlag: [false],
      medicineCd: [null],
      medicineName: [null],
      medcineSalt: [null],
      medicineUnitCd: [null],
      medicineDosage: [
        null,
        [decimalWithLengthValidation(6, 2), Validators.required],
      ],
      medicineFormCd: [null],
      medicineRouteCd: [null],
    });

    this.withoutCampaignForm
      .get('medicineControl')
      .valueChanges.subscribe((med) => {
        if (med) {
          // const med = this.withoutCampaignForm.get('medicineControl').value;
          if (this.dataSourceMedicineList.data.length) {
            this.dialog
              .open(TreatmentResponseDialogComponent, {
                data: {
                  icon: 'assets/images/info.svg',
                  title: this.translateService.instant('common.info_label'),
                  message: this.translateService.instant('deworming.med_label'),
                  primaryBtnText:
                    this.translateService.instant('registration.Yes'),
                  secondaryBtnText:
                    this.translateService.instant('registration.No'),
                },
                width: '600px',
                panelClass: 'common-info-dialog',
              })
              .afterClosed()
              .subscribe((res) => {
                if (res) {
                  this.dataSourceMedicineList.data = [med];
                  this.withoutCampaignForm.patchValue({
                    medicineCd: med.medicineCd,
                    medicineName: med.medicineName,
                    medcineSalt: med.saltDesc,
                    medicineUnitCd: med.medicineUnitCd,
                    medicineDosage: null,
                    medicineFormCd: med.medicineFormCd,
                    medicineRouteCd: med.medicineRouteCd,
                  });
                  // this.showVillage = true;
                  this.withoutCampaignForm.get('medicineName').disable();
                  this.withoutCampaignForm.get('medcineSalt').disable();
                  this.withoutCampaignForm.get('medicineFormCd').disable();
                  this.withoutCampaignForm.get('medicineRouteCd').disable();

                  this.withoutCampaignForm
                    .get('dewormerNotFoundFlag')
                    .patchValue(false, { emitEvent: false });
                } else
                  this.withoutCampaignForm
                    .get('medicineControl')
                    .patchValue(null, { emitEvent: false });
              });
          } else {
            this.dataSourceMedicineList.data = [med];
            this.withoutCampaignForm.patchValue({
              medicineCd: med.medicineCd,
              medicineName: med.medicineName,
              medcineSalt: med.saltDesc,
              medicineUnitCd: med.medicineUnitCd,
              medicineDosage: null,
              medicineFormCd: med.medicineFormCd,
              medicineRouteCd: med.medicineRouteCd,
            });
            // this.showVillage = true;
            this.withoutCampaignForm.get('medicineName').disable();
            this.withoutCampaignForm.get('medcineSalt').disable();
            this.withoutCampaignForm.get('medicineFormCd').disable();
            this.withoutCampaignForm.get('medicineRouteCd').disable();
          }
        } else {
          // this.showVillage = false;
          this.dataSourceMedicineList.data = [];
          this.withoutCampaignForm.get('medicineName').enable();
          this.withoutCampaignForm.get('medcineSalt').enable();
          this.withoutCampaignForm.get('medicineRouteCd').enable();

          this.withoutCampaignForm.get('medicineFormCd').enable();
        }
        this.withoutCampaignForm.get('medicineName').updateValueAndValidity();
        this.withoutCampaignForm.get('medcineSalt').updateValueAndValidity();
        this.withoutCampaignForm.get('medicineFormCd').updateValueAndValidity();
        this.withoutCampaignForm
          .get('medicineRouteCd')
          .updateValueAndValidity();
      });

    this.withoutCampaignForm
      .get('dewormerNotFoundFlag')
      .valueChanges.subscribe((value) => {
        if (value) {
          if (this.dataSourceMedicineList.data.length) {
            this.dialog
              .open(TreatmentResponseDialogComponent, {
                data: {
                  icon: 'assets/images/info.svg',
                  title: this.translateService.instant('common.info_label'),
                  message: this.translateService.instant('deworming.med_label'),
                  primaryBtnText:
                    this.translateService.instant('registration.Yes'),
                  secondaryBtnText:
                    this.translateService.instant('registration.No'),
                },
                width: '600px',
                panelClass: 'common-info-dialog',
              })
              .afterClosed()
              .subscribe((res) => {
                if (res) {
                  this.withoutCampaignForm
                    .get('medicineControl')
                    .patchValue(null);

                  this.dataSourceMedicineList = new MatTableDataSource([{}]);
                  this.withoutCampaignForm.patchValue({
                    medicineCd: 0,
                    medicineName: null,
                    medcineSalt: null,
                    medicineUnitCd: null,
                    medicineDosage: null,
                    medicineFormCd: null,
                    medicineRouteCd: null,
                  });
                  // this.showVillage = true;
                  this.withoutCampaignForm.get('medicineName').enable();
                  this.withoutCampaignForm.get('medcineSalt').enable();
                  this.withoutCampaignForm.get('medicineFormCd').enable();
                  this.withoutCampaignForm.get('medicineRouteCd').enable();
                } else {
                  this.withoutCampaignForm
                    .get('dewormerNotFoundFlag')
                    .patchValue(false, { emitEvent: false });
                }
              });
          } else {
            this.dataSourceMedicineList.data = [{}];

            this.withoutCampaignForm.patchValue({
              medicineCd: 0,
              medicineName: null,
              medcineSalt: null,
              medicineUnitCd: null,
              medicineDosage: null,
              medicineFormCd: null,
              medicineRouteCd: null,
            });
            this.showVillage = true;
            this.withoutCampaignForm.get('medicineName').enable();
            this.withoutCampaignForm.get('medcineSalt').enable();
            this.withoutCampaignForm.get('medicineFormCd').enable();
            this.withoutCampaignForm.get('medicineRouteCd').enable();
          }
        } else {
          if (this.dataSourceMedicineList.data.length) {
            this.dataSourceMedicineList.data = [];
          }
          // this.showVillage = false;
        }
        this.withoutCampaignForm.get('medicineName').updateValueAndValidity();
        this.withoutCampaignForm.get('medcineSalt').updateValueAndValidity();
        this.withoutCampaignForm.get('medicineFormCd').updateValueAndValidity();
        this.withoutCampaignForm
          .get('medicineRouteCd')
          .updateValueAndValidity();
      });

    this.dewormingwithcampaignForm = this.formBuilder.group({
      selected_tagId_details: this.formBuilder.array([]),
    });

    this.filterForm = this.formBuilder.group({
      filter: ['', [Validators.required]],
    });

    this.filterForm.get('filter').valueChanges.subscribe((value) => {
      if (value === null || value === '0') {
        this.onFilter();
      }
    });

    this.selectedMedicineRows = this.formBuilder.array([]);

    this.withoutCampaignForm.valueChanges.subscribe((res) => res);

    // this.treatmentService
    //   .getMeasurementUnitMaster()
    //   .subscribe((res) => (this.unitMaster = res));

    // this.healthService
    //   .getCommonMaster('medicine_form')
    //   .subscribe((res) => (this.forms = res));
    //   this.getCampingDewormingList();

    this.fetchMedicines();

    // this.isLoadingSpinner = true;
    this.getData();
  }

  onSelectingSearchBy(event: Event) {
    this.searchBy = (event.target as HTMLInputElement)?.value;
    this.searchForm.get('searchValue').reset();
    this.isAnimalTableVisible = false;
    this.isOwnerTableVisible = false;

    this.errorMessage = '';
    if (this.searchBy == 'individual') {
      this.individualOwner = true;
    } else {
      this.individualOwner = false;
    }
  }

  getData() {
    this.isLoadingSpinner = true;
    forkJoin([
      this.treatmentService
        .getMeasurementUnitMaster()
        .pipe(catchError((e) => of(null))),
      this.healthService
        .getCommonMaster('medicine_form')
        .pipe(catchError((e) => of(null))),

      // this.fetchMedicines(),
      this.dewormingService
        .getCampaignList(2)
        .pipe(catchError((e) => of(null))),
      this.treatmentService.getRouteMaster().pipe(catchError((e) => of(null))),
    ]).subscribe(
      (res) => {
        this.unitMaster = res[0] ?? [];
        this.forms = res[1] ?? [];
        this.routes = res[3] ?? [];

        this.campaigns = res[2] ?? [];
        this.filterCampaigns();
        this.loadCarousel();
      },
      () => (this.isLoadingSpinner = false)
    );
  }

  getCampingDewormingList() {
    this.isLoadingSpinner = true;
    this.dewormingService.getCampaignList(2).subscribe(
      (res) => {
        this.campaigns = res;
        this.filterCampaigns();
        this.loadCarousel();
      },
      () => {
        this.isLoadingSpinner = false;
      }
    );
  }

  loadCarousel() {
    // jquery

    setTimeout(() => {
      var multipleCardCarousel = document.querySelector(
        '#carouselExampleControls'
      );

      if (!multipleCardCarousel) {
        this.isLoadingSpinner = false;

        return;
      }

      this.removePreviousButton();

      if (window.matchMedia('(min-width: 1024px)').matches) {
        if (this.getCampaignList.length < 4) {
          this.removeNextButton();
        } else {
          this.addNextButton();
        }

        var carousel = new bootstrap.Carousel(multipleCardCarousel, {
          interval: false,
        });

        var carouselWidth = $('.carousel-inner')[0].scrollWidth;

        var cardWidth = $('.carousel-item').width();

        var scrollPosition = 0;

        $('#carouselExampleControls .carousel-control-next').on('click', () => {
          if (scrollPosition < carouselWidth - cardWidth * 3) {
            scrollPosition += cardWidth;

            $('#carouselExampleControls .carousel-inner').animate(
              { scrollLeft: scrollPosition },

              600
            );

            this.addPreviousButton();

            if (scrollPosition < carouselWidth - cardWidth * 3) {
              this.addNextButton();
            } else {
              this.removeNextButton();
            }
          }
        });

        $('#carouselExampleControls .carousel-control-prev').on('click', () => {
          if (scrollPosition > 0) {
            scrollPosition -= cardWidth;

            $('#carouselExampleControls .carousel-inner').animate(
              { scrollLeft: scrollPosition },

              600
            );

            if (scrollPosition <= 0) this.removePreviousButton();
            else this.addPreviousButton();
          } else {
          }

          if (this.getCampaignList.length >= 4) {
            this.addNextButton();
          } else {
            this.removeNextButton();
          }
        });
      } else if (window.matchMedia('(min-width: 768px)').matches) {
        if (this.getCampaignList.length < 3) {
          this.removeNextButton();
        } else {
          this.addNextButton();
        }

        var carousel = new bootstrap.Carousel(multipleCardCarousel, {
          interval: false,
        });

        var carouselWidth = $('.carousel-inner')[0].scrollWidth;

        var cardWidth = $('.carousel-item').width();

        var scrollPosition = 0;

        $('#carouselExampleControls .carousel-control-next').on('click', () => {
          if (scrollPosition < carouselWidth - cardWidth * 2) {
            scrollPosition += cardWidth;

            $('#carouselExampleControls .carousel-inner').animate(
              { scrollLeft: scrollPosition },

              600
            );

            this.addPreviousButton();

            if (scrollPosition < carouselWidth - cardWidth * 2) {
              this.addNextButton();
            } else {
              this.removeNextButton();
            }
          }
        });

        $('#carouselExampleControls .carousel-control-prev').on('click', () => {
          if (scrollPosition > 0) {
            scrollPosition -= cardWidth;

            $('#carouselExampleControls .carousel-inner').animate(
              { scrollLeft: scrollPosition },

              600
            );

            if (scrollPosition <= 0) this.removePreviousButton();
            else this.addPreviousButton();
          }

          if (this.campaigns.length >= 3) {
            this.addNextButton();
          } else {
            this.removeNextButton();
          }
        });
      } else if (window.matchMedia('(min-width: 560px)').matches) {
        if (this.getCampaignList.length < 2) {
          this.removeNextButton();
        } else {
          this.addNextButton();
        }

        var carousel = new bootstrap.Carousel(multipleCardCarousel, {
          interval: false,
        });

        var carouselWidth = $('.carousel-inner')[0].scrollWidth;

        var cardWidth = $('.carousel-item').width();

        var scrollPosition = 0;

        $('#carouselExampleControls .carousel-control-next').on('click', () => {
          if (scrollPosition < carouselWidth - cardWidth) {
            scrollPosition += cardWidth;

            $('#carouselExampleControls .carousel-inner').animate(
              { scrollLeft: scrollPosition },

              600
            );

            this.addPreviousButton();

            if (scrollPosition < carouselWidth - cardWidth) {
              this.addNextButton();
            } else {
              this.removeNextButton();
            }
          } else {
            document

              .getElementById('carousel-control-next')

              .classList.add('d-none');
          }
        });

        $('#carouselExampleControls .carousel-control-prev').on('click', () => {
          if (scrollPosition > 0) {
            scrollPosition -= cardWidth;

            $('#carouselExampleControls .carousel-inner').animate(
              { scrollLeft: scrollPosition },

              600
            );

            if (scrollPosition <= 0) this.removePreviousButton();
            else this.addPreviousButton();
          }

          if (this.getCampaignList.length >= 2) {
            this.addNextButton();
          } else {
            this.removeNextButton();
          }
        });
      } else if (window.matchMedia('(min-width: 425px)').matches) {
        var carousel = new bootstrap.Carousel(multipleCardCarousel, {
          interval: false,
        });

        var carouselWidth = $('.carousel-inner')[0].scrollWidth;

        var cardWidth = $('.carousel-item').width();

        var scrollPosition = 0;

        $('#carouselExampleControls .carousel-control-next').on(
          'click',

          function () {
            if (scrollPosition < carouselWidth - cardWidth) {
              scrollPosition += cardWidth;

              $('#carouselExampleControls .carousel-inner').animate(
                { scrollLeft: scrollPosition },

                600
              );
            } else {
            }
          }
        );

        $('#carouselExampleControls .carousel-control-prev').on(
          'click',

          function () {
            if (scrollPosition > 0) {
              scrollPosition -= cardWidth;

              $('#carouselExampleControls .carousel-inner').animate(
                { scrollLeft: scrollPosition },

                600
              );
            }
          }
        );
      } else {
        $(multipleCardCarousel).addClass('slide');
      }

      this.isLoadingSpinner = false;
    }, 1000);
  }
  addPreviousButton() {
    document
      .getElementById('carousel-control-prev')
      ?.classList.remove('d-none');
  }
  removePreviousButton() {
    document.getElementById('carousel-control-prev')?.classList.add('d-none');
  }
  addNextButton() {
    document
      .getElementById('carousel-control-next')
      ?.classList.remove('d-none');
  }
  removeNextButton() {
    document.getElementById('carousel-control-next')?.classList.add('d-none');
  }

  OnSearchCancel() {
    this.animalListOnSearch.reset();
    this.animalDetailOnSearch = [];
    this.dataSource.data = [];
  }

  applyFilterOnSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  toggleCampaign() {
    this.searchForm.patchValue({
      ownerType: 'individual',
      searchValue: null,
    });
    this.onReset();
    if (!this.withOutCampaign) this.getCampingDewormingList();
    this.campaignsVillages = [];
    this.dataSource.data = [];
    this.selectVillage = null;
    this.animalDetail = [];
    this.totalAnimalCount = { totalAnimalCount: null };
    this.isAnimalTableVisible = false;

    if (this.withOutCampaign) {
      this.selectedCampId = -1;
      this.healthService.getVillagesbyUserID().subscribe(
        (res) => {
          this.campaignsVillages = res;

          if (res.length !== 1) {
            return;
          }
          //this.selectVillage = res[0];
        },
        () => (this.isLoadingSpinner = false)
      );
    }
  }

  getAnimalListforCampaign(request) {
    if (this.selectVillage?.villageCd) {
      this.dewormingService.getAnimalList(request).subscribe(
        (res: any) => {
          this.dataSource.data = res;
          this.isAnimalTableVisible = true;
          this.isLoadingSpinner = false;
        },
        () => (this.isLoadingSpinner = false)
      );
    }
  }

  getVillages(data?: any) {
    this.selectedCampaignSpeciesList = data.speciesImpactedEntity.map(
      (a) => a.speciesCd
    );
    // Api getVillagesByCampaign list Integration
    if (data.campaignId === -1) {
      return;
    }

    if (data.campaignId === this.selectedCampId) {
      this.selectedCampId = -1;
      this.campaignsVillages = [];
      this.animalDetail = [];
      this.dataSource.data = [];
      this.isAnimalTableVisible = false;
      this.selectVillage = null;
      this.totalAnimalCount = { totalAnimalCount: null };
      return;
    }
    this.selectedCampId = data.campaignId;

    this.isLoadingSpinner = true;
    const reqObj = {
      campaignId: data.campaignId,
      campaignType: 2,
      vaccinationDewormingFlag: 'D',
      speciesCd: this.selectedCampaignSpeciesList,
    };
    forkJoin([
      this.dewormingService.getVillagesByCampaign(data.campaignId),
      // this.dewormingService.getTotalAnimalCount(reqObj),
    ]).subscribe(
      ([villages]) => {
        this.campaignsVillages = villages.villageDetails;
        // if (villages.villageCount === 1) {
        //   this.selectVillage = villages.villageDetails[0];
        //   this.onVillageSelected();
        // } else {
        this.selectVillage = null;
        this.isAnimalTableVisible = false;
        this.animalDetail.length = 0;
        //}
        if (data?.length) {
          this.selectVillage = this.campaignsVillages.find(
            (v) => v.villageName === data[0].villageName
          );
          this.onVillageSelected();
        }
        // this.totalAnimalCount = count;
        this.isLoadingSpinner = false;
      },
      () => (this.isLoadingSpinner = false)
    );
  }

  onVillageSelected() {
    // Api  list Integration
    this.errorMessage = null;
    this.noAnimalRegistered = false;
    this.isOwnerTableVisible = false;
    this.resetValue();
    this.animalDetail = [];

    this.isLoadingSpinner = true;
    if (this.withOutCampaign) {
      if (this.selectVillage && this.searchForm.get('searchValue')?.value) {
        this.dewormingService
          .getWithoutCampaignAnimalList(
            this.selectVillage?.villageCd,
            null,
            'D',
            this.searchForm.get('searchValue')?.value
          )
          .subscribe(
            (res: any) => {
              this.isLoadingSpinner = false;

              if (!res?.length) {
                this.selectVillage = null;
              }
              this.dataSource.data = res;
              this.isAnimalTableVisible = true;
            },
            () => {
              this.isLoadingSpinner = false;
              this.selectVillage = null;
            }
          );
      } else {
        this.isLoadingSpinner = false;
      }
    } else {
      if (this.searchForm.get('searchValue')?.value) {
        let sendingdata = {
          villageCd: this.selectVillage.villageCd,
          campaignId: this.selectedCampId,
          campaignType: 2,
          vaccinationDewormingFlag: 'D',
          speciesCd: this.selectedCampaignSpeciesList,
        };
        const req2 = this.dewormingService.getAnimalList(sendingdata);
        forkJoin([req2]).subscribe(
          (res: any) => {
            this.dataSource.data = res[0];
            this.isAnimalTableVisible = true;
            this.isLoadingSpinner = false;
          },
          () => {
            this.isLoadingSpinner = false;
            this.selectVillage = null;
          }
        );
      } else {
        this.isLoadingSpinner = false;
        return;
      }
    }
  }

  onFilter() {
    this.dataSource.filter = this.filterForm.get('filter').value;
    //  this.animalDetail = this.animalDetail.filter(value=>this.dataSource.filteredData.includes(value))
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  checkAllBoxes(event) {
    this.animalDetail.length = 0;
    if (event.target.checked) {
      for (var i = 0; i < this.dataSource.data.length; i++) {
        this.animalDetail.push(this.dataSource.data[i]);
      }
    }
  }

  onCheckboxChange(event, element: Animal) {
    if (event.target.checked) {
      this.animalDetail.push(element);
    } else {
      this.animalDetail.forEach((value, index) => {
        if (value.tagId === element.tagId) this.animalDetail.splice(index, 1);
      });
    }
    this.noOfBoxes = this.animalDetail.length;
  }

  checkIfInSelectedList(element: Animal) {
    // return this.animalDetail.includes(element);
    return !!this.animalDetail.find((obj) => {
      return obj.tagId === element.tagId;
    });
  }

  onClickingRemove(element: Animal) {
    this.animalDetail.forEach((value, index) => {
      if (value.tagId === element.tagId) this.animalDetail.splice(index, 1);
    });
  }

  onSelectMedicne($event) {
    this.selectedMedicine = [$event];
  }

  addToMedicineList() {
    const addedList = this.selectedMedicine.filter((a) => a.isAdded);
    //this.dialogRef.close({ addedMedicineList: this.toAddMedicineList })
  }
  addToMainMedicineList(medicine) {
    if (
      medicine.id != 0 &&
      !this.toAddMedicineList.find((a) => a.id === medicine.id)
    ) {
      this.toAddMedicineList.push(medicine);
    } else if (
      medicine.id == 0 &&
      !this.toAddMedicineList.find(
        (a) => a.medicine_name === medicine.medicine_name
      )
    ) {
      this.toAddMedicineList.push(medicine);
    }
  }

  removeToMainMedicineList(medicine) {
    if (medicine.id != 0) {
      const index = this.toAddMedicineList.findIndex(
        (a) => a.id == medicine.id
      );
      if (index != -1) {
        this.toAddMedicineList.splice(index, 1);
      }
    } else {
      const index = this.toAddMedicineList.findIndex(
        (a) => a.name == medicine.name
      );
      if (index != -1) {
        this.toAddMedicineList.splice(index, 1);
      }
    }
  }
  isMedAdded(med) {
    return this.toAddMedicineList.filter((a) => a.id == med.id).length;
  }

  fetchTable() {
    if (this.withoutCampaignForm.invalid) {
      return;
    } else {
      this.isAnimalTableVisible = true;
    }
  }

  onSubmit() {
    if (this.dewormingwithcampaignForm.invalid) {
      return;
    }
    if (this.withOutCampaign && this.withoutCampaignForm.invalid) {
      this.withoutCampaignForm.markAllAsTouched();
      return;
    }
    if (!this.withOutCampaign) {
      if (this.selectedCampId === -1) {
        this.dialog.open(TreatmentResponseDialogComponent, {
          data: {
            icon: 'assets/images/info.svg',
            title: this.translateService.instant('common.info_label'),
            message: this.translateService.instant(
              'vaccination.please_select_campaign'
            ),
            primaryBtnText: this.translateService.instant('common.ok_string'),
          },
          width: '400px',
          panelClass: 'common-info-dialog',
        });

        return;
      }
    }
    if (
      this.withOutCampaign &&
      (this.withoutCampaignForm.get('medicineName')?.value === null ||
        this.withoutCampaignForm.get('medicineName')?.value === '' ||
        this.dataSourceMedicineList.data.length === 0)
    ) {
      this.dialog.open(TreatmentResponseDialogComponent, {
        data: {
          icon: 'assets/images/info.svg',
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'deworming.please_enter_medicine_details'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
        },
        width: '400px',
        panelClass: 'common-info-dialog',
      });
      return;
    }
    if (!this.selectVillage && !this.withOutCampaign) {
      this.dialog.open(TreatmentResponseDialogComponent, {
        data: {
          icon: 'assets/images/info.svg',
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'vaccination.please_select_village'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
        },
        width: '400px',
        panelClass: 'common-info-dialog',
      });
      return;
    }
    if (this.animalDetail.length === 0) {
      this.dialog.open(TreatmentResponseDialogComponent, {
        data: {
          icon: 'assets/images/info.svg',
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'vaccination.please_select_atleast_one_animal_list'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
        },
        width: '400px',
        panelClass: 'common-info-dialog',
      });
      return;
    }

    this.submitted = false;

    this.dialog
      .open(DewormingDetailsComponent, {
        data: {
          animalDetail: this.animalDetail,

          searchByFlag: this.selectVillage == null ? 'DS' : 'NA',
          withOutCampaign: this.withOutCampaign,
          campaignId: this.selectedCampId,
          campaign: this.campaigns.find(
            (c) => c.campaignId === this.selectedCampId
          ),
          selectedMedicine: this.withoutCampaignForm.getRawValue(),
          routeName: this.routes.find(
            (r) =>
              r.routeCd ===
              this.withoutCampaignForm.getRawValue().medicineRouteCd
          )?.routeName,
          formName: this.forms.find(
            (f) =>
              f.cd === this.withoutCampaignForm.getRawValue().medicineFormCd
          )?.value,
          unitName: this.unitMaster.find(
            (f) =>
              f.unitCd === this.withoutCampaignForm.getRawValue().medicineUnitCd
          )?.unitDesc,
          medicineCd: this.campaigns.find(
            (camp) => camp.campaignId === this.selectedCampId
          )?.dewormerCd,
        },
        width: '90vw',
        height: '80vh',
        panelClass: 'custom-dialog-container',
        disableClose: true,
      })
      .afterClosed()
      .subscribe(
        (data: {
          submitted: boolean;
          count: number;
          res: any;
          vaccName: string;
        }) => {
          if (!data.submitted) return;
          if (data?.res?.data.transactionId) {
            const dialogRef = this.dialog.open(DewormingDialogComponent, {
              width: '400px',
              data,
            });
            dialogRef.afterClosed().subscribe((res) => {
              this.onReset();
            });
          } else {
            const dialogRef = this.dialog.open(DewormingDialogComponent, {
              width: '400px',
              data,
            });
            dialogRef.afterClosed().subscribe((res) => {
              // this.onReset();
            });
          }
        },
        () => (this.isLoadingSpinner = false)
      );
  }

  fetchMedicines(flag?) {
    //this.medicines = this._animalTreatmentService.getMedicinebySearch(request);
    this.medicines = concat(
      of([]),
      this.medcineInput$.pipe(
        distinctUntilChanged(),
        tap(() => (this.medicineLoading = true)),
        switchMap((term) => {
          return iif(
            () => term != null,
            this.treatmentService.getMedicinebySearch({
              dewormerFlg: 'Y',
              medicineNameOrSaltName: term,
            })
          ).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.medicineLoading = false))
          );
        })
      )
    );
  }



  // ON SEARCH CONDITION STARTS
  searchResults(mobNo: any, resetFlag = true) {
    this.noAnimalRegistered = false;
    this.animalDetail.length = 0;
    //this.isAnimalTableVisible = false;
    this.isOwnerTableVisible = false;
    if (this.searchForm.invalid) {
      this.isAnimalTableVisible = false;
      this.searchForm.markAllAsTouched();
      // if (
      //   this.searchForm.get('searchValue')?.value == undefined ||
      //   this.searchForm.get('searchValue')?.value == null ||
      //   this.searchForm.get('searchValue')?.value.length == 0
      // ) {
      //   this.errorMessage = this.translatePipe.transform(
      //     'errorMsg.enter_value'
      //   );
      // } else if (
      //   !isNaN(Number(this.searchForm.get('searchValue')?.value)) &&
      //   this.searchForm.get('searchValue')?.value.length > 0
      // ) {
      //   if (mobNo.length > 10) {
      //     this.errorMessage = this.translatePipe.transform(
      //       'errorMsg.check_field'
      //     );
      //   } else {
      //     this.errorMessage = this.translatePipe.transform(
      //       'errorMsg.mobile_start'
      //     );
      //   }
      // } else if (this.searchForm.get('searchValue')?.value.length == 0) {
      //   this.errorMessage = this.translatePipe.transform(
      //     'errorMsg.enter_value'
      //   );
      // } else {
      //   if (
      //     !isNaN(Number(this.searchForm.get('searchValue')?.value.slice(2)))
      //   ) {
      //     this.errorMessage = this.translatePipe.transform(
      //       'errorMsg.valid_owner_id'
      //     );
      //   } else {
      //     this.errorMessage = this.translatePipe.transform(
      //       'errorMsg.valid_owner_name'
      //     );
      //   }
      // }
      // return;
    } else {
      const param = mobNo;
      if (!this.isTagidSearch) this.dataSource.data = [];
      this.isTagidSearch =
        !isNaN(param) &&
        (param?.length == 8 || param?.length == 11 || param?.length == 12);
      if (this.selectVillage?.villageCd) {
        if (!this.searchForm.get('searchValue')?.value) {
          this.dialog.open(ConfirmationDialogComponent, {
            data: {
              title: this.translateService.instant('common.info_label'),
              message: this.translateService.instant(
                'vaccination.enter_search_by'
              ),
              primaryBtnText: this.translateService.instant('common.ok_string'),
              errorFlag: true,
              icon: 'assets/images/info.svg',
            },
            width: '500px',
            panelClass: 'common-info-dialog',
          });
          return;
        }
        this.isLoadingSpinner = true;
        if (this.withOutCampaign) {
          this.dewormingService
            .getWithoutCampaignAnimalList(
              this.selectVillage?.villageCd,
              null,
              'D',
              this.searchForm.get('searchValue')?.value,
              this.searchForm.get('ownerType')?.value === 'individual'
                ? OwnerType.individual
                : OwnerType.nonIndividual
            )
            .subscribe(
              (res: any) => {
                this.isLoadingSpinner = false;

                // if (!res?.length) {
                //   this.selectVillage = null;
                // }
                if (this.isTagidSearch) {
                  const tIndex = this.dataSource.data.findIndex(
                    (a: any) => a.tagId == res[0].tagId
                  );
                  if (tIndex == -1) {
                    if (res.length)
                      this.dataSource.data = [...this.dataSource.data, ...res];
                  } else {
                    this.isLoadingSpinner = false;
                    this.dialog.open(ConfirmationDialogComponent, {
                      data: {
                        title:
                          this.translateService.instant('common.info_label'),
                        message: this.translateService.instant(
                          'vaccination.tag_id_already_exists'
                        ),
                        primaryBtnText:
                          this.translateService.instant('common.ok_string'),
                        errorFlag: true,
                        icon: 'assets/images/info.svg',
                      },
                      width: '500px',
                      panelClass: 'common-info-dialog',
                    });
                    return;
                  }
                } else {
                  this.dataSource.data = res ?? [];
                }
                this.isAnimalTableVisible = true;
                this.isLoadingSpinner = false;
              },
              () => {
                this.isLoadingSpinner = false;
                this.selectVillage = null;
              }
            );
        } else {
          const sendingdata = {
            villageCd: this.selectVillage.villageCd,
            campaignId: this.selectedCampId,
            campaignType: 2,
            vaccinationDewormingFlag: 'D',
            speciesCd: this.selectedCampaignSpeciesList,
            text: mobNo,
            ownerType:
              this.searchForm.get('ownerType')?.value === 'individual'
                ? OwnerType.individual
                : OwnerType.nonIndividual,
          };
          this.isLoadingSpinner = true;
          const req2 = this.dewormingService.getAnimalList(sendingdata);
          forkJoin([req2]).subscribe(
            (res: any) => {
              if (this.isTagidSearch) {
                const tIndex = this.dataSource.data.findIndex(
                  (a: any) => a.tagId == res[0][0].tagId
                );
                if (tIndex == -1) {
                  if (res.length)
                    this.dataSource.data = [...this.dataSource.data, ...res[0]];
                } else {
                  this.isLoadingSpinner = false;
                  this.dialog.open(ConfirmationDialogComponent, {
                    data: {
                      title: this.translateService.instant('common.info_label'),
                      message: this.translateService.instant(
                        'vaccination.tag_id_already_exists'
                      ),
                      primaryBtnText:
                        this.translateService.instant('common.ok_string'),
                      errorFlag: true,
                      icon: 'assets/images/info.svg',
                    },
                    width: '500px',
                    panelClass: 'common-info-dialog',
                  });
                  return;
                }
              } else {
                this.dataSource.data = res[0] ?? [];
              }
              //this.dataSource.data = res[0];
              this.isAnimalTableVisible = true;
              this.isLoadingSpinner = false;
            },
            (error) => {
              this.isLoadingSpinner = false;
              if (error.status == 503) {
                this.dialog.open(ConfirmationDialogComponent, {
                  data: {
                    title: this.translateService.instant('common.info_label'),
                    message: this.translateService.instant(
                      'vaccination.data_too_large'
                    ),
                    primaryBtnText:
                      this.translateService.instant('common.ok_string'),
                    errorFlag: true,
                    icon: 'assets/images/info.svg',
                  },
                  width: '500px',
                  panelClass: 'common-info-dialog',
                });
              }
              this.isAndFilterTrue = true;
              this.isLoadingSpinner = false;
              //this.selectVillage = null;
            }
          );
        }
      } else if (this.withOutCampaign && param) {
        this.errorMessage = '';
        if (
          (mobNo.length == 8 || mobNo.length == 11 || mobNo.length == 12) &&
          !isNaN(+mobNo)
        ) {
          this.getDetailsByTagID(mobNo);
        } else {
          // if (
          //   (this.searchForm.get('ownerType')?.value == 1 || this.searchForm.get('ownerType')?.value == 2) &&
          //   // !String(mobNo).startsWith('1') &&
          //   mobNo.length == 15 &&
          //   !isNaN(Number(mobNo))
          // ) {
          //   this.errorMessage =
          //     this.translatePipe.transform('errorMsg.all_number_error');
          //   return;
          // }
          // else if (
          //   this.searchForm.get('ownerType')?.value == 2 &&
          //   // !String(mobNo).startsWith('3') &&
          //   mobNo.length == 15 &&
          //   !isNaN(Number(mobNo))
          // ) {
          //   this.errorMessage = this.translatePipe.transform(
          //     'common.nonIndvOwnerId'
          //   );
          //   return;
          //}
          this.isLoadingSpinner = true;
          this.errorMessage = '';
          this.ownerDS
            .getOwnerByMobile(
              mobNo.trim(),
              this.searchBy == 'nonIndividual' ? true : false
            )
            .subscribe(
              (data: any) => {
                this.ownerDetailsRecord = data;
                this.isLoadingSpinner = false;
                if (this.ownerDetailsRecord.length > 1) {
                  this.isAnimalTableVisible = false;
                  this.isOwnerTableVisible = true;
                  this.ownerDataSource.data = data;
                } else if (this.ownerDetailsRecord.length == 1) {
                  this.isAnimalTableVisible = false;
                  this.showOwnerDetails(
                    this.ownerDetailsRecord[0].ownerId,
                    resetFlag
                  );
                } else {
                  this.checkSearchValidity();
                }
              },
              (error) => {
                this.isLoadingSpinner = false;
                this.isAnimalTableVisible = false;
                this.isOwnerTableVisible = false;
                this.searchForm.patchValue({ searchValue: '' });
                this.searchForm.value.searchValue = null;
              }
            );
        }
      } else {
        this.dialog.open(TreatmentResponseDialogComponent, {
          data: {
            icon: 'assets/images/info.svg',
            title: this.translateService.instant('common.info_label'),
            message: this.translateService.instant(
              'vaccination.please_select_village'
            ),
            primaryBtnText: this.translateService.instant('common.ok_string'),
          },
          width: '400px',
          panelClass: 'common-info-dialog',
        });
        return;
      }
    }
  }

  getDetailsByTagID(searchValue: string) {
    this.noOfActiveAnimals = 0;
    this.isLoadingSpinner = true;
    this.isOwnerTableVisible = false;
    this.healthService.getDetailsByTagID(searchValue.trim()).subscribe(
      (searchResult: any) => {
        this.isLoadingSpinner = false;
        this.ownerDetailsByID = searchResult.ownerDetails;
        var animalList: any = <AnimalRegistrationList>{};
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

        //animalList.ageInMonths = this.getWords(animalList.ageInMonths);
        if (animalList.ageInMonths) {
          animalList['animalAge'] = this.getWords(animalList.ageInMonths);
        }
        if (searchResult.ownerDetails.ownerId) {
          this.searchForm.patchValue({
            ownerType: String(searchResult.ownerDetails.ownerId).startsWith('1')
              ? 'individual'
              : 'nonIndividual',
          });
          this.searchBy = String(searchResult.ownerDetails.ownerId).startsWith(
            '1'
          )
            ? 'individual'
            : 'nonIndividual';

          this.isAnimalTableVisible = true;
        } else if (animalList.ageInDays) {
          animalList['animalAge'] = `${animalList.ageInDays}D`;
        }
        animalList['breedDesc'] =
          animalList.breedAndExoticLevels &&
            animalList.breedAndExoticLevels.length > 1
            ? 'Cross Breed'
            : animalList.breedAndExoticLevels &&
              animalList.breedAndExoticLevels.length
              ? animalList.breedAndExoticLevels[0].breed
              : 'NA';
        animalList = [animalList].filter(
          (animal) => animal.animalStatusCd == 1
        );
        if (animalList && animalList.length) {
          if (this.isTagidSearch) {
            const tIndex = this.dataSource.data.findIndex(
              (a: any) => a.tagId == animalList[0].tagId
            );
            if (tIndex == -1) {
              if (animalList.length)
                this.dataSource.data = [
                  ...this.dataSource.data,
                  {
                    ...animalList[0],
                    ownerName:
                      searchResult.ownerDetails.ownerName ??
                      searchResult.ownerDetails.orgName,
                    villageName:
                      searchResult.ownerDetails.ownerVillageName ??
                      searchResult.ownerDetails.orgAddress,
                    dateOfBirth: moment(animalList.dateOfBirth).format(
                      'DD/MM/YYYY'
                    ),
                  },
                ];
            } else {
              this.dialog.open(ConfirmationDialogComponent, {
                data: {
                  title: this.translateService.instant('common.info_label'),
                  message: this.translateService.instant(
                    'vaccination.tag_id_already_exists'
                  ),
                  primaryBtnText:
                    this.translateService.instant('common.ok_string'),
                  errorFlag: true,
                  icon: 'assets/images/info.svg',
                },
                width: '500px',
                panelClass: 'common-info-dialog',
              });
              return;
            }
          } else {
            this.dataSource.data =
              animalList && animalList.length
                ? [
                  {
                    ...animalList[0],
                    ownerName:
                      searchResult.ownerDetails.ownerName ??
                      searchResult.ownerDetails.orgName,
                    villageName:
                      searchResult.ownerDetails.ownerVillageName ??
                      searchResult.ownerDetails.orgAddress,
                    dateOfBirth: moment(animalList.dateOfBirth).format(
                      'DD/MM/YYYY'
                    ),
                  },
                ]
                : [];
          }
        } else {
        }

        this.isAnimalTableVisible = true;
        this.setUsersFormOnSearch();
        this.animalsCount = 1;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  getWords(monthCount: any) {
    return monthCount ? this.treatmentService.getWords(monthCount) : null;
  }
  onPageAnimalPageChange(event: PageEvent) {
    this.animalPageIndex = event.pageIndex;
    this.animalPageSize = event.pageSize;
    this.showOwnerDetails(this.ownerDetailsByID?.ownerId);
  }

  showOwnerDetails(ownerId: number | string, resetFlag?: boolean) {
    this.selectVillage = null;
    this.isLoadingSpinner = true;
    this.noAnimalRegistered = false;
    if (resetFlag) this.animalDetail = [];
    this.healthService
      .getOwnerDetailsPageWise(
        ownerId,
        this.searchForm.get('ownerType')?.value === 'individual'
          ? OwnerType.individual
          : OwnerType.nonIndividual,
        this.animalPageIndex,
        this.animalPageSize
      )
      .subscribe(
        (res) => {
          this.ownerDetailsByID = res;
          this.isOwnerTableVisible = false;
          // this.dataSource.data = res?.animalsList
          //   ? res?.animalsList?.map((animal) => ({ ...res, ...animal }))
          //   : [];
          this.isLoadingSpinner = false;
          if (!res.animalsList?.length) {
            this.noAnimalRegistered = true;
            return;
          }
          let animalList = this.ownerDetailsByID?.animalsList.filter(
            (animal) => animal.animalStatusCd == 1
          );
          this.dataSource.data = animalList?.map((animal) => ({
            ...animal,
            ownerName: res.ownerName,
            villageName: res.ownerVillageName,
            speciesDesc: animal.species,
            dateOfBirth: moment(animal.dateOfBirth).format('DD/MM/YYYY'),
            animalAge:
              typeof animal.ageInMonths !== 'undefined' &&
                animal.ageInMonths !== null
                ? this.treatmentService.getWords(animal.ageInMonths)
                : `${animal.ageInDays}D`,
          }));

          this.isAnimalTableVisible = true;
          this.setUsersFormOnSearch();
          this.animalsCount = res.animalsCount;
        },
        () => (this.isLoadingSpinner = false)
      );
  }
  // getOwnerDetailsByID(ownerId: string, resetFlag: boolean) {
  //   this.selectVillage = null;
  //   this.isLoadingSpinner = true;
  //   this.noAnimalRegistered = false;
  //   if (resetFlag) this.animalDetail = [];
  //   this.vaccinationService.getOwnerByOwnerID(ownerId).subscribe(
  //     (data: any) => {
  //       this.ownerDetailsByID = data;
  //       this.isOwnerTableVisible = false;
  //       this.isLoadingSpinner = false;
  //       if (!data.animalsList?.length) {
  //         this.noAnimalRegistered = true;
  //         return;
  //       }
  //       let animalList = this.ownerDetailsByID?.animalsList.filter(
  //         (animal) => animal.animalStatusCd == 1
  //       );
  //       this.dataSource.data = animalList?.map((animal) => ({
  //         ...animal,
  //         ownerName: data.ownerName,
  //         villageName: data.ownerVillageName,
  //         speciesDesc: animal.species,
  //         dateOfBirth: moment(animal.dateOfBirth).format('DD/MM/YYYY'),
  //         animalAge:
  //           typeof animal.ageInMonths !== 'undefined' &&
  //             animal.ageInMonths !== null
  //             ? this.treatmentService.getWords(animal.ageInMonths)
  //             : `${animal.ageInDays}D`,
  //       }));
  //       this.isAnimalTableVisible = true;
  //       this.setUsersFormOnSearch();
  //     },
  //     (err) => (this.isLoadingSpinner = false)
  //   );
  // }

  checkSearchValidity() {
    this.dialog.open(TreatmentResponseDialogComponent, {
      width: '400px',
      data: {
        icon: 'assets/images/info.svg',
        title: this.translateService.instant('common.info_label'),
        message: this.translateService.instant('errorMsg.no_owner_found'),
        primaryBtnText: this.translateService.instant('common.ok_string'),
      },
      panelClass: 'common-info-dialog',
    });

    this.isAnimalTableVisible = false;
    this.isOwnerTableVisible = false;
  }

  resetValue() {
    this.searchForm.reset();
    this.searchForm.patchValue({
      ownerType: 'individual',
      searchValue: null,
    });
    if (!this.isTagidSearch) {
      this.isAnimalTableVisible = false;
      this.animalDetail.length = 0;
    }

    this.isOwnerTableVisible = false;
    this.isAndFilterTrue = false;
    this.errorMessage = null;
    this.dataSource.paginator = null;
    this.animalPageIndex = 0;
    this.animalPageSize = 5;
    this.animalsCount = 0;
  }

  private setUsersFormOnSearch() {
    const userCtrl = this.animalListOnSearch.get(
      'selected_tagId_OnSearch'
    ) as FormArray;
    this.dataSource.data.forEach((user) => {
      userCtrl.push(this.setUsersFormWithoutArrayOnSearch(user));
    });
  }
  private setUsersFormWithoutArrayOnSearch(user) {
    return this.formBuilder.group({
      tag_id: [user.tag_id],
    });
  }

  checkAllBoxesOnSearch(event) {
    this.animalDetailOnSearch.length = 0;
    if (event.target.checked) {
      for (var i = 0; i < this.dataSource.data.length; i++) {
        this.animalDetail.push(this.dataSource.data[i] as any);
      }
    }
  }

  onCheckboxChangeOnSearch(event, element: AnimalsList) {
    if (event.target.checked) {
      this.animalDetailOnSearch.push(element);
    } else {
      this.animalDetailOnSearch.forEach((value, index) => {
        if (value.tagId === element.tagId)
          this.animalDetailOnSearch.splice(index, 1);
      });
    }
    this.noOfBoxesOnSearch = this.animalDetailOnSearch.length;
  }

  checkIfInSelectedListOnSearch(element: AnimalsList) {
    return this.animalDetailOnSearch.includes(element);
  }

  onClickingRemoveOnSearch(element: AnimalsList) {
    this.animalDetailOnSearch.forEach((value, index) => {
      if (value.tagId === element.tagId)
        this.animalDetailOnSearch.splice(index, 1);
    });
  }

  // ON SEARCH CONDITION ENDS ?????????????? ?? /////////////////

  //view-more//
  openDialog(): void {
    const dialogRef = this.dialog.open(ViewMoreDialogComponent, {
      width: '700px',
      height: '80vh',
      panelClass: 'custom-dialog-container',
      data: {
        selectedTagIds: this.animalDetail,
      },
    });
  }

  onReset() {
    this.selectedCampId = -1;
    this.isOwnerTableVisible = false;
    this.selectVillage = null;
    this.animalDetail.length = 0;
    this.withoutCampaignForm.reset();
    this.errorMessage = null;
    this.totalAnimalCount = { totalAnimalCount: null };
    this.dewormerAnimalCount = null;
    this.filterForm.reset();
    this.isAnimalTableVisible = false;
    this.searchForm.reset();
    this.searchForm.patchValue({
      ownerType: 'individual',
      searchValue: null,
    });
    this.search = '';
    this.ownerDataSource.data = [];
    this.dataSource.data = [];
    this.isOwnerTableVisible = false;
  }

  resetIndividualValue() {
    this.errorMessage = '';
    this.isOwnerTableVisible = false;
    this.isAnimalTableVisible = false;
    this.errorMessage = '';
    this.ownerTypeCd = OwnerType.individual;
    this.ownerDetailsRecord = [];
  }

  formatDate(date: string) {
    if (date) {
      return moment(new Date(date)).format('DD/MM/YYYY');
    }
    return null;
  }

  viewAnimalHistory(element) {
    this.healthService.viewAnimalHistory(element, 4);
  }

  filterCampaigns() {
    if (this.showAllCampaigns) {
      this.getCampaignList = this.campaigns;
    } else {
      this.getCampaignList = this.campaigns?.filter((campaign: Campaign) => {
        const campaignEndDate = moment(
          new Date(campaign.campaignEndDate.split('/').reverse() as any)
        );

        return campaignEndDate.isSameOrAfter(
          moment(sessionStorage.getItem('serverCurrentDateTime'))
        );
      });
    }
    this.loadCarousel();
  }

  // get ownerType() {
  //   return OwnerType;
  // }
}
