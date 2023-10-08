import { Location } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  take,
} from 'rxjs/operators';
import { AnimalDetailService } from 'src/app/features/animal-management/animal-registration/animal-details/animal-detail.service';
import { AnimalDetails } from 'src/app/features/animal-management/animal-registration/models-animal-reg/animal-details.model';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { animalHealthErrorMessages } from 'src/app/shared/error-messages';
import { getSessionData } from 'src/app/shared/shareService/storageData';
import { decimalWithLengthValidation } from 'src/app/shared/utility/decimalWithLengthValidator';
import {
  AlphaNumericSpecialValidation,
  NamespecialValidation,
  UserNamespecialValidation,
  decimalNumberValidation,
  onlyNumberValidation,
} from 'src/app/shared/utility/validation';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { HealthService } from '../../health.service';
import { SaveInDraftResponse } from '../../post-mortem/models/saveInDraftResponse.model';
import { TreatmentResponseDialogComponent } from '../../treatment-response-dialog/treatment-response-dialog.component';
import { AddDiagnosticsComponent } from '../add-diagnostics/add-diagnostics.component';
import { AddMedicineComponent } from '../add-medicine/add-medicine.component';
import { AnimalTreatmentService } from '../animal-treatment.service';
import { CommonMaster } from '../models/common-master.model';
import { Disease } from '../models/disease.model';
import { Flag } from '../models/enums/flag.enum';
import { SampleLocation } from '../models/enums/sample.enum';
import {
  DiagnosticData,
  LabMaster,
  Medicine,
  OrganAffected,
  SampleType,
  Surgery,
  diagnosticsModel,
  suggestedMedicineModel,
} from '../models/master.model';
import { Symptom } from '../models/symptom.model';
import {
  DiseaseDetails,
  SymptomDetails,
  TreatmentHistory,
} from '../models/treatment-history.model';
import { Unit } from '../models/unit.model';
import { PreviewCaseComponent } from '../preview-case/preview-case.component';
import { SubmitDialogComponent } from '../submit-dialog/submit-dialog.component';

@Component({
  selector: 'app-new-case',
  templateUrl: './new-case.component.html',
  styleUrls: ['./new-case.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [TranslatePipe],
})
export class NewCaseComponent implements OnInit {
  isLoadingSpinner = false;
  currentDate: Date;
  animalId: string = '';
  caseId: number | null = null;
  followUpNo: number | null = null;
  validationMsg = animalHealthValidations.newCase;
  errorMsgs = animalHealthErrorMessages.newCase;
  suggestedMedicine: suggestedMedicineModel[] = [];
  suggested_medicine!: FormArray;
  clinicalValidations!: any;
  medicineTableDisplayedColumns: string[] = [
    'medicineName',
    'medicineFormCd',
    'medicineRouteCd',
    'dosage',
    'medicineUnitCd',
    'medicineFrequency',
    'medicineDuration',
    'medicinePrescribedOnlyFlag',
    'remarks',
    'action',
  ];
  diagnosticsDisplayedColumns: string[] = ['diagnosticsType', 'sampleType'];
  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  selectedMedicineListForm!: FormGroup;
  selectedMedicineListRows!: FormArray;
  selectedMedicineListData = [];
  diagnosticsDataSource: diagnosticsModel[] = [];
  animalTreatmentDetailForm!: FormGroup;
  otherSymptoms!: FormGroup;
  otherDiseases!: FormGroup;
  animal!: AnimalDetails;
  activeTab: 'treatment' | 'surgery' = 'treatment';
  step = 0;
  symptoms: Symptom[] = [];
  diseases: Disease[] = [];
  diseasesMaster: Disease[] = [];
  otherSymptomsFlag: boolean = false;
  otherDiseasesFlag: boolean = false;
  MedicineForm!: FormGroup;
  caseStatus: CommonMaster[] = [];
  treatment?: TreatmentHistory;
  campaignList: any[] = [];
  medicineFormMaster: any[] = [];
  unitMaster: Unit[] = [];
  routeMaster: any[] = [];
  sampleMaster: SampleType[] = [];
  // medicineMaster: Medicine[] = [];
  diagnosticsData?: DiagnosticData;
  surgeryMaster: Surgery[] = [];
  affectedOrgans: OrganAffected[] = [];
  rumenMotilityDisabledFlag: boolean = false;
  isUpdate: boolean = false;
  isSpotUpdate: boolean = false;
  spotData = [];
  sampleData = [];
  radiologyData = [];
  treatmentMinDate = '';
  treatmentMinDateValue = 6;
  samplingStatus: CommonMaster[] = [];
  isSurgeryDisabled = false;
  isSurgeryNeeded = false;
  draftDetails?: SaveInDraftResponse;
  isDraft = false;
  hospitals: LabMaster[] = [];
  showAllHospitals = false;

  constructor(
    private location: Location,
    private _fb: FormBuilder,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private treatmentService: AnimalTreatmentService,
    private animalMgmtService: AnimalDetailService,
    private healthService: HealthService,
    private translatePipe: TranslatePipe
  ) {}

  ngOnInit(): void {
    this.isLoadingSpinner = true;
    // Treatment Form
    this.initForm();

    this.route.queryParams
      .pipe(
        filter((params) => {
          if (!params['animalId']) {
            this.router.navigate(['/not-found']);
            return false;
          }

          this.animalId = params['animalId'];
          return true;
        }),
        switchMap((params) => {
          const requests = [
            this.animalMgmtService
              .getAnimalDetails(this.animalId)
              .pipe(catchError((err) => of(null))),

            this.healthService
              .getCommonMaster(AnimalHealthConfig.commonMasterKeys.caseStatus)
              .pipe(catchError((err) => of(null))),

            this.treatmentService
              .getSymptomsMaster()
              .pipe(catchError((err) => of(null))),

            this.healthService
              .getCommonMaster(AnimalHealthConfig.commonMasterKeys.medicineForm)
              .pipe(catchError((err) => of(null))),

            this.treatmentService
              .getRouteMaster()
              .pipe(catchError((err) => of(null))),

            this.treatmentService
              .getMeasurementUnitMaster()
              .pipe(catchError((err) => of(null))),

            this.healthService
              .getCampaignList(AnimalHealthConfig.treatmentCampaignCd)
              .pipe(
                map((res: any) => {
                  return res ?? [];
                }),
                catchError((err) => of(null))
              ),

            this.treatmentService
              .getDiseasesMaster()
              .pipe(catchError((err) => of(null))),

            this.treatmentService
              .getSampleTypeMaster(['A', 'B', 'D', 'O'])
              .pipe(catchError((err) => of(null))),

            this.treatmentService
              .getSurgeryTypeMaster()
              .pipe(catchError((err) => of(null))),

            this.healthService
              .getCommonMaster(
                AnimalHealthConfig.commonMasterKeys.samplingStatus
              )
              .pipe(catchError((err) => of(null))),

            this.healthService
              .getDefaultConfig('treatmentMinDate')
              .pipe(catchError((err) => of(7))),

            this.healthService.getSubOrgList(10).pipe(
              take(1),
              catchError((err) => of(null))
            ),

            this.healthService
              .getConfigDetails(AnimalHealthConfig.clinicalParameters)
              .pipe(catchError((err) => of(null))),

            this.healthService.getCurrentDate(),
          ];

          const draftId = params['loadDraft'];

          if (typeof draftId === 'undefined' || draftId == null) {
            requests.push(of(null));
          } else {
            requests.push(
              this.healthService.getDraftTransactionDetails(+this.animalId)
            );
          }

          return forkJoin(requests);
        })
      )
      .subscribe(
        ([
          animalDetails,
          caseStatus,
          symptoms,
          medicineForm,
          routes,
          units,
          campaigns,
          diseases,
          samples,
          surgery,
          samplingStatus,
          treatmentDateConfig,
          hospitals,
          clinicalParametersConfig,
          currentDate,
          draftDetails,
        ]) => {
          if (!animalDetails) {
            this.router.navigateByUrl('/dashboard/animal-treatment-surgery');
            return;
          }
          this.currentDate = currentDate;
          this.animal = animalDetails;
          this.caseStatus = caseStatus ?? [];
          this.symptoms = symptoms ?? [];
          this.medicineFormMaster = medicineForm ?? [];
          this.routeMaster = routes ?? [];
          this.unitMaster = units ?? [];
          this.campaignList = !campaigns?.flg ? [] : campaigns.data;
          //this.campaignList = campaigns ?? [];
          this.diseasesMaster = diseases ?? [];
          this.sampleMaster = samples ?? [];
          this.surgeryMaster = surgery ?? [];
          this.samplingStatus = samplingStatus ?? [];
          this.treatmentMinDateValue = treatmentDateConfig.defaultValue - 1;
          this.draftDetails = draftDetails ? draftDetails[0] : null;
          this.hospitals = hospitals ?? [];
          this.clinicalValidations = clinicalParametersConfig.map(
            (config) => Object.values(config)[0]
          );
          // const clinicalParametersConfig =
          if (
            moment(this.minDate).isAfter(moment(this.animal.registrationDate))
          ) {
            this.treatmentMinDate = this.minDate;
          } else {
            this.treatmentMinDate = this.animal.registrationDate;
          }

          this.rumenMotilityDisabledFlag =
            !AnimalHealthConfig.rumenMotilityEnabledSpecies.includes(
              this.animal?.species
            );
          this.initForm();
          if (this.draftDetails) this.loadDraft();
          if (this.clinicalValidations instanceof Array) {
            for (const validation of this.clinicalValidations) {
              const control = this.animalTreatmentDetailForm.get(
                configKeyFormMapping[validation.key]
              );
              control?.addValidators([
                Validators.min(validation.rangeLowerValue),
                Validators.max(validation.rangeUpperValue),
              ]);
            }
          }

          // For follow up
          this.route.queryParams
            .pipe(
              filter((params) => {
                if (!params['caseId']) {
                  this.isLoadingSpinner = false;
                  return false;
                }

                this.caseId = params['caseId'] ? +params['caseId'] : null;
                this.followUpNo = +params['followUpNo'];
                return true;
              }),
              switchMap(() =>
                this.treatmentService.getTreatmentDetails(
                  this.caseId,
                  this.followUpNo
                )
              )
            )
            .subscribe((data) => {
              this.treatment = data;
              if (
                this.treatment &&
                moment(this.minDate).isBefore(
                  moment(this.treatment.treatmentDetails.treatmentDate)
                )
              ) {
                this.treatmentMinDate =
                  this.treatment.treatmentDetails.treatmentDate;
              }
              this.initForm(this.treatment);
              this.isLoadingSpinner = false;

              // this.rumenMotilityDisabledFlag = result;
            });
        },
        (err) => (this.isLoadingSpinner = false)
      );
  }

  // Animal Treatment Form Initialization
  initForm(treatment?: TreatmentHistory) {
    this.isUpdate = this.router.url.includes('updatecase');

    const selectedSymptoms = treatment
      ? treatment?.symptomDetails
          .filter((symptoms) => symptoms.symptomCd !== 0)
          .map((symptom) =>
            this.symptoms.find(
              (symptomMaster) => symptom.symptomCd === symptomMaster.symptomCd
            )
          )
      : [];

    const selectedDiseases = treatment
      ? treatment.diseaseDetails
          .filter((disease) => disease.diseaseCd !== 0)
          .map((disease) =>
            this.diseasesMaster.find(
              (diseaseMaster) => disease.diseaseCd === diseaseMaster.diseaseCd
            )
          )
      : [];

    this.animalTreatmentDetailForm = this._fb.group({
      treatmentRecordDate: [
        { value: moment(this.today).format('DD/MM/YYYY'), disabled: true },
        [Validators.required],
      ],
      treatmentDate: [this.currentDate, [Validators.required]],
      caseStatus: [
        treatment ? treatment.treatmentDetails.caseStatus : 1,
        [Validators.required],
      ],
      recommeded_vet_name: ['', [NamespecialValidation]],
      campaignId: [treatment ? treatment.treatmentDetails.campaignId : null],
      clinicalParameterFlag: [false],
      bodyTemperatureC: [
        this.isUpdate && treatment
          ? this.treatmentService.convertToCelcius(
              treatment?.treatmentDetails?.bodyTemperatureF
            )
          : null,
        {
          updateOn: 'blur',
          validators: [decimalNumberValidation],
        },
      ],
      bodyTemperatureF: [
        this.isUpdate && treatment
          ? treatment?.treatmentDetails?.bodyTemperatureF
          : null,
        {
          updateOn: 'blur',
          validators: [decimalNumberValidation, Validators.min(95)],
        },
      ],
      pulseRate: [
        this.isUpdate && treatment
          ? treatment?.treatmentDetails?.pulseRate
          : null,
        [Validators.maxLength(3), onlyNumberValidation],
      ],
      respiration: [
        this.isUpdate && treatment
          ? treatment?.treatmentDetails?.respiration
          : null,
        [Validators.maxLength(2), onlyNumberValidation],
      ],
      rumenMotility: [
        {
          value:
            this.isUpdate && treatment
              ? treatment?.treatmentDetails?.rumenMotility
              : null,
          disabled: this.rumenMotilityDisabledFlag,
        },
        [Validators.maxLength(2), onlyNumberValidation],
      ],
      surgeryReq: [false, []],
      surgeryGroup: this._fb.group({
        surgery: [
          treatment && treatment.treatmentDetails.surgeryNeededFlag
            ? treatment.treatmentDetails.surgeryNeededFlag
            : null,
        ],
        recommendedHospitalCd: [
          treatment && treatment.treatmentDetails.recommendedHospitalCd
            ? treatment.treatmentDetails.recommendedHospitalCd
            : null,
        ],
        recommendedVetName: [
          treatment && treatment.treatmentDetails.recommendedVetName
            ? treatment.treatmentDetails.recommendedVetName
            : null,
          [Validators.maxLength(30), UserNamespecialValidation],
        ],
        surgeryType: [null],
        surgeryReason: [
          treatment && treatment.treatmentDetails.surgeryReason
            ? treatment.treatmentDetails.surgeryReason
            : null,
          [Validators.maxLength(250), AlphaNumericSpecialValidation],
        ],
        organAffected: [null],
        surgeryDetails: [
          treatment && treatment.treatmentDetails.surgeryDetails
            ? treatment.treatmentDetails.surgeryDetails
            : null,
          [Validators.maxLength(250), AlphaNumericSpecialValidation],
        ],
      }),
      symptomsDetails: [
        treatment ? selectedSymptoms : [],
        [Validators.required],
      ],
      diseaseDetails: [treatment ? selectedDiseases : []],
      otherSymptoms: this._fb.array([]),
      otherDiseases: this._fb.array([]),
      followUpDate: [
        this.isUpdate && treatment && treatment.treatmentDetails.followUpDate
          ? new Date(treatment.treatmentDetails.followUpDate)
          : '',
      ],
      treatmentRemarks: [
        null,
        [Validators.maxLength(250), AlphaNumericSpecialValidation],
      ],
    });

    const otherSymptomsControl =
      this.animalTreatmentDetailForm.get('otherSymptoms');

    otherSymptomsControl.valueChanges.subscribe((value) => {
      if (value && value.length) {
        this.animalTreatmentDetailForm.get('symptomsDetails').clearValidators();
        this.animalTreatmentDetailForm
          .get('symptomsDetails')
          .updateValueAndValidity();
      } else {
        this.animalTreatmentDetailForm
          .get('symptomsDetails')
          .addValidators([Validators.required]);
        this.animalTreatmentDetailForm
          .get('symptomsDetails')
          .updateValueAndValidity();
      }
    });

    this.selectedMedicineListRows = this._fb.array([]);
    this.MedicineForm = this._fb.group({
      suggested_medicine: this._fb.array([]),
      selected_medicine: this.selectedMedicineListRows,
      add_to_favorite: [false],
    });

    if (treatment) {
      const hospitalFound =
        this.hospitals.findIndex(
          (hospital) =>
            hospital.subOrgId ===
            treatment.treatmentDetails.recommendedHospitalCd
        ) === -1;

      if (!hospitalFound) {
        this.isLoadingSpinner = true;
        this.healthService.getSubOrgList(10, false).subscribe((value) => {
          this.isLoadingSpinner = false;
          this.hospitals = value;
        });
      }

      if (
        treatment?.surgeryPerformedDetails?.length ||
        treatment.treatmentDetails.recommendedHospitalCd != null
      ) {
        this.isSurgeryNeeded = true;
        this.animalTreatmentDetailForm.get('surgeryGroup').markAsDirty();
      }

      if (treatment?.surgeryPerformedDetails?.length) {
        const surgeryType = [];
        const organAffected = [];

        for (const surgery of treatment?.surgeryPerformedDetails) {
          if (surgery.surgeryTypeOrganFlag === 1)
            surgeryType.push(surgery.surgeryTypeOrganCd);
          else organAffected.push(surgery.surgeryTypeOrganCd);
        }

        this.fetchOrganAffected(surgeryType).subscribe((res) => {
          const surgeryGroup = this.animalTreatmentDetailForm.get(
            'surgeryGroup'
          ) as FormGroup;
          this.affectedOrgans = res;
          surgeryGroup.get('surgeryType').patchValue(surgeryType);
          surgeryGroup.get('organAffected').patchValue(organAffected);
        });
      }

      this.animalTreatmentDetailForm
        ?.get('diseaseDetails')
        ?.setValue(selectedDiseases);

      this.animalTreatmentDetailForm
        .get('treatmentRemarks')
        .patchValue(treatment?.treatmentDetails.treatmentRemarks);

      const otherSymptoms = treatment?.symptomDetails.filter(
        (symptoms) => symptoms.symptomCd === 0
      );

      if (otherSymptoms?.length !== 0) {
        this.toggleOtherSymptoms(false);
        otherSymptoms.forEach((symptom) => this.addOtherSymptoms(symptom));
      }

      const otherDiseases = treatment?.diseaseDetails.filter(
        (disease) => disease.diseaseCd === 0
      );

      if (otherDiseases?.length !== 0) {
        this.toggleOtherDiseases(false);
        otherDiseases.forEach((disease) => this.addOtherDiseases(disease));
      }

      this.fetchSuggestiveMedicine(selectedDiseases as any, false, treatment);
    }

    this.selectedMedicineListData.forEach((d: suggestedMedicineModel) =>
      this.addSelectedMedicineRow(d, false)
    );

    // surgery tab validations
    this.animalTreatmentDetailForm
      ?.get('surgeryGroup.surgery')
      ?.valueChanges.subscribe((value) => {
        if (value == 2) {
          this.animalTreatmentDetailForm
            .get('surgeryGroup.surgeryType')
            ?.clearValidators();
          this.animalTreatmentDetailForm
            .get('surgeryGroup.surgeryReason')
            ?.clearValidators();
          this.animalTreatmentDetailForm
            .get('surgeryGroup.surgeryReason')
            ?.addValidators([
              Validators.maxLength(250),
              AlphaNumericSpecialValidation,
            ]);

          this.animalTreatmentDetailForm
            .get('surgeryGroup.organAffected')
            ?.clearValidators();

          this.animalTreatmentDetailForm
            .get('surgeryGroup.recommendedHospitalCd')
            ?.addValidators(Validators.required);
        } else {
          this.animalTreatmentDetailForm
            .get('surgeryGroup.recommendedHospitalCd')
            ?.clearValidators();

          this.animalTreatmentDetailForm
            .get('surgeryGroup.surgeryType')
            ?.addValidators(Validators.required);
          this.animalTreatmentDetailForm
            .get('surgeryGroup.surgeryReason')
            ?.addValidators([
              Validators.required,
              Validators.maxLength(250),
              AlphaNumericSpecialValidation,
            ]);
          this.animalTreatmentDetailForm
            .get('surgeryGroup.organAffected')
            ?.addValidators(Validators.required);
        }

        this.animalTreatmentDetailForm
          .get('surgeryGroup.recommendedHospitalCd')
          ?.updateValueAndValidity({
            emitEvent: false,
          });
        this.animalTreatmentDetailForm
          .get('surgeryGroup.surgeryType')
          ?.updateValueAndValidity({
            emitEvent: false,
          });
        this.animalTreatmentDetailForm
          .get('surgeryGroup.surgeryReason')
          ?.updateValueAndValidity({
            emitEvent: false,
          });
        this.animalTreatmentDetailForm
          .get('surgeryGroup.organAffected')
          ?.updateValueAndValidity({
            emitEvent: false,
          });
      });

    this.animalTreatmentDetailForm
      .get('bodyTemperatureC')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe((value) => {
        if (!value || isNaN(parseInt(value))) {
          this.animalTreatmentDetailForm.get('bodyTemperatureF')?.setValue('');
          return;
        }

        const newValue = 1.8 * +value + 32;

        this.animalTreatmentDetailForm
          .get('bodyTemperatureF')
          ?.setValue(newValue.toFixed(2));
      });

    this.animalTreatmentDetailForm
      .get('bodyTemperatureF')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe((value) => {
        if (!value || isNaN(parseInt(value))) {
          this.animalTreatmentDetailForm.get('bodyTemperatureC')?.setValue('');
          return;
        }
        const newValue = ((+value - 32) * 5) / 9;

        this.animalTreatmentDetailForm
          .get('bodyTemperatureC')
          ?.setValue(newValue.toFixed(2));
      });

    this.MedicineForm?.get('add_to_favorite')?.valueChanges.subscribe(
      (value) => {
        if (value && this.selectedMedicineListRows.length === 0) {
          this.MedicineForm?.get('add_to_favorite')?.setValue(false, {
            emitEvent: false,
          });
          this.dialog.open(TreatmentResponseDialogComponent, {
            width: '500px',
            data: {
              title: this.translatePipe.transform('common.info_label'),

              icon: 'assets/images/info.svg',
              message: this.translatePipe.transform(
                'animalTreatmentSurgery.please_add_medicine_first'
              ),
              primaryBtnText: this.translatePipe.transform('common.ok_string'),
            },
            panelClass: 'common-info-dialog',
          });
        }
      }
    );

    this.animalTreatmentDetailForm
      ?.get('symptomsDetails')
      ?.valueChanges.pipe(
        debounceTime(500),
        switchMap((val) => this.fetchDiseases(val))
      )
      .subscribe((res) => {
        this.diseases = res ?? [];
        this.diseases = this.diseases.map((a) => ({
          ...a,
          type: 'Suspected Diseases',
        }));
        this.diseasesMaster = this.diseasesMaster.map((a) => ({
          ...a,
          type: 'All Diseases',
        }));
        for (let dis of this.diseasesMaster) {
          if (
            this.diseases.findIndex((a) => a.diseaseCd == dis.diseaseCd) == -1
          ) {
            this.diseases.push(dis);
          }
        }
      });

    this.fetchDiseases(selectedSymptoms as any).subscribe((res) => {
      this.diseases = res ?? [];

      this.diseases = this.diseases?.map((a) => ({
        ...a,
        type: 'Suspected Diseases',
      }));
      this.diseasesMaster = this.diseasesMaster.map((a) => ({
        ...a,
        type: 'All Diseases',
      }));
      for (let dis of this.diseasesMaster) {
        if (
          this.diseases.findIndex((a) => a.diseaseCd == dis.diseaseCd) == -1
        ) {
          this.diseases.push(dis);
        }
      }
    });

    this.animalTreatmentDetailForm
      ?.get('diseaseDetails')
      ?.valueChanges.subscribe((val) => {
        this.fetchSuggestiveMedicine(val);
      });

    this.animalTreatmentDetailForm
      ?.get('surgeryGroup.surgeryType')
      ?.valueChanges.pipe(
        switchMap((value) => this.fetchOrganAffected(value)),
        filter((value) => !!value)
      )
      .subscribe((value) => (this.affectedOrgans = value));

    if (this.isUpdate) {
      this.animalTreatmentDetailForm.get('treatmentDate').disable();
      this.animalTreatmentDetailForm.get('caseStatus').disable();
      this.animalTreatmentDetailForm.get('campaignId').disable();
      this.animalTreatmentDetailForm.get('bodyTemperatureC').disable();
      this.animalTreatmentDetailForm.get('bodyTemperatureF').disable();
      this.animalTreatmentDetailForm.get('pulseRate').disable();
      this.animalTreatmentDetailForm.get('respiration').disable();
      this.animalTreatmentDetailForm.get('rumenMotility').disable();
      this.animalTreatmentDetailForm.get('surgeryReq').disable();
      this.animalTreatmentDetailForm.get('followUpDate').disable();
      this.animalTreatmentDetailForm.get('treatmentRemarks').disable();
      this.animalTreatmentDetailForm.get('surgeryGroup').disable();

      this.spotData = treatment?.sampleDetails?.onSpotDetails ?? [];
      this.sampleData = treatment?.sampleDetails?.labTestingDetails ?? [];
      this.isSpotUpdate = true;
      this.radiologyData = treatment?.radiologyDetails;
    }

    this.animalTreatmentDetailForm
      .get('surgeryGroup.recommendedHospitalCd')
      ?.valueChanges.pipe(
        filter((value) => value === 0),
        switchMap((value) => {
          this.showAllHospitals = true;
          this.isLoadingSpinner = true;
          return this.healthService
            .getSubOrgList(10, !this.showAllHospitals)
            .pipe(take(1));
        })
      )
      .subscribe((value) => {
        this.animalTreatmentDetailForm
          .get('surgeryGroup.recommendedHospitalCd')
          ?.reset();
        this.isLoadingSpinner = false;
        this.hospitals = value;
      });
  }

  fetchDiseases(symptoms: SymptomDetails[]) {
    this.diseases = [];
    // this.animalTreatmentDetailForm
    //   ?.get('diseaseDetails')
    //   ?.setValue([], { emitEvent: false });

    if (!symptoms?.length) {
      this.animalTreatmentDetailForm.get('diseaseDetails').patchValue([]);

      return of(<Disease[]>[]);
    }

    const symptomCodes = symptoms.map(({ symptomCd }) => ({
      symptomCd,
    }));

    return this.treatmentService.getDiseaseFromSymptoms(symptomCodes);
  }

  fetchOrganAffected(surgeryCodes: number[]) {
    this.affectedOrgans = [];

    this.animalTreatmentDetailForm?.get('surgeryGroup.organAffected')?.reset();

    if (!surgeryCodes || surgeryCodes.length === 0) {
      return of([] as OrganAffected[]);
    }

    const reqObj = surgeryCodes.map((code) => ({ surgeryTypeCd: code }));

    return this.treatmentService.getOrganAffected(reqObj);
    // .subscribe((res) => (this.affectedOrgans = res));
  }

  fetchSuggestiveMedicine(
    diseases: DiseaseDetails[],
    reset: boolean = true,
    treatment?: TreatmentHistory
  ) {
    if (!diseases?.length && reset) {
      //this.selectedMedicineListRows.clear();
      this.updateMedicineListView();
      //return;
    }
    const req = {
      diseaseCd: diseases.map((a) => a.diseaseCd),
      userId: AnimalHealthConfig.userId,
    };
    this.treatmentService.getSuggestedMedicine(req).subscribe(
      (res: suggestedMedicineModel[]) => {
        if (!res) {
          //return;
          this.suggestedMedicine = [];
        } else {
          this.suggestedMedicine = res?.map((obj: any) => ({
            ...obj,
            formName: this.medicineFormMaster?.find(
              (a: any) => a.cd === obj.medicineFormCd
            )?.value,
          }));
          this.suggestedMedicine.unshift({
            medicineCd: null,
            medicineName: 'All',
            form: '0',
            route: '0',
            unit: 0,
            dose: 0,
            freq_day: 0,
            duration: 0,
            medicine_pres_only: false,
            remark: null,
          });
        }
        this.suggested_medicine = this.MedicineForm.get(
          'suggested_medicine'
        ) as FormArray;
        this.suggested_medicine.clear();
        for (const suggested of this.suggestedMedicine) {
          this.addSuggestedmedicine(suggested);
        }
        if (reset) {
          //this.selectedMedicineListRows.clear();
        }
        this.updateMedicineListView();
        if (treatment) {
          for (const med of treatment.medicineDetails) {
            if (med.medicineCd) {
              // const masterMed = this.medicineMaster.find(
              //   (m) => m.medicineCd === med.medicineCd
              // );

              this.addSelectedMedicineRow({
                ...med,
                medicineName: med.medicineOther,
                medicineFormCd: med.formCd,
                medicineRouteCd: med.routeCd,
                medicineUnitCd: med.unitCd,
              });
              const i = this.MedicineForm?.get(
                'suggested_medicine'
              )?.value.findIndex(
                (m: Medicine) => m.medicineCd === med.medicineCd
              );

              (this.MedicineForm.get('suggested_medicine') as FormArray)
                ?.at(i)
                ?.patchValue({ selected: true }, { emitEvent: true });
              this.onSuggestedMedChange();
            } else {
              this.addSelectedMedicineRow({
                ...med,
                medicineName: med.medicineOther,
                medicineFormCd: med.formCd,
                medicineRouteCd: med.routeCd,
                medicineUnitCd: med.unitCd,
              });
            }
          }
        }
      },
      (err) => {
        if (treatment) {
          for (const med of treatment.medicineDetails) {
            this.addSelectedMedicineRow({
              ...med,
              medicineName: med.medicineOther,
              medicineFormCd: med.formCd,
              medicineRouteCd: med.routeCd,
              medicineUnitCd: med.unitCd,
            });
            // const i = this.MedicineForm.get(
            //   'suggested_medicine'
            // ).value.findIndex((m) => m.medicineCd === med.medicineCd);

            // (this.MedicineForm.get('suggested_medicine') as FormArray)
            //   .at(i)
            //   .patchValue({ selected: true });
          }
        }
      },
      () => this.checkSuggestiveMedicineSelected()
    );
  }

  checkSuggestiveMedicineSelected() {
    const suggestiveMedicines = this.MedicineForm?.get(
      'suggested_medicine'
    ) as FormArray;

    const selectedMedicines = this.MedicineForm?.get(
      'selected_medicine'
    ) as FormArray;

    let selectedCount = 0;
    for (const suggestedMed of suggestiveMedicines.controls) {
      if (!suggestedMed.value.medicineCd) continue;
      if (
        selectedMedicines.value.findIndex(
          (selectedMed) =>
            selectedMed.medicineCd === suggestedMed.value.medicineCd
        ) !== -1
      ) {
        suggestedMed.patchValue({ selected: true });
        selectedCount++;
      }
    }
    if (selectedCount && selectedCount === suggestiveMedicines.length - 1) {
      suggestiveMedicines.at(0).patchValue({ selected: true });
    }
  }

  createSuggestedmedicine(val: any): FormGroup {
    return this._fb.group({
      medicineCd: val.medicineCd,
      medicineName: val.medicineName,
      selected: [false],
      medicineFormCd: val.medicineFormCd,
      formName: val.formName ? val.formName : '',
      medicineRouteCd: val.medicineRouteCd,
      medicineUnitCd: val.medicineUnitCd,
      dose: val.dose ? val.dose : null,
      freq_day: val.freq_day ? val.freq_day : null,
      duration: val.duration ? val.duration : null,
      medicine_pres_only: val.medicine_pres_only,
    });
  }

  addSuggestedmedicine(suggested: any) {
    this.suggested_medicine.push(this.createSuggestedmedicine(suggested));
  }

  onSuggestedMedChange($event?: any) {
    if ($event)
      if ($event?.value.selected) {
        switch ($event.value.medicineCd) {
          case null:
            const suggested_medicine = this.MedicineForm.get(
              'suggested_medicine'
            ) as FormArray;
            for (let i = 0; i < suggested_medicine.length; i++) {
              (<FormArray>this.MedicineForm['controls']['suggested_medicine'])
                .at(i)
                .patchValue({
                  selected: true,
                });

              if (i) {
                const selectedMedicine = (
                  this.MedicineForm.get('selected_medicine') as FormArray
                ).value;
                const currentId = (<FormArray>(
                  this.MedicineForm['controls']['suggested_medicine']
                )).at(i).value;
                if (
                  !selectedMedicine.find(
                    (val: suggestedMedicineModel) =>
                      val.medicineCd === currentId.medicineCd
                  )
                ) {
                  this.addSelectedMedicineRow(
                    (<FormArray>(
                      this.MedicineForm['controls']['suggested_medicine']
                    )).at(i).value
                  );
                }
              }
            }

            break;
          default:
            this.addSelectedMedicineRow($event.value);
            if (
              (this.MedicineForm.get('selected_medicine') as FormArray).value
                .length ===
              (this.MedicineForm.get('suggested_medicine') as FormArray).value
                .length -
                1
            ) {
              (this.MedicineForm.get('suggested_medicine') as FormArray)
                .at(0)
                .patchValue({ selected: true });
            }
            break;
        }
      } else {
        switch ($event?.value.medicineCd) {
          case null:
            const suggested_medicine = this.MedicineForm.get(
              'suggested_medicine'
            ) as FormArray;
            for (let i = 0; i < suggested_medicine.length; i++) {
              (<FormArray>this.MedicineForm['controls']['suggested_medicine'])
                .at(i)
                .patchValue({
                  selected: false,
                });
              this.removeSelectedMedicineElement(0);
            }
            break;
          default:
            const medicineTableArray = this.MedicineForm.get(
              'selected_medicine'
            ) as FormArray;
            const index = medicineTableArray.value
              .map(function (e: any) {
                return e.medicineCd;
              })
              .indexOf($event?.value.medicineCd);
            if (index != -1) {
              this.removeSelectedMedicineElement(index);
            }

            if (
              (this.MedicineForm.get('selected_medicine') as FormArray).value
                .length !==
              (this.MedicineForm.get('suggested_medicine') as FormArray).value
                .length -
                1
            ) {
              (this.MedicineForm.get('suggested_medicine') as FormArray)
                .at(0)
                .patchValue({ selected: false });
            }
            break;
        }
      }
    else if (
      (this.MedicineForm.get('selected_medicine') as FormArray).value.length ===
      (this.MedicineForm.get('suggested_medicine') as FormArray).value.length -
        1
    ) {
      let flag = true;
      (
        this.MedicineForm.get('suggested_medicine') as FormArray
      ).controls.forEach((c, i) => {
        if (i === 0) return;

        if (c.get('selected').value === false) {
          flag = false;
        }
      });

      if (flag)
        (this.MedicineForm.get('suggested_medicine') as FormArray)
          .at(0)
          .patchValue({ selected: true });
    }
    this.checkSuggestiveMedicineSelected();
  }

  updateMedicineListView() {
    this.dataSource.next(
      (this.MedicineForm.get('selected_medicine') as FormArray).controls
    );
  }

  addSelectedMedicineRow(d?: any, noUpdate?: boolean) {
    const row = this._fb.group({
      medicineCd: [d && d.medicineCd ? d.medicineCd : null, ''],
      medicineName: [
        d && d.medicineName ? d.medicineName : null,

        [Validators.required],
      ],
      medicineFormCd: [
        d && d.medicineFormCd ? d.medicineFormCd : null,
        [Validators.required],
      ],
      medicineRouteCd: [
        d && d.medicineRouteCd ? d.medicineRouteCd : null,
        [Validators.required],
      ],
      medicineUnitCd: [
        d && d.medicineUnitCd ? d.medicineUnitCd : null,
        [Validators.required],
      ],
      dosage: [
        d && d.dosage ? d.dosage : null,
        [decimalWithLengthValidation(6, 2), Validators.required],
      ],
      medicineFrequency: [
        d && d.medicineFrequency ? d.medicineFrequency : null,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(
            this.clinicalValidations.find((k) => k.key == 'medicineFrequency')
              ?.rangeUpperValue
          ),
        ],
      ],
      medicineDuration: [
        d && d.medicineDuration ? d.medicineDuration : null,
        [Validators.maxLength(2), Validators.required],
      ],
      remarks: [
        d && d.remarks ? d.remarks : null,
        [Validators.maxLength(250), AlphaNumericSpecialValidation],
      ],
      medicinePrescribedOnlyFlag: [
        d && d.medicinePrescribedOnlyFlag === Flag.true,
        [],
      ],
    });
    if (typeof d.medicineCd !== 'undefined' && d.medicineCd != 0) {
      row?.get('medicineFormCd')?.disable();
      row?.get('medicineRouteCd')?.disable();
      row?.get('medicineName')?.disable();
      row?.get('medicinePrescribedOnlyFlag')?.enable();
    } else {
      row?.get('medicineFormCd')?.enable();
      row?.get('medicineRouteCd')?.enable();
      row?.get('medicineName')?.enable();
      row?.get('medicinePrescribedOnlyFlag')?.disable();
    }
    this.selectedMedicineListRows.push(row);
    if (!noUpdate) {
      this.updateMedicineListView();
    }
  }

  deleteFromMedicineList(element: any, index: number) {
    const medicineTableArray = this.MedicineForm.get(
      'suggested_medicine'
    ) as FormArray;
    const i = medicineTableArray.value
      .map(function (e: any) {
        return e.medicineCd;
      })
      .indexOf(element.value.medicineCd);
    if (i != -1) {
      (<FormArray>this.MedicineForm['controls']['suggested_medicine'])
        .at(i)
        .patchValue({
          selected: false,
        });
    }
    this.removeSelectedMedicineElement(index);
  }

  removeSelectedMedicineElement(index: number) {
    if (
      this.MedicineForm?.get('suggested_medicine') ? ['controls'].length : false
    ) {
      (<FormGroup>(
        (<FormArray>this.MedicineForm.get('suggested_medicine')).at(0)
      ))?.patchValue({ selected: false });
    }
    this.selectedMedicineListRows.removeAt(index);
    this.updateMedicineListView();
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  goBack() {
    this.location.back();
  }

  addMedicine() {
    const dialogRef = this.dialog.open(AddMedicineComponent, {
      width: '70vw',
      panelClass: 'custom-dialog-container',
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (!res) return;
      for (let med of res.addedMedicineList) {
        const medicineTableArray = this.MedicineForm.get(
          'selected_medicine'
        ) as FormArray;
        const index = medicineTableArray.value
          .map(function (e: any) {
            return e.medicineCd;
          })
          .indexOf(med.medicineCd);
        if (index === -1) {
          this.addSelectedMedicineRow(med);
        }
      }
    });
  }

  addDiagnostics() {
    const dialogRef1 = this.dialog.open(AddDiagnosticsComponent, {
      data: {
        spotData: this.spotData,
        sampleData: this.sampleData,
        radiologyData: this.radiologyData,
        isSpotUpdate: this.isSpotUpdate,
        isDraft: this.isDraft,
        animal: this.animal,
        treatmentDate:
          this.animalTreatmentDetailForm.getRawValue().treatmentDate,
        diseasesSuspected:
          this.animalTreatmentDetailForm.getRawValue().diseaseDetails,
      },
      disableClose: true,
      width: '90vw',
      height: '90vh',
      panelClass: 'custom-dialog-container',
      // position: {
      //   right: '0px',
      //   top: '0px',
      // },
    });
    dialogRef1.afterClosed().subscribe((res: any) => {
      if (res) {
        this.diagnosticsData = res;
        this.diagnosticsDataSource = ELEMENT_DATA_DIAGNOSTICS.map((a) => a);
        if (res.spotTestingRows.length) {
          const index = this.diagnosticsDataSource.findIndex(
            (obj) => obj.diagnosticsType === 'On-Spot Testing'
          );
          this.diagnosticsDataSource[index].sampleType = res.spotTestingRows
            .filter((sample) => sample.sampleTypeName)
            .map((v: any) => v.sampleTypeName)
            .join(', ');
        } else {
          const index = this.diagnosticsDataSource.findIndex(
            (obj) => obj.diagnosticsType === 'On-Spot Testing'
          );
          if (index >= 0) {
            this.diagnosticsDataSource.splice(index, 1);
          }
        }

        if (res.samples?.length) {
          const index = this.diagnosticsDataSource.findIndex(
            (obj) => obj.diagnosticsType === 'Lab Testing'
          );
          this.diagnosticsDataSource[index].sampleType = res.samples
            .map((sample) => sample.sampleTypeName)
            .join(', ');
        } else {
          const index = this.diagnosticsDataSource.findIndex(
            (obj) => obj.diagnosticsType === 'Lab Testing'
          );
          if (index >= 0) {
            this.diagnosticsDataSource.splice(index, 1);
          }
        }

        if (res.diagnosticsDataDetails.length) {
          const index = this.diagnosticsDataSource.findIndex(
            (obj) => obj.diagnosticsType === 'Diagnostics'
          );
          this.diagnosticsDataSource[index].sampleType =
            res.diagnosticsDataDetails.map((v: any) => v.value).join(', ');
        } else {
          const index = this.diagnosticsDataSource.findIndex(
            (obj) => obj.diagnosticsType === 'Diagnostics'
          );
          if (index >= 0) {
            this.diagnosticsDataSource.splice(index, 1);
          }
        }
      }
    });
  }

  // For other symptoms
  get otherSymptomsControls() {
    return (this.animalTreatmentDetailForm.get('otherSymptoms') as FormArray)
      .controls as FormGroup[];
  }

  toggleOtherSymptoms(addFlag: boolean) {
    this.otherSymptomsFlag = !this.otherSymptomsFlag;

    if (this.otherSymptomsFlag && addFlag) {
      this.addOtherSymptoms();
    } else {
      (
        this.animalTreatmentDetailForm.get('otherSymptoms') as FormArray
      ).clear();
    }
  }

  addOtherSymptoms(symptom?: SymptomDetails) {
    const array = this.animalTreatmentDetailForm.get(
      'otherSymptoms'
    ) as FormArray;

    this.otherSymptoms = this._fb.group({
      name: [
        symptom ? symptom.otherSymptom || symptom.name : null,
        [Validators.required, AlphaNumericSpecialValidation],
      ],
      remark: [
        symptom ? symptom.remarks || symptom.remark : null,
        [AlphaNumericSpecialValidation],
      ],
    });

    array.push(this.otherSymptoms);
  }

  onRemoveOtherSymptom(i: number) {
    const array = this.animalTreatmentDetailForm.get(
      'otherSymptoms'
    ) as FormArray;

    array.removeAt(i);

    if (!array.length) {
      this.otherSymptomsFlag = false;
      array.markAsPristine();
    }
  }

  // For other diseases
  get otherDiseasesControls() {
    return (this.animalTreatmentDetailForm.get('otherDiseases') as FormArray)
      .controls as FormGroup[];
  }

  toggleOtherDiseases(addFlag: boolean) {
    this.otherDiseasesFlag = !this.otherDiseasesFlag;

    if (this.otherDiseasesFlag && addFlag) {
      this.addOtherDiseases();
    } else {
      (
        this.animalTreatmentDetailForm.get('otherDiseases') as FormArray
      ).clear();
    }
  }

  addOtherDiseases(disease?: DiseaseDetails) {
    const array = this.animalTreatmentDetailForm.get(
      'otherDiseases'
    ) as FormArray;

    this.otherDiseases = this._fb.group({
      name: [
        disease ? disease.otherDisease || disease.name : null,
        [AlphaNumericSpecialValidation],
      ],
      remark: [
        disease ? disease.remarks || disease.remark : null,
        [AlphaNumericSpecialValidation],
      ],
    });

    array.push(this.otherDiseases);
  }

  onRemoveOtherDisease(i: number) {
    const array = this.animalTreatmentDetailForm.get(
      'otherDiseases'
    ) as FormArray;

    array.removeAt(i);

    if (!array.length) {
      this.otherDiseasesFlag = false;
    }
  }

  get formControls() {
    return this.animalTreatmentDetailForm.controls;
  }

  get surgeryControls() {
    return (<FormGroup>this.animalTreatmentDetailForm.get('surgeryGroup'))
      .controls;
  }

  createSubmitReq() {
    const formValue = {
      ...this.animalTreatmentDetailForm.getRawValue(),
      treatmentRecordDate: this.today,
    };

    let symptomsTemp: any[] = [];
    if (!this.isUpdate)
      var followUpNo =
        this.followUpNo !== null && this.followUpNo !== undefined
          ? this.followUpNo + 1
          : 0;
    else followUpNo = this.followUpNo;
    formValue.symptomsDetails.forEach((symptom: SymptomDetails, i: number) => {
      symptomsTemp.push({
        otherSymptom: '',
        remarks: '',
        symptomCd: symptom.symptomCd,
      });
    });

    formValue.otherSymptoms.forEach((symptom: any, i: number) => {
      symptomsTemp.push({
        otherSymptom: symptom.name,
        remarks: symptom.remark,
        symptomCd: 0,
      });
    });

    let diseaseTemp: any[] = [];

    formValue.diseaseDetails.forEach((disease: any, i: number) => {
      diseaseTemp.push({
        otherDisease: '',
        remarks: '',
        diseaseCd: disease.diseaseCd,
      });
    });

    formValue.otherDiseases.forEach((disease: any, i: number) => {
      diseaseTemp.push({
        otherDisease: disease.name,
        remarks: disease.remark,
        diseaseCd: 0,
      });
    });

    let medicineDetailsTemp: any[] = [];
    const medicines = this.selectedMedicineListRows.value;
    this.selectedMedicineListRows.controls.forEach((group, index) => {
      medicineDetailsTemp.push({
        dosage: group.get('dosage')?.value,
        formCd: +group.get('medicineFormCd')?.value,
        medicineCd: medicines[index].medicineCd ?? 0,
        medicineDuration: +group.get('medicineDuration')?.value,
        medicineFrequency: +group.get('medicineFrequency')?.value,
        medicineOther: !medicines[index].medicineCd
          ? medicines[index].medicineName
          : '',
        medicinePrescribedOnlyFlag: group.get('medicinePrescribedOnlyFlag')
          ?.value
          ? Flag.true
          : Flag.false,
        remarks: medicines[index].remarks,
        routeCd: +group.get('medicineRouteCd')?.value,
        unitCd: +group.get('medicineUnitCd')?.value,
      });
    });

    // this.selectedMedicineListRows.value.forEach((medicine: any, i) => {});

    const radiologyDetails: any[] = [];

    this.diagnosticsData?.diagnosticsDataDetails?.forEach((d, i) => {
      radiologyDetails.push({
        radiologyReportDate: moment(formValue.treatmentDate).format(
          'YYYY-MM-DD'
        ),
        radiologyReportType: d.cd,
        reportObservationsRemarks: null,
        testImageUrl1: null,
        testImageUrl2: null,
      });
    });

    const surgeryPerformedDetails: any[] = [];
    formValue.surgeryGroup?.surgeryType?.forEach((s: number) =>
      surgeryPerformedDetails.push({
        surgeryTypeOrganCd: s,
        surgeryTypeOrganFlag: 1,
      })
    );

    formValue.surgeryGroup?.organAffected?.forEach((s: number) =>
      surgeryPerformedDetails.push({
        surgeryTypeOrganCd: s,
        surgeryTypeOrganFlag: 2,
      })
    );

    const surgeryNeededFlag =
      this.animalTreatmentDetailForm?.get('surgeryGroup')?.dirty ||
      this.isSurgeryNeeded;
    // New Request Object
    const requestObj = {
      onSpotDetails: [],
      isModifyTransaction: this.isUpdate,
      labTestingDetails: this.diagnosticsData?.samples?.length
        ? this.diagnosticsData?.samples
        : [],
      addToFavouriteFlg: this.MedicineForm.value.add_to_favorite
        ? Flag.true
        : Flag.false,
      sourceOriginCd: getSessionData('subModuleCd')?.subModuleCd
        ? getSessionData('subModuleCd')?.subModuleCd.toString()
        : '',
      diseaseDetails: diseaseTemp,
      followUpNo: followUpNo,

      medicineDetails: medicineDetailsTemp,

      radiologyDetails,
      // sampleDetails: Sample
      symptomsDetails: symptomsTemp,
      surgeryPerformedDetails,
      treatmentDetails: {
        animalId: this.animalId,
        bodyTemperatureF: formValue.bodyTemperatureF,
        campaignId: formValue.campaignId,
        caseStatus: formValue.caseStatus,
        createdBy: AnimalHealthConfig.userId,
        followUpDate: formValue.followUpDate
          ? moment(formValue.followUpDate).format('YYYY-MM-DD')
          : null,
        mobileNo: this.animal.ownerDetails.ownerMobileNo,
        // modifiedBy: AnimalHealthConfig.userId,
        ownerId: this.animal.ownerId,
        // paymentAmount: 0,
        // prescriptionRemarks: null,
        pulseRate: formValue.pulseRate,
        respiration: formValue.respiration,
        rumenMotility: formValue.rumenMotility,
        tagId: this.animal.tagId,
        // totalMedicineQtyGiven: 0,
        // totalMedicineQtyPrescribed: 0,
        treatmentDate: moment(formValue.treatmentDate).format('YYYY-MM-DD'),
        treatmentRecordDate: moment(formValue.treatmentRecordDate).format(
          'YYYY-MM-DD'
        ),
        treatmentRemarks: formValue.treatmentRemarks,
        treatmentType: surgeryNeededFlag ? 2 : 1,
        recommendedHospitalCd: surgeryNeededFlag
          ? +formValue.surgeryGroup.recommendedHospitalCd
          : null,
        recommendedVetName: surgeryNeededFlag
          ? formValue.surgeryGroup.recommendedVetName
          : null,
        surgeryDate: surgeryNeededFlag
          ? moment(formValue.treatmentDate).format('YYYY-MM-DD')
          : null,
        surgeryDetails: formValue.surgeryGroup.surgeryDetails,
        surgeryNeededFlag: surgeryNeededFlag
          ? formValue.surgeryGroup.surgery
          : null,
        surgeryReason: surgeryNeededFlag
          ? formValue.surgeryGroup.surgeryReason
          : null,
      },
    };

    this.diagnosticsData?.spotTestingRows?.forEach((sample, i) => {
      requestObj.onSpotDetails.push({
        diseaseCd: sample.diseaseSuspected,
        finalSampleResultValue: sample.finalReading,
        initialSampleResultValue: sample.initialReading,
        onSpotTestCd: sample.onSpotTestCd,
        sampleId: sample.sampleId ? sample.sampleId : null,
        sampleResult: sample.sampleResult,
        sampleType: sample.sampleType,
        samplingStatus: sample.samplingStatus,
      });
    });

    // this.diagnosticsData?.samples.forEach((sample, i) => {
    //   requestObj.labTestingDetails.push({
    //     sampleId: sample.sampleId ? sample.sampleId : null,
    //     diseaseCd: sample.diseaseSuspected,
    //     labCd: sample.labCd,
    //     labCharges: sample.labCharges,
    //     modeOfTransport: sample.modeOfTransport,
    //     receiptNo: sample.receiptNo,
    //     sampleCollectionDate: moment(formValue.treatmentDate).format(
    //       'YYYY-MM-DD'
    //     ),
    //     sampleExaminationSubtypeCd: sample.sampleExaminationSubtypeCd,
    //     sampleExaminationTypeCd: sample.sampleExaminationTypeCd,
    //     sourceOriginCd: AnimalHealthConfig.sourceOriginCd.treatment,
    //     sampleType: sample.sampleType,
    //     testingLocation: SampleLocation.labTesting,
    //     samplingStatus: this.samplingStatus[0].cd,
    //   });
    // });

    return requestObj;
  }

  submitCase() {
    if (this.animalTreatmentDetailForm.invalid || this.MedicineForm.invalid) {
      this.animalTreatmentDetailForm.markAllAsTouched();
      this.MedicineForm.markAllAsTouched();

      if (
        this.activeTab === 'surgery' &&
        this.animalTreatmentDetailForm.get('surgeryGroup').valid
      ) {
        this.changeTab('treatment');
        if (this.MedicineForm.invalid) {
          this.setStep(1);
        } else {
          this.setStep(0);
        }
      } else if (
        this.activeTab === 'treatment' &&
        this.animalTreatmentDetailForm.get('surgeryGroup').invalid
      ) {
        this.changeTab('surgery');
      } else {
        if (this.MedicineForm.invalid) {
          this.setStep(1);
        } else {
          this.setStep(0);
        }
      }

      return;
    }

    const requestObj = this.createSubmitReq();

    const dialogRef = this.dialog.open(PreviewCaseComponent, {
      position: {
        right: '0px',
        top: '0px',
      },
      panelClass: 'custom-dialog-container',
      width: '700px',
      height: '100vh',
      data: {
        requestObj: requestObj,
        openRequest: this.createOpenRequest(),
        animal: this.animal,
      },
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.submitRequest(requestObj);
      }
    });
    return;
    // For new case
  }

  submitRequest(requestObj) {
    this.isLoadingSpinner = true;
    if (this.followUpNo === undefined || this.followUpNo === null) {
      this.treatmentService
        .registerNewCase(requestObj)
        .pipe(
          switchMap((res) => {
            if (this.isDraft) {
              this.healthService
                .deleteDraftTransactionDetails(this.draftDetails.draftId)
                .subscribe();
            }
            const onspot = res.sampleDetails
              ?.filter((s) => s.testingLocation === SampleLocation.onSpot)
              .map((sample) => [
                'OnSpot',
                sample.sampleId,
                this.getSampleName(+sample.sampleType),
              ]);

            const lab = res.sampleDetails
              ?.filter((s) => s.testingLocation === SampleLocation.labTesting)
              .map((sample) => [
                'Lab',
                sample.sampleId,
                this.getSampleName(+sample.sampleType),
              ]);

            const samples: any[] = [];
            onspot?.forEach((s) => samples.push(s));
            lab?.forEach((s) => samples.push(s));
            this.isLoadingSpinner = false;

            return this.dialog
              .open(SubmitDialogComponent, {
                data: {
                  ownerId: this.animal.ownerId,
                  title: this.translatePipe.transform(
                    'animalTreatmentSurgery.treatment_details_saved_successfully'
                  ),
                  sub_title: this.translatePipe.transform(
                    'animalTreatmentSurgery.treatment_information_sent_to_the_farmer'
                  ),
                  followDateMessage:
                    this.translatePipe.transform(
                      'animalTreatmentSurgery.next_follow_up_date'
                    ) + ':',
                  followDate: res.data.followUpDate
                    ? moment(res.data.followUpDate).format('DD/MM/YYYY')
                    : null,
                  caseID: res.data.caseId,
                  supervisorName: res.data.supervisorName,
                  followUpNo: this.followUpNo ? this.followUpNo : 0,
                  table_header: {
                    col1: this.translatePipe.transform(
                      'animalTreatmentSurgery.sample_for'
                    ),
                    col2: this.translatePipe.transform(
                      'animalTreatmentSurgery.sample_id'
                    ),
                    col3: this.translatePipe.transform(
                      'animalTreatmentSurgery.sample_type'
                    ),
                  },

                  table_value: res.data.sampleDetails ?? null,
                },
                disableClose: true,
                width: '600px',
              })
              .afterClosed();
          })
        )
        .subscribe(
          (res) => {
            this.viewPrescription(res.caseID, res.followUpNo);
          },
          () => (this.isLoadingSpinner = false)
        );
    } else {
      // For follow up
      (<any>requestObj).caseId = this.caseId;
      this.treatmentService
        .saveFollowupVisitDetails(requestObj)
        .pipe(
          switchMap((res) => {
            // const onspot = res.sampleDetails
            //   ?.filter((s) => s.testingLocation === SampleLocation.onSpot)
            //   .map((sample) => [
            //     'OnSpot',
            //     sample.sampleId,
            //     sample.sampleTypeDesc,
            //   ]);

            // const lab = res.sampleDetails
            //   ?.filter((s) => s.testingLocation === SampleLocation.labTesting)
            //   .map((sample) => ['Lab', sample.sampleId, sample.sampleTypeDesc]);

            // const samples: any[] = [];
            // onspot?.forEach((s) => samples.push(s));
            // lab?.forEach((s) => samples.push(s));
            this.isLoadingSpinner = false;
            return this.dialog
              .open(SubmitDialogComponent, {
                data: {
                  ownerId: this.animal.ownerId,
                  title: this.isUpdate
                    ? this.translatePipe.transform(
                        'animalTreatmentSurgery.treatment_details_updated_successfully'
                      )
                    : this.translatePipe.transform(
                        'animalTreatmentSurgery.follow_up_details_saved_successfully'
                      ),
                  sub_title: this.translatePipe.transform(
                    'animalTreatmentSurgery.treatment_information_sent_to_the_farmer'
                  ),
                  followDateMessage:
                    this.translatePipe.transform(
                      'animalTreatmentSurgery.next_follow_up_date'
                    ) + ':',
                  followDate: res.data.followUpDate
                    ? moment(res.data.followUpDate).format('DD/MM/YYYY')
                    : null,
                  caseID: res.data.caseId,
                  supervisorName: res.data.supervisorName,
                  followUpNo: this.followUpNo ? this.followUpNo : 0,
                  table_header: {
                    col1: this.translatePipe.transform(
                      'animalTreatmentSurgery.sample_for'
                    ),
                    col2: this.translatePipe.transform(
                      'animalTreatmentSurgery.sample_id'
                    ),
                    col3: this.translatePipe.transform(
                      'animalTreatmentSurgery.sample_type'
                    ),
                  },

                  table_value: res.data.sampleDetails ?? null,
                },
                disableClose: true,
                width: '500px',
              })
              .afterClosed();
          })
        )
        .subscribe(
          (res) => {
            this.viewPrescription(res.caseID, res.followUpNo);
          },
          () => (this.isLoadingSpinner = false)
        );
    }
  }

  getSampleName(sampleId: number) {
    return this.sampleMaster?.find((sample) => sample.sampleTypeCd === sampleId)
      ?.sampleTypeDesc;
  }

  onReset() {
    // this.animalTreatmentDetailForm.reset();
    // this.animalTreatmentDetailForm
    //   .get('treatmentRecordDate')
    //   ?.patchValue(moment().format('DD/MM/YYYY'));
    // this.animalTreatmentDetailForm
    //   .get('surgeryGroup.surgery')
    //   ?.patchValue('refer');
    window.location.reload();
  }

  get minDate() {
    return moment(this.currentDate)
      .subtract(this.treatmentMinDateValue, 'days')
      .format('YYYY-MM-DD');
  }

  get today() {
    return moment(this.currentDate).format('YYYY-MM-DD');
  }

  get followUpMinDate() {
    return (
      this.animalTreatmentDetailForm?.get('treatmentDate')?.value ??
      moment(this.currentDate).format('YYYY-MM-DD')
    );
  }

  getAnimalAge(ageInMonths: number) {
    return this.treatmentService.getWords(ageInMonths);
  }

  changeTab(tab: 'treatment' | 'surgery') {
    if (this.isSurgeryDisabled) {
      return;
    }
    const surgeryGroup = <FormGroup>(
      this.animalTreatmentDetailForm.get('surgeryGroup')
    );
    switch (tab) {
      case 'treatment':
        this.activeTab = 'treatment';
        if (surgeryGroup.pristine) {
          for (const control in surgeryGroup.controls) {
            surgeryGroup.get(control)?.clearValidators();
            surgeryGroup
              .get(control)
              ?.updateValueAndValidity({ emitEvent: false });
          }
        }
        break;

      case 'surgery':
        this.activeTab = 'surgery';
        if (this.animalTreatmentDetailForm.get('symptomsDetails')?.pristine) {
        }
        if (surgeryGroup.controls.surgery.value === 2) {
          surgeryGroup.controls.recommendedHospitalCd.addValidators(
            Validators.required
          );
        } else {
          surgeryGroup.controls.surgeryType.addValidators(Validators.required);
          surgeryGroup.controls.surgeryReason.addValidators([
            Validators.required,
            Validators.maxLength(250),
            AlphaNumericSpecialValidation,
          ]);
          surgeryGroup.controls.organAffected.addValidators(
            Validators.required
          );
        }
        surgeryGroup.controls.recommendedHospitalCd.updateValueAndValidity({
          emitEvent: false,
        });
        surgeryGroup.controls.surgeryType.updateValueAndValidity({
          emitEvent: false,
        });
        surgeryGroup.controls.surgeryReason.updateValueAndValidity({
          emitEvent: false,
        });
        surgeryGroup.controls.organAffected.updateValueAndValidity({
          emitEvent: false,
        });
        break;
    }
  }

  removeSelectedDisease(i: number) {
    const value = this.formControls.diseaseDetails.value;
    value.splice(i, 1);
    this.formControls.diseaseDetails.patchValue(value);
    this.formControls.diseaseDetails.updateValueAndValidity();
  }

  removeSelectedSymptom(i: number) {
    const value = this.formControls.symptomsDetails.value;
    value.splice(i, 1);
    this.formControls.symptomsDetails.patchValue(value);
    this.formControls.symptomsDetails.updateValueAndValidity();
  }

  checkDiseaseSelected(disease: Disease) {
    if (this.formControls) {
      return !!this.formControls.diseaseDetails.value?.find(
        (d: DiseaseDetails) => disease.diseaseCd === d.diseaseCd
      );
    }
    return false;
  }

  checkSymptomSelected(symptom: Symptom) {
    return !!this.formControls.symptomsDetails.value?.find(
      (s: SymptomDetails) => symptom.symptomCd === s.symptomCd
    );
  }

  getWords(monthCount: number) {
    this.treatmentService.getWords(monthCount);
  }

  get getMedicineFormArray() {
    return this.MedicineForm.get('suggested_medicine') as FormArray;
  }

  get getMedicineFormControl() {
    return;
  }

  onCaseStatusChange(event: Event) {
    if (+(event.target as HTMLSelectElement).value == 1) {
      this.animalTreatmentDetailForm.get('followUpDate').enable();
      this.isSurgeryDisabled = false;

      return;
    }
    if (+(event.target as HTMLSelectElement).value == 5) {
      this.isSurgeryDisabled = true;
      this.activeTab = 'treatment';
      return;
    }
    this.isSurgeryDisabled = false;
    if (+(event.target as HTMLSelectElement).value != 1)
      this.animalTreatmentDetailForm.get('followUpDate').disable();
    if (this.followUpNo != undefined && this.followUpNo != null) {
      var result = this.treatment?.sampleDetails?.samplingStatus == 1;
      var title = 'Test results pending from lab';
    } else {
      result = this.diagnosticsData?.samples?.length > 0;
      title = 'Samples added';
    }

    if (result) {
      this.dialog.open(TreatmentResponseDialogComponent, {
        data: {
          title: this.translatePipe.transform('common.info_label'),

          icon: 'assets/images/info.svg',
          message: this.translatePipe.transform(
            'animalTreatmentSurgery.case_status_cannot_be_changed'
          ),
          primaryBtnText: this.translatePipe.transform('common.ok_string'),
        },
        panelClass: 'common-info-dialog',
        width: '500px',
      });
      this.animalTreatmentDetailForm.get('caseStatus').setValue(1);
    }
  }

  saveInDraft() {
    this.isLoadingSpinner = true;
    const currentDate = new Date(
      sessionStorage.getItem('serverCurrentDateTime')
    );
    // const requestObj: any = {
    //   animalId: +this.animalId,
    //   creationDate: currentDate,
    //   lastUpdateDate: currentDate,
    //   subModuleCd: getSessionData('subModuleCd')?.subModuleCd
    //     ? getSessionData('subModuleCd')?.subModuleCd.toString()
    //     : '',
    //   userId: AnimalHealthConfig.userId,
    //   tagId: this.animal.tagId,
    //   draftJson: {},
    // };

    // requestObj.draftJson.animalTreatmentDetailForm =
    //   this.animalTreatmentDetailForm.getRawValue();
    // requestObj.draftJson.MedicineForm = this.MedicineForm.getRawValue();
    // requestObj.draftJson.diagnosticsData = this.diagnosticsData;
    // requestObj.draftJson.activeTab = this.activeTab;
    // requestObj.draftJson.diagnosticsDataSource = this.diagnosticsDataSource;
    // requestObj.draftJson.step = this.step;
    const requestObj = this.createOpenRequest();
    this.healthService.saveDraftTransactionDetails(requestObj).subscribe(
      () => {
        this.isLoadingSpinner = false;
        this.dialog
          .open(ConfirmationDialogComponent, {
            data: {
              title: this.translatePipe.transform('common.info_label'),
              icon: 'assets/images/info.svg',
              message: this.translatePipe.transform(
                'animalTreatmentSurgery.draft_saved_successfully'
              ),
              primaryBtnText: this.translatePipe.transform('common.ok_string'),
            },
            panelClass: 'common-info-dialog',
          })
          .afterClosed()
          .subscribe((res) => {
            this.location.back();
          });
      },
      () => (this.isLoadingSpinner = false),
      () => (this.isLoadingSpinner = false)
    );
  }

  loadDraft() {
    const draftJson = this.draftDetails.draftJson;
    this.isDraft = true;
    this.activeTab = draftJson.activeTab ?? 'treatment';
    this.step = draftJson.step ?? 0;
    this.animalTreatmentDetailForm.patchValue(
      draftJson.animalTreatmentDetailForm
    );

    if (draftJson?.animalTreatmentDetailForm?.otherSymptoms) {
      for (const symptom of draftJson?.animalTreatmentDetailForm
        ?.otherSymptoms) {
        this.otherSymptomsFlag = true;
        this.addOtherSymptoms(symptom);
      }
    }

    if (draftJson?.animalTreatmentDetailForm?.otherDiseases) {
      for (const disease of draftJson?.animalTreatmentDetailForm
        ?.otherDiseases) {
        this.otherDiseasesFlag = true;
        this.addOtherDiseases(disease);
      }
    }

    if (draftJson?.MedicineForm?.selected_medicine) {
      for (const med of draftJson?.MedicineForm?.selected_medicine) {
        this.addSelectedMedicineRow(med);
      }
    }

    this.MedicineForm.patchValue(draftJson?.MedicineForm);
    if (draftJson?.diagnosticsData) {
      this.diagnosticsDataSource = draftJson.diagnosticsDataSource ?? [];
      this.diagnosticsData = draftJson?.diagnosticsData;
      this.spotData = draftJson?.diagnosticsData?.spotTestingRows?.map((s) => ({
        ...s,
        diseaseCd: s.diseaseSuspected,
        initialSampleResultValue: s.initialReading,
        finalSampleResultValue: s.finalReading,
      }));
      this.sampleData = draftJson?.diagnosticsData?.samples;
      this.radiologyData = draftJson?.diagnosticsData?.diagnosticsDataDetails;
    }
  }

  findInvalidControlsRecursive(formToInvestigate: FormGroup | FormArray) {
    var invalidControls: string[] = [];
    let recursiveFunc = (form: FormGroup | FormArray) => {
      Object.keys(form.controls).forEach((field) => {
        const control = form.get(field);
        if (control?.invalid && control instanceof FormControl) {
          invalidControls.push(field);
        } else if (control instanceof FormGroup) {
          recursiveFunc(control);
        } else if (control instanceof FormArray) {
          recursiveFunc(control);
        }
      });
    };
    recursiveFunc(formToInvestigate);
  }

  createOpenRequest() {
    const currentDate = new Date(
      sessionStorage.getItem('serverCurrentDateTime')
    );
    const requestObj: any = {
      animalId: +this.animalId,
      creationDate: currentDate,
      lastUpdateDate: currentDate,
      subModuleCd: getSessionData('subModuleCd')?.subModuleCd
        ? getSessionData('subModuleCd')?.subModuleCd.toString()
        : '',
      userId: AnimalHealthConfig.userId,
      tagId: this.animal.tagId,
      draftJson: {},
    };

    requestObj.draftJson.animalTreatmentDetailForm =
      this.animalTreatmentDetailForm.getRawValue();
    requestObj.draftJson.MedicineForm = this.MedicineForm.getRawValue();
    requestObj.draftJson.diagnosticsData = this.diagnosticsData;
    requestObj.draftJson.activeTab = this.activeTab;
    requestObj.draftJson.diagnosticsDataSource = this.diagnosticsDataSource;
    requestObj.draftJson.step = this.step;
    requestObj.draftJson.symptomDispList = [
      ...this.animalTreatmentDetailForm
        .getRawValue()
        .symptomsDetails.map((a) => a.symptomDesc),
      ...this.animalTreatmentDetailForm
        .getRawValue()
        .otherSymptoms.map((a) => a.name),
    ];
    requestObj.draftJson.diseaseDispList = [
      ...this.animalTreatmentDetailForm
        .getRawValue()
        .diseaseDetails.map((a) => a.diseaseDesc),
      ...this.animalTreatmentDetailForm
        .getRawValue()
        .otherDiseases.map((a) => a.name),
    ];
    requestObj.draftJson.MedicineForm.selected_medicine =
      requestObj.draftJson.MedicineForm.selected_medicine.map((medicine) => ({
        ...medicine,
        form: this.medicineFormMaster.find(
          (form) => form.cd == medicine.medicineFormCd
        )?.value,
      }));
    const surgeryGroup =
      requestObj.draftJson.animalTreatmentDetailForm.surgeryGroup;
    requestObj.draftJson.surgeryDisp = {
      ...surgeryGroup,
      isSurgeryPresent: Object.keys(surgeryGroup).some(
        (key) => surgeryGroup[key] !== null
      ),
      recommendedHospitalCdDesc: surgeryGroup.recommendedHospitalCd
        ? this.hospitals.find(
            (hospital: any) =>
              hospital.subOrgId == surgeryGroup.recommendedHospitalCd
          )?.subOrgName
        : '',
      surgeryDesc:
        surgeryGroup.surgery == 1
          ? this.translatePipe.transform(
              'animalTreatmentSurgery.self_performed'
            )
          : surgeryGroup.surgery == 2
          ? this.translatePipe.transform(
              'animalTreatmentSurgery.recommended_referred'
            )
          : '',
      organAffectedDesc: surgeryGroup.organAffected?.map(
        (organ: any) =>
          this.affectedOrgans.find((affect: any) => affect.organCd == organ)
            ?.organDesc
      ),
      surgeryTypeDesc: surgeryGroup.surgeryType?.map(
        (surgery: any) =>
          this.surgeryMaster.find((aff: any) => aff.surgeryTypeCd == surgery)
            ?.surgeryTypeDesc
      ),
    };
    return requestObj;
  }

  viewPrescription(caseId: number, followUpNo: number) {
    // const dialogRef = this.dialog.open(ViewPrescriptionComponent, {
    //   position: {
    //     right: '0px',
    //     top: '0px',
    //   },
    //   panelClass: 'custom-dialog-container',
    //   width: '700px',
    //   height: '100vh',
    //   data: {
    //     caseId,
    //     followUpNo,
    //   },
    // });
    // dialogRef.afterClosed().subscribe((res) => {});
    this.treatmentService

      .downloadPrescription({
        caseId: caseId,
        followUpNo: followUpNo,
      })

      .subscribe(
        (res: any) => {
          this.isLoadingSpinner = false;
          const blob = new Blob([res.body], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const popUp = window.open(url, '_blank');
          if (popUp == null || typeof popUp == 'undefined') {
            this.dialog.open(TreatmentResponseDialogComponent, {
              data: {
                title: this.translatePipe.transform('errorMsg.popup_blocked'),
                icon: 'assets/images/info.svg',
                message: this.translatePipe.transform(
                  'errorMsg.please_disable_your_popup_blocker_and_click_the_view_link_again'
                ),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
              },
              panelClass: 'common-info-dialog',
            });
          } else {
            popUp.focus();
          }
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
  }
}

const ELEMENT_DATA_DIAGNOSTICS: diagnosticsModel[] = [
  { diagnosticsType: 'On-Spot Testing', sampleType: '' },
  { diagnosticsType: 'Lab Testing', sampleType: '' },
  { diagnosticsType: 'Diagnostics', sampleType: '' },
];

const configKeyFormMapping = {
  temperatureCelcius: 'bodyTemperatureC',
  temperatureFarenheit: 'bodyTemperatureF',
  heartRate: 'pulseRate',
  rumenMotility: 'rumenMotility',
  medicineFrequency: 'medicineFrequency',
  respiration: 'respiration',
};
