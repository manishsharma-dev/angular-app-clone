import { Vaccination } from './../vaccination/vaccination.model';
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CampaignCreationDialogComponent } from './campaign-creation-dialog/campaign-creation-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, Sort } from '@angular/material/sort';
import { CampaignCreationViewDialogComponent } from './campaign-creation-view-dialog/campaign-creation-view-dialog.component';
import { CampaignCreationEditDialogComponent } from './campaign-creation-edit-dialog/campaign-creation-edit-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { VaccinationService } from '../vaccination/vaccination.service';
import { Campaign } from '../vaccination/models/campaign.model';
import moment from 'moment';
import {
  AlphaNumericSpecialValidation,
  AlphaNumericValidation,
  NamespecialValidation,
  onlyNumberValidation,
} from 'src/app/shared/utility/validation';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { VaccinationFor } from '../vaccination/models/vacc-For.model';
import {
  Species,
  VaccinationName,
  VaccinationType,
  VaccType,
} from '../vaccination/models/vacc-Name.model';
import { Village } from '../intimation-report/models/village.model';
import { IntimationReportService } from '../intimation-report/intimation-report.service';
import { CampaignCreationService } from './campaign-creation.service';
import { CampaignMaster, SaveCamCreation } from './models/camCreation.model';
import {
  BehaviorSubject,
  concat,
  forkJoin,
  iif,
  Observable,
  of,
  Subject,
  Subscription,
} from 'rxjs';
import {
  tap,
  distinctUntilChanged,
  switchMap,
  catchError,
  map,
} from 'rxjs/operators';
import { AnimalTreatmentService } from '../animal-treatment/animal-treatment.service';
import { CampaignType } from './models/campaignType.model';
import { ProjectManagementService } from '../../admin-management/project-management/project-management.service';
import { Project } from '../../admin-management/project-management/models/project.model';
import { Location } from '@angular/common';
import { UserManagementService } from '../../admin-management/user-management/user-management.service';
import { ErrorComponent } from 'src/app/core/error/error.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { MasterConfig } from 'src/app/shared/master.config';
import { TranslateService } from '@ngx-translate/core';
import { MatSelectChange } from '@angular/material/select';
import { GetProjectDetails } from './models/getProjectDetails.model';
import { randomWeibull } from 'd3';
import { decimalWithLengthValidation } from 'src/app/shared/utility/decimalWithLengthValidator';
import { getSessionData } from 'src/app/shared/shareService/storageData';
//interfaces
interface speciesDetails {
  speciesCd: string;
  formCd: string;
  routeCd: string;
  dosage: number;
  unitCd: number;
  // availableStock: number;
}

@Component({
  selector: 'app-campaign-creation',
  templateUrl: './campaign-creation.component.html',
  styleUrls: ['./campaign-creation.component.css'],
})
export class CampaignCreationComponent implements OnInit, OnDestroy {
  masterConfig = MasterConfig;
  displayedColumns: string[] = DISPLAYED_COLUMNS;
  affectedAnimalDisplayedColumns: string[] = affectedAnimal_Displayed_Columns;
  affectedAnimalDataSource = new BehaviorSubject<AbstractControl[]>([]);
  dataSource = new MatTableDataSource();
  speciesDetails = new MatTableDataSource();
  isLoadingSpinner: boolean = false;
  getCampaignList: Campaign[] = [];
  validationMsg = animalHealthValidations.campaignCreation;
  private withpaginator!: MatPaginator;
  public isShowError: string = '';
  itemForm: FormGroup;
  getVaccinationFor: VaccinationFor[] = [];
  SubmitReport: SaveCamCreation[] = [];
  campaignIdMessage: SaveCamCreation[] = [];
  Successmessage: SaveCamCreation[] = [];
  campaignTypeMessage: SaveCamCreation[] = [];
  diseaseCode: number;
  getVaccinationName: VaccinationName[] = [];
  vaccCode: number;
  getVaccType: VaccType[] = [];
  _values2: any = [];
  subTypeValue: any;
  vaccTypeCode: number;
  vaccSubTypeCode: any;
  getDose: any[][] = [];
  getUnit: any[][] = [];
  selectedSpeciesCD: any;
  getRouteName: any[][] = [];
  formData: any[][] = [];
  getSpeciesType: Species[] = [];
  fileList = [];
  submitted = false;
  state: Village[] = [];
  district: Village[] = [];
  tehsil = [];
  village = [];
  medcineInput$ = new Subject<string>();
  medicines!: Observable<any[]>;
  selectedMedicine = [];
  medicineLoading = false;
  tabDetails: boolean = false;
  compaignForm: boolean = false;
  selectedCampaignValue: number;
  @ViewChild('paginator') paginator: MatPaginator;
  private sort!: MatSort;
  filterValues = {};
  filterSelectObj = [];
  readonly filterForm: AbstractControl;
  temVillageList: Village[];
  campaignTypeData: CampaignType[] = [];
  projectData: Project[] = [];
  campaignCreationSubmitted = false;
  campMinStartDate: any;
  campMaxStartDate: any;
  campMinEndDate: any;
  campMaxEndDate: any;
  campMinEntryEndDate: any;
  campMaxEntryEndDate: any;
  selectedStartDate: string;
  selectedEndDate: string;
  projectTypeData: any;
  getVaccinationType: VaccinationType[] = [];
  getProjectDetailsData: GetProjectDetails[] = [];
  projectStartDate: any;
  projectEndDate: any;
  projectEntryEndDate: any;
  speciesData: { unitCd: any; formCd: any; routeCd: any }[];
  // Subscription Declarations
  stateCdSubscription!: Subscription;
  selectedDistrictSubscription!: Subscription;
  selectedTehsilSubscription!: Subscription;
  campaignStartDateSubscription!: Subscription;
  campaignEndDateSubscription!: Subscription;
  campaigndataEntryEndDateSubscription!: Subscription;
  userType;
  isLiveStackAdmin = (getSessionData('adminUser'));
  // Subscription Declarations

  constructor(
    private intimationReportService: IntimationReportService,
    private vaccinationService: VaccinationService,
    private camCreationService: CampaignCreationService,
    private projectService: ProjectManagementService,
    private treatmentService: AnimalTreatmentService,
    public userService: UserManagementService,
    private readonly translateService: TranslateService,
    public dialog: MatDialog,
    public formBuilder: FormBuilder
  ) { }
  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild('withpaginatorRef') set matPaginator(mp: MatPaginator) {
    this.withpaginator = mp;
    this.setDataSourceAttributes();
  }

  ngOnInit(): void {
    this.tabDetails = true;

    // this.getVaccinationTypeMaster();
    // this.CampaignList();
    // this.VaccinationFor();
    // this.campaignType();
    // this.projectType();

    this.createCampaignForm();
    this.pageLoadMethods();
    this.fetchMedicines();
    this.formFieldChange();
    this.isLoadingSpinner = true;
  }

  pageLoadMethods() {
    this.isLoadingSpinner = true;
    this.camCreationService.campaignList().subscribe((campaign: CampaignMaster[]) => {
      this.dataSource.data = campaign;
      this.isLoadingSpinner = false;
    }, err => this.isLoadingSpinner = false)
  }

  createRequestList() {
    const vaccinationRequest = [];
    const vaccinationTypeRequest = this.vaccinationService.getVaccinationType(VACCINATION_TYPE).pipe(catchError((err) => of(null)));
    const vaccinationForRequest = this.vaccinationService.getVaccinationFor().pipe(catchError((err) => of(null)));
    const campaignTypeRequest = this.camCreationService.campaignType(CAMPAIGN_TYPE).pipe(catchError((err) => of(null)));
    const projectTypeRequest = this.camCreationService.projectType().pipe(catchError((err) => of(null)));
    const admin = getSessionData('adminUser');

    vaccinationRequest.push(vaccinationTypeRequest, vaccinationForRequest, campaignTypeRequest, projectTypeRequest);
    if (admin) this.userType = UserType.LivestackAdmin;
    else this.userType = UserType.others;
    if (this.userType == UserType.LivestackAdmin) {
      vaccinationRequest.push(this.userService.getMultiState().pipe(catchError((err) => of(null))))
    }
    else {
      vaccinationRequest.push(this.intimationReportService
        .getVillagesByUser().pipe(catchError((err) => of(null))))
    }
    return vaccinationRequest;
  }

  handlePageLoadResponse(response) {
    this.getVaccinationType = response[0];
    this.getVaccinationFor = response[1] ?? [];
    this.campaignTypeData = response[2] ?? [];
    this.projectTypeData = response[3].userProjectAllocation;
    this.filterSelectObj.filter((o) => {
      o.options = this.getFilterObject(this.getCampaignList, o.columnProp);
    });
    if (this.userType == UserType.LivestackAdmin) {
      this.state = response[4].map((state: any) => {
        return {
          ...state,
          stateCd: state.stateCode
        }
      })
    }
    else {
      let dist = {};
      this.temVillageList = response[4];
      this.state = response[4].filter((entries) => {
        if (dist[entries.stateCd]) {
          return false;
        }
        dist[entries.stateCd] = true;
        return true;
      });
      this.selectAllForDropdownItems(this.state);
    }
    this.isLoadingSpinner = false
  }

  getStates() {
    this.userService.getMultiState()
      .subscribe((state: any) => {
        this.state = state.map((state: any) => {
          return {
            ...state,
            stateCd: state.stateCode
          }
        })
      })
  }

  createCampaignForm() {
    this.itemForm = this.formBuilder.group({
      stateCd: [[], [Validators.required]],
      selectedDistrict: [[], [Validators.required]],
      selectedTehsil: [[], [Validators.required]],
      selectedVillage: [[], [Validators.required]],
      projectId: ['', [Validators.required]],
      recordDate: [
        { value: moment(this.today).format('DD/MM/YYYY'), disabled: true },
        [Validators.required],
      ],
      diseaseCd: ['', Validators.required],
      vaccineCd: ['', Validators.required],
      vaccineTypeCd: ['', Validators.required],
      vaccineSubtypeCd: ['', Validators.required],
      batchNumber: [
        '',
        [Validators.required, Validators.maxLength(15), AlphaNumericValidation],
      ],
      dewormerCd: ['', Validators.required],
      dewormerContent: [{ value: '', disabled: true }, [Validators.required]],
      dosage: ['', [Validators.required, decimalWithLengthValidation(6, 2)]],
      manufacturer: ['', Validators.required],
      formName: [{ value: '', disabled: true }, [Validators.required]],
      unit: [{ value: '', disabled: true }, [Validators.required]],
      route: [{ value: '', disabled: true }, [Validators.required]],
      campaignStartDate: [[], [Validators.required]],
      campaignEndDate: [[], [Validators.required]],
      campaigndataEntryEndDate: [[], [Validators.required]],
      campaignType: [, [Validators.required]],
      affectedAnimals: this.formBuilder.array([]),
      medicineControl: [''],
      // campaignCreatorId: ["ppppp", Validators.required],
      vaccinationType: ['', Validators.required],
      // createdBy: ["system", Validators.required],
      // modifiedBy: ["system", Validators.required],
      campaignName: [
        [],
        [Validators.required, Validators.maxLength(80), NamespecialValidation],
      ],
    });
  }

  getVillagesByUser() {
    this.intimationReportService
      .getVillagesByUser(AnimalHealthConfig.campaignUserID.toString())
      .subscribe(
        (res) => {
          let dist = {};
          this.temVillageList = res;
          this.state = res.filter((entries) => {
            if (dist[entries.stateCd]) {
              return false;
            }
            dist[entries.stateCd] = true;
            return true;
          });

          this.selectAllForDropdownItems(this.state);
          this.isLoadingSpinner = false;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
  }

  getVaccinationTypeMaster() {
    this.vaccinationService.getVaccinationType('vaccination_type').subscribe(
      (res: any[]) => {
        this.getVaccinationType = res;
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  async formFieldChange() {
    this.stateCdSubscription = this.itemForm.get('stateCd').valueChanges.subscribe(async (data) => {
      this.isLoadingSpinner = true;
      let dist = {};
      if (this.userType == UserType.LivestackAdmin) {
        if (data) {
          this.district = await this.userService.getMultiDistricts([data.stateCd]).toPromise();
        }
        else {
          this.district = [];
        }
      }
      else {
        this.district = this.temVillageList.filter((entries) => {
          if (
            data.stateCd != entries.stateCd ||
            dist[entries.districtCd]
          ) {
            return false;
          }
          dist[entries.districtCd] = true;
          return true;
        });
      }

      this.selectAllForDropdownItems(this.district);

      this.itemForm
        .get('selectedDistrict')
        .patchValue([], { emitEvent: false });
      this.itemForm
        .get('selectedTehsil')
        .patchValue([], { emitEvent: false });
      this.itemForm
        .get('selectedVillage')
        .patchValue([], { emitEvent: false });
      this.itemForm.get('selectedDistrict').enable({ emitEvent: false });
      this.itemForm.get('selectedTehsil').enable({ emitEvent: false });
      this.itemForm.get('selectedVillage').enable({ emitEvent: false });
      this.itemForm.get('selectedDistrict').markAsUntouched();
      this.itemForm.get('selectedTehsil').markAsUntouched();
      this.itemForm.get('selectedVillage').markAsUntouched();
      this.isLoadingSpinner = false;
    });

    this.selectedDistrictSubscription = this.itemForm.get('selectedDistrict').valueChanges.subscribe(async (data) => {
      let teh = {};
      if (this.userType == UserType.LivestackAdmin) {
        if (data) {
          this.tehsil = await this.userService.getMultiTehsils(data?.map((dist) => dist.districtCd)).toPromise();
        }
        else {
          this.tehsil = [];
        }
      }
      else {
        this.tehsil = this.temVillageList.filter((entries) => {
          if (
            data.findIndex((a: Village) => a.districtCd == entries.districtCd) ==
            -1 ||
            teh[entries.tehsilCd]
          ) {
            return false;
          }
          teh[entries.tehsilCd] = true;
          return true;
        });
      }
      this.selectAllForDropdownItems(this.tehsil);
      if (data?.length > 1) {
        this.itemForm.get('selectedTehsil').disable({ emitEvent: false });

        this.itemForm.get('selectedVillage').disable({ emitEvent: false });
      } else {
        this.itemForm.get('selectedTehsil').enable({ emitEvent: false });

        this.itemForm.get('selectedVillage').enable({ emitEvent: false });
      }
      if (data?.length != 1) {
        this.itemForm
          .get('selectedTehsil')
          .patchValue([], { emitEvent: false });

        this.itemForm
          .get('selectedVillage')
          .patchValue([], { emitEvent: false });
      }
    });

    this.selectedTehsilSubscription = this.itemForm.get('selectedTehsil').valueChanges.subscribe(async (data) => {
      let vill = {};
      if (this.userType == UserType.LivestackAdmin) {
        if (data) {
          this.village = await this.userService.getMultiVillages(data?.map((dist) => dist.tehsilCd)).toPromise();
        }
        else {
          this.village = [];
        }
      }
      else {
        this.village = this.temVillageList.filter((entries) => {
          if (
            data.findIndex((a: Village) => a.tehsilCd == entries.tehsilCd) ==
            -1 ||
            vill[entries.villageCd]
          ) {
            return false;
          }
          vill[entries.villageCd] = true;
          return true;
        });
      }
      this.selectAllForDropdownItems(this.village);
      if (data?.length > 1) {
        this.itemForm.get('selectedVillage').disable({ emitEvent: false });
      } else {
        this.itemForm.get('selectedVillage').enable();
      }
      if (data?.length != 1) {
        this.itemForm
          .get('selectedVillage')
          .patchValue([], { emitEvent: false });
      }
    });

    this.campaignStartDateSubscription = this.itemForm.get('campaignStartDate')
      .valueChanges
      .pipe(distinctUntilChanged(
        (p, n) => p === n
      ))
      .subscribe(data => {
        if (data && moment(data).isValid() && moment(data).isBetween(moment(this.campMinStartDate), moment(this.itemForm.get('campaignEndDate')?.value), undefined, "[]")) {
          this.setMinMaxValues('campMinEndDate', data);
        }
      })
    this.campaignEndDateSubscription = this.itemForm.get('campaignEndDate').valueChanges
      .pipe(distinctUntilChanged(
        (p, n) => p === n
      )).subscribe(data => {
        if (data && moment(data).isValid() && moment(data).isBetween(moment(this.campMinEndDate), moment(this.itemForm.get('campaigndataEntryEndDate')?.value), undefined, "[]")) {
          this.setMinMaxValues('campMinEntryEndDate', data);
        }
      })
    this.campaigndataEntryEndDateSubscription = this.itemForm.get('campaigndataEntryEndDate').valueChanges
      .pipe(distinctUntilChanged(
        (p, n) => p === n
      )).subscribe(data => {

      })
  }

  CampaignList() {
    this.isLoadingSpinner = true;

    this.camCreationService.campaignList().subscribe(
      (res: any) => {
        this.dataSource.data = res ?? [];
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
    this.filterSelectObj.filter((o) => {
      o.options = this.getFilterObject(this.getCampaignList, o.columnProp);
    });
  }
  campaignType() {
    this.isLoadingSpinner = true;

    this.camCreationService.campaignType('campaign_type').subscribe(
      (data: any) => {
        this.campaignTypeData = data ?? [];
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  projectType() {
    this.isLoadingSpinner = true;

    this.camCreationService
      .projectType(AnimalHealthConfig.campaignUserID.toString())
      .subscribe(
        (data: any) => {
          this.projectTypeData = data.userProjectAllocation ?? [];
          this.isLoadingSpinner = false;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
  }
  onProjectChange(val) {
    this.isLoadingSpinner = true;
    this.camCreationService.getProjectDetails(val).subscribe(
      (data: any) => {
        this.getProjectDetailsData = data;
        const currentUser = JSON.parse(sessionStorage.getItem('user'))
        const CurrentorgId = currentUser?.orgId;
        if (getSessionData('adminUser')) {
          this.projectStartDate = data?.projectStartDate;
          this.projectEndDate = data?.projectEndDate;
          this.projectEntryEndDate = data?.projectDeEndDate;
          this.setMinMaxValues('campMinStartDate', data?.projectStartDate);
          this.setMinMaxValues('campMaxStartDate', data?.projectEndDate);
          this.setMinMaxValues('campMinEndDate', data?.projectStartDate);
          this.setMinMaxValues('campMaxEndDate', data?.projectDeEndDate);
          this.setMinMaxValues('campMinEntryEndDate', data?.projectEndDate);
          this.setMinMaxValues('campMaxEntryEndDate', data?.projectDeEndDate);
        }
        else {
          let cuurentAllocation = data.projectLocationMap.find(
            (project) => project.orgSuborgId == CurrentorgId
          );
          this.projectStartDate = cuurentAllocation?.orgMappingStartDate;
          this.projectEndDate = cuurentAllocation?.orgMappingEndDate;
          this.projectEntryEndDate = cuurentAllocation?.deEndDate;
          this.setMinMaxValues('campMinStartDate', cuurentAllocation?.orgMappingStartDate);
          this.setMinMaxValues('campMaxStartDate', cuurentAllocation?.orgMappingEndDate);
          this.setMinMaxValues('campMinEndDate', cuurentAllocation?.orgMappingStartDate);
          this.setMinMaxValues('campMaxEndDate', cuurentAllocation?.deEndDate);
          this.setMinMaxValues('campMinEntryEndDate', cuurentAllocation?.orgMappingEndDate);
          this.setMinMaxValues('campMaxEntryEndDate', cuurentAllocation?.deEndDate);
        }
        this.itemForm.patchValue({
          campaignStartDate: moment(this.projectStartDate),
          campaignEndDate: moment(this.projectEndDate),
          campaigndataEntryEndDate: moment(this.projectEntryEndDate),
        }, { emitEvent: false });
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  setDataSourceAttributes() {
    this.dataSource.paginator = this.withpaginator;
    this.dataSource.sort = this.sort;
  }

  get today() {
    return moment(sessionStorage.getItem('serverCurrentDateTime')).format(
      'YYYY-MM-DD'
    );
  }
  get f() {
    return this.itemForm.controls;
  }

  campaign(event) {
    this.selectedCampaignValue = event.target.value;
    if (this.selectedCampaignValue == 1) {
      this.itemForm.get('dewormerCd').clearValidators();
      this.itemForm.get('dosage').clearValidators();
      this.itemForm.get('manufacturer').clearValidators();
      this.itemForm.get('dosage').updateValueAndValidity();
      this.itemForm.get('dewormerCd').updateValueAndValidity();
      this.itemForm.get('manufacturer').updateValueAndValidity();
      this.itemForm.get('diseaseCd').addValidators([Validators.required]);
      this.itemForm.get('vaccineCd').addValidators([Validators.required]);
      this.itemForm.get('vaccineTypeCd').addValidators([Validators.required]);
      this.itemForm.get('vaccineSubtypeCd').addValidators([Validators.required]);
      this.itemForm.get('batchNumber').addValidators([Validators.required]);
      this.itemForm.get('vaccinationType').addValidators([Validators.required]);
      this.itemForm.get('diseaseCd').updateValueAndValidity();
      this.itemForm.get('vaccineCd').updateValueAndValidity();
      this.itemForm.get('vaccineTypeCd').updateValueAndValidity();
      this.itemForm.get('vaccineSubtypeCd').updateValueAndValidity();
      this.itemForm.get('batchNumber').updateValueAndValidity();
      this.itemForm.get('vaccinationType').updateValueAndValidity();
    } else if (this.selectedCampaignValue == 2) {
      this.itemForm.get('diseaseCd').clearValidators();
      this.itemForm.get('vaccineCd').clearValidators();
      this.itemForm.get('vaccineTypeCd').clearValidators();
      this.itemForm.get('vaccineSubtypeCd').clearValidators();
      this.itemForm.get('batchNumber').clearValidators();
      this.itemForm.get('vaccinationType').clearValidators();
      this.itemForm.get('diseaseCd').updateValueAndValidity();
      this.itemForm.get('vaccineCd').updateValueAndValidity();
      this.itemForm.get('vaccineTypeCd').updateValueAndValidity();
      this.itemForm.get('vaccineSubtypeCd').updateValueAndValidity();
      this.itemForm.get('batchNumber').updateValueAndValidity();
      this.itemForm.get('vaccinationType').updateValueAndValidity();
      this.itemForm.get('dosage').addValidators([Validators.required]);
      this.itemForm.get('manufacturer').addValidators([Validators.required]);
      this.itemForm.get('dewormerCd').addValidators([Validators.required]);
      this.itemForm.get('dosage').updateValueAndValidity();
      this.itemForm.get('manufacturer').updateValueAndValidity();
      this.itemForm.get('dewormerCd').updateValueAndValidity();
    } else {
      this.itemForm.get('dewormerCd').clearValidators();
      this.itemForm.get('dosage').clearValidators();
      this.itemForm.get('manufacturer').clearValidators();
      this.itemForm.get('diseaseCd').clearValidators();
      this.itemForm.get('vaccineCd').clearValidators();
      this.itemForm.get('vaccineTypeCd').clearValidators();
      this.itemForm.get('vaccineSubtypeCd').clearValidators();
      this.itemForm.get('batchNumber').clearValidators();
      this.itemForm.get('vaccinationType').clearValidators();

      this.itemForm.get('vaccinationType').updateValueAndValidity();
      this.itemForm.get('dosage').updateValueAndValidity();
      this.itemForm.get('dewormerCd').updateValueAndValidity();
      this.itemForm.get('manufacturer').updateValueAndValidity();
      this.itemForm.get('diseaseCd').updateValueAndValidity();
      this.itemForm.get('vaccineCd').updateValueAndValidity();
      this.itemForm.get('vaccineTypeCd').updateValueAndValidity();
      this.itemForm.get('vaccineSubtypeCd').updateValueAndValidity();
      this.itemForm.get('batchNumber').updateValueAndValidity();
    }
    this.itemForm.patchValue({
      dewormerCd: '',
      dewormerContent: '',
      dosage: '',
      manufacturer: '',
      formName: '',
      unit: '',
      route: '',
      diseaseCd: '',
      vaccineCd: '',
      vaccineTypeCd: '',
      vaccineSubtypeCd: '',
      batchNumber: '',
      vaccinationType: ''
    })
    const affectedAnimals = this.itemForm.get('affectedAnimals') as FormArray;
    if (affectedAnimals && affectedAnimals.length) {
      while (affectedAnimals.length) {
        affectedAnimals.removeAt(0);
      }
    }
  }

  VaccinationFor() {
    this.isLoadingSpinner = true;
    this.vaccinationService.getVaccinationFor().subscribe(
      (data) => {
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
          this.getVaccinationName = res ?? [];
          this.isLoadingSpinner = false;
          this.itemForm.patchValue({
            vaccineTypeCd: null,
            vaccineSubtypeCd: null,
            vaccineCd: null,
          });
        },
        (error) => {
          this.isLoadingSpinner = false;
          this.getVaccinationName = [];
          this.getVaccType = null;
          this._values2 = null;
          this.subTypeValue = null;
          this.getSpeciesType = null;
          this.resetSpeciesTable();
          this.itemForm.patchValue({
            vaccineTypeCd: null,
            vaccineSubtypeCd: null,
            vaccineCd: null,
          });
        }
      );
    } else {
      this.getVaccinationName = [];
      this.resetSpeciesTable();
      this.getVaccType = null;
      this._values2 = null;
      this.subTypeValue = null;
      this.getSpeciesType = null;

      this.itemForm.patchValue({
        vaccineTypeCd: null,
        vaccineSubtypeCd: null,
        vaccineCd: null,
      });
    }
  }

  resetSpeciesTable() {
    this.affectedAnimals.clear();
    this.updateAffectedAnimalView();
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
          this.getVaccType = res ?? [];
          let data = this.getVaccType.filter(
            (element) => element.vaccineCd == event
          );
          this._values2 = data.map((a) => {
            return {
              vaccineTypeCd: a.vaccineTypeCd,
              vaccineTypeName: a.vaccineTypeName,
            };
          });
          this.vaccTypeCode = this._values2[0].vaccineTypeCd;
          this.subTypeValue = data.map((a) => {
            return {
              vaccineSubtypeCd: a.vaccineSubtypeCd,
              vaccineSubtypeName: a.vaccineSubtypeName,
            };
          });
          this.vaccSubTypeCode = this.subTypeValue[0].vaccineSubtypeCd;
          this.itemForm.patchValue({
            vaccineTypeCd: this._values2[0].vaccineTypeName,
            vaccineSubtypeCd: this.subTypeValue[0].vaccineSubtypeName,
          });

          this.isLoadingSpinner = false;
          this.vaccSubTypeSelected();
        },
        (error) => {
          this.resetSpeciesTable();
          this.isLoadingSpinner = false;
          this._values2 = null;
          this.getVaccType = null;
          this.subTypeValue = null;
          this.getSpeciesType = null;

          this.itemForm.patchValue({
            vaccineTypeCd: null,
            vaccineSubtypeCd: null,
          });
        }
      );
    } else {
      this.resetSpeciesTable();
      this.isLoadingSpinner = false;
      this._values2 = null;
      this.getVaccType = null;
      this.subTypeValue = null;
      this.getSpeciesType = null;
    }
  }

  vaccSubTypeSelected() {
    let data = {
      vaccineSubtypeCd: this.vaccSubTypeCode,
      vaccineCd: this.vaccCode,
      vaccineTypeCd: this.vaccTypeCode,
    };
    this.resetSpeciesTable();
    this.isLoadingSpinner = true;
    this.camCreationService.getSpecies(data).subscribe(
      (res: any) => {
        this.getSpeciesType = res ?? [];

        this.isLoadingSpinner = false;
        this.addAffectedAnimalRow({
          speciesCd: '',
          formCd: '',
          routeCd: '',
          unitCd: null,
          dosage: null,
        });
      },
      (error) => {
        this.resetSpeciesTable();
        this.isLoadingSpinner = false;
        this.getSpeciesType = null;
      }
    );
  }

  test(e: MatSelectChange, index: number) {
    const rows = this.affectedAnimals.value as {
      speciesCd: string;
      formCd: number;
      routeCd: number;
      dosage: number;
      unitCd: number;
    }[];
    if (!(rows && rows?.length)) {
      return;
    }

    const result =
      rows.findIndex((row, i) => i != index && row.speciesCd === e.value) !==
      -1;
    if (result) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant(
            'intimation.species_already_exists'
          ),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
      this.affectedAnimals.at(index).reset();
      return;
      //this.affectedAnimals.at(index + 1).reset();
    }
    this.selectedSpeciesCD = e;
    let species = this.getSpeciesType.filter(
      (element) => element.speciesCd == e.value
    );
    this.formData[index] = species.map((a) => {
      return {
        formCd: a.formCd,
        formName: a.formName,
      };
    });
    this.getRouteName[index] = species.map((a) => {
      return {
        routeCd: a.routeCd,
        routeName: a.routeName,
      };
    });
    this.getDose[index] = species.map((a) => {
      return {
        dosage: a.dosage,
      };
    });
    this.getUnit[index] = species.map((a) => {
      return {
        unitCd: a.unitCd,
        unitName: a.unitName,
      };
    });
    this.itemForm['controls']['affectedAnimals']['controls']
      .at(index)
      .patchValue({
        formCd: this.formData[index][0].formCd,
        routeCd: this.getRouteName[index][0].routeCd,
        dosage: this.getDose[index][0].dosage,
        unitCd: this.getUnit[index][0].unitCd,
      });
  }

  fromDateChange(event) {
    this.selectedStartDate = event;

    this.campMinEntryEndDate = this.selectedStartDate;
  }
  campaignEndDateChange(event) {
    // this.campMaxStartDate = event;
    //this.campMinEntryEndDate = event;
  }
  campaignEntryEndDateChange(event) {
    // this.campMaxEndDate = event;
  }

  // Add Rows starts

  get affectedAnimals() {
    return this.itemForm.get('affectedAnimals') as FormArray;
  }

  addAffectedAnimalRow(d?: speciesDetails, noUpdate?: boolean) {
    const row = this.formBuilder.group({
      speciesCd: [d && d.speciesCd ? d.speciesCd : null, [Validators.required]],
      formCd: [d && d.formCd ? d.formCd : null, [Validators.required]],
      routeCd: [d && d.routeCd ? d.routeCd : null, [Validators.required]],
      dosage: [d && d.dosage ? d.dosage : null, [Validators.required]],
      unitCd: [d && d.unitCd ? d.unitCd : null, [Validators.required]],
    });
    this.affectedAnimals.push(row);
    if (!noUpdate) {
      this.updateAffectedAnimalView();
    }
  }

  removeAffectedAnimalElement(index: number) {
    if (this.affectedAnimals.controls.length > 1) {
      this.affectedAnimals.removeAt(index);
      this.updateAffectedAnimalView();
    }
  }

  updateAffectedAnimalView() {
    this.affectedAnimalDataSource.next(this.affectedAnimals.controls);
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

  onSelectMedicne($event) {
    if ($event) {
      this.selectedMedicine = [$event];
      this.itemForm.patchValue({
        dewormerCd: this.selectedMedicine[0].medicineCd,
        dewormerContent: this.selectedMedicine[0].saltDesc,
        manufacturer: this.selectedMedicine[0].manufacturer,
        formName: this.selectedMedicine[0].medicineFormCd,
        unit: this.selectedMedicine[0].unitDesc,
        route: this.selectedMedicine[0].routeName,
      });
    }
    else {
      this.selectedMedicine = [];
      this.itemForm.patchValue({
        dewormerCd: '',
        dewormerContent: '',
        manufacturer: '',
        formName: '',
        unit: '',
        route: '',
      });
    }

  }

  fetchTable() {
    if (this.itemForm.invalid) {
      return;
    } else {
      this.tabDetails = true;
    }
  }

  async CamCreationSubmit() {
    if (this.itemForm.invalid || this.isShowError) {
      this.itemForm.markAllAsTouched();
      return;
    }

    let request = this.itemForm.value;
    const formattedDateStart =
      moment(this.itemForm.value.campaignStartDate).format('YYYY-MM-DD') ==
        'Invalid date'
        ? ''
        : moment(this.itemForm.value.campaignStartDate).format('YYYY-MM-DD');
    const formattedDateEnd =
      moment(this.itemForm.value.campaignEndDate).format('YYYY-MM-DD') ==
        'Invalid date'
        ? ''
        : moment(this.itemForm.value.campaignEndDate).format('YYYY-MM-DD');
    const formattedDateEntryEndDate =
      moment(this.itemForm.value.campaigndataEntryEndDate).format(
        'YYYY-MM-DD'
      ) == 'Invalid date'
        ? ''
        : moment(this.itemForm.value.campaigndataEntryEndDate).format(
          'YYYY-MM-DD'
        );

    request['vaccineTypeCd'] = this.vaccTypeCode ?? '';
    request['vaccineSubtypeCd'] = this.vaccSubTypeCode ?? '';

    let data = [
      {
        unitCd: request.medicineControl?.medicineUnitCd,
        formCd: request.medicineControl?.medicineFormCd,
        routeCd: request.medicineControl?.medicineRouteCd,
        dosage: request.dosage
      },
    ];
    if (
      request.medicineControl?.medicineUnitCd &&
      request.medicineControl?.medicineFormCd &&
      request.medicineControl?.medicineRouteCd &&
      request.dosage
    ) {
      this.speciesData = data;
    } else {
      this.speciesData = request.affectedAnimals;
    }

    request['userTypeFlag'] = this.userType == UserType.LivestackAdmin ? 'adminUser' : 'user';
    if (getSessionData('adminUser')) {
      request['areaMappingDetails'] = await this.createRequestAreaAllocationForUser();
    }
    else {
      if (request.selectedVillage) {
        request['areaMappingDetails'] = this.getUnqiueVillages(request.selectedVillage);
      } else if (request.selectedTehsil && request.selectedTehsil?.length > 1) {
        // request['areaMappingDetails'] = this.getUnqiueVillages(this.temVillageList?.filter((v) =>
        //   request.selectedTehsil.find((tehsil) => tehsil.tehsilCd === v.tehsilCd)
        // ));
        request['areaMappingDetails'] = request.selectedTehsil.map((v) => {
          return {
            stateCd: v.stateCd,
            districtCd: v.districtCd,
            tehsilCd: v.tehsilCd,
            villageCd: null
          }
        })
      } else if (
        request.selectedDistrict &&
        request.selectedDistrict?.length > 1
      ) {
        const selectedDistrictCd = request.selectedDistrict.map((v) => v.districtCd);
        const filteredData = this.temVillageList.filter(item => selectedDistrictCd.includes(item.districtCd));

        // Get unique tehsilCd values
        const uniqueTehsilCd = [...new Set(filteredData.map(item => item.tehsilCd))];

        // Create a new array with unique tehsilCd values
        const result = uniqueTehsilCd.map(tehsilCd => {
          const data = filteredData.find(item => item.tehsilCd === tehsilCd);
          return {
            stateCd: data.stateCd,
            districtCd: data.districtCd,
            tehsilCd: data.tehsilCd,
            villageCd: null
          }
        });

        // request['areaMappingDetails'] = this.getUnqiueVillages(this.temVillageList?.filter((v) =>
        //   request.selectedDistrict.find((d) => d.districtCd === v.districtCd)
        // ));
        request['areaMappingDetails'] = result;
      } else if (request.stateCd && request.stateCd?.length > 1) {
        request['areaMappingDetails'] = this.getUnqiueVillages(this.temVillageList?.filter((v) =>
          request.stateCd.find((s) => s.stateCd === v.stateCd)
        ));
      }
    }
    let areaMappingDetails = [...request['areaMappingDetails']];
    areaMappingDetails = areaMappingDetails.map((area) => {
      return {
        stateCd: area.stateCd,
        districtCd: area.districtCd,
        tehsilCd: area.tehsilCd,
        villageCd: area.villageCd
      }
    });
    request['areaMappingDetails'] = [...areaMappingDetails];
    request['speciesImpactedEntity'] = this.speciesData;

    request['campaignMasterEntity'] = {
      ...this.itemForm.value,
      campaignStartDate: formattedDateStart,
      campaignEndDate: formattedDateEnd,
      campaigndataEntryEndDate: formattedDateEntryEndDate,
      vaccineTypeCd: request['vaccineTypeCd'],
      vaccineSubtypeCd: request['vaccineSubtypeCd'],
    };
    delete request.campaignMasterEntity.areaMappingDetails;
    delete request.campaignMasterEntity.speciesImpactedEntity;
    delete request.selectedVillage;
    delete request.stateCd;
    delete request.campaignMasterEntity.selectedVillage;
    delete request.campaignMasterEntity.stateCd;
    delete request.campaignMasterEntity.selectedTehsil;
    delete request.campaignMasterEntity.selectedDistrict;
    delete request.selectedDistrict;
    delete request.selectedTehsil;
    delete request.campaignMasterEntity.affectedAnimals;
    delete request.projectId;
    delete request.diseaseCd;
    delete request.vaccineCd;
    delete request.vaccineTypeCd;
    delete request.vaccineSubtypeCd;
    delete request.batchNumber;
    delete request.affectedAnimals;
    delete request.dewormerCd;

    delete request.dosage;

    delete request.manufacturer;

    delete request.campaignStartDate;
    delete request.campaignEndDate;
    delete request.campaigndataEntryEndDate;
    delete request.campaignType;
    delete request.medicineControl;
    delete request.campaignCreatorId;
    delete request.vaccinationType;
    delete request.createdBy;
    delete request.modifiedBy;
    delete request.campaignName;

    this.isLoadingSpinner = true;
    this.camCreationService.campaignCreation(request).subscribe(
      (res) => {
        this.Successmessage = res.msg.msgDesc;
        this.campaignIdMessage = res.data.campaignId;
        this.campaignTypeMessage = res.data.campaignTypeName;
        this.isLoadingSpinner = false;
        this.openCampaignDialog();
      },
      (err) => (this.isLoadingSpinner = false)
    );
  }

  async createRequestAreaAllocationForUser() {
    this.isLoadingSpinner = true;
    const formValue = this.itemForm.getRawValue();
    let areaRequest = null;
    if (formValue.selectedVillage && formValue.selectedVillage.length) {
      areaRequest = formValue.selectedVillage;
    } else if (
      formValue.selectedTehsil &&
      formValue.selectedTehsil.length > 1
    ) {
      areaRequest = formValue.selectedTehsil;  //await this.userService.getMultiVillages(formValue.selectedTehsil.map((teh) => teh.tehsilCd)).toPromise();
    } else if (
      formValue.selectedDistrict &&
      formValue.selectedDistrict.length > 1
    ) {
      areaRequest = await this.userService.getMultiTehsils(formValue.selectedDistrict.map((dist) => dist.districtCd)).toPromise();
      //areaRequest = await this.userService.getMultiVillages(tehsils.map((teh) => teh.tehsilCd)).toPromise();
    } else if (formValue.stateCd && formValue.stateCd.length > 1) {
      const dist = await this.userService.getMultiDistricts(formValue.stateCd.map((state) => state.stateCode)).toPromise();
      areaRequest = await this.userService.getMultiTehsils(dist.map((dist) => dist.districtCd)).toPromise();
      //areaRequest = await this.userService.getMultiVillages(tehsils.map((teh) => teh.tehsilCd)).toPromise();
    }
    return areaRequest;
  }

  // Get Uniqu values from columns to build filter
  getFilterObject(fullObj, key) {
    const uniqChk = [];
    fullObj.filter((obj) => {
      if (!uniqChk.includes(obj[key])) {
        uniqChk.push(obj[key]);
      }
      return obj;
    });
    return uniqChk;
  }

  selectAllForDropdownItems(items: any[]) {
    let allSelect = (items) => {
      items.forEach((element) => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };

    allSelect(items);
  }

  addCampaign() {
    this.compaignForm = true;
    this.tabDetails = false;
    this.addCampaignApiCalls();
  }

  addCampaignApiCalls() {
    this.isLoadingSpinner = true;
    const requestList = this.createRequestList();
    forkJoin(requestList).subscribe((response: any) => {
      this.handlePageLoadResponse(response)
    }, err => this.isLoadingSpinner = false)
  }

  showTabsContent() {
    this.compaignForm = false;
    this.tabDetails = true;
    this.itemForm.reset();
    this.selectedCampaignValue = null;
    this.pageLoadMethods();
  }

  filterData(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  // table Starts

  openCampaignDialog() {
    const dialogRef = this.dialog.open(CampaignCreationDialogComponent, {
      disableClose: true,
      data: {
        title: this.Successmessage,
        campaignId: this.campaignIdMessage,
        campaignType: this.campaignTypeMessage,
      },
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((res) => { });
  }

  openCampaignViewDialog(campaignId: number, campaignType: number) {
    const dialogRef = this.dialog.open(CampaignCreationViewDialogComponent, {
      width: '40%',
      height: '100vh',
      panelClass: 'custom-dialog-container',
      data: {
        campaignId,
        campaignType,
      },
      position: {
        right: '0px',
      },
    });
    dialogRef.afterClosed().subscribe((res) => { });
  }

  openCampaignEditDialog(element) {
    if (element.campaignStatusId == 2) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translateService.instant('common.info_label'),
          message: this.translateService.instant('campaignCreation.camp_err'),
          primaryBtnText: this.translateService.instant('common.ok_string'),
          errorFlag: true,
          icon: 'assets/images/info.svg',
        },
        width: '500px',
        panelClass: 'common-info-dialog',
      });
    } else {
      const dialogRef = this.dialog.open(CampaignCreationEditDialogComponent, {
        width: '50%',
        height: '100vh',
        panelClass: 'custom-dialog-container',
        data: {
          element,
        },
        position: {
          right: '0px',
        },
      });
      dialogRef.afterClosed().subscribe((res) => { });
    }
  }

  // Called on Filter change
  filterChange(filter, event) {
    //let filterValues = {}
    this.filterValues[filter.columnProp] = event.target.value
      .trim()
      .toLowerCase();
    this.dataSource.filter = JSON.stringify(this.filterValues);
  }

  campaignCancel() {
    this.compaignForm = false;
    this.tabDetails = true;
    this.itemForm.reset();
    window.location.reload();
  }

  setMinMaxValues(control, value) {
    const tempValue = moment(value)
    switch (control) {
      case "campMinStartDate":
        this.campMinStartDate = tempValue;
        break;
      case "campMaxStartDate":
        this.campMaxStartDate = tempValue;
        break;
      case "campMinEndDate":
        this.campMinEndDate = tempValue;
        break;
      case "campMaxEndDate":
        this.campMaxEndDate = tempValue;
        break;
      case "campMinEntryEndDate":
        this.campMinEntryEndDate = tempValue;
        break;
      case "campMaxEntryEndDate":
        this.campMaxEntryEndDate = tempValue;
        break;
    }
  }

  getUnqiueVillages(list: any[]) {

    const uniqueList = Array.from(
      list.reduce((idSet, obj) => {
        idSet.add(obj.villageCd);
        return idSet;
      }, new Set()),
      villageCd => list.find(obj => obj.villageCd === villageCd)
    );
    return uniqueList;
  }

  ngOnDestroy() {
    this.stateCdSubscription?.unsubscribe();
    this.selectedDistrictSubscription?.unsubscribe();
    this.selectedTehsilSubscription?.unsubscribe();
    this.campaignStartDateSubscription?.unsubscribe();
    this.campaignEndDateSubscription?.unsubscribe();
    this.campaigndataEntryEndDateSubscription?.unsubscribe();
  }

}

const DISPLAYED_COLUMNS = [
  'sr_no',
  'campaignId',
  'districtName',
  'campaignType',
  'campaignName',
  'campaignStartDate',
  'campaignEndDate',
  'campaignStatus',
  'action',
];

const affectedAnimal_Displayed_Columns = [
  'species',
  'form',
  'route',
  'dose',
  'unit',
  'action',
];

enum UserType {
  LivestackAdmin = 1,
  StateAdmin = 2,
  DistrictAdmin = 3,
  others = 4
}

const VACCINATION_TYPE = "vaccination_type";
const CAMPAIGN_TYPE = "campaign_type";
