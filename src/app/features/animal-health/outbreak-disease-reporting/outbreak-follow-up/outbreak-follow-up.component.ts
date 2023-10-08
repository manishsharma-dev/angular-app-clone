import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { Location } from '@angular/common';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { MatDialog } from '@angular/material/dialog';
import { InterimReportComponent } from '../interim-report/interim-report.component';
import { SubmitFollowUpComponent } from '../submit-follow-up/submit-follow-up.component';
import { Village } from '../../intimation-report/models/village.model';
import { IntimationReportService } from '../../intimation-report/intimation-report.service';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { catchError } from 'rxjs/operators';
import { FIRService } from '../../fir/fir.service';
import { ProbableSource } from '../../fir/models/probableSource.model';
import { ActivatedRoute } from '@angular/router';
import { OutBreakDiseaseService } from '../outbreak-disease.service';
import { OutBreakDetails } from '../models/getOutbreakDetail.model';
import { SeverityOfOutBreak } from '../models/severityOfOutbreak.model';
import { ActionTakenList } from '../../fir/models/actionTakenList.model';
import { FirDiseaseTestingComponent } from '../../fir/fir-disease-testing/fir-disease-testing.component';
import { MatTableDataSource } from '@angular/material/table';
import { SampleCollection } from '../../fir/models/sampleCollection.model';
import { SaveOutBreak } from '../models/SaveOutbreak.model';
import moment from 'moment';
import { MasterSpecies } from '../../fir/models/species.model';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { TreatmentResponseDialogComponent } from '../../treatment-response-dialog/treatment-response-dialog.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlphaNumericSpecialValidation, NumericValidation } from 'src/app/shared/utility/validation';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-outbreak-follow-up',
  templateUrl: './outbreak-follow-up.component.html',
  styleUrls: ['./outbreak-follow-up.component.css'],
  providers: [TranslatePipe],
})
export class OutbreakFollowUpComponent implements OnInit {
  outBreakFollowUpForm!: FormGroup;
  dataSourceSampleCollection = new MatTableDataSource<SampleCollection>([]);
  sampleCollectionDisplayedColumns: string[] = [
    'tagId',
    'sampleId',
    'sampleType',
    'examinationType',
    'result',
  ];
  validationMsg = animalHealthValidations.outbreakFollowup;
  probableSourceofIncome: any = [];
  action_taken_list: ActionTakenList[] = [];
  selected_action_taken_list: any = [];
  diseaseJson: any;
  affectedAnimalDisplayedColumns: string[] = [
    'speciesCd',
    'noOfAnimals',
    'noOfAnimalsDied',
    'action',
  ];
  labTestingDisplayedColumns: string[] = [
    'sampleColl',
    'sampleType',
    'typeOfExam',
    'examsubType',
    'lab',
    'labCharges',
    'receiptno',
    'transportmode',
    'action',
  ];
  affectedAnimalForm!: FormGroup;
  affectedAnimalRows!: FormArray;
  affectedAnimalData = affectedAnimalInitialData;
  dataSourceLab = new BehaviorSubject<AbstractControl[]>([]);
  labTestingForm!: FormGroup;
  labTestingRows!: FormArray;
  labTestingData = ELEMENT_DATA_LabTesting;
  affectedAnimalDataSource = new BehaviorSubject<AbstractControl[]>([]);
  villages: Village[] = [];
  selectedVillages = [];
  public isShowError: string = '';
  teshil = [];
  districts = [];
  selectedTeshil = [];
  isLoadingSpinner: boolean = false;
  getProSource: ProbableSource[] = [];
  getSeverityRes: SeverityOfOutBreak[] = [];
  speciesMaster: MasterSpecies[] = [];
  outbreakDetailData: OutBreakDetails[] = [];
  totalNoOfAnimalsAffectedData: OutBreakDetails[] = [];
  firstIncidenceDate: OutBreakDetails[] = [];
  firstIncidenceReportingDate: OutBreakDetails[] = [];
  minDate: string;
  VillageDetailsDesc: OutBreakDetails[] = [];
  actionTakenDesc: OutBreakDetails[] = [];
  speciesDesc: OutBreakDetails[] = [];
  paramsRequest: any;
  Successmessage: SaveOutBreak[] = [];
  outbreakIdMessage: SaveOutBreak[] = [];
  sampleDetails: SaveOutBreak[] = [];
  outbreakStatus: SaveOutBreak[] = [];
  interiemReport: any;
  outbreakId: number;

  constructor(
    private _fb: FormBuilder,
    private _location: Location,
    public dialog: MatDialog,
    private intimationReportService: IntimationReportService,
    private firService: FIRService,
    private OutbreakService: OutBreakDiseaseService,
    private route: ActivatedRoute,
    private translatePipe: TranslatePipe,
    private readonly translateService: TranslateService
  ) { }
  public today: Date = new Date(sessionStorage.getItem('serverCurrentDateTime'));
  public currentYear: number = this.today.getFullYear();
  public currentMonth: number = this.today.getMonth();
  public currentDay: number = this.today.getDate();
  public maxDate: Object = new Date(this.today);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.paramsRequest = params;
      this.interiemReport = this.paramsRequest.interimReportNo;
      this.outbreakId = this.paramsRequest.outbreakId;
    });

    this.probableSourceofIncome = probable_Source_of_Income_List;
    this.affectedAnimalRows = this._fb.array([]);
    this.labTestingRows = this._fb.array([]);
    this.outBreakFollowUpForm = this._fb.group({
      villages: [[], [Validators.required]],
      teshil: [[], [Validators.required]],
      district: [[], [Validators.required]],
      interimReportDate: [new Date(sessionStorage.getItem('serverCurrentDateTime')), [Validators.required]],
      sourceOfInfectionCd: [null, Validators.required],
      diseaseConfirmed: [null, Validators.required],
      severityOfOutbreak: [''],
      remarks: ['', [AlphaNumericSpecialValidation]],
      actionTakenCdList: ['', [Validators.required]],
      finalReport: ['N'],
      update_affected_species_flag: ['no'],
      sample_for_lab_testing_flag: ['no'],
      updateAffectedSpecies: this.affectedAnimalRows,
      sample_for_lab_testing: this.labTestingRows,
    });
    // if (this.affectedAnimalData.length)
    //   this.affectedAnimalData.forEach((d: affectedAnimalModel) =>
    //     this.addAffectedAnimalRow(d, false)
    //   );
    // this.updateAffectedAnimalView();

    this.labTestingData.forEach((d: LabTestingModel) =>
      this.addLabTestingRow(d, false)
    );
    this.updateLabTestingView();
    this.affectedAnimalRows.valueChanges.subscribe((res) => {
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
          this.affectedAnimalRows.at(i).get('noOfAnimalsDied').reset();
        }
      });
    });

    this.outBreakFollowUpForm['controls'][
      'update_affected_species_flag'
    ].valueChanges.subscribe((val: string) => {
      let affected_animals =
        this.outBreakFollowUpForm['controls']['updateAffectedSpecies'][
        'controls'
        ];
      if (val == 'yes') {
        for (let animal of affected_animals) {
          animal['controls']['speciesCd'].setValidators([Validators.required]);
          animal['controls']['speciesCd'].updateValueAndValidity();
        }
      } else {
        for (let animal of affected_animals) {
          animal['controls']['speciesCd'].clearValidators();
          animal['controls']['speciesCd'].updateValueAndValidity();
        }
      }
    });

    this.intimationReportService
      .getVillagesByUser(AnimalHealthConfig.campaignUserID.toString())
      .subscribe(
        (res) => {
          this.villages = res;

          this.selectAllForDropdownItems(this.villages);

          this.isLoadingSpinner = false;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );

    this.outBreakFollowUpForm
      .get('villages')
      .valueChanges.subscribe((value: Village[]) => {
        if (!value?.length) {
          return;
        }
        const tehsils: Village[] = [];
        for (const village of value) {
          if (tehsils.find((tehsil) => tehsil.tehsilCd === village.tehsilCd))
            continue;

          tehsils.push(village);
        }

        this.outBreakFollowUpForm.get('teshil').patchValue(tehsils);
      });

    this.outBreakFollowUpForm
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

        this.outBreakFollowUpForm.get('district').patchValue(districts);
      });
    const todo1$ = this.firService
      .getprobableSource('infection_source')
      .pipe(catchError((err) => of(null)));
    const todo2$ = this.OutbreakService.getOutbreakDetail(
      this.paramsRequest
    ).pipe(catchError((err) => of(null)));
    const todo3$ = this.OutbreakService.severityOfOutbreak(
      'severity_of_outbreak'
    ).pipe(catchError((err) => of(null)));
    const todo4$ = this.firService
      .getActionTakenList()
      .pipe(catchError((err) => of(null)));
    const todo5$ = this.firService
      .getSpecies('species')
      .pipe(catchError((err) => of(null)));
    this.isLoadingSpinner = true;
    forkJoin([todo1$, todo2$, todo3$, todo4$, todo5$]).subscribe(
      ([
        getprobableSourceRes,
        outBreakDetailsRes,
        severityRes,
        actionTakenRes,
        speciesRes,
      ]) => {
        this.isLoadingSpinner = false;
        this.getProSource = getprobableSourceRes ?? [];
        this.getSeverityRes = severityRes ?? [];
        this.action_taken_list = actionTakenRes ?? [];
        this.selectAllForDropdownItems(this.action_taken_list);
        this.speciesMaster = speciesRes;

        this.outbreakDetailData = outBreakDetailsRes ?? [];
        this.totalNoOfAnimalsAffectedData =
          outBreakDetailsRes.outbreakDetail.totalNoOfAnimalsAffected;
        this.firstIncidenceDate =
          outBreakDetailsRes.outbreakDetail.firstIncidenceDate;
        this.firstIncidenceReportingDate =
          outBreakDetailsRes.outbreakDetail.firstIncidenceReportingDate;
        this.minDate = outBreakDetailsRes.outbreakDetail.interimReportDate;
        this.VillageDetailsDesc = outBreakDetailsRes['areaMappingDetails'];
        this.actionTakenDesc = outBreakDetailsRes['actionTakenDetails'] ?? [];
        this.speciesDesc = outBreakDetailsRes['speciesImpactedList'];
        if (this.speciesDesc?.length) {
          for (let species of this.speciesDesc) {
            this.addAffectedAnimalRow({
              speciesCd: species.speciesCd,
              noOfAnimals: species.noOfAnimals,
              noOfAnimalsDied: species.noOfAnimalsDied,
            });
          }
        }
        this.outBreakFollowUpForm.patchValue({
          villages: this.VillageDetailsDesc,
          actionTakenCdList: this.actionTakenDesc.map((a) => a.actionTakenCd),
          sourceOfInfectionCd:
            outBreakDetailsRes.outbreakDetail.sourceOfInfectionCd,
          diseaseConfirmed: outBreakDetailsRes.outbreakDetail.diseaseConfirmed,
          severityOfOutbreak:
            outBreakDetailsRes.outbreakDetail.severityOfOutbreak,
          interimReportDate:
            outBreakDetailsRes.outbreakDetail.interimReportDate,
        });
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  // onCheckDupRole() {
  //   this.checkDuplicateList();
  // }

  // checkDuplicateList() {
  //   const dup = this.outBreakFollowUpForm.value.speciesImpacted
  //     ?.map((val: any) => val.speciesCd)
  //     .filter((val: any, i: number, role: any[]) => role.indexOf(val) != i);
  //   const dupRecord = this.outBreakFollowUpForm.value.speciesImpacted?.filter(
  //     (obj: any) => obj.speciesCd && dup.includes(obj.speciesCd)
  //   );
  //   if (dupRecord?.length > 1) {
  //     this.isShowError = this.translatePipe.transform(
  //       'errorMsg.species_already_exists_please_select_another_species'
  //     );
  //   } else {
  //     this.isShowError = '';
  //   }
  // }

  selectAllForDropdownItems(items: any[]) {
    let allSelect = (items) => {
      items.forEach((element) => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };

    allSelect(items);
  }

  removeAllVillages() {
    this.outBreakFollowUpForm.get('teshil').reset();
    this.outBreakFollowUpForm.get('district').reset();
  }
  updateAffectedAnimalView() {
    this.affectedAnimalDataSource.next(this.affectedAnimalRows.controls);
  }

  // addAffectedAnimalRow(d?: affectedAnimalModel, noUpdate?: boolean) {
  //   const row = this._fb.group({
  //     speciesCd: [d && d.speciesCd ? d.speciesCd : null, []],
  //     noOfAnimals: [d && d.noOfAnimals ? d.noOfAnimals : null, []],
  //     noOfAnimalsDied: [d && d.noOfAnimalsDied ? d.noOfAnimalsDied : null, []],
  //   });
  //   this.affectedAnimalRows.push(row);
  //   if (!noUpdate) {
  //     this.updateAffectedAnimalView();
  //   }
  // }
  addAffectedAnimalRow(d?: affectedAnimalModel, noUpdate?: boolean) {
    const row = this._fb.group({
      speciesCd: [d && d.speciesCd ? d.speciesCd : null, [Validators.required]],
      noOfAnimals: [
        d && d.noOfAnimals ? d.noOfAnimals : null,
        [NumericValidation, Validators.maxLength(6), Validators.required],
      ],
      noOfAnimalsDied: [
        d && d.noOfAnimalsDied ? d.noOfAnimalsDied : null,
        [NumericValidation, Validators.maxLength(6)]
      ],
    });
    this.affectedAnimalRows.push(row);
    if (!noUpdate) {
      this.updateAffectedAnimalView();
    }
  }

  removeAffectedAnimalElement(index: number) {
    if (this.affectedAnimalRows.controls.length > 1) {
      this.affectedAnimalRows.removeAt(index);
      this.updateAffectedAnimalView();
    }
  }

  updateLabTestingView() {
    this.dataSourceLab.next(this.labTestingRows.controls);
  }

  addLabTestingRow(d?: LabTestingModel, noUpdate?: boolean) {
    const row = this._fb.group({
      sampleColl: [d && d.sampleColl ? d.sampleColl : null, []],
      sampleType: [d && d.sampleType ? d.sampleType : null, []],
      typeOfExam: [d && d.typeOfExam ? d.typeOfExam : null, []],
      examsubType: [d && d.examsubType ? d.examsubType : null, []],
      lab: [d && d.lab ? d.lab : null, []],
      labCharges: [d && d.labCharges ? d.labCharges : null, []],
      receiptno: [d && d.receiptno ? d.receiptno : null, []],
      transportmode: [d && d.transportmode ? d.transportmode : null, []],
    });
    this.labTestingRows.push(row);
    if (!noUpdate) {
      this.updateLabTestingView();
    }
  }

  removeLabTestingElement(index: number) {
    if (this.labTestingRows.controls.length > 1) {
      this.labTestingRows.removeAt(index);
      this.updateLabTestingView();
    }
  }

  isControlValid(path: string) {
    const formControl = this.outBreakFollowUpForm.get(path);
    return formControl?.touched && formControl.invalid;
  }

  openDiseaseTestingDialog() {
    const dialogRef = this.dialog.open(FirDiseaseTestingComponent, {
      disableClose: true,
      width: '90vw',
      height: '90vh',
      panelClass: 'custom-dialog-container',
    });
    dialogRef.afterClosed().subscribe((diseaseTestingres) => {
      if (!diseaseTestingres) return;
      this.diseaseJson = diseaseTestingres.sampleData;
      for (const animal of this.diseaseJson) {
        animal['examinationCount'] = 0;
        for (const sample of animal.labTestingRequestDtos) {
          animal['examinationCount'] += sample.sampleExaminationDetails.length;
        }
      }
      // this.labTesting = diseaseTestingres['']
      this.dataSourceSampleCollection.data = this.diseaseJson ?? [];
      // for (let data of this.diseaseJson) {

      //   data['sampleId'] = data.onSpotRequestDtos.map(a => a.sampleId);
      //   data['sampleType'] = data.onSpotRequestDtos.map(a => a.sampleType);
      //   data['initialexaminationType'] = data.onSpotRequestDtos.map(a => a.initialSampleResultValue);
      //   data['finalexaminationType'] = data.onSpotRequestDtos.map(a => a.finalSampleResultValue);
      // }
      // this.dataSourceSampleCollection.data = this.diseaseJson ?? [];
    });
  }

  submitOutBreakReport() {
    if (this.outBreakFollowUpForm.invalid) {
      this.outBreakFollowUpForm.markAllAsTouched();
      return;
    }

    const interimReportDate =
      moment(this.outBreakFollowUpForm.value.interimReportDate).format(
        'YYYY-MM-DD'
      ) == 'Invalid date'
        ? ''
        : moment(this.outBreakFollowUpForm.value.interimReportDate).format(
          'YYYY-MM-DD'
        );
    const request = {
      ...this.outBreakFollowUpForm.value,
    };
    (request['villageCdList'] = this.villages.map((a) => a.villageCd)),
      (request['saveSampleRequestDtos'] = this.diseaseJson),
      (request['interimReportDate'] = interimReportDate);
    // request['villageCdList'] = this.VillageDetailsDesc.map(a => a.villageCd),
    request['outbreakDetails'] = {
      diseaseConfirmed: request['diseaseConfirmed'],
      finalReport: request['finalReport'],
      interimReportDate: request['interimReportDate'],
      reportedBy: 'RabishMidnight',
      sourceOfInfectionCd: request['sourceOfInfectionCd'],
      severityOfOutbreak: request['severityOfOutbreak'],
      interimReportNo: this.interiemReport
        ? parseInt(this.interiemReport) + 1
        : this.interiemReport,
      outbreakId: this.outbreakId,
      totalNoOfAnimalsAffected: this.totalNoOfAnimalsAffectedData,
      firstIncidenceDate: this.firstIncidenceDate,
      firstIncidenceReportingDate: this.firstIncidenceReportingDate,
    };
    delete request['diseaseConfirmed'];
    delete request['finalReport'];
    delete request['interimReportDate'];
    delete request['sourceOfInfectionCd'];
    delete request['sample_for_lab_testing'];
    delete request['sample_for_lab_testing_flag'];
    delete request['update_affected_species_flag'];
    delete request['severityOfOutbreak'];
    delete request['villages'];
    delete request['teshil'];
    delete request['district'];
    delete request['remarks'];

    this.isLoadingSpinner = true;
    this.OutbreakService.saveOutBreak(request).subscribe(
      (res: any) => {
        this.Successmessage = res.msg.msgDesc;
        this.outbreakIdMessage = res.data.outbreakId;
        this.sampleDetails = res.data.sampleDetails;
        this.outbreakStatus = res.data.outbreakStatus;
        this.isLoadingSpinner = false;
        this.openCampaignDialog();
      },
      (err) => (this.isLoadingSpinner = false)
    );
  }

  openCampaignDialog() {
    const dialogRef2 = this.dialog.open(SubmitFollowUpComponent, {
      disableClose: true,
      data: {
        title: this.Successmessage,
        outbreakId: this.outbreakIdMessage,
        outbreakStatus: this.outbreakStatus,
        finalReport: this.outBreakFollowUpForm.value.finalReport,
      },
      width: '400px',
    });
    dialogRef2.afterClosed().subscribe((res) => { });
  }

  onReset() {
    this.outBreakFollowUpForm.reset();
  }

  goBack() {
    this._location.back();
  }


  onSpeciesSelected(event: MatSelectChange, index: number) {
    const rows = this.affectedAnimalRows.value as {
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
      this.affectedAnimalRows.at(index).reset();
    }
  }
}

interface affectedAnimalModel {
  speciesCd: string | number;
  noOfAnimals: number | null;
  noOfAnimalsDied: number | null;
}

interface LabTestingModel {
  sampleColl: string;
  sampleType: string;
  typeOfExam: string;
  examsubType: string;
  lab: string;
  labCharges: string;
  receiptno: string;
  transportmode: string;
}

const probable_Source_of_Income_List = [
  {
    cd: '1',
    value: 'Water',
  },
  {
    cd: '2',
    value: 'Air',
  },
  {
    cd: '3',
    value: 'Contact',
  },
  {
    cd: '4',
    value: 'Food',
  },
];

const affectedAnimalInitialData: affectedAnimalModel[] = [
  {
    speciesCd: '',
    noOfAnimals: null,
    noOfAnimalsDied: null,
  },
];

const ELEMENT_DATA_LabTesting: LabTestingModel[] = [
  {
    sampleColl: '',
    sampleType: '',
    typeOfExam: '',
    examsubType: '',
    lab: '',
    labCharges: '',
    receiptno: '',
    transportmode: '',
  },
];
