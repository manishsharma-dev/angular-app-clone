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
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { BehaviorSubject, Subject, forkJoin, of } from 'rxjs';
import { filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { decimalWithLengthValidation } from 'src/app/shared/utility/decimalWithLengthValidator';
import {
  AlphaNumericSpecialValidation,
  AlphaNumericValidation,
  NumericValidation,
} from 'src/app/shared/utility/validation';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { CommonMaster } from '../../animal-treatment/models/common-master.model';
import { SampleType } from '../../animal-treatment/models/master.model';
import { HealthService, UploadStatus } from '../../health.service';
import { TreatmentResponseDialogComponent } from '../../treatment-response-dialog/treatment-response-dialog.component';
import { PostMortemDetailsRes } from '../models/postmortem-details.model';
import { PostMortemService } from '../post-mortem.service';
import { SavePostMortemDialogComponent } from '../save-post-mortem-dialog/save-post-mortem-dialog.component';

export interface LabTestingModel {
  sampleDate: string;
  sampleType: string;
  examType: string;
  examSubType: string;
  lab: string;
  labCharges: string;
  receiptNo: string;
  transportMode: string;
}

export interface InternalExaminationField {
  key: string;
  label: string;
}

interface PostMortemImage {
  fileName: string;
  fileSize: string;
  fileProgress: number;
  ngUnsubscribe: Subject<any>;
  uploaded: boolean;
  url: string | null;
  file: File;
}

@Component({
  selector: 'app-add-post-mortem',
  templateUrl: './add-post-mortem.component.html',
  styleUrls: ['./add-post-mortem.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [TranslatePipe],
})
export class AddPostMortemComponent implements OnInit {
  validationMsg = animalHealthValidations.postMortem;
  animalId!: number;
  step = 0;
  fileUploadAreaActive = false;
  sampleData?: any;
  postMortemForm!: FormGroup;
  basicDetailsForm!: FormGroup;
  externalExaminationForm!: FormGroup;
  internalExaminationForm!: FormGroup;
  labTestingForm!: FormGroup;
  finalObservationForm!: FormGroup;
  isLoadingSpinner = false;
  vetForm: FormGroup;

  submitStatus = {
    basicDetailsForm: false,
    externalExaminationForm: false,
    internalExaminationForm: false,
    labTestingForm: false,
    finalObservationForm: false,
  };

  fieldLabel: InternalExaminationField[] = [
    { key: 'headNeck', label: 'Head and Neck' },
    { key: 'cardiovascularSystem', label: 'Cardiovascular system' },
    { key: 'respiratorySystem', label: 'Respiratory system' },
    { key: 'gastrointestinalTract', label: 'Gastrointestinal tract' },
    { key: 'urinarySystem', label: 'Urinary system' },
    { key: 'reproductiveSystem', label: ' Reproductive system' },
    { key: 'udderTeats', label: 'Udder and teats' },
    { key: 'nervousSystem', label: 'Nervous System' },
    { key: 'musculoSkeletalSystem', label: 'Musculo-Skeletal System' },
    { key: 'anyOtherSystem', label: 'Any Other' },
  ];

  selectedFields: InternalExaminationField[] = [];

  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  labTestingDisplayedColumns: string[] = [
    'sampleCollectionDate',
    'sampleType',
    'sampleExaminationTypeCd',
    'sampleExaminationSubtypeCd',
    'labCd',
    'labCharges',
    'receiptNo',
    'modeOfTransport',
    'action',
  ];
  dataSourceLab = new BehaviorSubject<AbstractControl[]>([]);

  sampleSubExamTypeMaster: any[][] = [];
  animal!: PostMortemDetailsRes['animalDetails'];
  postMortemDetails!: PostMortemDetailsRes;
  sampleType: SampleType[] = [];
  labMaster: any[] = [];
  editMode = false;
  postmortemId: number;
  uploadedMedia: PostMortemImage[] = [];
  fileUrls: string[] = [];
  modesOfTransport: CommonMaster[] = [];
  draftId?: number;
  isDraft = true;
  showAllHospitals = false;

  constructor(
    private _fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private postMortemService: PostMortemService,
    private healthService: HealthService,
    private translate: TranslatePipe
  ) { }

  ngOnInit(): void {
    // this.fieldLabel = this.fieldLabel.map(label => {
    //   const translation = this.translate.transform(label.label)

    //   return {
    //     key: label.key, label: translation
    //   }
    // })
    this.initForm();

    const req1 = this.route.queryParams.pipe(
      filter((params) => {
        if (params['animalId']) {
          this.animalId = +params['animalId'];

          return true;
        }

        this.router.navigate(['/not-found']);
        return false;
      }),
      tap((params) => {
        if (params['postmortemId']) {
          this.editMode = true;
          this.isDraft = false;
          this.postmortemId = +params['postmortemId'];
          this.setStep(4);

          this.vetForm.disable();
          this.basicDetailsForm.disable();
          this.internalExaminationForm.disable();
          this.externalExaminationForm.disable();
          this.labTestingForm.disable();
          this.finalObservationForm.get('receiptNo').disable();
          this.finalObservationForm.get('pmCharges').disable();
        }
      }),
      switchMap(() => {
        return this.postMortemService.getPostmortemDetail(this.animalId);
      }),
      take(1)
    );

    const req2 = this.healthService.getCommonMaster(
      'pm_internal_examination_master'
    );

    const req3 = this.healthService.getSubOrgList(10).pipe(take(1));

    this.isLoadingSpinner = true;
    forkJoin([req1, req3])
      .pipe(
        switchMap((res) => {
          if (
            typeof res[0]?.postmortemDetails?.postmortemId !== 'undefined' &&
            res[0]?.postmortemDetails?.postmortemId !== null
          ) {
            const req = this.postMortemService.getSampleDetails(
              res[0].postmortemDetails.postmortemId
            );
            return forkJoin([of(res[0]), of(res[1]), req]);
          }

          return forkJoin([of(res[0]), of(res[1]), of(null)]);
        })
      )
      .subscribe(
        (res: any) => {
          const res1 = res[0];
          const res2 = res[1];

          // const res1 = (res as any).data as PostMortemDetailsRes;
          this.animal = res1.animalDetails as any;
          this.postMortemDetails = res1;
          this.labMaster = res2;

          if (this.editMode) {
            const res3 = res[2];

            if (
              (res1.postmortemDetails?.referredOrgCd !== null &&
                typeof res1.postmortemDetails?.referredOrgCd !== 'undefined') ||
              (res1.postmortemDetails?.referredByVetDesignation !== null &&
                typeof res1.postmortemDetails?.referredByVetDesignation !==
                'undefined') ||
              (res1.postmortemDetails?.referredByVetRegistrationNo !== null &&
                typeof res1.postmortemDetails?.referredByVetRegistrationNo !==
                'undefined') ||
              (res1.postmortemDetails?.referredByVet !== null &&
                typeof res1.postmortemDetails?.referredByVet !== 'undefined')
            ) {
              this.vetForm.patchValue(
                {
                  referredBy: true,
                  ...res1.postmortemDetails,
                },
                { emitEvent: false }
              );
            }
            this.basicDetailsForm.patchValue(res1.postmortemDetails, {
              emitEvent: false,
            });

            // For populating internal examination fields
            const fields: [InternalExaminationField, string][] = [];
            for (const [key, value] of Object.entries(
              this.postMortemDetails.postmortemDetails
            )) {
              const keys = this.fieldLabel;

              const currentKey = keys.find(
                (k) => k.key === key && value !== null
              );
              if (typeof currentKey !== 'undefined') {
                // this.internalExaminationForm.get('fieldSelect').patchValue();
                fields.push([currentKey, value]);
              }
            }
            const fieldSelect = fields.map((f) => f[0]);
            const selectedFields = fields.map((f) => ({
              [f[0].key]: f[1],
            }));

            this.internalExaminationForm.patchValue({
              fieldSelect,
              selectedFields,
            });
            this.internalExaminationForm.disable();

            this.externalExaminationForm.patchValue(res1.postmortemDetails, {
              emitEvent: false,
            });
            this.sampleData = res3.labTestingDetails;
            this.labTestingForm.disable();
            this.finalObservationForm.patchValue(res1.postmortemDetails, {
              emitEvent: false,
            });
            // this.initForm(res1);
          }
          if (this.isDraft) {
            this.loadDraftDetails();
          } else {
            this.isLoadingSpinner = false;
          }
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
  }

  initForm(details?: PostMortemDetailsRes) {
    this.vetForm = this._fb.group({
      referredBy: [],
      referredOrgCd: [null, []],
      referredByVet: [
        null,
        [AlphaNumericSpecialValidation, Validators.maxLength(100)],
      ],
      referredByVetRegistrationNo: [
        null,
        [NumericValidation, Validators.maxLength(100)],
      ],
      referredByVetDesignation: [
        null,
        [AlphaNumericSpecialValidation, Validators.maxLength(100)],
      ],
    });

    this.basicDetailsForm = this._fb.group({
      animalDeathDate: [
        '',
        { validators: [Validators.required], updateOn: 'blur' },
      ],
      animalDeathTime: ['', [Validators.required]],
      placeOfDeath: ['', [Validators.required, AlphaNumericSpecialValidation]],
      history: ['', [AlphaNumericSpecialValidation]],
      identificationMark: ['', [AlphaNumericSpecialValidation]],
      animalImages: [[]],
      pmInitiationStartDate: [
        '',
        { validators: [Validators.required], updateOn: 'blur' },
      ],
      pmInitiationStartTime: ['', [Validators.required]],
      pmCompletionEndDate: [
        '',
        { validators: [Validators.required], updateOn: 'blur' },
      ],
      pmCompletionEndTime: ['', [Validators.required]],
      pmLocation: ['', [Validators.required, AlphaNumericSpecialValidation]],
    });

    this.externalExaminationForm = this._fb.group({
      rigorMortis: ['N'],
      generalConditionCarcass: ['', [AlphaNumericSpecialValidation]],
      naturePositionOfInjury: ['', [AlphaNumericSpecialValidation]],
      naturalOrificesState: ['', [AlphaNumericSpecialValidation]],
      mucousMembraneAndEyeCondition: ['', [AlphaNumericSpecialValidation]],
      skinCondition: ['', [AlphaNumericSpecialValidation]],
    });

    this.internalExaminationForm = this._fb.group({
      fieldSelect: [[]],
      selectedFields: this._fb.array([]),
    });

    this.labTestingForm = this._fb.group({});

    this.finalObservationForm = this._fb.group({
      causeOfDeath: [
        null,
        [Validators.required, AlphaNumericSpecialValidation],
      ],
      pmDiagnosis: [null, [Validators.required, AlphaNumericSpecialValidation]],
      pmCharges: [null, [decimalWithLengthValidation(9, 2)]],
      receiptNo: [null, [Validators.maxLength(10), AlphaNumericValidation]],
    });

    const selectedFieldsArray = this.internalExaminationForm.get(
      'selectedFields'
    ) as FormArray;

    this.internalExaminationForm
      .get('fieldSelect')
      ?.valueChanges.subscribe((value: InternalExaminationField[]) => {
        if (!(value && value.length)) {
          this.selectedFields = [];
          while (selectedFieldsArray.length !== 0) {
            selectedFieldsArray.removeAt(0);
          }
          return;
        } else if (value?.length < this.selectedFields.length) {
          const removedControl = this.selectedFields.findIndex(
            (control) => !value.includes(control)
          );

          selectedFieldsArray.removeAt(removedControl);
        } else {
          value?.forEach(({ key }) => {
            if (!this.selectedFields.find((control) => key === control.key)) {
              const group = this._fb.group({
                [key]: [null, [AlphaNumericSpecialValidation]],
              });

              selectedFieldsArray.push(group);
            }
          });
        }
        this.selectedFields = value;
      });

    this.postMortemForm = this._fb.group({
      basicDetailsForm: this.basicDetailsForm,
      externalExaminationForm: this.externalExaminationForm,
      internalExaminationForm: this.internalExaminationForm,
      // labTestingForm: this.labTestingForm,
      finalObservationForm: this.finalObservationForm,
    });

    if (details) {
      this.postMortemForm.patchValue({
        basicDetailsForm: details.postmortemDetails,
        externalExaminationForm: details.postmortemDetails,

        finalObservationForm: details.postmortemDetails,
      });
    }

    this.basicDetailsForm
      .get('pmInitiationStartTime')
      .valueChanges.subscribe((value) => {
        const deathDate = moment(
          moment(this.basicDetailsForm.value.animalDeathDate).format(
            'YYYY-MM-DD'
          ) +
          ' ' +
          this.basicDetailsForm.value.animalDeathTime
        );
        const startDate = moment(
          moment(this.basicDetailsForm.value.pmInitiationStartDate).format(
            'YYYY-MM-DD'
          ) +
          ' ' +
          value
        );
        if (deathDate.isAfter(startDate)) {
          this.showError(
            this.translate.transform('errorMsg.invalid_date_or_time'),
            this.translate.transform(
              'errorMsg.post_mortem_initiation_start_date_time_cannot_be_before_animal_death_date'
            )
          ).subscribe(() => {
            this.basicDetailsForm
              .get('pmInitiationStartTime')
              .patchValue(null, { emitEvent: false });
          });
        }
        this.basicDetailsForm
          .get('pmCompletionEndDate')
          .patchValue(null, { emitEvent: false });
        this.basicDetailsForm
          .get('pmCompletionEndTime')
          .patchValue(null, { emitEvent: false });
      });

    this.basicDetailsForm
      .get('pmCompletionEndTime')
      .valueChanges.subscribe((value) => {
        const startDate = moment(
          moment(this.basicDetailsForm.value.pmInitiationStartDate).format(
            'YYYY-MM-DD'
          ) +
          ' ' +
          this.basicDetailsForm.value.pmInitiationStartTime
        );
        const endDate = moment(
          moment(this.basicDetailsForm.value.pmCompletionEndDate).format(
            'YYYY-MM-DD'
          ) +
          ' ' +
          value
        );
        if (startDate.isAfter(endDate)) {
          this.showError(
            this.translate.transform('errorMsg.invalid_date_or_time'),
            this.translate.transform(
              'errorMsg.post_mortem_completion_end_date_time_cannot_be_before_post_mortem_initiation_start_date'
            )
          ).subscribe(() => {
            this.basicDetailsForm
              .get('pmCompletionEndTime')
              .patchValue(null, { emitEvent: false });
          });
        }
      });

    this.vetForm
      .get('referredBy')
      .valueChanges.pipe(filter((value) => value !== null))
      .subscribe((value) => {
        this.resetVetForm(value);
      });

    this.vetForm
      .get('referredOrgCd')
      .valueChanges.pipe(
        filter((value) => value.subOrgId === 0),
        switchMap(() => {
          this.isLoadingSpinner = true;
          this.showAllHospitals = true;
          return this.healthService.getSubOrgList(10, false);
        })
      )
      .subscribe((res) => {
        this.isLoadingSpinner = false;
        this.labMaster = res;
        this.vetForm.get('referredOrgCd').reset();
      });
  }

  loadDraftDetails() {
    this.isLoadingSpinner = true;

    this.healthService
      .getDraftTransactionDetails(this.animal.animalId)
      .subscribe((res) => {
        this.isLoadingSpinner = false;
        if (this.healthService.isErrorResponse(res)) {
          return;
        }

        if (this.postMortemDetails.postmortemDetails) {
          this.isLoadingSpinner = false;
          this.healthService
            .deleteDraftTransactionDetails(res[0].draftId)
            .subscribe();

          this.showError(
            this.translate.transform('common.alert_string'),
            this.translate.transform(
              'errorMsg.post_mortem_details_already_saved_cannot_perform_post_mortem_again'
            )
          ).subscribe(() => {
            this.router.navigate(['..'], { relativeTo: this.route });
          });
          return;
        }

        if (res[0]?.draftJson) {
          this.draftId = res[0].draftId;
          const draftJson = res[0].draftJson;

          if (draftJson?.step != undefined || draftJson?.step != null) {
            this.step = draftJson?.step;
          }

          if (draftJson?.submitStatus) {
            this.submitStatus = draftJson.submitStatus;
          }

          if (draftJson?.vetForm) {
            this.vetForm.patchValue(draftJson?.vetForm);
            this.vetForm.markAllAsTouched();
            this.vetForm.markAsDirty();
          }

          if (draftJson?.basicDetailsForm) {
            this.basicDetailsForm.patchValue(draftJson.basicDetailsForm, {
              emitEvent: false,
            });
            this.basicDetailsForm.markAllAsTouched();
            this.basicDetailsForm.markAsDirty();
            this.fileUrls = draftJson?.basicDetailsForm.fileUrls ?? [];
            this.uploadedMedia =
              draftJson?.basicDetailsForm.uploadedMedia ?? [];
          }

          if (draftJson?.vetForm) {
            this.vetForm.patchValue(draftJson.vetForm);
          }

          if (draftJson?.externalExaminationForm) {
            this.externalExaminationForm.patchValue(
              draftJson.externalExaminationForm
            );
            this.externalExaminationForm.markAllAsTouched();
            this.externalExaminationForm.markAsDirty();
          }

          if (draftJson?.internalExaminationForm) {
            this.internalExaminationForm.patchValue(
              draftJson.internalExaminationForm
            );
            this.internalExaminationForm.markAllAsTouched();
            this.internalExaminationForm.markAsDirty();
          }

          if (draftJson?.labTestingForm) {
            this.sampleData = draftJson?.labTestingForm?.samples;
            this.labTestingForm.markAllAsTouched();
            this.labTestingForm.markAsDirty();
            this.labTestingForm.get('samples').markAsDirty();
          } else {
            this.labTestingForm.reset();
          }

          if (draftJson?.finalObservationForm) {
            this.finalObservationForm.patchValue(
              draftJson.finalObservationForm
            );
            this.finalObservationForm.markAllAsTouched();
            this.finalObservationForm.markAsDirty();
          }

          // for (const [index, key] of Object.keys(this.submitStatus).entries()) {
          //   if (!this.submitStatus[key]) {
          //     this.setStep(index);
          //     break;
          //   }
          // }
        }
      });
  }

  getSampleExaminationSubtype(event: MatSelectChange, index: number) {
    const request = {
      sampleExaminationTypeCd: event.value,
    };
    this.healthService
      .getSubExaminationTypeMaster(request.sampleExaminationTypeCd)
      .subscribe((res: any) => {
        this.sampleSubExamTypeMaster[index] = res;
      });
  }

  handleFiles(fileList: FileList) {
    let error = false;
    const control = this.basicDetailsForm.get('animalImages');
    if (this.uploadedMedia.length + fileList.length > 5) {
      this.showError(
        this.translate.transform('common.alert_string'),
        this.translate.transform('errorMsg.cannot_add_more_than_5_images')
      );
      // this.dialog.open(TreatmentResponseDialogComponent, {
      //   data: {
      //     primaryBtnText: 'Ok',
      //     title: 'Cannot add more than 5 images!',
      //   },
      // });
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

  onFileAreaClick(element: HTMLInputElement) {
    if (this.uploadedMedia.length === 5) {
      this.showError(
        this.translate.transform('common.alert_string'),
        this.translate.transform('errorMsg.cannot_add_more_than_5_images')
      );

      // this.dialog.open(TreatmentResponseDialogComponent, {
      //   data: {
      //     primaryBtnText: 'Ok',
      //     title: 'Cannot add more than 5 images!',
      //   },
      // });
      return;
    }

    element.click();
  }

  deleteFile(i: number) {
    if (this.uploadedMedia[i].ngUnsubscribe.closed) {
      this.fileUrls.splice(i, 1);
    } else {
      this.uploadedMedia[i].ngUnsubscribe.next();
    }
    this.uploadedMedia = this.uploadedMedia.filter((_, index) => i !== index);
  }

  uploadFiles(file: File, i: number) {
    const filteredFile = this.uploadedMedia
      .filter((_, index) => i === index)
      .pop();

    if (!!filteredFile) {
      const fd = new FormData();
      fd.append('file', file);
      // this.uploadedMedia.forEach((media,i) => fd.append(`file${i}`, media.file))
      fd.append('id', this.animal.ownerId.toString());
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

  isUploading() {
    if (!this.uploadedMedia.length) {
      return false;
    }

    return this.uploadedMedia.reduce(
      (result, media) => !media.uploaded || result,
      !this.uploadedMedia[0].uploaded
    );
  }

  onSubmit() {
    if (this.postMortemForm.invalid && !this.editMode) {
      this.postMortemForm.markAllAsTouched();
      this.findInvalidControlsRecursive(this.postMortemForm);
      switch (true) {
        case this.basicDetailsForm.invalid:
          this.setStep(0);
          break;
        case this.externalExaminationForm.invalid:
          this.setStep(1);
          break;
        case this.internalExaminationForm.invalid:
          this.setStep(2);
          break;
        case this.labTestingForm.invalid &&
          this.labTestingForm.get('samples').dirty:
          this.setStep(3);
          break;
        case this.finalObservationForm.invalid:
          this.setStep(4);
          break;
      }
      return;
    }

    if (
      this.labTestingForm.invalid &&
      this.labTestingForm.dirty &&
      !this.editMode
    ) {
      this.setStep(3);
      return;
    }
    this.submitStatus.finalObservationForm = true;

    if (this.editMode) {
      if (this.finalObservationForm.invalid) {
        this.finalObservationForm.markAllAsTouched();
        return;
      }
      const formValue = this.finalObservationForm.value;

      this.isLoadingSpinner = true;
      this.postMortemService
        .updateCauseOfDeathAndPmDiagnosis(
          formValue.causeOfDeath,
          formValue.pmDiagnosis,
          this.postmortemId
        )
        .subscribe(
          (res) => {
            this.isLoadingSpinner = false;
            if (this.healthService.isErrorResponse(res)) {
              return;
            }

            this.dialog.open(SavePostMortemDialogComponent, {
              data: {
                title: this.translate.transform(
                  'errorMsg.post_mortem_details_updated_successfully'
                ),
                postMortemId: this.postmortemId,
              },
            });
          },
          () => (this.isLoadingSpinner = false)
        );

      return;
    }

    this.dialog
      .open(TreatmentResponseDialogComponent, {
        data: {
          title: this.translate.transform('common.confirm'),
          message: this.translate.transform('errorMsg.do_you_want_to_submit'),
          primaryBtnText: this.translate.transform('common.yes'),
          secondaryBtnText: this.translate.transform('common.no'),
          icon: 'assets/images/info.svg',
        },
        width: '250px',
        panelClass: 'common-info-dialog',
      })
      .afterClosed()
      .subscribe((res) => {
        if (!res) return;

        const requestObj = {
          postmortemDetails: {
            ...this.basicDetailsForm.value,
            pmInitiationStartDate: moment(
              this.basicDetailsForm.value.pmInitiationStartDate
            ).format('YYYY-MM-DD'),
            ...((this.submitStatus.externalExaminationForm &&
              this.externalExaminationForm.value) ||
              {}),
            ...this.finalObservationForm.value,
            animalId: this.animal.animalId,
            ownerId: this.animal.ownerId,
            tagId: this.animal.tagId,
            pmCharges: +this.finalObservationForm.value.pmCharges,
            // createdBy: AnimalHealthConfig.userId,
            // modifiedBy: AnimalHealthConfig.userId,
            // creationDate: new Date(),
            // modifiedDate: new Date(),
            // referredByVetDesignation: 'surgeon',
            // referredByVetRegistrationNo: '1234',
            // referredOrgCd: 0,
            ...this.vetForm.value,
            referredOrgCd: this.vetForm?.value?.referredOrgCd?.subOrgId,
            conductedByVetDesignation: 'surgeon',
            conductedByVetRegistrationNo: '1234',
            conductedOrgCd: 0,
            pmStatus: 1,
            animalDeathDate: moment(
              this.basicDetailsForm.value.animalDeathDate
            ).format('YYYY-MM-DD'),
            pmCompletionEndDate: moment(
              this.basicDetailsForm.value.pmCompletionEndDate
            ).format('YYYY-MM-DD'),

            animalDeathTime: moment(
              moment(this.basicDetailsForm.value.animalDeathDate).format(
                'YYYY-MM-DD'
              ) +
              ' ' +
              this.basicDetailsForm.value.animalDeathTime
            ).format('H:mm:ss'),

            pmCompletionEndTime: moment(
              moment(this.basicDetailsForm.value.pmCompletionEndDate).format(
                'YYYY-MM-DD'
              ) +
              ' ' +
              this.basicDetailsForm.value.pmCompletionEndTime
            ).format('H:mm:ss'),
            pmInitiationStartTime: moment(
              moment(this.basicDetailsForm.value.pmInitiationStartDate).format(
                'YYYY-MM-DD'
              ) +
              ' ' +
              this.basicDetailsForm.value.pmInitiationStartTime
            ).format('H:mm:ss'),
          },

          labTestingDetails: <any>[],
          onSpotDetails: [],
          draftId: this.draftId,
        };

        this.fileUrls.forEach((url, i) => {
          requestObj.postmortemDetails[`animalImageUrl${i + 1}`] = url;
        });

        if (this.submitStatus.labTestingForm) {
          requestObj.labTestingDetails = this.labTestingForm.value.samples;
          requestObj.postmortemDetails.pmStatus = requestObj.labTestingDetails
            .length
            ? 1
            : 2;
        }

        if (this.submitStatus.internalExaminationForm) {
          Object.assign(
            requestObj.postmortemDetails,
            ...this.internalExaminationForm.get('selectedFields').value
          );
        }

        delete requestObj.postmortemDetails.animalImages;
        delete requestObj.postmortemDetails.fileUrls;
        delete requestObj.postmortemDetails.uploadedMedia;

        Object.keys(requestObj.postmortemDetails).forEach((key) => {
          if (
            requestObj.postmortemDetails[key] === null ||
            requestObj.postmortemDetails[key] === ''
          ) {
            delete requestObj.postmortemDetails[key];
          }
        });

        this.isLoadingSpinner = true;
        this.postMortemService.savePostMortemDetail(requestObj).subscribe(
          (res) => {
            if (this.healthService.isErrorResponse(res)) {
              return;
            }

            if (this.draftId != undefined || this.draftId != null) {
              this.healthService
                .deleteDraftTransactionDetails(this.draftId)
                .subscribe();
            }

            this.isLoadingSpinner = false;
            this.dialog.open(SavePostMortemDialogComponent, {
              data: {
                title: this.translate.transform(
                  'errorMsg.post_mortem_details_saved_successfully'
                ),
                postMortemId: res.data.postmortemId,
                table_header: {
                  col1: this.translate.transform(
                    'animalHealthHistory.sample_id'
                  ),
                  col2: this.translate.transform(
                    'animalTreatmentSurgery.sample_type'
                  ),
                },
                table_value: res.data.sampleDetails ?? null,
              },
              disableClose: true,
              width: '500px',
            });
          },
          () => (this.isLoadingSpinner = false)
        );
      });
  }
  getSampleName(sampleId: number) {
    return this.sampleType.find((sample) => sample.sampleTypeCd === sampleId)
      ?.sampleTypeDesc;
  }
  // Temp Function to get invalid controls on submit
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

  onReset(form: FormGroup) {
    if (this.editMode) {
      this.finalObservationForm.reset({
        pmCharges: this.postMortemDetails.postmortemDetails.pmCharges,
        receiptNo: this.postMortemDetails.postmortemDetails.receiptNo,
      });
      return;
    }

    form.reset();
    switch (form) {
      case this.basicDetailsForm:
        this.uploadedMedia = [];
        this.submitStatus.basicDetailsForm = false;
        break;

      case this.externalExaminationForm:
        this.submitStatus.externalExaminationForm = false;
        break;

      case this.internalExaminationForm:
        this.selectedFields = [];
        this.submitStatus.internalExaminationForm = false;

        const selectedFields = <FormArray>(
          this.internalExaminationForm.get('selectedFields')
        );
        while (selectedFields.length !== 0) {
          selectedFields.removeAt(0);
        }
        break;
      case this.labTestingForm:
        this.labTestingForm.markAsPristine();
        this.sampleData = [];
        const labTestingDetails = <FormArray>this.labTestingForm.get('samples');
        while (labTestingDetails.length > 1) {
          labTestingDetails.removeAt(0);
        }
        labTestingDetails.clear();
        this.labTestingForm.updateValueAndValidity();
        this.labTestingForm.reset();
        this.submitStatus.labTestingForm = false;
        break;
      // this.submitStatus;
      case this.finalObservationForm:
        this.submitStatus.finalObservationForm = false;
    }
  }

  nextStep(form: FormGroup) {
    if (form.invalid && form.dirty && this.labTestingForm !== form) {
      form.markAllAsTouched();
      this.findInvalidControlsRecursive(form);
      return;
    } else if (
      this.labTestingForm === form &&
      this.labTestingForm.get('samples').touched &&
      this.labTestingForm.get('samples').invalid
    ) {
      this.labTestingForm.get('samples').markAllAsTouched();
      this.findInvalidControlsRecursive(form);
      return;
    } else {
      switch (form) {
        case this.basicDetailsForm:
          this.submitStatus.basicDetailsForm = true && !this.editMode;
          break;

        case this.externalExaminationForm:
          if (form.dirty)
            this.submitStatus.externalExaminationForm = true && !this.editMode;
          break;

        case this.internalExaminationForm:
          if (form.controls.selectedFields.dirty)
            this.submitStatus.internalExaminationForm = true && !this.editMode;
          break;
        case this.labTestingForm:
          const labTestingDetails = <FormArray>(
            this.labTestingForm.get('samples')
          );
          if (labTestingDetails.dirty)
            this.submitStatus.labTestingForm = true && !this.editMode;
      }

      this.step++;
    }
  }

  saveInDraft() {
    const requestObj = {
      userId: JSON.parse(sessionStorage.getItem('user'))?.userId,
      animalId: this.animal.animalId,
      subModuleCd: AnimalHealthConfig.sourceOriginCd.postMortem,
      tagId: this.animal.tagId,
      creationDate: this.healthService.currentDate.toDate(),
      lastUpdateDate: this.healthService.currentDate.toDate(),
      draftJson: <any>{
        submitStatus: this.submitStatus,
        step: this.step,
      },
    };
    switch (this.step) {
      // @ts-ignore: Fallthrough case in switch
      case 4:
        if (this.finalObservationForm.dirty)
          requestObj.draftJson.finalObservationForm =
            this.finalObservationForm.value;

      // @ts-ignore: Fallthrough case in switch
      case 3:
        // if (this.labTestingForm.dirty) {
        requestObj.draftJson.labTestingForm = this.labTestingForm.getRawValue();
        requestObj.draftJson.sampleSubExamTypeMaster =
          this.sampleSubExamTypeMaster;
      // }

      // @ts-ignore: Fallthrough case in switch
      case 2:
        if (this.internalExaminationForm.dirty)
          requestObj.draftJson.internalExaminationForm =
            this.internalExaminationForm.value;

      // @ts-ignore: Fallthrough case in switch
      case 1:
        if (this.externalExaminationForm.dirty)
          requestObj.draftJson.externalExaminationForm =
            this.externalExaminationForm.value;

      // @ts-ignore: Fallthrough case in switch
      case 0:
        if (this.basicDetailsForm.dirty) {
          requestObj.draftJson.basicDetailsForm = this.basicDetailsForm.value;
          // requestObj.draftJson.basicDetailsForm.uploadedMedia =
          //   this.uploadedMedia.map((media) => {
          //     delete media.file;
          //     return { ...media };
          //   });
          requestObj.draftJson.vetForm = this.vetForm.value;
          // requestObj.draftJson.basicDetailsForm.fileUrls = this.fileUrls;
        }

        if (this.vetForm.dirty) {
          requestObj.draftJson.vetForm = this.vetForm.value;
        }
    }

    this.isLoadingSpinner = true;
    this.healthService.saveDraftTransactionDetails(requestObj).subscribe(
      () => {
        this.isLoadingSpinner = false;

        this.dialog
          .open(ConfirmationDialogComponent, {
            data: {
              title: this.translate.transform('common.info_label'),
              icon: 'assets/images/info.svg',
              primaryBtnText: this.translate.transform('common.ok_string'),
              message: this.translate.transform(
                'animalTreatmentSurgery.draft_saved_successfully'
              ),
            },
            panelClass: 'common-info-dialog',
          })
          .afterClosed()
          .subscribe(() => {
            this.router.navigate(['..'], { relativeTo: this.route });
          });
      },
      () => (this.isLoadingSpinner = false)
    );
  }

  setStep(index: number) {
    this.step = index;

    switch (index) {
      case 0:
        if (this.basicDetailsForm?.invalid)
          this.submitStatus.basicDetailsForm = false;
        break;
      case 1:
        if (this.externalExaminationForm?.invalid)
          this.submitStatus.externalExaminationForm = false;
        break;
      case 2:
        if (this.internalExaminationForm?.invalid)
          this.submitStatus.internalExaminationForm = false;
        break;
      case 3:
        if (this.labTestingForm?.invalid)
          this.submitStatus.labTestingForm = false;
        break;
      case 4:
        if (this.finalObservationForm?.invalid)
          this.submitStatus.finalObservationForm = false;
        break;
    }
  }

  prevStep() {
    this.step--;
  }

  get finalObservationControls() {
    return this.finalObservationForm.controls;
  }

  get basicDetailsControls() {
    return this.basicDetailsForm.controls;
  }

  get externalExaminationControls() {
    return this.externalExaminationForm.controls;
  }

  getInternalFormControls(i: number) {
    return (
      (<FormArray>this.internalExaminationForm?.get('selectedFields'))?.at(
        i
      ) as FormGroup
    )?.controls;
  }

  get today() {
    return moment(this.healthService.currentDate).format('YYYY-MM-DD');
  }

  goBack() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  showError(title: string, message: string) {
    this.dialog.closeAll();
    return this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title,
          message,
          primaryBtnText: this.translate.transform('common.ok_string'),
          icon: 'assets/images/alert.svg',
        },
        panelClass: 'common-info-dialog',
      })
      .afterClosed();
  }

  resetControls(control: string) {
    switch (control) {
      case 'animalDeathDate':
        this.basicDetailsForm
          .get('pmInitiationStartDate')
          .patchValue(null, { emitEvent: false });
        this.basicDetailsForm
          .get('pmInitiationStartTime')
          .patchValue(null, { emitEvent: false });
        this.basicDetailsForm
          .get('pmCompletionEndDate')
          .patchValue(null, { emitEvent: false });
        this.basicDetailsForm
          .get('pmCompletionEndTime')
          .patchValue(null, { emitEvent: false });
        break;

      case 'animalDeathTime':
        this.basicDetailsForm
          .get('pmInitiationStartDate')
          .patchValue(null, { emitEvent: false });
        this.basicDetailsForm
          .get('pmInitiationStartTime')
          .patchValue(null, { emitEvent: false });
        this.basicDetailsForm
          .get('pmCompletionEndDate')
          .patchValue(null, { emitEvent: false });
        this.basicDetailsForm
          .get('pmCompletionEndTime')
          .patchValue(null, { emitEvent: false });
        break;

      case 'pmInitiationStartDate':
        this.basicDetailsForm
          .get('pmInitiationStartTime')
          .patchValue(null, { emitEvent: false });
        this.basicDetailsForm
          .get('pmCompletionEndDate')
          .patchValue(null, { emitEvent: false });
        this.basicDetailsForm
          .get('pmCompletionEndTime')
          .patchValue(null, { emitEvent: false });

        break;

      case 'pmCompletionEndDate':
        this.basicDetailsForm
          .get('pmCompletionEndTime')
          .patchValue(null, { emitEvent: false });
        break;
    }
  }

  resetVetForm(isReferred: boolean) {
    // const isReferred = (event.target as HTMLInputElement).checked;
    // if (isReferred) {
    //   this.vetForm.get('organization').addValidators(Validators.required);
    // } else {
    //   this.vetForm.get('organization').clearValidators();
    //   this.vetForm.reset();
    // }
  }
}
