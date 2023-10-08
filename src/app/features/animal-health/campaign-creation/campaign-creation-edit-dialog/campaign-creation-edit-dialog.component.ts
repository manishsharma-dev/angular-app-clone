import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { HealthService } from '../../health.service';
import { IntimationReportService } from '../../intimation-report/intimation-report.service';
import { Village } from '../../intimation-report/models/village.model';
import { CampaignCreationService } from '../campaign-creation.service';
import { CampaignStatus } from '../models/campaignType.model';
import { EditCampaign } from '../models/editCampaign.model';
import { SpeciesImpactedEntity, ViewCampaign } from '../models/viewCampaign.model';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { Species } from '../../vaccination/models/vacc-Name.model';
import { MatSelectChange } from '@angular/material/select';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { LocationMappingViewComponent } from '../location-mapping-view/location-mapping-view.component';
import { TreatmentResponseDialogComponent } from '../../treatment-response-dialog/treatment-response-dialog.component';
import { getSessionData } from 'src/app/shared/shareService/storageData';

@Component({
  selector: 'app-campaign-creation-edit-dialog',
  templateUrl: './campaign-creation-edit-dialog.component.html',
  styleUrls: ['./campaign-creation-edit-dialog.component.css'],
  providers: [TranslatePipe]
})
export class CampaignCreationEditDialogComponent implements OnInit {
  @ViewChild('locationMapping') locationMapping: LocationMappingViewComponent;
  speciesTypeList: Species[] = [];
  itemForm!: FormGroup;
  village: Village[] = [];
  vaccinationRes = false;
  dewormingRes = false;
  treatmentRes = false;
  isLoadingSpinner = false;
  temVillageList: Village[];
  prescriptionRes!: ViewCampaign;
  startDateDisplay: string;
  campaignIdDisplay: number;
  newStringSpecies: string;
  public isShowError: string = '';
  SubmitReport: EditCampaign[] = [];
  Successmessage: EditCampaign[] = [];
  campaignStatusData: CampaignStatus[] = [];
  campMinEndDate: string;
  campMaxEndDate: string;
  campMinEntryEndDate: string;
  campMaxEntryEndDate: any;
  campMaxStartDate: string;
  tehsilMaster: Village[] = [];
  selectTehsil: Village[] = [];
  districtMaster: Village[] = [];
  selectedDistricts: any[] = [];
  selectedTehsils: any[] = [];
  selectedVillages: Village[] = [];
  isFormLoaded: boolean = false;
  affectedAnimalDataSource = new BehaviorSubject<AbstractControl[]>([]);
  affectedAnimalDisplayedColumns: string[] = affectedAnimal_Displayed_Columns;
  validationMsg = animalHealthValidations.untagged;
  projectDetails: any;
  constructor(
    private camCreationService: CampaignCreationService,
    private readonly translateService: TranslateService,
    public dialog: MatDialog,
    private intimationReportService: IntimationReportService,
    @Inject(MAT_DIALOG_DATA)
    public data: { element },
    private healthService: HealthService,
    private formBuilder: FormBuilder,
    private translatePipe: TranslatePipe,
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.checkCampaignType();
    this.getPageLoadApis();
  }

  checkCampaignType() {
    if (this.data.element.campaignTypeId == 1) {
      this.vaccinationRes = true;
      this.dewormingRes = false;
      this.treatmentRes = false;
    } else if (this.data.element.campaignTypeId == 2) {
      this.dewormingRes = true;
      this.vaccinationRes = false;
      this.treatmentRes = false;
    } else if (
      this.data.element.campaignTypeId == 4 ||
      this.data.element.campaignTypeId == 3
    ) {
      this.treatmentRes = true;
      this.dewormingRes = false;
      this.vaccinationRes = false;
    } else {
      this.dewormingRes = false;
      this.treatmentRes = false;
    }
  }

  getPageLoadApis() {
    this.isLoadingSpinner = true;
    const request = [];
    request.push(this.camCreationService.viewCampaignCreation(this.data.element.campaignId, this.data.element.campaignTypeId).pipe(catchError((err) => of(null))));
    request.push(this.camCreationService.campaignStatus('campaign_status').pipe(catchError((err) => of(null))));
    if (getSessionData('adminUser')) {
      request.push(this.intimationReportService.getVillagesByUser(AnimalHealthConfig.campaignUserID.toString()))
    }
    forkJoin(request)
      .pipe(switchMap((response: any) => {
        const campaignResponse = response[0];
        this.prescriptionRes = response[0];
        this.campaignStatusData = response[1];
        if (getSessionData('adminUser')) {
          this.bindArea(response[2]);
        }
        this.onGetCampaignDetails(this.prescriptionRes);
        const newRequest = [];
        newRequest.push(this.camCreationService.getProjectDetails(campaignResponse.viewCampaignDetailDto.projectId).pipe(catchError((err) => of(null))));
        if (this.vaccinationRes) {
          let speciesRequest = {
            vaccineSubtypeCd: campaignResponse.viewCampaignDetailDto.vaccineSubtypeCd,
            vaccineCd: campaignResponse.viewCampaignDetailDto.vaccineCd,
            vaccineTypeCd: campaignResponse.viewCampaignDetailDto.vaccineTypeCd,
          };
          newRequest.push(this.camCreationService.getSpecies(speciesRequest).pipe(catchError((err) => of(null))));
        }
        return forkJoin(newRequest);
      }),
      ).subscribe((newResponse: any) => {
        const data = newResponse[0];
        const species = newResponse[1];
        const currentUser = JSON.parse(sessionStorage.getItem('user'))
        const CurrentorgId = currentUser?.orgId;
        this.projectDetails = data;
        this.speciesTypeList = species ?? [];
        this.initForm(this.prescriptionRes);
        for (let species of this.prescriptionRes.speciesImpactedEntity) {
          this.addAffectedAnimalRow(species, this.prescriptionRes.speciesEditable, false);
        }
        if (getSessionData('adminUser')) {
          this.campMinEndDate = data?.projectStartDate;
          this.campMaxEndDate = data?.projectEndDate;
          this.campMinEntryEndDate = data?.projectStartEntryEndDate;
          this.campMaxEntryEndDate = data?.projectDeEndDate;
        }
        else {
          let cuurentAllocation = data.projectLocationMap.find(
            (project) => project.orgSuborgId == CurrentorgId
          );
          this.campMinEndDate = cuurentAllocation?.orgMappingStartDate;
          this.campMaxEndDate = cuurentAllocation?.orgMappingEndDate;
          this.campMaxStartDate = cuurentAllocation?.orgMappingEndDate;
          this.campMaxEntryEndDate = cuurentAllocation?.deEndDate;
        }
        this.isLoadingSpinner = false;
      })
  }

  onGetCampaignDetails(res) {
    this.campaignIdDisplay = res.viewCampaignDetailDto.campaignId;
    let array = res.speciesImpactedEntity;
    const ids = array.map((obj) => obj.species);

    this.newStringSpecies = ids
      .map((e) => e.replace(/\s/g, ''))
      .join(',');
    this.startDateDisplay = res.viewCampaignDetailDto.campaignStartDate;
    this.campMinEndDate = moment(
      new Date(
        res.viewCampaignDetailDto.campaignStartDate
          .split('/')
          .reverse()
          .join('-')
      )
    ).format('YYYY-MM-DD');
    this.campMaxEndDate = moment(
      new Date(
        res.viewCampaignDetailDto.campaignDataEntryEndDate
          .split('/')
          .reverse()
          .join('-')
      )
    ).format('YYYY-MM-DD');
    this.campMinEntryEndDate = moment(
      new Date(
        res.viewCampaignDetailDto.campaignEndDate
          .split('/')
          .reverse()
          .join('-')
      )
    ).format('YYYY-MM-DD');
    this.selectTehsil = res.locationDetailsResponseDto.map(
      (tehsil) => tehsil.tehsilCd
    );
  }

  bindArea(res) {
    let vigg = {};
    this.temVillageList = res;
    this.village = res.filter((entries) => {
      if (vigg[entries.villageCd]) {
        return false;
      }
      vigg[entries.villageCd] = true;
      return true;
    });
    const teh = {};
    this.tehsilMaster = res.filter((entries) => {
      if (teh[entries.tehsilCd]) {
        return false;
      }
      teh[entries.tehsilCd] = true;
      return true;
    });
    const dist = {};
    this.districtMaster = res.filter((entries) => {
      if (dist[entries.districtCd]) {
        return false;
      }
      dist[entries.districtCd] = true;
      return true;
    });
    this.selectAllForDropdownItems(this.village);
  }

  initForm(res?: any) {

    if (res) {
      var selectedVillages = res?.locationDetailsResponseDto ?? [];
      var selectedTehsils = Object.values(
        res?.locationDetailsResponseDto?.reduce((acc, obj) => ({ ...acc, [obj.tehsilCd]: obj }), {})
      ) ?? [];
      var selectedDistricts = Object.values(
        res?.locationDetailsResponseDto?.reduce((acc, obj) => ({ ...acc, [obj.districtCd]: obj }), {})
      ) ?? [];
      this.selectedVillages = selectedVillages;
      this.selectedTehsils = selectedTehsils;
      this.selectedDistricts = selectedDistricts;
    }
    this.itemForm = new FormGroup({
      selectedDistrict: new FormControl(selectedDistricts, [
        Validators.required,
      ]),
      selectedTehsil: new FormControl(selectedTehsils, [Validators.required]),
      selectedVillage: new FormControl(selectedVillages, [Validators.required]),
      campaignSD: new FormControl(
        {
          value: res && this.startDateDisplay ? this.startDateDisplay : null,
          disabled: true,
        },
        [Validators.required]
      ),
      campaignEndDate: new FormControl(
        res && res.viewCampaignDetailDto.campaignEndDate
          ? res.viewCampaignDetailDto.campaignEndDate
            .split('/')
            .reverse()
            .join('-')
          : null,
        [Validators.required]
      ),
      campaignRD: new FormControl(
        res && res.viewCampaignDetailDto.campaignDataEntryEndDate
          ? res.viewCampaignDetailDto.campaignDataEntryEndDate
            .split('/')
            .reverse()
            .join('-')
          : null,
        [Validators.required]
      ),
      campaignStatus: new FormControl(
        res && res['viewCampaignDetailDto'].campaignStatusCd
          ? res['viewCampaignDetailDto'].campaignStatusCd
          : null,
        [Validators.required]
      ),
      remarks: new FormControl(""),
      campaignId: new FormControl(
        res && res['viewCampaignDetailDto'].campaignId
          ? res['viewCampaignDetailDto'].campaignId
          : null
      ),
    });
    this.itemForm.get('campaignRD').valueChanges.subscribe((event) => {
      this.campMaxEndDate = event;
    });
    if (this.vaccinationRes && !this.itemForm.contains('speciesImpactedEntity')) {
      this.itemForm.addControl('speciesImpactedEntity', this.formBuilder.array([]));
    }
    this.isFormLoaded = true;
  }

  selectAllForDropdownItems(items: any[]) {
    let allSelect = (items) => {
      items.forEach((element) => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };

    allSelect(items);
  }

  get today() {
    return moment(sessionStorage.getItem('serverCurrentDateTime')).format(
      'YYYY-MM-DD'
    );
  }

  campaignEndDateChange(event) {
    this.campMaxStartDate = event;
    this.campMinEntryEndDate = event;
  }
  campaignEntryEndDateChange(event) {
    this.campMaxEndDate = event;
  }
  editCampaignSubmit(): void {
    if (this.itemForm.invalid || this.isShowError) {
      this.itemForm.markAllAsTouched();
      return;
    }
    if (!this.locationMapping.selectedState) {
      this.dialog
        .open(TreatmentResponseDialogComponent, {
          data: {
            title: this.translatePipe.transform('common.info_label'),
            icon: 'assets/images/info.svg',
            message: this.translateService.instant(
              'errorMsg.no_selected_state'
            ),
            primaryBtnText: this.translatePipe.transform('common.yes'),
            secondaryBtnText: this.translatePipe.transform('common.no')
          },
          panelClass: 'common-info-dialog',
          width: '500px',
        })
        .afterClosed()
    }
    else if (!this.locationMapping.selectedDistrict || !this.locationMapping.selectedDistrict.length) {
      this.dialog
        .open(TreatmentResponseDialogComponent, {
          data: {
            title: this.translatePipe.transform('common.info_label'),
            icon: 'assets/images/info.svg',
            message: this.translateService.instant(
              'errorMsg.no_selected_district'
            ),
            primaryBtnText: this.translatePipe.transform('common.yes'),
            secondaryBtnText: this.translatePipe.transform('common.no')
          },
          panelClass: 'common-info-dialog',
          width: '500px',
        })
        .afterClosed()
    }
    else if (!this.locationMapping.selectedTehsil || !this.locationMapping.selectedTehsil.length) {
      this.dialog
        .open(TreatmentResponseDialogComponent, {
          data: {
            title: this.translatePipe.transform('common.info_label'),
            icon: 'assets/images/info.svg',
            message: this.translateService.instant(
              'errorMsg.no_selected_tehsil'
            ),
            primaryBtnText: this.translatePipe.transform('common.yes'),
            secondaryBtnText: this.translatePipe.transform('common.no')
          },
          panelClass: 'common-info-dialog',
          width: '500px',
        })
        .afterClosed()
    }
    else if (!this.locationMapping.selectedVillage || !this.locationMapping.selectedVillage.length) {
      this.dialog
        .open(TreatmentResponseDialogComponent, {
          data: {
            title: this.translatePipe.transform('common.info_label'),
            icon: 'assets/images/info.svg',
            message: this.translateService.instant(
              'errorMsg.no_selected_village'
            ),
            primaryBtnText: this.translatePipe.transform('common.yes'),
            secondaryBtnText: this.translatePipe.transform('common.no')
          },
          panelClass: 'common-info-dialog',
          width: '500px',
        })
        .afterClosed()
    }
    let request = this.itemForm.getRawValue();
    const formattedcampaignEndDate =
      moment(this.itemForm.value.campaignEndDate).format('YYYY-MM-DD') ==
        'Invalid date'
        ? ''
        : moment(this.itemForm.value.campaignEndDate).format('YYYY-MM-DD');

    request['campaignEndDate'] = formattedcampaignEndDate;
    request['campaignDataEntryEndDate'] = moment(request.campaignRD).format('YYYY-MM-DD');
    request['villageCd'] = this.locationMapping.selectedVillage.map((a) => a.villageCd);
    request['tehsilCd'] = this.locationMapping.selectedTehsil.map((a) => a.tehsilCd);
    request['districtCd'] = this.locationMapping.selectedDistrict.map((a) => a.districtCd);
    //delete request.campaignRD;
    delete request.selectedVillage;
    delete request.selectedTehsil;
    delete request.selectedDistrict;

    this.isLoadingSpinner = true;
    this.camCreationService.editCampaign(request).subscribe(
      (res) => {
        this.SubmitReport = res;
        this.Successmessage = res.msgDesc;
        this.isLoadingSpinner = false;
        this.openCampaignDialog();
      },
      (err) => (this.isLoadingSpinner = false)
    );
  }

  openCampaignDialog() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        title: this.translateService.instant('common.info_label'),
        message: this.Successmessage,
        primaryBtnText: this.translateService.instant('common.ok_string'),
        errorFlag: true,
        icon: 'assets/images/info.svg',
      },
      panelClass: 'common-info-dialog',
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((res) => {
      window.location.reload();
    });
  }

  onAreaChange(areas: Village[], control: string) {
    const districtControl = this.itemForm.get('selectedDistrict');
    const tehsilControl = this.itemForm.get('selectedTehsil');
    const villageControl = this.itemForm.get('selectedVillage');

    switch (control) {
      case 'district':
        if (areas.length > this.selectedDistricts.length) {
          districtControl.setValue(this.selectedDistricts);
        } else {
          this.selectedDistricts = areas;
          this.selectedTehsils = this.selectedTehsils.filter((t) =>
            areas.find((a) => a.districtCd === t.districtCd)
          );

          this.selectedVillages = this.selectedVillages.filter((v) =>
            areas.find((a) => a.districtCd === v.districtCd)
          );

          tehsilControl.setValue(this.selectedTehsils);
          villageControl.setValue(this.selectedVillages);
        }
        break;

      case 'tehsil':
        if (areas.length > this.selectedTehsils.length) {
          tehsilControl.setValue(this.selectedTehsils);
        } else {
          this.selectedTehsils = areas;

          this.selectedDistricts = this.selectedDistricts.filter((d) =>
            areas.find((a) => a.tehsilCd === d.tehsilCd)
          );

          this.selectedVillages = this.selectedVillages.filter((v) =>
            areas.find((a) => a.tehsilCd === v.tehsilCd)
          );

          districtControl.setValue(this.selectedDistricts);
          villageControl.setValue(this.selectedVillages);
        }

        break;

      case 'village':
        this.selectedVillages = areas;
        this.selectedDistricts = this.districtMaster.filter((d) =>
          areas.find((a) => a.districtCd === d.districtCd)
        );

        this.selectedTehsils = this.tehsilMaster.filter((t) =>
          areas.find((a) => a.tehsilCd === t.tehsilCd)
        );

        districtControl.setValue(this.selectedDistricts);
        tehsilControl.setValue(this.selectedTehsils);
        break;
    }
  }

  get formControls() {
    return this.itemForm.controls;
  }

  //Affected Species Manage section

  get speciesImpactedEntity() {
    return this.itemForm?.get('speciesImpactedEntity') as FormArray;
  }

  updateAffectedAnimalView() {
    this.affectedAnimalDataSource.next(this.speciesImpactedEntity.controls);
  }

  removeAffectedAnimalElement(index: number) {
    if (this.speciesImpactedEntity.controls.length > 1) {
      this.speciesImpactedEntity.removeAt(index);
      this.updateAffectedAnimalView();
    }
  }

  addAffectedAnimalRow(d?: any, update: boolean = true, isNew: boolean = true) {
    const row = this.formBuilder.group({
      speciesCd: [d && d.speciesCd ? d.speciesCd : null, [Validators.required]],
      formCd: [d && d.formCd ? d.formCd : null, []],
      form: [d && d.form ? d.form : null, []],
      routeCd: [d && d.routeCd ? d.routeCd : null, []],
      route: [d && d.route ? d.route : null, []],
      dosage: [d && d.dosage ? d.dosage : null, []],
      unitCd: [d && d.unitCd ? d.unitCd : null, []],
      unit: [d && d.unit ? d.unit : null, []],
      isMigrated: [d && d.isMigrated ? d.isMigrated : null, []],
      runSeqNo: [d && d.runSeqNo ? d.runSeqNo : null, []],
      sourceOriginId: [d && d.sourceOriginId ? d.sourceOriginId : null, []],
      sourceOriginCd: [d && d.sourceOriginCd ? d.sourceOriginCd : null, []],
      isUpdate: [update ?? false],
      isNew: [isNew],
      createdBy: [d && d.createdBy ? d.createdBy : null, []]
    });
    if (!update) {
      row.get('speciesCd').disable({ emitEvent: false });
    }
    this.speciesImpactedEntity.push(row);
    this.updateAffectedAnimalView();
  }

  hasError(form: FormGroup, errorKey: string) {
    const checkError = (err: string | Array<any> | Object) => {
      if (!err) return false;
      if (err[errorKey]) {
        return { [errorKey]: err[errorKey] };
      } else {
        for (const key of Object.keys(err)) {
          if (typeof err[key] == 'object') {
            const result = checkError(err[key]);

            if (result) return result;
          }
        }
      }

      return false;
    };

    return checkError(form.errors);
  }


  onSpeciesSelected(e: MatSelectChange, index: number) {
    const rows = this.speciesImpactedEntity.getRawValue() as any[];
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
      if (this.prescriptionRes.speciesImpactedEntity && (this.prescriptionRes.speciesImpactedEntity.length - 1 >= index)) {
        this.speciesImpactedEntity.at(index).patchValue(this.prescriptionRes.speciesImpactedEntity[index]);
        return;
      }
      this.speciesImpactedEntity.at(index).reset();
      this.speciesImpactedEntity.at(index).patchValue({
        isNew: true,
      })
      return;
    }
    let species = this.speciesTypeList.find(
      (element) => element.speciesCd == e.value
    );
    this.itemForm['controls']['speciesImpactedEntity']['controls']
      .at(index)
      .patchValue({
        formCd: species?.formCd,
        form: species?.formName,
        routeCd: species?.routeCd,
        route: species?.routeName,
        dosage: species?.dosage,
        unitCd: species?.unitCd,
        unit: species?.unitName,
      });
  }


  //Affected Species Manage section
}


interface speciesDetails {
  speciesCd?: string | number;
  species?: string;
  formCd?: string | number;
  form?: string;
  routeCd?: string | number;
  route?: string;
  dosage: string | number;
  unitCd?: string | number;
  unit?: string;
  // availableStock: number;
}
const affectedAnimal_Displayed_Columns = [
  'species',
  'form',
  'route',
  'dose',
  'unit',
  'action',
];

const tempSpecies = [
  {
    "speciesCd": 1,
    "speciesName": "Cattle",
    "routeCd": 6,
    "routeName": "Sub-cutaneous",
    "formCd": 3,
    "formName": "Injection",
    "dosage": 1,
    "unitCd": 25,
    "unitName": "ml"
  },
  {
    "speciesCd": 2,
    "speciesName": "Buffalo",
    "routeCd": 6,
    "routeName": "Sub-cutaneous",
    "formCd": 3,
    "formName": "Injection",
    "dosage": 1,
    "unitCd": 25,
    "unitName": "ml"
  },
  {
    "speciesCd": 3,
    "speciesName": "Yak",
    "routeCd": 6,
    "routeName": "Sub-cutaneous",
    "formCd": 3,
    "formName": "Injection",
    "dosage": 1,
    "unitCd": 25,
    "unitName": "ml"
  },
  {
    "speciesCd": 4,
    "speciesName": "Mithun",
    "routeCd": 6,
    "routeName": "Sub-cutaneous",
    "formCd": 3,
    "formName": "Injection",
    "dosage": 1,
    "unitCd": 25,
    "unitName": "ml"
  }
]
