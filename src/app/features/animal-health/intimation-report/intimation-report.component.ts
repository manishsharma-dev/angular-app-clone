import { MatSelectChange } from '@angular/material/select';
import {
  Component,
  OnInit,
  QueryList,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import moment from 'moment';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { UserService } from 'src/app/shared/user/user.service';
import {
  EartagValidation,
  NumericValidation,
} from 'src/app/shared/utility/validation';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { AnimalTreatmentService } from '../animal-treatment/animal-treatment.service';
import { Disease } from '../animal-treatment/models/disease.model';
import { Symptom } from '../animal-treatment/models/symptom.model';
import {
  DiseaseDetails,
  SymptomDetails,
} from '../animal-treatment/models/treatment-history.model';
import { AlphaNumericSpecialValidation } from './../../../shared/utility/validation';
import { AnimalManagementService } from './../../animal-management/animal-registration/animal-management.service';
import { TreatmentResponseDialogComponent } from './../treatment-response-dialog/treatment-response-dialog.component';
import { IntimationReportService } from './intimation-report.service';
import { UpdateReq } from './models/update-req.model';

import { MatExpansionPanel } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { HealthService } from '../health.service';
import { IntimationSubmitDialogComponent } from './intimation-submit-dialog/intimation-submit-dialog.component';
import {
  DiseaseDetail,
  IntimationReportDetails,
  SymptomDetail,
} from './models/intimation-report-details.model';
import { Species } from './models/species.model';
import { Village } from './models/village.model';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { Config } from '../deworming/models/config.model';

//interfaces
interface affectedAnimalModel {
  speciesCd: string;
  noOfAnimals: number;
  noOfAnimalsDied: number;
  runSeqNo?: number;
}

export interface IntimationVillage extends Village {
  name?: string;
}

@Component({
  selector: 'app-intimation-report',
  templateUrl: './intimation-report.component.html',
  styleUrls: ['./intimation-report.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [TranslatePipe],
})
export class IntimationReportComponent implements OnInit {
  validationMsg = animalHealthValidations.intimatonReport;
  affectedAnimalDisplayedColumns: string[] = [
    'speciesCd',
    'noOfAnimals',
    'noOfAnimalsDied',
    'action',
  ];
  affectedAnimalDataSource = new BehaviorSubject<AbstractControl[]>([]);
  step = 0;
  symptoms: Symptom[] = [];
  diseases: Disease[] = [];
  tags: { tagNumber: number }[] = Tag_List;
  selectedSymptoms = [];
  selectedDiseases = [];

  diseasesMaster = [];
  villages: Village[] = [];
  selectedVillages = [];
  teshil = [];
  districts = [];
  selectedTeshil = [];
  intimationForm: FormGroup;
  otherSymptoms: FormGroup;
  otherDiseases: FormGroup;
  otherSymptomsFlag: boolean = false;
  otherDiseasesFlag: boolean = false;
  speciesImpactedRows: FormArray;
  affectedAnimalData = affectedAnimalInitialData;
  speciesMaster: Species[] = [];
  affectedAnimals: { animalId: number; tagId: number; intimationId: number }[] =
    [];
  isLoadingSpinner = false;
  currentDate = new Date(sessionStorage.getItem('serverCurrentDateTime'));
  editMode = false;
  reportDetails?: IntimationReportDetails;
  minDateConfig: Config;

  @ViewChildren('panel') panels: QueryList<MatExpansionPanel>;

  constructor(
    private dialog: MatDialog,
    private intimationReportService: IntimationReportService,
    private _fb: FormBuilder,
    private treatmentService: AnimalTreatmentService,
    private userService: UserService,
    private healthService: HealthService,
    private animalMS: AnimalManagementService,
    private router: Router,
    private route: ActivatedRoute,
    private translatePipe: TranslatePipe,
    private readonly translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.isLoadingSpinner = true;

    this.route.queryParams
      .pipe(
        switchMap((params) => {
          const requests: any = [
            this.intimationReportService.getVillagesByUser(
              AnimalHealthConfig.campaignUserID
            ),
            this.treatmentService.getSymptomsMaster(),
            this.treatmentService.getDiseasesMaster(),
            this.healthService.getCommonMaster('species'),
            this.healthService.getDefaultConfig('intimationMinDate'),
          ];

          if (
            typeof params['intimationId'] === 'undefined' ||
            params['intimationId'] == null
          ) {
            requests.push(of(null));
          } else {
            this.editMode = true;
            requests.push(
              this.intimationReportService.viewIntimationReport(
                +params['intimationId']
              )
            );
          }
          return forkJoin(requests);
        })
      )
      .subscribe(
        ([
          villages,
          symptoms,
          diseases,
          species,
          intimationDateConfig,
          reportDetails,
        ]: any) => {
          this.villages = villages;
          this.minDateConfig = intimationDateConfig;
          // .map((v) => ({ ...v, runSeqNo: null }));
          this.selectAllForDropdownItems(this.villages);
          this.symptoms = symptoms;
          this.diseasesMaster = diseases;
          this.speciesMaster = species;
          this.isLoadingSpinner = false;
          if (reportDetails) {
            this.reportDetails = reportDetails;
            this.initForm(reportDetails);
          }
        },
        () => (this.isLoadingSpinner = false)
      );

    this.initForm();
  }

  initForm(reportDetails?: IntimationReportDetails) {
    const villages = [];
    const symptoms = [];
    const diseases = [];
    if (reportDetails) {
      for (const village of this.villages) {
        const i =
          reportDetails.intimationReportAreaMappingDetailsDesc.findIndex(
            (v) => v.villageCd === village.villageCd
          );
        if (i !== -1) {
          village.runSeqNo =
            reportDetails.intimationReportAreaMappingDetailsDesc[i].runSeqNo;
        } else {
          village.runSeqNo = null;
        }
      }

      for (const symptom of reportDetails?.symptomDetails) {
        const s = this.symptoms.find((s) => s.symptomCd === symptom.symptomCd);
        if (s) symptoms.push(s);
      }

      for (const disease of reportDetails?.diseaseDetails) {
        const d = this.diseasesMaster.find(
          (d) => d.diseaseCd === disease.diseaseCd
        );
        if (d) diseases.push(d);
      }
    }

    this.speciesImpactedRows = this._fb.array([]);

    this.intimationForm = this._fb.group({
      villages: [
        reportDetails && reportDetails.intimationReportAreaMappingDetailsDesc
          ? reportDetails.intimationReportAreaMappingDetailsDesc
          : [],
        [Validators.required],
      ],
      teshil: [[], [Validators.required]],
      district: [[], [Validators.required]],
      recordDateIntimation: [
        {
          value: moment(sessionStorage.getItem('serverCurrentDateTime')).format(
            'DD/MM/YYYY'
          ),
          disabled: true,
        },
        [Validators.required],
      ],
      dateIntimation: [
        {
          value:
            reportDetails && reportDetails.intimationReport?.firstIntimationDate
              ? reportDetails.intimationReport.firstIntimationDate
              : null,
          disabled: this.editMode,
        },
        [Validators.required],
      ],
      reportedBy: [
        reportDetails && reportDetails.intimationReport?.reportedBy
          ? reportDetails.intimationReport?.reportedBy
          : null,
        [Validators.maxLength(60), AlphaNumericSpecialValidation],
      ],
      symptoms: [
        reportDetails &&
        reportDetails?.intimationReportSymptomDetails?.length &&
        symptoms?.length
          ? symptoms
          : [],
        [Validators.required],
      ],
      diseases: [
        reportDetails &&
        reportDetails?.intimationReportDiseaseDetails?.length &&
        diseases?.length
          ? diseases
          : [],
      ],
      animalTagsId: ['', [EartagValidation]],
      otherSymptoms: this._fb.array([]),
      otherDiseases: this._fb.array([]),
      remarks: [
        reportDetails && reportDetails?.intimationReport?.remarks
          ? reportDetails?.intimationReport?.remarks
          : null,
        [Validators.maxLength(250), AlphaNumericSpecialValidation],
      ],
      speciesImpacted: this.speciesImpactedRows,
    });
    const otherSymptomsControl = this.intimationForm.get('otherSymptoms');
    otherSymptomsControl.valueChanges.subscribe((value) => {
      if (value && value.length) {
        this.intimationForm.get('symptoms').clearValidators();
        this.intimationForm.get('symptoms').updateValueAndValidity();
      } else {
        this.intimationForm
          .get('symptoms')
          .addValidators([Validators.required]);
        this.intimationForm.get('symptoms').updateValueAndValidity();
      }
    });
    this.intimationForm
      ?.get('symptoms')
      ?.valueChanges.pipe(
        debounceTime(500),
        switchMap((val) => this.fetchDiseases(val))
      )
      .subscribe((res) => {
        // if ((res as any as ErrorResponse)?.errorCode) {
        //   this.diseases = [];
        // } else {
        if (res?.length) this.diseases = res;
        else this.diseases = [];
        // }

        this.diseases = this.diseases?.map((a) => ({
          ...a,
          type: 'Suspected Diseases',
        }));
        this.diseasesMaster = this.diseasesMaster?.map((a) => ({
          ...a,
          type: 'All Diseases',
        }));
        for (let dis of this.diseasesMaster) {
          if (
            this.diseases?.findIndex((a) => a.diseaseCd == dis.diseaseCd) == -1
          ) {
            this.diseases?.push(dis);
          }
        }
      });

    this.intimationForm
      .get('villages')
      .valueChanges.subscribe((value: Village[]) => {
        if (!value?.length) {
          this.removeAllVillages();
          return;
        }
        const tehsils: Village[] = [];
        for (const village of value) {
          if (tehsils.find((tehsil) => tehsil.tehsilCd === village.tehsilCd))
            continue;

          tehsils.push(village);
        }

        this.intimationForm.get('teshil').patchValue(tehsils);
      });

    this.intimationForm
      .get('teshil')
      .valueChanges.subscribe((tehsils: Village[]) => {
        if (!tehsils?.length) {
          return;
        }
        const districts: Village[] = [];
        for (const tehsil of tehsils) {
          if (
            districts.find(
              (district) => district.districtCd === tehsil.districtCd
            )
          )
            continue;

          districts.push(tehsil);
        }

        this.intimationForm.get('district').patchValue(districts);
      });

    if (reportDetails) {
      if (reportDetails?.speciesImpacted?.length) {
        for (const species of reportDetails?.speciesImpacted) {
          this.addspeciesImpactedRow(species as any, false);
        }
      } else {
        this.affectedAnimalData.forEach((d: affectedAnimalModel) =>
          this.addspeciesImpactedRow(d, false)
        );
        this.updateAffectedAnimalView();
      }

      this.affectedAnimals =
        reportDetails && reportDetails?.affectedAnimals.length
          ? reportDetails?.affectedAnimals
          : [];

      const otherSymptoms = reportDetails.symptomDetails?.filter(
        (s) => s.symptomCd === 0
      );

      if (otherSymptoms.length) {
        this.otherSymptomsFlag = true;
      }

      const otherDiseases = reportDetails.diseaseDetails?.filter(
        (d) => d.diseaseCd === 0
      );
      for (const s of otherSymptoms) {
        this.addOtherSymptoms(s);
      }
      for (const d of otherDiseases) {
        this.addOtherDiseases(d);
      }
      if (otherDiseases.length) {
        this.otherDiseasesFlag = true;
      }
    } else {
      this.affectedAnimalData.forEach((d: affectedAnimalModel) =>
        this.addspeciesImpactedRow(d, false)
      );
      this.updateAffectedAnimalView();
    }
    this.intimationForm.get('villages').updateValueAndValidity();
    this.intimationForm.get('symptoms').updateValueAndValidity();
    //mk
    this.speciesImpactedRows.valueChanges.subscribe((res) => {
      res?.forEach((val, i) => {
        if (+val?.noOfAnimalsDied > +val?.noOfAnimals) {
          this.dialog.open(TreatmentResponseDialogComponent, {
            width: '400px',
            data: {
              icon: 'assets/images/info.svg',
              title: this.translatePipe.transform('common.alert_string'),
              message: this.translatePipe.transform(
                'campaignCreation.no_of_died_animals'
              ),
              primaryBtnText: this.translatePipe.transform('common.ok_string'),
            },
            panelClass: 'common-info-dialog',
          });
          this.speciesImpactedRows.at(i).get('noOfAnimalsDied').reset();
        }
      });
    });
  }
  fetchDiseases(symptoms: SymptomDetails[]) {
    // this.diseases = [];
    // this.intimationForm?.get('diseaseDetails')?.setValue([]);

    if (!symptoms?.length) {
      return of(<Disease[]>[]);
    }

    const symptomCodes = symptoms.map((symptom) => ({
      symptomCd: symptom?.symptomCd,
    }));

    return this.treatmentService.getDiseaseFromSymptoms(symptomCodes);
  }

  //affected Animal View
  updateAffectedAnimalView() {
    this.affectedAnimalDataSource.next(this.speciesImpactedRows.controls);
  }

  addspeciesImpactedRow(d?: affectedAnimalModel, noUpdate?: boolean) {
    const row = this._fb.group({
      runSeqNo: [d?.runSeqNo],
      speciesCd: [d && d.speciesCd ? d.speciesCd : null, [Validators.required]],
      noOfAnimals: [
        d && d.noOfAnimals ? d.noOfAnimals : null,
        [NumericValidation, Validators.maxLength(6), Validators.required],
      ],
      noOfAnimalsDied: [
        d && d.noOfAnimalsDied ? d.noOfAnimalsDied : null,
        [NumericValidation, Validators.maxLength(6)],
      ],
    });
    this.speciesImpactedRows.push(row);
    if (!noUpdate) {
      this.updateAffectedAnimalView();
    }
  }

  removespeciesImpactedElement(index: number) {
    if (this.speciesImpactedRows.controls.length > 1) {
      this.speciesImpactedRows.removeAt(index);
      this.updateAffectedAnimalView();
    } else {
      this.speciesImpactedRows.at(0).reset();
    }
  }

  // all select func
  selectAllForDropdownItems(items: any[]) {
    let allSelect = (items) => {
      items.forEach((element) => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };

    allSelect(items);
  }

  // dialog
  intimationSubmit() {
    if (this.intimationForm.invalid) {
      this.intimationForm.markAllAsTouched();
      if (
        this.intimationForm.get('symptoms').invalid ||
        this.intimationForm.get('otherSymptoms').invalid
      ) {
        this.step = 0;
        this.panels.get(0).open();
      } else if (this.intimationForm.get('speciesImpacted').invalid) {
        this.step = 1;
        this.panels.get(1).open();
      }

      return;
    }

    const formValue = this.intimationForm.value;

    // const areaMappingDetails: UpdateReq['areaMappingDetails'] = (
    //   formValue.villages as Village[]
    // ).map<UpdateReq['areaMappingDetails'][0]>((village, i) => ({
    //   districtCd: village.districtCd,
    //   tehsilCd: village.tehsilCd,
    //   villageCd: village.villageCd,
    //   runSeqNo: village.runSeqNo,
    // }));

    const symptomDetail: UpdateReq['symptomDetail'] = [];

    formValue.symptoms?.forEach((symptom: SymptomDetails, i: number) => {
      symptomDetail.push({
        otherSymptom: '',
        remarks: '',
        symptomCd: symptom.symptomCd,
      });
    });

    formValue.otherSymptoms?.forEach((symptom: any, i: number) => {
      symptomDetail.push({
        otherSymptom: symptom.name,
        remarks: symptom.remark,
        symptomCd: 0,
      });
    });

    const diseaseDetail: UpdateReq['diseaseDetail'] = [];

    formValue.diseases?.forEach((disease: any, i: number) => {
      diseaseDetail.push({
        otherDisease: '',
        remarks: '',
        diseaseCd: disease.diseaseCd,
      });
    });

    formValue.otherDiseases?.forEach((disease: any, i: number) => {
      diseaseDetail.push({
        otherDisease: disease.name,
        remarks: disease.remark,
        diseaseCd: 0,
      });
    });

    const requestObj: UpdateReq = {
      intimationId: this.editMode
        ? this.reportDetails.intimationReport.intimationId
        : null,
      affectedAnimals: this.affectedAnimals,
      diseaseDetail,
      symptomDetail,
      areaMappingDetails: formValue.villages.map((v: Village) => ({
        ...v,
        sourceOriginId: this.reportDetails?.intimationReport?.intimationId,
      })),
      speciesImpacted: formValue.speciesImpacted.map((s) => ({
        ...s,
        sourceOriginId: this.reportDetails?.intimationReport?.intimationId,
      })),
      firstIntimationReportingDate: moment(
        sessionStorage.getItem('serverCurrentDateTime')
      ).format('YYYY-MM-DD'),
      firstIntimationDate: moment(formValue.dateIntimation).format(
        'YYYY-MM-DD'
      ),
      reportedBy: formValue.reportedBy,
      remarks: formValue.remarks,
    };

    this.isLoadingSpinner = true;
    if (!this.editMode) {
      this.intimationReportService.saveIntimationReport(requestObj).subscribe(
        (res) => {
          this.isLoadingSpinner = false;
          this.dialog
            .open(IntimationSubmitDialogComponent, {
              width: '400px',
              data: {
                intimationId: res.data.intimationId,
                message: res.msg.msgDesc,
              },
              disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
              this.router.navigate(['..'], {
                relativeTo: this.route,
              });
            });
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    } else {
      this.intimationReportService.updateIntimationReport(requestObj).subscribe(
        (res) => {
          this.isLoadingSpinner = false;

          this.dialog
            .open(IntimationSubmitDialogComponent, {
              width: '400px',
              data: {
                intimationId: res.data.intimationId,
                message: res.msg.msgDesc,
              },
              disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
              this.router.navigate(['..'], {
                relativeTo: this.route,
              });
            });
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    }
  }

  //remove cross chip item
  removeSelectedDisease(i: number) {
    const value = this.intimationForm.controls.diseases.value;
    value.splice(i, 1);
    this.intimationForm.controls.diseases.patchValue(value);
  }

  removeAffectedAnimals(i: number) {
    this.affectedAnimals.splice(i, 1);
    // this.intimationForm.controls.animalTagsId.patchValue(value);
  }

  removeSelectedSymptom(i: number) {
    const value = this.intimationForm.controls.symptoms.value;
    value.splice(i, 1);
    this.intimationForm.controls.symptoms.patchValue(value);
  }

  // For other symptoms
  get otherSymptomsControls() {
    return (this.intimationForm.get('otherSymptoms') as FormArray)
      .controls as FormGroup[];
  }

  toggleOtherSymptoms() {
    this.otherSymptomsFlag = !this.otherSymptomsFlag;

    if (this.otherSymptomsFlag) {
      this.addOtherSymptoms();
    } else {
      (this.intimationForm.get('otherSymptoms') as FormArray).clear();
    }
  }

  removeAllVillages() {
    this.intimationForm.get('teshil').reset();
    this.intimationForm.get('district').reset();
  }

  addOtherSymptoms(symptom?: SymptomDetail) {
    const array = this.intimationForm.get('otherSymptoms') as FormArray;

    this.otherSymptoms = this._fb.group({
      name: [
        symptom ? symptom.otherSymptom : null,
        [Validators.required, AlphaNumericSpecialValidation],
      ],
      remark: [
        symptom ? symptom.remarks : null,
        [AlphaNumericSpecialValidation],
      ],
    });

    array.push(this.otherSymptoms);
  }

  onRemoveOtherSymptom(i: number) {
    const array = this.intimationForm.get('otherSymptoms') as FormArray;

    array.removeAt(i);

    if (!array.length) {
      this.otherSymptomsFlag = false;
    }
  }

  // For other diseases
  get otherDiseasesControls() {
    return (this.intimationForm.get('otherDiseases') as FormArray)
      .controls as FormGroup[];
  }

  toggleOtherDiseases() {
    this.otherDiseasesFlag = !this.otherDiseasesFlag;

    if (this.otherDiseasesFlag) {
      this.addOtherDiseases();
    } else {
      (this.intimationForm.get('otherDiseases') as FormArray).clear();
    }
  }

  addOtherDiseases(d?: DiseaseDetail) {
    const array = this.intimationForm.get('otherDiseases') as FormArray;

    this.otherDiseases = this._fb.group({
      name: [
        d && d.otherDisease ? d.otherDisease : null,
        [AlphaNumericSpecialValidation],
      ],
      remark: [
        d && d.remarks ? d.remarks : null,
        [AlphaNumericSpecialValidation],
      ],
    });

    array.push(this.otherDiseases);
  }

  onRemoveOtherDisease(i: number) {
    const array = this.intimationForm.get('otherDiseases') as FormArray;

    array.removeAt(i);

    if (!array.length) {
      this.otherDiseasesFlag = false;
    }
  }

  // expansion-panel step
  setStep(index: number) {
    this.step = index;
  }

  // minDate maxDate
  get minDate() {
    return moment(sessionStorage.getItem('serverCurrentDateTime'))
      .subtract(this.minDateConfig?.defaultValue, 'd')
      .format('YYYY-MM-DD');
  }

  get today() {
    return moment(sessionStorage.getItem('serverCurrentDateTime')).format(
      'YYYY-MM-DD'
    );
  }

  // validation control
  isControlValid(path: string) {
    const formControl = this.intimationForm.get(path);
    return formControl.touched && formControl.invalid;
  }
  get formControls() {
    return this.intimationForm.controls;
  }

  checkDiseaseSelected(disease: Disease) {
    if (this.formControls) {
      return !!this.formControls.diseases.value?.find(
        (d: DiseaseDetails) => disease.diseaseCd === d.diseaseCd
      );
    }
    return false;
  }

  checkSymptomSelected(symptom: Symptom) {
    return !!this.formControls.symptoms.value?.find(
      (s: SymptomDetails) => symptom.symptomCd === s.symptomCd
    );
  }

  searchTagId() {
    const control = this.intimationForm.get('animalTagsId');
    if (control.invalid) {
      control.markAsTouched();
      return;
    }

    const value = control.value;
    //mk
    if (this.affectedAnimals.findIndex(({ tagId }) => tagId == value) !== -1) {
      this.dialog.open(TreatmentResponseDialogComponent, {
        width: '350px',
        data: {
          icon: 'assets/images/info.svg',
          title: this.translatePipe.transform('common.alert_string'),
          message: this.translatePipe.transform(
            'errorMsg.tag_id_is_already_selected'
          ),
          primaryBtnText: this.translatePipe.transform('common.ok_string'),
        },
        panelClass: 'common-info-dialog',
      });
      control.reset();

      return;
    }
    if (!control.value) {
      this.dialog.open(TreatmentResponseDialogComponent, {
        width: '350px',
        data: {
          icon: 'assets/images/info.svg',
          title: this.translatePipe.transform('common.alert_string'),
          message: this.translatePipe.transform('errorMsg.please_enter_tag_id'),
          primaryBtnText: this.translatePipe.transform('common.ok_string'),
        },
        panelClass: 'common-info-dialog',
      });
      control.reset();

      return;
    }
    this.isLoadingSpinner = true;
    this.healthService.getDetailsByTagID(value).subscribe(
      (res) => {
        this.isLoadingSpinner = false;
        this.affectedAnimals.push({
          tagId: +res.tagId,
          animalId: res.animalId,
          intimationId: this.editMode
            ? this.reportDetails.intimationReport.intimationId
            : null,
        });
      },
      (err) => {
        this.isLoadingSpinner = false;

        if (err.error.message)
          this.dialog.open(TreatmentResponseDialogComponent, {
            width: '300px',
            data: {
              icon: 'assets/images/info.svg',
              message: err.error.message,
              title: this.translatePipe.transform('common.alert_string'),
              primaryBtnText: this.translatePipe.transform('common.ok_string'),
            },
            panelClass: 'common-info-dialog',
          });
      }
    );
    control.reset();
  }

  //error control//
  get formControl() {
    return this.intimationForm.controls;
  }

  onResetReport() {
    this.affectedAnimals = [];
    this.otherDiseasesFlag = false;
    this.otherSymptomsFlag = false;
    const affectedAnimals = this.intimationForm.get(
      'speciesImpacted'
    ) as FormArray;

    while (affectedAnimals.length) {
      affectedAnimals.removeAt(0);
    }
    const otherSymptoms = this.intimationForm.get('otherSymptoms') as FormArray;

    while (otherSymptoms.length) {
      otherSymptoms.removeAt(0);
    }

    const otherDiseases = this.intimationForm.get('otherDiseases') as FormArray;

    while (otherDiseases.length) {
      otherDiseases.removeAt(0);
    }

    this.addspeciesImpactedRow();
    this.updateAffectedAnimalView();
    this.intimationForm.reset({
      recordDateIntimation: moment(
        sessionStorage.getItem('serverCurrentDateTime')
      ).format('DD/MM/YYYY'),
    });
  }

  onSpeciesSelected(event: MatSelectChange, index: number) {
    const rows = this.speciesImpactedRows.value as {
      speciesCd: string;
      noOfAnimals: any;
      noOfAnimalsDied: any;
    }[];
    if (!(rows && rows?.length)) {
      return;
    }

    const result =
      rows.findIndex(
        (row, i) => i != index && row.speciesCd === event.value
      ) !== -1;
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
      this.speciesImpactedRows.at(index).reset();
    }
  }
}

//

const Tag_List = [
  {
    tagNumber: 123478940978,
  },
  {
    tagNumber: 789409781234,
  },
];

const affectedAnimalInitialData = [
  {
    speciesCd: '',
    noOfAnimals: null,

    noOfAnimalsDied: null,
  },
];
