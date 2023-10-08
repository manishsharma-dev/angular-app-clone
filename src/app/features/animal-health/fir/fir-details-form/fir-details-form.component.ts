import { FirDiseaseTestingComponent } from './../fir-disease-testing/fir-disease-testing.component';
import { Location } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { BehaviorSubject, forkJoin, of, Subject } from 'rxjs';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { DraftFirDialogComponent } from '../draft-fir-dialog/draft-fir-dialog.component';
import { getDecryptedData } from 'src/app/shared/shareService/storageData';
import { FIRService } from '../fir.service';
import { MergeIntimationReport } from '../models/firstIncDetails.model';
import { MasterSpecies, Species } from '../models/species.model';
import { HealthService } from '../../health.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { ProbableSource } from '../models/probableSource.model';
import { ActionTakenList } from '../models/actionTakenList.model';
import { AnimalManagementService } from 'src/app/features/animal-management/animal-registration/animal-management.service';
import { catchError, takeUntil } from 'rxjs/operators';
import { AnimalTreatmentService } from '../../animal-treatment/animal-treatment.service';
import {
  DiseaseDetails,
  SymptomDetails,
} from '../../animal-treatment/models/treatment-history.model';
import { Symptom } from '../../animal-treatment/models/symptom.model';
import { Disease } from '../../animal-treatment/models/disease.model';
import { SaveFIR } from '../models/saveFIR.model';
import {
  AlphaNumericSpecialValidation,
  NumericValidation,
} from 'src/app/shared/utility/validation';
import { MatTableDataSource } from '@angular/material/table';
import { SampleCollection } from '../models/sampleCollection.model';
import { index } from 'd3';
import { SymptomDetail } from '../../intimation-report/models/intimation-report-details.model';
import { TreatmentResponseDialogComponent } from '../../treatment-response-dialog/treatment-response-dialog.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatSelectChange } from '@angular/material/select';

export enum UploadStatus {
  progress,
  started,
  complete,
  idle,
}
const affectedAnimalInitialData = [];

interface affectedAnimalModel {
  speciesCd: number | string;
  noOfAnimals: number;
  noOfAnimalsDied: number;
}
interface FIRImage {
  fileName: string;
  fileSize: string;
  fileProgress: number;
  ngUnsubscribe: Subject<any>;
  uploaded: boolean;
  url: string | null;
  file: File;
}
@Component({
  selector: 'app-fir-details-form',
  templateUrl: './fir-details-form.component.html',
  styleUrls: ['./fir-details-form.component.css'],
  providers: [TranslatePipe],
})
export class FirDetailsFormComponent implements OnInit {
  validationMsg = animalHealthValidations.intimatonReport;
  step = 0;
  symptoms: any[] = [];
  selectedSymptoms = [];
  selectedDiseases = [];
  diseases: any[] = [];
  intimationForm: FormGroup;
  otherSymptoms: FormGroup;
  otherDiseases: FormGroup;
  otherSymptomsFlag: boolean = false;
  otherDiseasesFlag: boolean = false;
  affectedAnimalRows: FormArray;
  selectedVillages = [];
  controls: ActionTakenList[] = [];
  fileUrls: string[] = [];
  speciesImpacted: { animalId: number; tagId: number; intimationId: number }[] =
    [];
  editMode = false;
  selectedTeshil = [];
  dataSourceSampleCollection = new MatTableDataSource<SampleCollection>([]);
  sampleCollectionDisplayedColumns: string[] = [
    'tagId',
    'sampleId',
    'sampleType',
    'examinationType',
    'result',
  ];
  affectedAnimalDataSource = new BehaviorSubject<AbstractControl[]>([]);
  affectedAnimalDisplayedColumns: string[] = [
    'speciesCd',
    'noOfAnimals',
    'noOfAnimalsDied',
    'action',
  ];
  words: any;
  uploadProgress = 47;
  files: File[] = [];
  affectedAnimalData = affectedAnimalInitialData;
  firstIncDetailsList: any;
  mergeDetailsMaster: MergeIntimationReport;
  speciesDesc: MergeIntimationReport[] = [];
  CSVOf_arrVillage: any;
  reportsDetails: MergeIntimationReport[] = [];
  removeDuplicatesArrayById: any;
  CSVOf_villageDisplay: any;
  data: string;
  villageList: MergeIntimationReport[] = [];
  errorMesAffectedAnimals: any;
  symtomsList: any;
  affectedAnimalsMaster: any;
  formData: any[][] = [];
  public isShowError: string = '';
  diedData: any[][] = [];
  uploadedMedia: FIRImage[] = [];
  getProSource: ProbableSource[] = [];
  speciesMaster: MasterSpecies[] = [];
  isLoadingSpinner: boolean = false;
  DiseaseID: boolean = true;
  diseaseJson: any = [];
  Successmessage: SaveFIR[] = [];
  firIdMessage: SaveFIR[] = [];
  supervisorName: SaveFIR[] = [];
  sampleDetails: SaveFIR[] = [];
  minDate: string;
  constructor(
    private dialog: MatDialog,
    private location: Location,
    private route: ActivatedRoute,
    private firService: FIRService,
    private readonly translateService: TranslateService,
    private treatmentService: AnimalTreatmentService,
    private animalMS: AnimalManagementService,
    private _fb: FormBuilder,
    private healthService: HealthService,
    private translatePipe: TranslatePipe
  ) { }
  public todayDate: Date = new Date(sessionStorage.getItem('serverCurrentDateTime'));
  public currentYear: number = this.todayDate.getFullYear();
  public currentMonth: number = this.todayDate.getMonth();
  public currentDay: number = this.todayDate.getDate();
  public maxDate: Object = new Date(this.todayDate);

  ngOnInit(): void {
    // this.firstIncDetailsList = getDecryptedData("AESSHA256firstIncDetails")?.id;
    // const type = getDecryptedData("AESSHA256firstIncDetails")?.type;
    this.firstIncDetailsList = JSON.parse(
      sessionStorage.getItem('mergeData')
    ).id;
    // for(let data of this.data){
    //   this.firstIncDetailsList  = data['id'];
    // }
    if (
      this.firstIncDetailsList === null ||
      this.firstIncDetailsList === undefined
    ) {
      this.location.back();
    }

    //validation form and define
    this.affectedAnimalRows = this._fb.array([]);
    this.intimationForm = this._fb.group({
      diseaseSuspected: [''],
      vaccinationDone: [''],
      publicHealthDisease: [''],
      firstIncidenceReportingDate: [
        { value: moment(this.today).format('DD/MM/YYYY'), disabled: true },
        [Validators.required],
      ],
      firstIncidenceDate: ['', Validators.required],
      reportedBy: [
        '',
        [Validators.maxLength(60), AlphaNumericSpecialValidation],
      ],
      symptomDetail: ['', [Validators.required]],
      animalImages: [[]],
      sourceOfInfectionCd: [null, Validators.required],
      actionTakenList: ['', [Validators.required]],
      diseaseDetail: [''],
      textArea: ['', [AlphaNumericSpecialValidation]],
      otherSymptoms: this._fb.array([]),
      otherDiseases: this._fb.array([]),
      speciesImpacted: this.affectedAnimalRows,
      sample_for_lab_testing_flag: ['no'],
      final_report: ['no'],
    });
    this.intimationForm.valueChanges.subscribe();
    this.affectedAnimalRows.valueChanges.subscribe((res) => {
      res?.forEach((val, i) => {
        if (+val?.noOfAnimalsDied > +val?.noOfAnimals) {
          this.dialog.open(TreatmentResponseDialogComponent, {
            width: '400px',
            data: {
              icon: 'assets/images/info.svg',
              title: this.translateService.instant('campaignCreation.alert'),
              message: this.translateService.instant(
                'campaignCreation.no_of_died_animals'
              ),
              primaryBtnText: this.translateService.instant('common.ok_string'),
            },
            panelClass: 'common-info-dialog',
          });
          this.affectedAnimalRows.at(i).get('noOfAnimalsDied').reset();
        }
      });
    });
    this.getMasterData();
  }

  get today() {
    return moment(sessionStorage.getItem('serverCurrentDateTime')).format('YYYY-MM-DD');
  }

  getMasterData() {
    const mergeIntimationReport = this.firService
      .getMergeIntimationReport(this.firstIncDetailsList)
      .pipe(catchError((err) => of(null)));
    const probableSource = this.firService
      .getprobableSource('infection_source')
      .pipe(catchError((err) => of(null)));
    const getSpecies = this.firService
      .getSpecies('species')
      .pipe(catchError((err) => of(null)));
    const getActionTakenList = this.firService
      .getActionTakenList()
      .pipe(catchError((err) => of(null)));
    const getSymptomsMaster = this.treatmentService
      .getSymptomsMaster()
      .pipe(catchError((err) => of(null)));
    const getDiseasesMaster = this.treatmentService
      .getDiseasesMaster()
      .pipe(catchError((err) => of(null)));

    this.isLoadingSpinner = true;
    forkJoin([
      mergeIntimationReport,
      probableSource,
      getSpecies,
      getActionTakenList,
      getSymptomsMaster,
      getDiseasesMaster,
    ]).subscribe(
      ([
        mergeRes,
        proSourceRes,
        speciesRes,
        getActionTakenListRes,
        getSymptomsMasterRes,
        getDiseasesMasterRes,
      ]) => {
        this.isLoadingSpinner = false;
        this.mergeDetailsMaster = mergeRes;
        this.getProSource = proSourceRes; // data fetch getprobableSource
        this.speciesMaster = speciesRes; // data fetch speciesMaster
        // data fetch getActionTakenList
        this.controls = getActionTakenListRes;
        this.selectAllForDropdownItems(this.controls);
        // data fetch getSymptomsMaster
        this.symptoms = getSymptomsMasterRes;
        this.selectAllForDropdownItems(this.symptoms);
        // data fetch getDiseasesMaster
        this.diseases = getDiseasesMasterRes;
        this.selectAllForDropdownItems(this.diseases);

        this.reportsDetails = mergeRes['reportIds'];

        this.villageList = mergeRes.incidenceReportVillageCdAndNameDetails;

        this.CSVOf_arrVillage = Object.entries(this.villageList);
        this.CSVOf_villageDisplay = Object.keys(this.villageList);
        this.minDate = this.mergeDetailsMaster.firstIncidenceDate;
        this.speciesDesc = mergeRes['speciesImpacted'];
        if (this.speciesDesc?.length) {
          for (let species of this.speciesDesc) {
            this.addAffectedAnimalRow({
              speciesCd: species.speciesCd,
              noOfAnimals: species.noOfAnimalsAffected,
              noOfAnimalsDied: species.noOfAnimalsDied,
            });
          }
        }
        let selectedSymtoms = [];
        for (let data of Object.entries(
          mergeRes['incidenceReportSymptomCdAndNameDetails']
        )) {
          if (data[0] != '0') {
            selectedSymtoms.push({
              symptomCd: data[0],
              symptomDesc: data[1],
            });
          }
        }
        let othersSymtoms = [];
        for (let data of mergeRes['incidenceReportOtherSymptomsDetails']) {
          // if (data[0] = '0') {
          othersSymtoms.push({
            symptomCd: data.symptomCd,
            symptomDesc: data.symptomDesc,
            otherRemarks: data.otherRemarks,
          });
          // }
        }

        if (othersSymtoms.length) {
          this.otherSymptomsFlag = true;
        }
        for (const s of othersSymtoms) {
          this.addOtherSymptoms(s);
        }

        let selectedDisease = [];
        for (let data of Object.entries(
          mergeRes['incidenceReportDiseaseCdAndNameDetails']
        )) {
          if (data[0] != '0') {
            selectedDisease.push({
              diseaseCd: data[0],
              diseaseDesc: data[1],
            });
          }
        }

        let otherDiseases = [];
        for (let data of mergeRes['incidenceReportOtherDiseaseDetails']) {
          // if (data[0] = '0') {
          otherDiseases.push({
            diseaseCd: data.diseaseCd,
            diseaseDesc: data.diseaseDesc,
            otherRemarks: data.otherRemarks,
          });
          // }
        }

        for (const d of otherDiseases) {
          this.addOtherDiseases(d);
        }
        if (otherDiseases.length) {
          this.otherDiseasesFlag = true;
        }
        this.intimationForm.patchValue({
          firstIncidenceDate: this.mergeDetailsMaster.firstIncidenceDate,
          reportedBy: this.mergeDetailsMaster.reportedBy,
          symptomDetail: selectedSymtoms,
          diseaseDetail: selectedDisease,
        });
        this.getSpecies();
        this.isLoadingSpinner = false;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  getSpecies() {
    if (this.reportsDetails) {
      const data = {
        reportIds: this.reportsDetails,
      };
      this.isLoadingSpinner = true;
      this.firService.getAffectedAnimals(data).subscribe(
        (res) => {
          this.isLoadingSpinner = false;
          this.affectedAnimalsMaster = res;
          // this.errorMesAffectedAnimals= res.msg.msgDesc;
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
    }
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

  // onCheckDupRole() {
  //   this.checkDuplicateList();
  // }

  // checkDuplicateList() {
  //   const dup = this.intimationForm.value.speciesImpacted
  //     .map((val: any) => val.affected_species)
  //     .filter((val: any, i: number, role: any[]) => role.indexOf(val) != i);
  //   const dupRecord = this.intimationForm.value.speciesImpacted.filter(
  //     (obj: any) => obj.affected_species && dup.includes(obj.affected_species)
  //   );
  //   if (dupRecord.length > 1) {
  //     this.isShowError = this.translatePipe.transform(
  //       'errorMsg.species_already_exists_please_select_another_species'
  //     );
  //   } else {
  //     this.isShowError = '';
  //   }
  // }

  checkSymptomSelected(symptom: Symptom) {
    return !!this.formControls.symptomDetail.value?.find(
      (s: SymptomDetails) => symptom.symptomCd === s.symptomCd
    );
  }

  checkDiseaseSelected(disease: Disease) {
    if (this.formControls) {
      return !!this.formControls.diseaseDetail.value?.find(
        (d: DiseaseDetails) => disease.diseaseCd === d.diseaseCd
      );
    }
    return false;
  }
  removeAffectedAnimals(i: number) {
    this.speciesImpacted.splice(i, 1);
  }

  get formControls() {
    return this.intimationForm.controls;
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
  //Collapse starts
  addOtherSymptoms(symptom?: MergeIntimationReport) {
    const array = this.intimationForm.get('otherSymptoms') as FormArray;

    this.otherSymptoms = this._fb.group({
      name: [
        symptom ? symptom.symptomDesc : null,
        [Validators.required, AlphaNumericSpecialValidation],
      ],
      remark: [
        symptom ? symptom.otherRemarks : null,
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
  addOtherDiseases(d?: MergeIntimationReport) {
    const array = this.intimationForm.get('otherDiseases') as FormArray;

    this.otherDiseases = this._fb.group({
      name: [
        d && d.diseaseDesc ? d.diseaseDesc : null,
        [AlphaNumericSpecialValidation],
      ],
      remark: [
        d && d.otherRemarks ? d.otherRemarks : null,
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
  //remove cross chip item
  removeSelectedDisease(i: number) {
    const value = this.intimationForm.controls.diseases.value;
    value.splice(i, 1);
    this.intimationForm.controls.diseases.patchValue(value);
  }
  toggleOtherDiseases() {
    this.otherDiseasesFlag = !this.otherDiseasesFlag;

    if (this.otherDiseasesFlag) {
      this.addOtherDiseases();
    } else {
      (this.intimationForm.get('otherDiseases') as FormArray).clear();
    }
  }

  toggleOtherSymptoms() {
    this.otherSymptomsFlag = !this.otherSymptomsFlag;

    if (this.otherSymptomsFlag) {
      this.addOtherSymptoms();
    } else {
      (this.intimationForm.get('otherSymptoms') as FormArray).clear();
    }
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
  // For other diseases
  get otherDiseasesControls() {
    return (this.intimationForm.get('otherDiseases') as FormArray)
      .controls as FormGroup[];
  }
  // validation control
  isControlValid(path: string) {
    const formControl = this.intimationForm.get(path);
    return formControl.touched && formControl.invalid;
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
  //affected Animal View
  updateAffectedAnimalView() {
    this.affectedAnimalDataSource.next(this.affectedAnimalRows.controls);
  }

  removeAffectedAnimalElement(index: number) {
    if (this.affectedAnimalRows.controls.length > 1) {
      this.affectedAnimalRows.removeAt(index);
      this.updateAffectedAnimalView();
    }
  }
  //Collapse Ends
  //upload starts//
  onFileAreaClick(element: HTMLInputElement) {
    if (this.uploadedMedia.length === 5) {
      this.showError(
        this.translatePipe.transform('common.alert_string'),
        this.translatePipe.transform('errorMsg.cannot_add_more_than_5_images')
      );
      return;
    }

    element.click();
  }

  showError(title: string, message: string) {
    this.dialog.closeAll();
    return this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title,
          message,
          primaryBtnText: this.translateService.instant('common.ok_string'),
          icon: 'assets/images/alert.svg',
        },
        panelClass: 'common-info-dialog',
      })
      .afterClosed();
  }

  isUploading() {
    if (!this.uploadedMedia.length) {
      return false;
    }

    return this.uploadedMedia.reduce(
      (result, media) => !media.uploaded || result,
      !this.uploadedMedia[0].uploaded
    );
  }
  deleteFile(i: number) {
    if (this.uploadedMedia[i].ngUnsubscribe.closed) {
      this.fileUrls.splice(i, 1);
    } else {
      this.uploadedMedia[i].ngUnsubscribe.next();
    }
    this.uploadedMedia = this.uploadedMedia.filter((_, index) => i !== index);
  }
  handleFiles(fileList: FileList) {
    let error = false;
    const control = this.intimationForm.get('animalImages');
    if (this.uploadedMedia.length + fileList.length > 5) {
      this.showError(
        this.translatePipe.transform('common.alert_string'),
        this.translatePipe.transform('errorMsg.cannot_add_more_than_5_images')
      );
      return;
    }

    for (let i = 0; i < fileList.length; i++) {
      if (
        !this.uploadedMedia.some((f) => f.file.name === fileList.item(i)?.name)
      ) {
        if (!fileList.item(i)?.type.startsWith('image/')) {
          error = true;
          continue;
        }
        const file = fileList.item(i);

        this.uploadedMedia.push({
          fileName: file.name,
          fileSize:
            this.healthService.getFileSize(file.size) +
            ' ' +
            this.healthService.getFileSizeUnit(file.size),
          fileProgress: 0,
          ngUnsubscribe: new Subject<any>(),
          uploaded: false,
          url: null,
          file,
        });
        this.uploadFiles(file, this.uploadedMedia.length - 1);
      }
    }

    control?.patchValue(this.uploadedMedia.map(({ file }) => file));
    if (error) {
      control?.setErrors({ invalidMimeType: true });
      return;
    } else {
      control?.setErrors(null);
    }
  }
  onFileInputChange(event: Event) {
    this.handleFiles((event.target as HTMLInputElement).files!);
  }

  uploadFiles(file: File, i: number) {
    const filteredFile = this.uploadedMedia
      .filter((_, index) => i === index)
      .pop();

    if (!!filteredFile) {
      const fd = new FormData();
      fd.append('file', file);
      // this.uploadedMedia.forEach((media,i) => fd.append(`file${i}`, media.file))
      fd.append('id', 'FIR_Image_1');
      fd.append('moduleFilePath', 'uploadSampleImagePostmortemPath');
      fd.append('uploadType', 'uploadSampleReport');

      this.healthService
        .uploadFile(fd)
        .pipe(takeUntil(filteredFile.ngUnsubscribe))
        .subscribe((res) => {
          switch (res.status) {
            case UploadStatus.complete:
              this.fileUrls.push(res.url);
              if (this.uploadedMedia[i]) {
                this.uploadedMedia[i].uploaded = true;
              }
              break;

            case UploadStatus.progress:
              filteredFile.fileProgress = res.progress;
              break;
          }
        });
    }
  }
  //upload ends//
  //Validation parts
  get f() {
    return this.intimationForm.controls;
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

  submitInterimReport(): void {
    if (this.intimationForm.invalid || this.isShowError) {
      this.intimationForm.markAllAsTouched();
      return;
    }

    const firstIncidenceReportingDate =
      moment(this.intimationForm.value.firstIncidenceReportingDate).format(
        'YYYY-MM-DD'
      ) == 'Invalid date'
        ? ''
        : moment(this.intimationForm.value.firstIncidenceReportingDate).format(
          'YYYY-MM-DD'
        );

    const formattedfirstIncidenceDate =
      moment(this.intimationForm.value.firstIncidenceDate).format(
        'YYYY-MM-DD'
      ) == 'Invalid date'
        ? ''
        : moment(this.intimationForm.value.firstIncidenceDate).format(
          'YYYY-MM-DD'
        );
    const request = {
      ...this.intimationForm.value,
      firstIncidenceReportingDate: this.today
    };

    let temAction = [];

    for (let action of request['actionTakenList']) {
      temAction.push({
        actionTakenCd: action.actionTakenCd,
      });
    }
    // For Disease Requets Starts
    let temDisease = [];
    for (let disease of request['diseaseDetail']) {
      temDisease.push({
        diseaseCd: disease.diseaseCd,
        otherDisease: '',
        remarks: '',
      });
    }
    for (let disease of request['otherDiseases']) {
      temDisease.push({
        diseaseCd: 0,
        otherDisease: disease.name,
        remarks: disease.remark,
      });
    }
    // For Symptoms Requets Starts
    let temSymptoms = [];
    for (let symptom of request['symptomDetail']) {
      temSymptoms.push({
        symptomCd: symptom.symptomCd,
        otherSymptom: '',
        remarks: '',
      });
    }
    for (let symptom of request['otherSymptoms']) {
      temSymptoms.push({
        symptomCd: 0,
        otherSymptom: symptom.name,
        remarks: symptom.remark,
      });
    }
    request['diseaseDetail'] = temDisease;
    request['symptomDetail'] = temSymptoms;
    request['actionTakenList'] = temAction;
    delete request['otherDiseases'];
    delete request['otherSymptoms'];
    delete request.animalImages;
    if (request['diseaseSuspected'] == 'D') {
      request['diseaseSuspected'] = 'Y';
      request['labConfirmed'] = 'N';
    } else if (request['diseaseSuspected'] == 'L') {
      request['diseaseSuspected'] = 'N';
      request['labConfirmed'] = 'Y';
    }
    request['vaccinationDone'] = request['vaccinationDone'] ? 'Y' : 'N';
    request['publicHealthDisease'] = request['publicHealthDisease'] ? 'Y' : 'N';
    request['firstIncidenceDate'] = formattedfirstIncidenceDate;
    request['firstIncidenceReportingDate'] = this.today;
    (request['reportIds'] = this.reportsDetails),
      (request['villageCds'] = this.CSVOf_villageDisplay),
      (request['saveSampleRequestDtos'] = this.diseaseJson),
      (request['firDetails'] = {
        diseaseSuspected: request['diseaseSuspected'],
        firStatus: 1,
        firstIncidenceDate: request['firstIncidenceDate'],
        firstIncidenceReportingDate: request['firstIncidenceReportingDate'],
        labConfirmed: request['labConfirmed'],
        publicHealthDisease: request['publicHealthDisease'],
        remarks: request['textArea'],
        reportedBy: request['RabishMidnight'],
        sourceOfInfectionCd: request['sourceOfInfectionCd'],
        vaccinationDone: request['vaccinationDone'],
      });
    this.fileUrls.forEach((url, i) => {
      request['firDetails'][`animalImageUrl${i + 1}`] = url;
    });
    this.isLoadingSpinner = true;
    this.firService.saveFIR(request).subscribe(
      (res: any) => {
        this.Successmessage = res.msg.msgDesc;
        this.firIdMessage = res.data.firId;
        this.supervisorName = res.data.supervisorName;
        this.sampleDetails = res.data.sampleDetails;
        this.isLoadingSpinner = false;
        this.openCampaignDialog();
      },
      (err) => (this.isLoadingSpinner = false)
    );
  }
  openCampaignDialog() {
    const dialogRef2 = this.dialog.open(DraftFirDialogComponent, {
      data: {
        title: this.Successmessage,
        firID: this.firIdMessage,
        supervisorName:this.supervisorName
      },
      width: '500px',
    });
    dialogRef2.afterClosed().subscribe((res) => { });
  }

  onResetReport() {
    this.speciesImpacted = [];
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

    this.addAffectedAnimalRow();
    this.updateAffectedAnimalView();
    this.intimationForm.reset({
      recordDateIntimation: moment(sessionStorage.getItem('serverCurrentDateTime')).format('DD/MM/YYYY'),
    });
  }
}

// const diseaseJson = [
//   {
//     animalId: 101000000011646,
//     ownerId: 110000000007715,
//     tagId: 100000005123,
//     labTestingRequestDtos: [
//       {
//         sampleId: null,
//         diseaseCd: null,
//         sampleType: 115,
//         sampleExaminationDetails: [
//           {
//             sampleId: null,
//             sampleExaminationTypeCd: 2,
//             sampleExaminationSubtypeCd: 34,
//             labCd: 1,
//             labCharges: '',
//             receiptNo: '',
//             testRemarks: '',
//             modeOfTransport: '',
//             isUpdate: null,
//           },
//           {
//             sampleId: null,
//             sampleExaminationTypeCd: 3,
//             sampleExaminationSubtypeCd: 39,
//             labCd: 1,
//             labCharges: '',
//             receiptNo: '',
//             testRemarks: '',
//             modeOfTransport: '',
//             isUpdate: null,
//           },
//         ],
//       },
//       {
//         sampleId: null,
//         diseaseCd: null,
//         sampleType: 19,
//         sampleExaminationDetails: [
//           {
//             sampleId: null,
//             sampleExaminationTypeCd: 4,
//             sampleExaminationSubtypeCd: 71,
//             labCd: 4,
//             labCharges: '',
//             receiptNo: '',
//             testRemarks: '',
//             modeOfTransport: '',
//             isUpdate: null,
//           },
//           {
//             sampleId: null,
//             sampleExaminationTypeCd: 11,
//             sampleExaminationSubtypeCd: 43,
//             labCd: 4,
//             labCharges: '',
//             receiptNo: '',
//             testRemarks: '',
//             modeOfTransport: '',
//             isUpdate: null,
//           },
//         ],
//       },
//     ],
//     onSpotRequestDtos: [],
//   },
//   {
//     animalId: 101000000011707,
//     ownerId: 110000000007715,
//     tagId: 100000003148,
//     labTestingRequestDtos: [
//       {
//         sampleId: null,
//         diseaseCd: null,
//         sampleType: 115,
//         sampleExaminationDetails: [
//           {
//             sampleId: null,
//             sampleExaminationTypeCd: 2,
//             sampleExaminationSubtypeCd: 34,
//             labCd: 1,
//             labCharges: '',
//             receiptNo: '',
//             testRemarks: '',
//             modeOfTransport: '',
//             isUpdate: null,
//           },
//           {
//             sampleId: null,
//             sampleExaminationTypeCd: 3,
//             sampleExaminationSubtypeCd: 39,
//             labCd: 1,
//             labCharges: '',
//             receiptNo: '',
//             testRemarks: '',
//             modeOfTransport: '',
//             isUpdate: null,
//           },
//         ],
//       },
//       {
//         sampleId: null,
//         diseaseCd: null,
//         sampleType: 19,
//         sampleExaminationDetails: [
//           {
//             sampleId: null,
//             sampleExaminationTypeCd: 4,
//             sampleExaminationSubtypeCd: 71,
//             labCd: 4,
//             labCharges: '',
//             receiptNo: '',
//             testRemarks: '',
//             modeOfTransport: '',
//             isUpdate: null,
//           },
//           {
//             sampleId: null,
//             sampleExaminationTypeCd: 11,
//             sampleExaminationSubtypeCd: 43,
//             labCd: 4,
//             labCharges: '',
//             receiptNo: '',
//             testRemarks: '',
//             modeOfTransport: '',
//             isUpdate: null,
//           },
//         ],
//       },
//     ],
//     onSpotRequestDtos: [],
//   },
//   {
//     animalId: 101000000012582,
//     ownerId: 110000000007715,
//     tagId: 100000001255,
//     labTestingRequestDtos: [
//       {
//         sampleId: null,
//         diseaseCd: null,
//         sampleType: 115,
//         sampleExaminationDetails: [
//           {
//             sampleId: null,
//             sampleExaminationTypeCd: 2,
//             sampleExaminationSubtypeCd: 34,
//             labCd: 1,
//             labCharges: '',
//             receiptNo: '',
//             testRemarks: '',
//             modeOfTransport: '',
//             isUpdate: null,
//           },
//           {
//             sampleId: null,
//             sampleExaminationTypeCd: 3,
//             sampleExaminationSubtypeCd: 39,
//             labCd: 1,
//             labCharges: '',
//             receiptNo: '',
//             testRemarks: '',
//             modeOfTransport: '',
//             isUpdate: null,
//           },
//         ],
//       },
//       {
//         sampleId: null,
//         diseaseCd: null,
//         sampleType: 19,
//         sampleExaminationDetails: [
//           {
//             sampleId: null,
//             sampleExaminationTypeCd: 4,
//             sampleExaminationSubtypeCd: 71,
//             labCd: 4,
//             labCharges: '',
//             receiptNo: '',
//             testRemarks: '',
//             modeOfTransport: '',
//             isUpdate: null,
//           },
//           {
//             sampleId: null,
//             sampleExaminationTypeCd: 11,
//             sampleExaminationSubtypeCd: 43,
//             labCd: 4,
//             labCharges: '',
//             receiptNo: '',
//             testRemarks: '',
//             modeOfTransport: '',
//             isUpdate: null,
//           },
//         ],
//       },
//     ],
//     onSpotRequestDtos: [],
//   },
// ];
