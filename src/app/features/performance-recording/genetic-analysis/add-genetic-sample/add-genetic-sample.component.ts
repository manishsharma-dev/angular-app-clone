import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  switchMap,
  take,
} from 'rxjs/operators';
import { CommonMaster } from 'src/app/features/animal-health/animal-treatment/models/common-master.model';
import { LabMaster } from 'src/app/features/animal-health/animal-treatment/models/master.model';
import { HealthService } from 'src/app/features/animal-health/health.service';
import { AnimalDetailService } from 'src/app/features/animal-management/animal-registration/animal-details/animal-detail.service';
import { AnimalManagementService } from 'src/app/features/animal-management/animal-registration/animal-management.service';
import { AnimalResult } from 'src/app/features/animal-management/animal-registration/models-animal-reg/tagId-search.model';
import { animalBreedingPRConfig } from 'src/app/shared/animal-breeding-pr.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import {
  AlphaNumericSpecialValidation,
  NumericValidation,
} from 'src/app/shared/utility/validation';
import { animalBreedingValidations } from 'src/app/shared/validatator';
import { decimalWithLengthValidation } from '../../../../shared/utility/decimalWithLengthValidator';
import { GeneticAnalysisService } from '../genetic-analysis.service';
import { ExaminationSubType } from '../models/examination-sub-type.model';
import { SaveGeneticDialogComponent } from '../save-genetic-dialog/save-genetic-dialog.component';
import { PrService } from '../../pr.service';

@Component({
  selector: 'app-add-genetic-sample',
  templateUrl: './add-genetic-sample.component.html',
  styleUrls: ['./add-genetic-sample.component.css'],
  providers: [TranslatePipe],
})
export class AddGeneticSampleComponent implements OnInit {
  cmnValidation = animalBreedingValidations.common;
  validationMsg = animalBreedingValidations.geneticAnalysis;
  isLoadingSpinner = false;
  animal!: AnimalResult | any;
  geneticSampleForm: FormGroup;
  dataSource = new BehaviorSubject<FormGroup[]>([]);
  displayedColumns = [
    'sampleType',
    'breedingSampleTypeOther',

    'examinationSubType',
    'otherExaminationSubType',
    'labName',
    'testingCharges',
    'receiptNo',
    'action',
  ];
  sampleTypes: CommonMaster[] = [];
  labs: LabMaster[] = [];
  examinationSubTypes: ExaminationSubType[] = [];
  currentDate = moment(this.prService.currentDate);
  minDate = '';

  constructor(
    private healthService: HealthService,
    private route: ActivatedRoute,
    private location: Location,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private geneticService: GeneticAnalysisService,
    private animalMgmtService: AnimalDetailService,
    private dataService: DataServiceService,
    private translatePipe: TranslatePipe,
    private prService: PrService
  ) {}

  ngOnInit(): void {
    this.getData();
    this.initForm();
  }

  initForm() {
    this.geneticSampleForm = this.fb.group({
      breedingExaminationType: [{ value: 'Genetic Analysis', disabled: true }],
      sampleCollectionDate: [
        this.currentDate,
        { validators: [Validators.required], updateOn: 'blur' },
      ],
      examinationRows: this.fb.array([]),
    });

    this.geneticSampleForm
      .get('sampleCollectionDate')
      .valueChanges.pipe(
        filter(() => !!this.animal?.taggingDate),
        distinctUntilChanged()
      )
      .subscribe((res) => {
        const selectedDate = moment(res);

        const taggingDate = moment(this.animal?.taggingDate);

        if (selectedDate.isBefore(taggingDate)) {
          this.dialog
            .open(ConfirmationDialogComponent, {
              data: {
                title: this.translatePipe.transform('common.info_label'),
                message: this.translatePipe.transform(
                  'performanceRecording.please_select_date_after_animal_tagging_date'
                ),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
                icon: 'assets/images/alert.svg',
              },
              panelClass: 'common-info-dialog',
            })
            .afterClosed()
            .subscribe(() =>
              this.geneticSampleForm.get('sampleCollectionDate').reset()
            );
        }
      });

    this.addRow();
  }

  addRow() {
    const row = this.fb.group({
      breedingSampleType: [null, [Validators.required]],
      breedingExaminationSubtype: [],
      // breedingSampleTypeOther: [
      //   { value: null, disabled: true },
      //   [Validators.required, AlphaNumericSpecialValidation],
      // ],
      breedingExaminationSubtypeOther: [
        { value: null, disabled: true },
        [Validators.required, AlphaNumericSpecialValidation],
      ],
      labCd: [null, [Validators.required]],
      testCharges: [
        null,
        [decimalWithLengthValidation(9, 2), Validators.min(0)],
      ],
      receiptNo: [null, [Validators.maxLength(15), NumericValidation]],
    });

    this.examinationRows.push(row);
    this.updateTableView();
  }

  removeRow(i: number) {
    if (this.examinationRows.length > 1) {
      this.examinationRows.removeAt(i);
      this.updateTableView();
    } else {
      this.examinationRows.at(i).reset();
    }
  }

  updateTableView() {
    this.dataSource.next(this.examinationRows.controls as FormGroup[]);
  }

  getData() {
    const animalReq = this.route.queryParamMap.pipe(
      switchMap((params) => {
        return this.animalMgmtService.getAnimalDetails(params.get('animalId'));
      }),
      take(1)
    );

    const labsReq = this.getLabs();

    const sampleRequest = this.healthService.getCommonMaster(
      'breeding_sample_type'
    );

    const examinationReq = this.geneticService.getExaminationSubtype(2);

    const configDateReq = this.dataService.getDefaultConfig(
      animalBreedingPRConfig.backdate.GeneticAnalysisBackdate
    );

    this.isLoadingSpinner = true;
    forkJoin([
      animalReq,
      labsReq,
      sampleRequest,
      examinationReq,
      configDateReq,
    ]).subscribe(
      ([animalDetails, labs, samples, examinationSubTypes, config]) => {
        this.labs = labs;
        // ?.length > 0
        //   ? labs[1].filter(
        //       (org) => org?.orgId == labs[0].orgId && org?.subOrgType == 5
        //     )
        //   : [];
        this.animal = animalDetails;
        this.sampleTypes = samples;
        this.examinationSubTypes = examinationSubTypes;
        this.minDate = moment(this.prService.currentDate)
          .subtract(config.defaultValue, 'days')
          .format('YYYY-MM-DD');
        this.isLoadingSpinner = false;
      },
      () => {
        this.isLoadingSpinner = false;
      }
    );
  }

  onSubmit() {
    if (this.geneticSampleForm.invalid) {
      this.geneticSampleForm.markAllAsTouched();
      return;
    }

    const formValue = this.geneticSampleForm.value;

    const reqObj = formValue.examinationRows.map((exam) => ({
      ...exam,
      animalId: this.animal.animalId,
      sampleRecordDate: this.currentDate,
      tagId: this.animal.tagId,

      testingLocation: 2,
      breedingExaminationType: 2,
      sampleCollectionDate: moment(formValue.sampleCollectionDate).format(
        'YYYY-MM-DD'
      ),
    }));

    this.isLoadingSpinner = true;
    this.geneticService
      .saveGeneticAnalysis(reqObj)
      .pipe(
        switchMap((res) => {
          this.isLoadingSpinner = false;
          return this.dialog
            .open(SaveGeneticDialogComponent, {
              data: res,
              width: '500px',
              // panelClass: 'makeItMiddle',
              disableClose: true,
            })
            .afterClosed();
        })
      )
      .subscribe(
        (res) => {
          this.location.back();
        },
        () => (this.isLoadingSpinner = false)
      );
  }

  onSelectingOtherType(element: string, cd: number, index: number) {
    switch (element) {
      // case 'breedingSampleType':
      //   if (cd === 7) {
      //     this.examinationRows
      //       .at(index)
      //       .get('breedingSampleTypeOther')
      //       .enable();
      //   } else {
      //     this.examinationRows
      //       .at(index)
      //       .get('breedingSampleTypeOther')
      //       .disable();
      //   }
      //   break;

      case 'breedingExaminationSubtype':
        if (cd === 6) {
          this.examinationRows
            .at(index)
            .get('breedingExaminationSubtypeOther')
            .enable();
        } else {
          this.examinationRows
            .at(index)
            .get('breedingExaminationSubtypeOther')
            .disable();
        }
        break;
    }
  }

  goBack() {
    this.location.back();
  }

  onReset() {
    this.geneticSampleForm.reset({
      breedingExaminationType: 'Genetic Analysis',
    });
    while (this.examinationRows.length) {
      this.examinationRows.removeAt(0);
    }
    this.addRow();
  }

  get examinationRows() {
    return this.geneticSampleForm.get('examinationRows') as FormArray;
  }

  get today() {
    return moment(this.prService.currentDate).format('YYYY-MM-DD');
  }

  getAnimalAge(age: number) {
    return this.healthService.getWords(age);
  }

  private getLabs() {
    const subOrganisationType = {
      subOrgType: 5,
    };
    return this.dataService._getOrganizationList(subOrganisationType);
    // forkJoin([
    //   this.dataService._getUserDetailsByUserId(),
    // ]);

    // this.dataService._getUserDetailsByUserId().subscribe((data: any) => {
    //   this.getLabs(data?.orgId);
    // });

    // this.dataService._getOrganizationList().subscribe((orgList: any) => {
    //   this.labMaster =
    // orgList?.length > 0
    //   ? orgList.filter((org) => org?.orgId == orgId && org?.subOrgType == 5)
    //   : [];
    // });
  }
}
