import { catchError } from 'rxjs/operators';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import {
  CommonSearchBoxComponent,
  OwnerType,
  SearchValue,
} from 'src/app/shared/common-search-box/common-search-box.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { MasterConfig } from 'src/app/shared/master.config';
import {
  AlphaNumericValidation,
  TagIdSearchValidation,
} from 'src/app/shared/utility/validation';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { AnimalManagementService } from '../../animal-management/animal-registration/animal-management.service';
import { OwnerData } from '../../animal-management/owner-registration/models-owner-reg/get-owner-details.model';
import { OwnerDetailsService } from '../../animal-management/owner-registration/owner-details.service';
import { AnimalTreatmentService } from '../animal-treatment/animal-treatment.service';
import { CampaignCreationService } from '../campaign-creation/campaign-creation.service';
import { HealthService } from '../health.service';
import { CampaignDetailComponent } from './campaign-detail/campaign-detail.component';
import { Animal, AnimalListWithout } from './models/animal.model';
import {
  CampaignVillages,
  EligibleAnimal,
  WithoutCamVillages,
} from './models/campaign-village.model';
import { Campaign } from './models/campaign.model';
import { AnimalsList } from './models/ownerDetails.model';
import { VaccinationFor } from './models/vacc-For.model';
import { VaccType, VaccinationName } from './models/vacc-Name.model';
import { OnSearchDetailsComponent } from './on-search-details/on-search-details.component';
import { VaccinationService } from './vaccination.service';
import { ViewMoreVaccinationComponent } from './view-more-vaccination/view-more-vaccination.component';
import { WithoutCampDetailsComponent } from './without-camp-details/without-camp-details.component';
import { IntimationReportService } from '../intimation-report/intimation-report.service';
import { forkJoin, of } from 'rxjs';

declare var $: any;
declare var bootstrap: any;

// export type SearchValue = {
//   searchValue: string;
//   ownerType: OwnerType;
// };

// export enum OwnerType {
//   individual = 1,
//   nonIndividual = 2,
//   organization = 3,
// }

@Component({
  selector: 'app-vaccination',
  templateUrl: './vaccination.component.html',
  styleUrls: ['./vaccination.component.css'],
  providers: [TranslatePipe],
})
export class VaccinationComponent implements OnInit {
  // @Input() ownerTypeCd: OwnerType = OwnerType.individual;
  @ViewChild(CommonSearchBoxComponent) child: CommonSearchBoxComponent;
  masterConfig = MasterConfig;
  getSpeciesType: any;
  noOfActiveAnimals = 0;
  campaigns = [];
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
    'milkingStatus',
    'ownerDetails',
    // 'animalCategory'
  ];
  spotTestingDisplayedColumns: string[] = [
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
  DisplayedColumns: string[] = [
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
  validationMsg = animalHealthValidations.campaignCreation;
  dataSource = new MatTableDataSource<Animal>([]);
  dataSourceWithOutCampaign = new MatTableDataSource<AnimalListWithout>([]);
  dataSourceOnSearch = new MatTableDataSource<AnimalsList>([]);
  tableDataSourceOwner = new MatTableDataSource<OwnerData>();
  searchBy: string = 'individual';
  withOutCampaign: boolean = false;
  private withpaginator!: MatPaginator;
  private searchAnimalPaginator!: MatPaginator;
  private searchOwnerPaginator!: MatPaginator;
  private withOutPaginator!: MatPaginator;
  isAnimalTableVisible: boolean = false;
  isAnimalTableWithoutVisible: boolean = false;
  isAnimalOnSearch: boolean = false;
  animalDetail: Animal[] = [];
  ownerDetailsRecord: OwnerData[] = [];
  ownerDetailsLength: number = 0;
  selectedCampaignSpeciesList: Campaign[] = [];
  private sort!: MatSort;
  animalDetailWithOutCampaign: AnimalListWithout[] = [];
  animalDetailOnSearch: AnimalsList[] = [];
  noOfBoxes: number = 0;
  isTableVisible: boolean = false;
  noOfBoxesWithout: number = 0;
  noOfBoxesOnSearch: number = 0;
  filterForm: FormGroup;
  filterFormwithOutCampaign: FormGroup;
  screenWidth: any = window.innerWidth;
  cellsShow: number;
  cellArrow: boolean;
  withoutCampaignForm: FormGroup;
  animalListForm: FormGroup;
  animalListWithOutCampaign: FormGroup;
  animalListOnSearch: FormGroup;
  submitted = false;
  clickedOwnerName: string = '';
  clickedOwnerMobNo: number = 0;
  withoutCampaignTableSubmitted = false;
  getCampaignList: Campaign[] = [];
  getVillageList: CampaignVillages[] = [];
  getVaccinationName: VaccinationName[] = [];
  getVaccType: VaccType[] = [];
  getVaccinationFor: VaccinationFor[] = [];
  totalVillageList: WithoutCamVillages[] = [];
  //selectVillageWithout: WithoutCamVillages | null = null;
  selectVillageWithout = new FormControl(null);
  eligibleCountList: EligibleAnimal[] = [];
  vaccinatedAnimalCountInVillage: EligibleAnimal[] = [];
  totalAnimalCount: EligibleAnimal[] = [];
  totalVaccinatedAnimalCount: EligibleAnimal[] = [];
  selectVillage: CampaignVillages | null = null;
  selectedCampId: number = -1;
  selectVaccFor: any;
  selectVaccType: any;
  form: any;
  species: any;
  route: any;
  dose: any;
  unit: any;
  vaccinationSubType: any;
  vaccinationName: any;
  batchNumber: number;
  filtered: any;
  DetailList: any;
  sharedData: any;
  isLoadingSpinner: boolean = false;
  vaccinationDewormingFlag: any;
  errorMessage: string = '';
  errorMessageWithout: string = '';
  searchCam;
  VaccineCDwithout: number;
  VaccineNamewithout: string;
  diseaseDescwithout: string;
  manufacName: string;
  searchForm!: FormGroup;
  ownerDetailsByID!: any;
  ownerInfoForm: FormGroup;
  dataSourceOnSearchOwnerName: string;
  dataSourceOnSearchVillage: string;
  infoData: { campaignId: number; campaignType: number };
  batchNumberWithoutCampaign: number;
  VaccineCode: number;
  vaccCode: number;
  diseaseCode: number;
  vaccTypeCode: number;
  _values2: any;
  subTypeValue: any;
  getRouteName: any;
  getDose: any;
  getUnit: any;
  vaccSubTypeCode: any;
  vaccNameDate: any;
  showAllCampaigns = false;
  isTagidSearch = false;
  isAndFilterTrue: boolean = false;
  orgID: number = null;
  ownerTypeCd = OwnerType.individual;
  searchObj: SearchValue;
  animalPageIndex = 0;
  animalPageSize = 5;
  animalsCount = 0;
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

  constructor(
    private formBuilder: FormBuilder,
    private vaccinationService: VaccinationService,
    private campaignService: CampaignCreationService,
    private router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private ownerDS: OwnerDetailsService,
    private animalMS: AnimalManagementService,
    private healthService: HealthService,
    private readonly translateService: TranslateService,
    private treatmentService: AnimalTreatmentService,
    private translatePipe: TranslatePipe,
    private intimationReportService: IntimationReportService
  ) {
    this.getScreenSize();
  }

  @ViewChild('withpaginatorRef') set matPaginator(mp: MatPaginator) {
    this.withpaginator = mp;
    this.setDataSourceAttributes();
  }
  @ViewChild('withOutpaginatorRef') set withOutMatPaginator(mp: MatPaginator) {
    this.withOutPaginator = mp;
    this.setDataSourceAttributes();
  }

  @ViewChild('paginatorRef') set ownerMatPaginator(mp: MatPaginator) {
    this.searchOwnerPaginator = mp;
    this.setDataSourceAttributes();
  }
  // @ViewChild('searchpaginatorRef') set searchMatPaginator(mp: MatPaginator) {
  //   this.searchAnimalPaginator = mp;
  //   this.setDataSourceAttributes();
  // }
  @ViewChild('searchpaginatorRef') searchpaginatorRef: MatPaginator;

  ngOnInit(): void {
    this.createVaccinationForms();
    this.CampaignList();
    // this.VaccinationFor();
    // this.villageListWithoutCam();
  }

  createVaccinationForms() {
    this.searchForm = new FormGroup({
      ownerType: new FormControl(this.ownerTypeCd),
      searchValue: new FormControl(null, [
        Validators.required,
        TagIdSearchValidation,
      ]),
    });
    this.filterForm = this.formBuilder.group({
      filter: ['', [Validators.required]],
    });
    this.filterFormwithOutCampaign = this.formBuilder.group({
      filterwithOutCampaign: ['', [Validators.required]],
    });
    this.animalListForm = this.formBuilder.group({
      selected_tagId_details: this.formBuilder.array([]),
    });
    this.animalListWithOutCampaign = this.formBuilder.group({
      selected_tagId_withOutCampaign: this.formBuilder.array([]),
    });
    this.animalListOnSearch = this.formBuilder.group({
      selected_tagId_OnSearch: this.formBuilder.array([]),
    });
    this.withoutCampaignForm = this.formBuilder.group({
      VaccinationName: [null, Validators.required],
      vaccinationFor: [null, Validators.required],
      batchNumber: [null, [Validators.maxLength(15), AlphaNumericValidation]],
      vaccinationType: [null, Validators.required],
      vaccinationSubType: [null, Validators.required],
      species: [null, Validators.required],
      form: [null, Validators.required],
      route: [null, Validators.required],
      dose: [null, Validators.required],
      unit: [null, Validators.required],
    });
  }

  setDataSourceAttributes() {
    // With Animal List
    this.dataSource.paginator = this.withpaginator;
    this.dataSource.sort = this.sort;

    // WithOut Animal List
    this.dataSourceWithOutCampaign.paginator = this.withOutPaginator;
    this.dataSourceWithOutCampaign.sort = this.sort;
    // Search Animal List
    // this.dataSourceOnSearch.paginator = this.searchAnimalPaginator;
    // this.dataSourceOnSearch.sort = this.sort;
    // Search Owner List
    this.tableDataSourceOwner.paginator = this.searchOwnerPaginator;
    this.tableDataSourceOwner.sort = this.sort;
  }

  // // API Intregation Data Value starts
  CampaignList() {
    this.isLoadingSpinner = true;
    this.vaccinationService.getCampaignList(1).subscribe(
      (data: any) => {
        this.getCampaignList = data ?? [];
        this.campaigns = [...this.getCampaignList];
        this.filterCampaigns();
        this.isLoadingSpinner = false;
      },
      (error) => {
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

  toggleCampaign(value?: boolean) {
    if (!value) {
      this.CampaignList();
    } else {
      this.withoutCampApiCalls();
      // this.VaccinationFor();
      // this.villageListWithoutCam();
    }
    this.withOutCampaign = value;
    this.searchForm.reset();
    this.searchForm.patchValue({
      ownerType: this.ownerType.individual,
      searchValue: null,
    });
    this.errorMessage = '';
    this.withCampaignCancel();
    this.withoutCampaignCancel();
    //this.searchForm.value.searchValue = null;
    this.isAnimalTableWithoutVisible = false;
    this.isTableVisible = false;
    this.isAnimalOnSearch = false;
    this.selectVillageWithout.reset();
    this.getVaccType = null;
    this.getRouteName = null;
    this.getDose = null;
    this.getUnit = null;
    this._values2 = null;
    this.getVaccinationName = null;
    this.eligibleCountList = [];
    this.vaccinatedAnimalCountInVillage = [];
    const userCtrl = this.animalListForm.get(
      'selected_tagId_details'
    ) as FormArray;
    userCtrl.clear();
  }

  withoutCampApiCalls() {
    this.isLoadingSpinner = true;
    const vaccForRequest = this.vaccinationService.getVaccinationFor().pipe(
      catchError((err) => {
        return of(null);
      })
    );
    const userVillageRequest = this.intimationReportService
      .getVillagesByUser()
      .pipe(
        catchError((err) => {
          return of(null);
        })
      );

    forkJoin([vaccForRequest, userVillageRequest]).subscribe(
      ([vaccForResponse, userVillageResponse]: any) => {
        this.getVaccinationFor = vaccForResponse;
        this.totalVillageList = userVillageResponse ?? [];
        this.isLoadingSpinner = false;
      },
      (err) => (this.isLoadingSpinner = false)
    );
  }

  toggleTable(data?: any) {
    this.selectedCampaignSpeciesList = data.speciesImpactedEntity
      .map((a) => a.speciesCd)
      .filter((value) => value);
    if (data.campaignId === -1) {
      return;
    }

    if (data.campaignId === this.selectedCampId) {
      this.selectedCampId = -1;
      this.getVillageList = [];
      this.animalDetail = [];
      this.animalDetailOnSearch = [];
      this.dataSource.data = [];
      this.isAnimalTableVisible = false;
      this.selectVillage = null;
      this.searchForm.reset();
      this.searchForm.patchValue({
        ownerType: this.ownerType.individual,
        searchValue: null,
      });
      this.errorMessage = '';
      return;
    }
    this.isLoadingSpinner = true;
    this.selectedCampId = data.campaignId;
    this.VaccineCode = data.vaccineCd;
    this.searchForm.reset();
    this.searchForm.patchValue({
      ownerType: this.ownerType.individual,
      searchValue: null,
    });
    this.errorMessage = '';
    this.eligibleCountList = [];
    this.vaccinatedAnimalCountInVillage = [];

    this.vaccinationService.getVillagesByCampaign(data.campaignId).subscribe(
      (res: any) => {
        this.getVillageList = res.villageDetails;
        this.selectVillage = null;
        this.isAnimalTableVisible = false;
        this.animalDetail.length = 0;
        this.isLoadingSpinner = false;
        //}
        if (data?.length) {
          this.isLoadingSpinner = true;
          this.selectVillage = this.getVillageList.find(
            (v) => v.villageName === data[0].villageName
          );
          this.onOptionsSelected(data);
        }
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
    this.infoData = { campaignId: data.campaignId, campaignType: 1 };

    // this.vaccinationService.setCampaignListInfo(campaignId, 'Vaccination');
    //sessionStorage.setItem('CampID', JSON.stringify(infoData));
  }
  onOptionsSelected(data?: any) {
    this.isLoadingSpinner = true;
    this.animalDetail = [];
    this.animalDetailOnSearch = [];
    this.dataSource.data = [];

    let sendingdata = {
      villageCd: this.selectVillage?.villageCd,
      campaignId: this.selectedCampId,
      campaignType: 1,
      vaccinationDewormingFlag: 'V',
      speciesCd: this.selectedCampaignSpeciesList,
    };
    if (this.searchForm.get('searchValue')?.value) {
      sendingdata['text'] = this.searchForm.get('searchValue');
      this.fetchAnimalList(sendingdata);
    } else {
      this.isLoadingSpinner = false;
      return;
    }
  }

  searchAnimalforCampaign() {
    if (this.selectVillage?.villageCd) {
      if (this.searchForm.invalid) {
        this.validateAnimalForm(this.searchForm.get('searchValue')?.value);
      } else {
        this.errorMessage = '';
        const request = {
          villageCd: this.selectVillage.villageCd,
          campaignId: this.selectedCampId,
          campaignType: 1,
          vaccinationDewormingFlag: 'V',
          speciesCd: this.selectedCampaignSpeciesList,
          text: this.searchForm.get('searchValue')?.value,
          ownerType: this.searchForm.get('ownerType')?.value,
        };
        this.fetchAnimalList(request);
      }
    } else {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'vaccination.please_select_village'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
      this.isAndFilterTrue = true;
      return;
    }
  }

  validateAnimalForm(mobno) {
    this.searchForm.markAllAsTouched();
    if (mobno == undefined || mobno == null || mobno.length == 0) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant('vaccination.enter_search_by'),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
      this.isAndFilterTrue = true;
      return;
    }
    // else if (
    //   !isNaN(Number(mobno)) &&
    //   mobno.length > 0
    // ) {
    //   if (mobNo.length > 10) {
    //     this.errorMessage = this.errorMessage = this.translatePipe.transform(
    //       'errorMsg.check_field'
    //     );
    //   } else {
    //     this.errorMessage = this.translatePipe.transform(
    //       'errorMsg.mobile_start'
    //     );
    //   }
    // }
    else if (mobno.length == 0) {
      this.errorMessage = this.translatePipe.transform('errorMsg.enter_value');
    } else {
      if (!isNaN(Number(mobno.slice(2)))) {
        this.errorMessage = this.translatePipe.transform(
          'errorMsg.invalid_onwerId'
        );
      } else {
        this.errorMessage = this.translatePipe.transform(
          'errorMsg.owner_name_err'
        );
      }
    }
    return;
  }

  fetchAnimalList(request: any): void {
    const param = request.text;
    if (!this.isTagidSearch) {
      this.animalDetail = [];
      this.animalDetailOnSearch = [];
      this.dataSource.data = [];
    }
    this.isTagidSearch =
      !isNaN(param) &&
      (param?.length == 8 || param?.length == 11 || param?.length == 12);
    this.isLoadingSpinner = true;
    this.vaccinationService.getAnimalList(request).subscribe(
      (res: any) => {
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
          this.animalDetail = [];
          this.animalDetailOnSearch = [];
          this.dataSource.data = res ?? [];
          this.isLoadingSpinner = false;
        }
        //this.dataSource.data = res ?? [];
        this.isAnimalTableVisible = true;
        this.searchForm.reset();
        this.searchForm.patchValue({
          ownerType: this.ownerType.individual,
          searchValue: null,
        });
        this.errorMessage = '';
        this.setUsersForm();
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
        if (!this.isTagidSearch) {
          this.animalDetail = [];
          this.animalDetailOnSearch = [];
          this.isAnimalTableVisible = false;
        }
        //this.searchForm.reset();
        this.errorMessage = '';
      }
    );
  }
  //API FOR WITHOUT CAMPAIGN
  villageListWithoutCam() {
    this.isLoadingSpinner = true;
    this.intimationReportService.getVillagesByUser().subscribe(
      (data: any) => {
        this.isLoadingSpinner = true;
        this.totalVillageList = data ?? [];
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  VaccinationFor() {
    this.isLoadingSpinner = true;
    this.vaccinationService.getVaccinationFor().subscribe(
      (data) => {
        this.isLoadingSpinner = true;
        this.getVaccinationFor = data;
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  vaccForSelected(event) {
    if (event) {
      this.diseaseCode = event;
      this.isLoadingSpinner = true;
      this.vaccinationService.getVaccinationName(this.diseaseCode).subscribe(
        (res: any) => {
          this.isLoadingSpinner = true;
          this.getVaccinationName = res ?? [];
          this.getVaccType = [];
          this.isLoadingSpinner = false;
          this.withoutCampaignForm.patchValue({
            VaccinationName: null,
            vaccinationType: null,
            vaccinationSubType: null,
          });
        },
        (error) => {
          this.isLoadingSpinner = false;
          this.getVaccinationName = [];
          this.getVaccType = [];
          this.withoutCampaignForm.patchValue({
            VaccinationName: null,
            vaccinationType: null,
            vaccinationSubType: null,
          });
        }
      );
    } else {
      this.getVaccinationName = [];
      this.getVaccType = [];
    }
  }

  vaccNameSelected(event) {
    this.vaccCode = event;
    if (this.vaccCode) {
      const data = {
        diseaseCd: this.diseaseCode,
        vaccineCd: this.vaccCode,
      };
      this.isLoadingSpinner = true;
      this.vaccinationService.getVaccineTypeSubType(data).subscribe(
        (res: any) => {
          this.isLoadingSpinner = true;
          this.getVaccType = res ?? [];
          this.speciesData(this.getVaccType);
          for (let data of this.getVaccType) {
            this.diseaseDescwithout = data.diseaseDesc;
            this.manufacName = data.manufacturer;
            this.VaccineNamewithout = data.vaccineName;
          }
          let data = this.getVaccType.filter(
            (element) => element.vaccineCd == event
          );
          const vaccTypes = data.map((a) => {
            return {
              vaccineTypeCd: a.vaccineTypeCd,
              vaccineTypeName: a.vaccineTypeName,
            };
          });
          this._values2 = this.removeDuplicateTypes(vaccTypes);
          this.vaccTypeCode = this._values2[0].vaccineTypeCd;

          this.subTypeValue = data.map((a) => {
            return {
              vaccineSubtypeCd: a.vaccineSubtypeCd,
              vaccineSubtypeName: a.vaccineSubtypeName,
            };
          });
          this.vaccSubTypeCode = this.subTypeValue[0].vaccineSubtypeCd;
          this.withoutCampaignForm.patchValue({
            vaccinationType: this._values2[0].vaccineTypeName,
            vaccinationSubType: this.subTypeValue[0].vaccineSubtypeName,
          });

          this.isLoadingSpinner = false;
        },
        (error) => {
          this.isLoadingSpinner = false;
          this.getVaccType = [];
        }
      );
    } else {
      this.isLoadingSpinner = false;
      this.getVaccType = [];
    }
  }

  removeDuplicateTypes(arrayOfObjects) {
    const uniqueObjects = new Map();
    const filteredArray = arrayOfObjects.filter((obj) => {
      const key = obj.vaccineTypeCd + obj.vaccineTypeName;
      if (!uniqueObjects.has(key)) {
        uniqueObjects.set(key, obj);
        return true;
      }
      return false;
    });
    return filteredArray;
  }

  speciesData(getVaccType) {
    for (let data of getVaccType) {
      this.vaccSubTypeCode = data.vaccineSubtypeCd;
      this.vaccTypeCode = data.vaccineTypeCd;
    }

    let data = {
      vaccineSubtypeCd: this.vaccSubTypeCode,
      vaccineCd: this.vaccCode,
      vaccineTypeCd: this.vaccTypeCode,
    };
    this.isLoadingSpinner = true;
    this.campaignService.getSpecies(data).subscribe(
      (res: any) => {
        // this.getSpeciesType = res ?? [];
        this.getSpeciesType = res.map((a) => a.speciesCd) ?? [];
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
        this.getSpeciesType = null;
      }
    );
  }

  villageWithoutSelected() {
    this.dataSourceOnSearch.data = [];
    this.animalDetailWithOutCampaign.length = 0;
    this.dataSourceWithOutCampaign.data = [];
    //this.searchForm.reset();
    if (!this.withoutCampaignForm?.value?.vaccinationFor) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'vaccination.please_select_vaccination_for'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
      setTimeout(() => {
        this.selectVillageWithout.reset();
      }, 100);
      return;
    } else if (!this.withoutCampaignForm?.value?.VaccinationName) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'vaccination.please_select_vaccination_name'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
      this.selectVillageWithout.reset();
      return;
    } else if (!this.withoutCampaignForm?.value?.vaccinationType) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'vaccination.please_select_vaccination_type'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
      this.selectVillageWithout.reset();
      return;
    } else if (!this.withoutCampaignForm?.value?.vaccinationSubType) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'vaccination.please_select_vaccination_sub_type'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
      this.selectVillageWithout.reset();
      return;
    }

    // this.isLoadingSpinner = true;
    // const data = {
    //   villageCd: this.selectVillageWithout.value.villageCd,
    //   vaccinationDewormingFlag: 'V',
    //   vaccineCd: this.vaccCode,
    //   vaccineTypeCd: this.vaccTypeCode,
    //   vaccineSubtypeCd: this.vaccSubTypeCode,
    // };
    // this.isLoadingSpinner = false;
  }

  getAnimalListforWithoutCampaign(request) {
    if (this.selectVillageWithout?.value?.villageCd) {
      if (!this.isTagidSearch) {
        this.animalDetail = [];
        this.animalDetailOnSearch = [];
        this.dataSourceWithOutCampaign.data = [];
      }
      const param = request.text;
      this.isTagidSearch =
        !isNaN(param) &&
        (param?.length == 8 || param?.length == 11 || param?.length == 12);
      this.isLoadingSpinner = true;
      this.vaccinationService.getWithoutCampaignAnimalList(request).subscribe(
        (res: any) => {
          if (this.isTagidSearch) {
            const tIndex = this.dataSourceWithOutCampaign.data.findIndex(
              (a: any) => a.tagId == res[0].tagId
            );
            if (tIndex == -1) {
              if (res.length)
                this.dataSourceWithOutCampaign.data = [
                  ...this.dataSourceWithOutCampaign.data,
                  ...res,
                ];
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
            this.animalDetail = [];
            this.animalDetailOnSearch = [];
            this.dataSourceWithOutCampaign.data = res ?? [];
          }
          //this.dataSourceWithOutCampaign.data = res ?? [];
          this.isAnimalTableWithoutVisible = true;
          this.searchForm.patchValue({ searchValue: '' });
          this.isAnimalOnSearch = false;
          this.isTableVisible = false;
          this.searchForm.value.searchValue = null;
          this.isLoadingSpinner = false;
          this.searchForm.reset();
          this.searchForm.patchValue({
            ownerType: this.ownerType.individual,
            searchValue: null,
          });
          this.errorMessage = '';
          this.setUsersFormWithout();
        },
        (error) => {
          this.isLoadingSpinner = false;
          this.searchForm.value.searchValue = null;
          this.isAnimalTableWithoutVisible = false;
          this.searchForm.reset();
          this.searchForm.patchValue({
            ownerType: this.ownerType.individual,
            searchValue: null,
          });
          this.errorMessage = '';
          this.selectVillageWithout.reset();
        }
      );
    }
  }

  calculateAge(months: number) {
    const year = Math.floor(months / 12);
    const month = months % 12;
    return String(year) + 'Y' + ' ' + String(month) + 'M';
  }

  // // API Intregation Data Value ends ///////

  // WITHOUT CAMPAIGN CONDITION STARTS

  private setUsersFormWithout() {
    const userCtrl = this.animalListWithOutCampaign.get(
      'selected_tagId_withOutCampaign'
    ) as FormArray;
    this.dataSourceWithOutCampaign.data.forEach((user) => {
      userCtrl.push(this.setUsersFormWithoutArray(user));
    });
  }
  private setUsersFormWithoutArray(user) {
    return this.formBuilder.group({
      tag_id: [user.tag_id],
    });
  }

  checkAllBoxesWithOutCampaign(event) {
    this.animalDetailWithOutCampaign.length = 0;
    if (event.target.checked) {
      // for (var i = 0; i < this.dataSource.filteredData.length; i++) {
      //    this.animalDetail.push(this.dataSource.filteredData[i]);
      //   this.animalDetail.push(this.dataSource.data[i]);
      // }
      for (var i = 0; i < this.dataSourceWithOutCampaign.data.length; i++) {
        this.animalDetailWithOutCampaign.push(
          this.dataSourceWithOutCampaign.data[i]
        );
      }
    }
  }

  onCheckboxChangeWithOutCampaign(event, element: AnimalListWithout) {
    if (event.target.checked) {
      this.animalDetailWithOutCampaign.push(element);
    } else {
      this.animalDetailWithOutCampaign.forEach((value, index) => {
        if (value.tagId === element.tagId)
          this.animalDetailWithOutCampaign.splice(index, 1);
      });
    }
    this.noOfBoxesWithout = this.animalDetailWithOutCampaign.length;
  }

  checkIfInSelectedListWithOutCampaign(element: AnimalListWithout) {
    return this.animalDetailWithOutCampaign.includes(element);
  }

  onClickingRemoveWithOutCampaign(element: AnimalListWithout) {
    this.animalDetailWithOutCampaign.forEach((value, index) => {
      if (value.tagId === element.tagId)
        this.animalDetailWithOutCampaign.splice(index, 1);
    });
  }
  // WITHOUT CAMPAIGN CONDITION ENDS ?????????????? ?? /////////////////

  // WITH CAMPAIGN STARTS
  private setUsersForm() {
    this.isLoadingSpinner = true;
    const userCtrl = this.animalListForm.get(
      'selected_tagId_details'
    ) as FormArray;
    this.dataSource.data.forEach((user) => {
      userCtrl.push(this.setUsersFormArray(user));
    });
    this.isLoadingSpinner = false;
  }
  private setUsersFormArray(user) {
    return this.formBuilder.group({
      tag_id: [user.tag_id],
    });
  }

  checkAllBoxes(event) {
    this.animalDetail.length = 0;
    if (event.target.checked) {
      // for (var i = 0; i < this.dataSource.filteredData.length; i++) {
      //    this.animalDetail.push(this.dataSource.filteredData[i]);
      //   this.animalDetail.push(this.dataSource.data[i]);
      // }
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
    return !!this.animalDetail.find((obj) => {
      return obj.tagId === element.tagId;
    });
  }

  onClickingRemove(element: Animal) {
    this.animalDetail.forEach((value, index) => {
      if (value.tagId === element.tagId) this.animalDetail.splice(index, 1);
    });
  }

  // WITH CAMPAIGN ENDS

  // All Filters Starts

  onFilter() {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();

      if (this.filterForm.get('filter')?.value.length == 0) {
        this.errorMessage = this.translatePipe.transform(
          'errorMsg.enter_value'
        );
      }
      return;
    } else {
      if (!this.selectVillage) {
        this.errorMessage = 'Please Select Village First';
        return;
      }
      this.isLoadingSpinner = false;
      this.errorMessage = '';
      this.dataSource.filter = this.filterForm.get('filter').value;
    }

    //  this.animalDetail = this.animalDetail.filter(value=>this.dataSource.filteredData.includes(value))
  }
  onFilterwithOutCampaign() {
    if (this.filterFormwithOutCampaign.invalid) {
      this.filterFormwithOutCampaign.markAllAsTouched();

      if (
        this.filterFormwithOutCampaign.get('filterwithOutCampaign')?.value
          .length == 0
      ) {
        this.errorMessageWithout = this.translatePipe.transform(
          'errorMsg.enter_value'
        );
      }
      return;
    } else {
      if (!this.totalVillageList) {
        this.errorMessage = this.translatePipe.transform(
          'errorMsg.please_select_village_first'
        );
        return;
      }
      this.isLoadingSpinner = false;
      this.errorMessage = '';
      this.dataSourceWithOutCampaign.filter =
        this.filterFormwithOutCampaign.get('filterwithOutCampaign').value;
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  applyFilterwithoutCamp(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceWithOutCampaign.filter = filterValue.trim().toLowerCase();
  }
  applyFilterOnSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceOnSearch.filter = filterValue.trim().toLowerCase();
  }

  // All Filters Ends
  fetchTable() {
    this.withoutCampaignTableSubmitted = true;
    if (this.withoutCampaignForm.invalid) {
      return;
    } else {
      this.isAnimalTableVisible = true;
    }
  }

  get f() {
    return this.withoutCampaignForm.controls;
  }
  onSubmitwithoutCampaignForm(): void {
    this.submitted = true;
    if (this.withoutCampaignForm.invalid) {
      return;
    }
  }

  animalList(): void {
    let selectedtagId = [];
    for (let animal of this.animalDetail) {
      selectedtagId.push({
        tagId: animal.tagId,
        animalId: animal.animalId,
        ownerId: animal.ownerId,
      });
    }
    this.submitted = true;
    if (this.selectedCampId === -1) {
      this.dialog.open(ConfirmationDialogComponent, {
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
    } else if (!this.selectVillage) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'vaccination.please_select_village'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          panelClass: 'custom-modalbox',
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
      return;
    } else {
      if (selectedtagId.length == 0) {
        this.dialog.open(ConfirmationDialogComponent, {
          data: {
            title: this.translateService.instant('common.info_label'),
            message: this.translateService.instant(
              'vaccination.please_select_atleast_one_animal_list'
            ),
            primaryBtnText: this.translateService.instant('common.ok_string'),
            errorFlag: true,
            icon: 'assets/images/info.svg',
          },
          width: '500px',
          panelClass: 'common-info-dialog',
        });
        return;
      } else {
        if (selectedtagId) {
          this.dialog.open(CampaignDetailComponent, {
            disableClose: true,
            width: '90vw',
            height: '80vh',
            panelClass: 'custom-dialog-container',
            data: {
              selectedtagId,
              campdata: this.infoData,
            },
          });
        }
      }
    }
  }

  animalListWithoutCampaignSubmit() {
    this.batchNumberWithoutCampaign =
      this.withoutCampaignForm.value.batchNumber;
    let selectedtagIdWithOutCampaign = [];
    for (let animal of this.animalDetailWithOutCampaign) {
      selectedtagIdWithOutCampaign.push({
        tagId: animal.tagId,
        animalId: animal.animalId,
        ownerId: animal.ownerId,
      });
    }
    this.submitted = true;

    if (!this.withoutCampaignForm.value.vaccinationFor) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'vaccination.please_select_vaccination_for'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
      return;
    } else if (!this.withoutCampaignForm.value.VaccinationName) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'vaccination.please_select_vaccination_name'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
      return;
    } else if (!this.selectVillageWithout.value) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'vaccination.please_select_village'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          panelClass: 'custom-modalbox',
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
      return;
    } else if (
      !this.withoutCampaignForm.value.batchNumber ||
      this.withoutCampaignForm.get('batchNumber').invalid
    ) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'vaccination.please_enter_batch_number'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
      return;
    } else {
      if (selectedtagIdWithOutCampaign.length == 0) {
        this.dialog.open(ConfirmationDialogComponent, {
          data: {
            title: this.translateService.instant('common.info_label'),
            message: this.translateService.instant(
              'vaccination.please_select_atleast_one_animal_list'
            ),
            primaryBtnText: this.translateService.instant('common.ok_string'),
            errorFlag: true,
            icon: 'assets/images/info.svg',
          },
          width: '500px',
          panelClass: 'common-info-dialog',
        });
        return;
      } else {
        if (selectedtagIdWithOutCampaign) {
          this.dialog.open(WithoutCampDetailsComponent, {
            disableClose: true,
            width: '90vw',
            height: '80vh',
            panelClass: 'custom-dialog-container',
            data: {
              selectedtagIdWithOutCampaign,
              batch: this.batchNumberWithoutCampaign,

              diseaseDesc: this.diseaseDescwithout,
              manufacturer: this.manufacName,
              vaccineName: this.VaccineNamewithout,
              diseaseCodeName: this.diseaseCode,
              vaccineCd: this.vaccCode,
              vaccineTypeCd: this.vaccTypeCode,
              vaccineSubtypeCd: this.vaccSubTypeCode,
            },
          });
        }
      }
    }
  }

  withCampaignCancel() {
    this.animalListForm.reset();
    this.animalDetail = [];
    this.animalDetailOnSearch = [];
    this.getVillageList = [];
    this.dataSource.data = [];
    this.eligibleCountList = [];
    this.vaccinatedAnimalCountInVillage = [];
    this.totalAnimalCount = [];
    this.totalVaccinatedAnimalCount = [];
    this.selectedCampId = -1;
    this.selectVillage = null;
    this.animalDetail.length = 0;
    this.withoutCampaignForm.reset();
    this.filterForm.reset();
    this.isAnimalTableVisible = false;
    this.isAnimalTableWithoutVisible = false;
    this.searchForm.reset();
    this.searchForm.patchValue({
      ownerType: this.ownerType.individual,
      searchValue: null,
    });
    this.searchCam = '';
    this.dataSource.data = [];
    this.isAndFilterTrue = false;
  }
  withoutCampaignCancel() {
    this.animalListWithOutCampaign.reset();
    this.animalDetailWithOutCampaign = [];
    this.getVillageList = [];
    this.dataSourceWithOutCampaign.data = [];
    this.dataSourceOnSearch.data = [];
    this.eligibleCountList = [];
    this.getVaccinationName = [];
    this.getVaccinationFor = [];
    //this.VaccinationFor();
    this.isAnimalTableVisible = false;
    this.isAnimalTableWithoutVisible = false;
    this.getVaccinationFor = [];
    this.animalDetail.length = 0;
    this.searchForm.reset();
    this.searchForm.patchValue({
      ownerType: this.ownerType.individual,
      searchValue: null,
    });
    this.getVaccType = [];
    this._values2 = [];
    this.getRouteName = [];
    this.getDose = [];
    this.getUnit = [];
    this.withoutCampaignForm.reset();
  }
  OnSearchCancel() {
    this.animalListOnSearch.reset();
    this.searchForm.reset();
    this.searchForm.patchValue({
      ownerType: this.ownerType.individual,
      searchValue: null,
    });
    this.getVaccType = [];
    this._values2 = [];
    this.getRouteName = [];
    this.getDose = [];
    this.getUnit = [];
    this.animalDetailOnSearch = [];
    this.getVillageList = [];
    this.dataSourceOnSearch.data = [];
    this.isAnimalTableVisible = false;
    this.isAnimalTableWithoutVisible = false;
    this.eligibleCountList = [];
    this.getVaccinationName = [];
    this.getVaccinationFor = [];
    this.VaccinationFor();
    this.withoutCampaignForm.reset();
  }

  dateFormatChange(date: String) {
    date = date.substring(0, 10);
    return date.split('-').reverse().join('/');
  }

  searchInOwners(event: Event) {
    const filterOwnerValue = (event.target as HTMLInputElement).value;
    this.tableDataSourceOwner.filter = filterOwnerValue.trim().toLowerCase();
    if (this.tableDataSourceOwner.paginator) {
      this.tableDataSourceOwner.paginator.firstPage();
    }
  }

  searchResults(searchObj: SearchValue) {
    this.searchObj = searchObj;
    // if (!this.isTagidSearch) {
    //   this.animalDetail = [];
    //   this.animalDetailOnSearch = [];
    //   this.dataSourceOnSearch.data = []
    // };
    if (!this.withoutCampaignForm.value.vaccinationFor) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'vaccination.please_select_vaccination_for'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
      return;
    } else if (!this.withoutCampaignForm.value.VaccinationName) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'vaccination.please_select_vaccination_name'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
      return;
    } else if (!this.withoutCampaignForm.value.vaccinationType) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'vaccination.please_select_vaccination_type'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
      return;
    } else if (!this.withoutCampaignForm.value.vaccinationSubType) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'vaccination.please_select_vaccination_sub_type'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
      });
      return;
    }

    if (this.child?.searchForm.invalid) {
      this.validateAnimalForm(this.child?.searchForm.get('searchValue')?.value);
    } else if (this.selectVillageWithout?.value?.villageCd) {
      if (!searchObj.searchValue) {
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
        this.isAndFilterTrue = true;
        return;
      }
      const request = {
        villageCd: this.selectVillageWithout.value.villageCd,
        vaccinationDewormingFlag: 'V',
        vaccineCd: this.vaccCode,
        vaccineTypeCd: this.vaccTypeCode,
        vaccineSubtypeCd: this.vaccSubTypeCode,
        text: searchObj?.searchValue,
        ownerType: searchObj.ownerType,
      };
      this.getAnimalListforWithoutCampaign(request);
    } else if (
      (this.searchObj.searchValue.length == 8 ||
        this.searchObj.searchValue.length == 11 ||
        this.searchObj.searchValue.length == 12) &&
      !isNaN(+this.searchObj.searchValue)
    ) {
      this.isTagidSearch = true;
      this.getDetailsByTagID(this.searchObj.searchValue);
    } else {
      this.isLoadingSpinner = true;
      this.errorMessage = '';
      this.ownerDS.getOwnerByMobile(searchObj.searchValue,
        searchObj.ownerType == 2
      ).subscribe(
        (data: OwnerData[]) => {
          this.tableDataSourceOwner = new MatTableDataSource(data);
          this.ownerDetailsRecord = data;
          this.isLoadingSpinner = false;
          if (this.ownerDetailsRecord.length > 1) {
            this.isTableVisible = true;
            this.isAnimalOnSearch = false;
            this.isAnimalTableWithoutVisible = false;
            //this.selectVillageWithout.reset();
          } else if (this.ownerDetailsRecord.length == 1) {
            this.isTableVisible = false;
            this.isAnimalOnSearch = false;
            this.isAnimalTableWithoutVisible = false;
            this.selectVillageWithout.reset();
            this.showOwnerDetails(this.ownerDetailsRecord[0].ownerId);
          } else {
            this.checkSearchValidity();
          }
        },
        (error) => {
          this.isLoadingSpinner = false;
          //this.selectVillageWithout.reset();
          this.isAnimalOnSearch = false;
          this.isAnimalTableWithoutVisible = false;
          this.searchForm.patchValue({ searchValue: '' });
          this.searchForm.value.searchValue = null;
        }
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
          this.isLoadingSpinner = false;
          if (
            this.ownerDetailsByID.animalsList &&
            this.ownerDetailsByID.animalsList.length
          ) {
            for (let animal of this.ownerDetailsByID.animalsList) {
              if (animal.ageInMonths) {
                animal.ageInMonths = this.getWords(animal.ageInMonths);
              } else if (animal.ageInDays) {
                animal.ageInMonths = `${animal.ageInDays}D`;
              }
              animal['ownerName'] = this.ownerDetailsByID?.ownerName;
              animal['breedDesc'] =
                animal.breedAndExoticLevels &&
                  animal.breedAndExoticLevels.length > 1
                  ? 'Cross Breed'
                  : animal.breedAndExoticLevels &&
                    animal.breedAndExoticLevels.length
                    ? animal.breedAndExoticLevels[0].breed
                    : 'NA';
            }
          }
          let animalList = this.ownerDetailsByID.animalsList?.filter(
            (a) =>
              this.getSpeciesType.includes(a.speciesCd) && a.animalStatusCd == 1
          );
          if (animalList && animalList.length) {
            this.dataSourceOnSearch = new MatTableDataSource(animalList);
            this.clickedOwnerName =
              this.ownerDetailsByID.ownerFirstName +
              ' ' +
              this.ownerDetailsByID?.ownerMiddleName +
              ' ' +
              this.ownerDetailsByID.ownerLastName;
            this.clickedOwnerMobNo = this.ownerDetailsByID?.ownerMobileNo;

            this.dataSourceOnSearchOwnerName = this.ownerDetailsByID.ownerName;
            this.dataSourceOnSearchVillage = this.ownerDetailsByID.ownerVillageName;
            this.isTableVisible = false;
            this.isAnimalOnSearch = true;
            this.selectVillageWithout.reset();
            this.isAnimalTableWithoutVisible = false;
            this.setUsersFormOnSearch();
            // this.isTableVisible = false;
            // this.isAnimalOnSearch = true;
            // this.dataSourceOnSearch.data = res?.animalsList
            //   ? res?.animalsList?.map((animal) => ({ ...res, ...animal }))
            //   : [];
            // this.isLoadingSpinner = false;
            this.animalsCount = res.animalsCount;
          }
          else {
            this.dataSourceOnSearch = new MatTableDataSource([]);
            this.isAnimalOnSearch = false;
            this.dialog.open(ConfirmationDialogComponent, {
              data: {
                title: this.translateService.instant('common.info_label'),
                message: this.translateService.instant(
                  'vaccination.animal_not_found_for_selected_details'

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
        },
        (err) => {
          this.isLoadingSpinner = false;
          this.isAnimalOnSearch = false;
          this.selectVillageWithout.reset();
          this.isAnimalTableWithoutVisible = false;
          this.searchForm.patchValue({ searchValue: '' });
          this.searchForm.value.searchValue = null;
        }
      );
  }
  onPageAnimalPageChange(event: PageEvent) {
    this.animalPageIndex = event.pageIndex;
    this.animalPageSize = event.pageSize;
    this.showOwnerDetails(this.ownerDetailsByID?.ownerId);
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
    this.noOfActiveAnimals = 0;
    this.isLoadingSpinner = true;
    this.isTableVisible = false;
    this.healthService.getDetailsByTagID(searchValue).subscribe(
      (searchResult: any) => {
        this.isLoadingSpinner = false;
        this.ownerDetailsByID = searchResult.ownerDetails;
        var animalList: any = <AnimalsList>{};
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
        if (searchResult.ownerDetails.ownerId) {
          this.ownerTypeCd = searchResult?.ownerDetails.ownerTypeCd;

          this.isAnimalOnSearch = true;
        } else {
          this.ownerTypeCd = OwnerType.organization;


          this.isAnimalOnSearch = true;
        }
        // if (searchResult.ownerDetails.ownerId) {
        //   this.ownerTypeCd = String(
        //     searchResult.ownerDetails.ownerId
        //   ).startsWith('1')
        //     ? 1
        //     : 2;

        //   this.isAnimalOnSearch = true;
        // }
        //animalList.ageInMonths = this.getWords(animalList.ageInMonths);
        if (animalList.ageInMonths) {
          animalList.ageInMonths = this.getWords(animalList.ageInMonths);
        } else if (animalList.ageInDays) {
          animalList.ageInMonths = `${animalList.ageInDays}D`;
        }
        animalList['ownerName'] = animalList?.ownerDetails?.ownerName;
        animalList['breedDesc'] =
          animalList.breedAndExoticLevels &&
            animalList.breedAndExoticLevels.length > 1
            ? 'Cross Breed'
            : animalList.breedAndExoticLevels &&
              animalList.breedAndExoticLevels.length
              ? animalList.breedAndExoticLevels[0].breed
              : 'NA';
        let animalListdata = [animalList]?.filter(
          (a) =>
            this.getSpeciesType.includes(a.speciesCd) && a.animalStatusCd == 1
        );
        if (animalListdata && animalListdata.length) {
          const tIndex = this.dataSourceOnSearch.data.findIndex(
            (a: any) => a.tagId == animalListdata[0].tagId
          );
          if (tIndex == -1) {
            if (animalListdata.length)
              this.dataSourceOnSearch.data = [
                ...this.dataSourceOnSearch.data,
                ...animalListdata,
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
          if (!this.isTagidSearch) {
            this.animalDetail = [];
            this.animalDetailOnSearch = [];
            this.dataSourceOnSearch.data = [];
          }
          this.dialog.open(ConfirmationDialogComponent, {
            data: {
              title: this.translateService.instant('common.info_label'),
              message: this.translateService.instant(
                'vaccination.animal_not_found_for_selected_details'
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
        this.dataSourceOnSearchOwnerName =
          this.ownerDetailsByID.ownerName ?? this.ownerDetailsByID.orgName;
        this.dataSourceOnSearchVillage =
          this.ownerDetailsByID.ownerVillageName ??
          this.ownerDetailsByID.orgAddress;
        this.animalsCount = 1;
        this.isTableVisible = false;
        this.isAnimalOnSearch = true;
        this.isAnimalTableWithoutVisible = false;
        this.setUsersFormOnSearch();
      },
      (error) => {
        this.isLoadingSpinner = false;
        if (!this.isTagidSearch) {
          this.isTableVisible = false;
          this.isAnimalOnSearch = false;
        }
        this.isAnimalTableWithoutVisible = false;
        this.searchForm.patchValue({ searchValue: '' });
        this.searchForm.value.searchValue = null;
        this.isTableVisible = false;
      }
    );
  }

  // getOwnerDetailsByID(ownerId: string) {
  //   this.isLoadingSpinner = true;
  //   this.vaccinationService.getOwnerByOwnerID(ownerId).subscribe(
  //     (data: any) => {
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
  //           animal['ownerName'] = this.ownerDetailsByID?.ownerName;
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
  //       let animalList = this.ownerDetailsByID.animalsList?.filter(
  //         (a) =>
  //           this.getSpeciesType.includes(a.speciesCd) && a.animalStatusCd == 1
  //       );
  //       if (animalList && animalList.length) {
  //         this.dataSourceOnSearch = new MatTableDataSource(animalList);
  //         this.clickedOwnerName =
  //           this.ownerDetailsByID.ownerFirstName +
  //           ' ' +
  //           this.ownerDetailsByID?.ownerMiddleName +
  //           ' ' +
  //           this.ownerDetailsByID.ownerLastName;
  //         this.clickedOwnerMobNo = this.ownerDetailsByID?.ownerMobileNo;

  //         this.dataSourceOnSearchOwnerName = this.ownerDetailsByID.ownerName;
  //         this.dataSourceOnSearchVillage = this.ownerDetailsByID.ownerVillageName;
  //         this.isTableVisible = false;
  //         this.isAnimalOnSearch = true;
  //         this.selectVillageWithout.reset();
  //         this.isAnimalTableWithoutVisible = false;
  //         this.setUsersFormOnSearch();
  //       }
  //       else {
  //         this.dataSourceOnSearch = new MatTableDataSource([]);
  //         this.isAnimalOnSearch = false;
  //         this.dialog.open(ConfirmationDialogComponent, {
  //           data: {
  //             title: this.translateService.instant('common.info_label'),
  //             message: this.translateService.instant(
  //               'vaccination.animal_not_found_for_selected_details'

  //             ),
  //             primaryBtnText: this.translateService.instant('common.ok_string'),
  //             errorFlag: true,
  //             icon: 'assets/images/info.svg',
  //           },
  //           width: '500px',
  //           panelClass: 'common-info-dialog',
  //         });
  //         return;
  //       }

  //       //this.vaccinationService.setOwnerDetailsTemp(this.ownerDetailsByID);
  //     },
  //     (err) => {
  //       this.isLoadingSpinner = false;
  //       this.isAnimalOnSearch = false;
  //       this.selectVillageWithout.reset();
  //       this.isAnimalTableWithoutVisible = false;
  //       this.searchForm.patchValue({ searchValue: '' });
  //       this.searchForm.value.searchValue = null;
  //     }
  //   );
  // }

  getWords(monthCount: any) {
    return monthCount ? this.treatmentService.getWords(monthCount) : null;
  }

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
    this.isTableVisible = false;
    this.isAnimalOnSearch = false;
    this.selectVillageWithout.reset();
    this.isAnimalTableWithoutVisible = false;
    this.searchForm.patchValue({ searchValue: '' });
    this.searchForm.value.searchValue = null;
  }

  formatDate(date) {
    if (date) {
      return moment(new Date(date)).format('DD/MM/YYYY');
    }
    return null;
  }

  resetValue() {
    this.searchForm.patchValue({ searchValue: '' });
    this.errorMessage = '';
    this.dataSourceOnSearch.paginator = null;
    this.animalPageIndex = 0;
    this.animalPageSize = 5;
    this.animalsCount = 0;
    this.isAnimalOnSearch = false;
    if (!this.isTagidSearch) {
      this.animalDetail = [];
      this.animalDetailOnSearch = [];
      this.isAnimalOnSearch = false;
    }
  }
  resetIndividualValue() {
    this.isAnimalTableWithoutVisible = false;
    this.isAnimalTableVisible = false;
    this.isAnimalOnSearch = false;
    this.isTableVisible = false;
    this.errorMessage = '';
    this.ownerTypeCd = OwnerType.individual;
    this.ownerDetailsRecord = [];
  }
  // ON SEARCH CONDITION STARTS

  private setUsersFormOnSearch() {
    const userCtrl = this.animalListOnSearch.get(
      'selected_tagId_OnSearch'
    ) as FormArray;
    this.dataSourceOnSearch.data.forEach((user) => {
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
      for (var i = 0; i < this.dataSourceOnSearch.data.length; i++) {
        this.animalDetailOnSearch.push(this.dataSourceOnSearch.data[i]);
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
    return this.animalDetailOnSearch
      .map((e) => e.tagId)
      .includes(element?.tagId);
  }

  onClickingRemoveOnSearch(element: AnimalsList) {
    this.animalDetailOnSearch.forEach((value, index) => {
      if (value.tagId === element.tagId)
        this.animalDetailOnSearch.splice(index, 1);
    });
  }

  animalListOnSearchSubmit() {
    this.batchNumberWithoutCampaign =
      this.withoutCampaignForm.value.batchNumber;
    let selected_tagId_OnSearch = [];
    for (let animal of this.animalDetailOnSearch) {
      selected_tagId_OnSearch.push({
        tagId: animal.tagId,
        animalId: animal.animalId,
        ownerId: animal.ownerId,
      });
    }
    this.submitted = true;

    if (!this.withoutCampaignForm.value.vaccinationFor) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'vaccination.please_select_vaccination_for'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
      return;
    } else if (!this.withoutCampaignForm.value.VaccinationName) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'vaccination.please_select_vaccination_name'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
      return;
    } else if (
      !this.withoutCampaignForm.value.batchNumber ||
      this.withoutCampaignForm.get('batchNumber').invalid
    ) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'vaccination.please_enter_batch_number'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
      return;
    } else {
      if (selected_tagId_OnSearch.length == 0) {
        this.dialog.open(ConfirmationDialogComponent, {
          data: {
            title: this.translateService.instant('common.info_label'),
            message: this.translateService.instant(
              'vaccination.please_select_atleast_one_animal_list'
            ),
            primaryBtnText: this.translateService.instant('common.ok_string'),
            errorFlag: true,
            icon: 'assets/images/info.svg',
          },
          width: '500px',
          panelClass: 'common-info-dialog',
        });
        return;
      } else {
        if (selected_tagId_OnSearch) {
          this.dialog.open(OnSearchDetailsComponent, {
            disableClose: true,
            width: '90vw',
            height: '80vh',
            panelClass: 'custom-dialog-container',
            data: {
              selected_tagId_OnSearch,
              batch: this.batchNumberWithoutCampaign,
              diseaseDesc: this.diseaseDescwithout,
              manufacturer: this.manufacName,
              vaccineName: this.VaccineNamewithout,
              diseaseCodeName: this.diseaseCode,
              vaccineCd: this.vaccCode,
              vaccineTypeCd: this.vaccTypeCode,
              vaccineSubtypeCd: this.vaccSubTypeCode,
            },
          });
        }
      }
    }
  }

  // ON SEARCH CONDITION ENDS ?????????????? ?? /////////////////

  //view-more//
  openDialogWithCampaign(): void {
    const dialogRef = this.dialog.open(ViewMoreVaccinationComponent, {
      width: '700px',
      height: '80vh',
      panelClass: 'custom-dialog-container',
      data: {
        selectedTagIds: this.animalDetail,
      },
    });
  }
  openDialogWithoutCampaign(): void {
    const dialogRef = this.dialog.open(ViewMoreVaccinationComponent, {
      width: '700px',
      height: '80vh',
      panelClass: 'custom-dialog-container',
      data: {
        selectedTagIds: this.animalDetailWithOutCampaign,
      },
    });
  }
  openDialogOnSearch(): void {
    const dialogRef = this.dialog.open(ViewMoreVaccinationComponent, {
      width: '700px',
      height: '80vh',
      panelClass: 'custom-dialog-container',
      data: {
        selectedTagIds: this.animalDetailOnSearch,
      },
    });
  }
  viewAnimalHistory(element) {
    this.healthService.viewAnimalHistory(element, 3);
  }

  filterCampaigns() {
    if (this.showAllCampaigns) {
      this.getCampaignList = this.campaigns;
    } else {
      this.getCampaignList = this.campaigns.filter((campaign: Campaign) => {
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

  get ownerType() {
    return OwnerType;
  }
}
