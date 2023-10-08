import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { SuccessDialogComponent } from 'src/app/features/animal-breeding/success-dialog/success-dialog.component';
import { AnimalManagementService } from 'src/app/features/animal-management/animal-registration/animal-management.service';
import { AnimalResult } from 'src/app/features/animal-management/animal-registration/models-animal-reg/tagId-search.model';
import { animalBreedingPRConfig } from 'src/app/shared/animal-breeding-pr.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { animalBreedingValidations } from 'src/app/shared/validatator';
import { decimalWithLengthValidation } from '../../../../shared/utility/decimalWithLengthValidator';
import { SaveTypingReq } from '../models/save-typing-req.model';
import { TypingTrait } from '../models/typing-trait.model';
import { PreviewTypingDialogComponent } from '../preview-typing-dialog/preview-typing-dialog.component';
import { TypingService } from '../typing.service';
import { PrService } from '../../pr.service';
import { SaveDialogComponent } from 'src/app/features/animal-breeding/pregnancy-diagnosis/save-dialog/save-dialog.component';

@Component({
  selector: 'app-new-typing',
  templateUrl: './new-typing.component.html',
  styleUrls: ['./new-typing.component.css'],
  providers: [TranslatePipe],
})
export class NewTypingComponent implements OnInit {
  isLoadingSpinner = false;
  typingForm: FormGroup;
  animal!: AnimalResult;
  validationMsg = animalBreedingValidations.common;
  typingValidations = animalBreedingValidations.typing;
  typingTraits: TypingTrait[] = [];
  minDate = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private animalMgmtService: AnimalManagementService,
    private typingService: TypingService,
    private translatePipe: TranslatePipe,
    private dataService: DataServiceService,
    private prService: PrService
  ) {}

  ngOnInit(): void {
    this.getData();
    this.initForm();
  }

  getData() {
    this.isLoadingSpinner = true;
    const animalReq = this.route.queryParamMap.pipe(
      filter((param) => {
        if (param.get('tagId')) {
          return true;
        }
        this.router.navigate(['..'], { relativeTo: this.route });
        return false;
      }),
      switchMap((param) => {
        return this.animalMgmtService.getDetailsByTagID(param.get('tagId'));
      })
    );

    const typingTraitReq = this.typingService.getTypingTraitsValue();
    const configDateReq = this.dataService.getDefaultConfig(
      animalBreedingPRConfig.backdate.TypingBackdate
    );
    // typingTraitReq.subscribe((typing_traits) => {
    //   this.typingTraits = typing_traits;
    //   this.isLoadingSpinner = false;
    // });
    // animalReq.subscribe((animal) => {
    //   this.animal = animal;
    //   this.initForm(animal);
    //   // this.typingTraits = typing_traits;
    //   this.isLoadingSpinner = false;
    // });
    combineLatest([animalReq, typingTraitReq, configDateReq]).subscribe(
      ([animal, typing_traits, config]) => {
        this.animal = animal;
        this.typingTraits = typing_traits;
        // this.typingTraits.sort((a, b) => {
        //   return a.cd - b.cd;
        // });
        this.initForm(animal);
        this.isLoadingSpinner = false;
        this.minDate = moment(this.prService.currentDate)
          .subtract(config.defaultValue, 'days')
          .format('YYYY-MM-DD');
      },
      () => (this.isLoadingSpinner = false)
    );
  }

  initForm(animal?: AnimalResult | any) {
    this.typingForm = this.fb.group({
      currentLactationNo: [
        {
          value:
            animal && typeof animal.currentLactationNo !== 'undefined'
              ? animal.currentLactationNo
              : null,
          disabled: true,
        },
      ],
      recordDate: [
        {
          value: moment(this.prService.currentDate).format('DD/MM/YYYY'),
          disabled: true,
        },
      ],
      typingDate: [moment(this.prService.currentDate), { updateOn: 'blur' }],

      animalTypingTraitsList: this.fb.array([]),
    });

    for (const trait of this.typingTraits) {
      this.addTraitControl(trait);
    }

    this.typingForm
      .get('typingDate')
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
            .subscribe(() => this.typingForm.get('typingDate').reset());
        }
      });
  }

  addTraitControl(traitDetail: TypingTrait) {
    const traitsList = this.typingForm.get(
      'animalTypingTraitsList'
    ) as FormArray;

    const trait = this.fb.group({
      isMigrated: [],
      typingTrait: [traitDetail.typingTrait],
      typingTraitValue: [
        null,
        [
          decimalWithLengthValidation(5, 2),
          Validators.max(traitDetail.maxLimit),
          Validators.min(traitDetail.minLimit),
        ],
      ],
      label: [{ value: traitDetail.typingTraitDesc, disabled: true }],
      measurementUnitCd: [
        { value: traitDetail.measurementUnitCd, disabled: true },
      ],
      measurementUnitDesc: [
        { value: traitDetail.measurementUnitDesc, disabled: true },
      ],
      min: [{ value: traitDetail.minLimit, disabled: true }],
      max: [{ value: traitDetail.maxLimit, disabled: true }],
    });

    traitsList.push(trait);
  }

  goBack() {
    this.location.back();
  }

  onSubmit() {
    if (this.typingForm.invalid) {
      this.typingForm.markAllAsTouched();
      return;
    }
    const formValue: SaveTypingReq = this.typingForm.getRawValue();
    delete formValue.recordDate;
    formValue.typingRecordDate = moment(this.prService.currentDate).format(
      'YYYY-MM-DD'
    );
    formValue.currentLactationNo = this.animal.currentLactationNo;
    formValue.typingDate = moment(formValue.typingDate).format('YYYY-MM-DD');
    formValue.projectId = '1234';
    formValue.animalId = this.animal.animalId;
    formValue.tagId = +this.animal.tagId;

    this.dialog
      .open(PreviewTypingDialogComponent, {
        data: formValue,
      })
      .afterClosed()
      .pipe(
        filter((res) => res),
        switchMap(() => {
          this.isLoadingSpinner = true;
          formValue.animalTypingTraitsList =
            formValue.animalTypingTraitsList.filter(
              (trait) => trait.typingTraitValue !== null
            );
          return this.typingService.saveTypingDetails(formValue);
        })
      )
      .subscribe(
        (res: any) => {
          this.isLoadingSpinner = false;
          let dialogRef;
          if (res?.msg?.msgCode === 3046) {
            dialogRef = this.dialog.open(ConfirmationDialogComponent, {
              data: {
                title: this.translatePipe.transform('common.info_label'),
                icon: 'assets/images/info.svg',
                message:res?.msg?.msgDesc,
                  // this.translatePipe.transform(
                  //   'animalDetails.transaction-success-supervisor'
                  // ) + String(res?.msg?.msgDesc),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
              },
              panelClass: 'common-info-dialog',
            });
          } else {
            dialogRef = this.dialog.open(SuccessDialogComponent, {
              data: {
                transaction_id: res.typingId,
                lactationNo: res.currentLactationNo,
                title: this.translatePipe.transform(
                  'performanceRecording.typing_details_have_been_saved_successfully'
                ),
              },
            });
          }

          dialogRef?.afterClosed()?.subscribe((res) => {
            this.goBack();
          });
        },
        () => (this.isLoadingSpinner = false)
      );
  }

  onReset() {
    this.typingForm.reset({
      currentLactationNo:
        this.animal && typeof this.animal.currentLactationNo !== 'undefined'
          ? this.animal.currentLactationNo
          : null,

      recordDate: moment(this.prService.currentDate).format('DD/MM/YYYY'),
      typingDate: this.prService.currentDate.toDate(),
    });

    const traitsList = this.typingForm.get(
      'animalTypingTraitsList'
    ) as FormArray;

    while (traitsList.length) {
      traitsList.removeAt(0);
    }

    for (const trait of this.typingTraits) {
      this.addTraitControl(trait);
    }
  }

  get today() {
    return moment(this.prService.currentDate).format('YYYY-MM-DD');
  }

  get traitListControls() {
    return (this.typingForm.get('animalTypingTraitsList') as FormArray)
      .controls as FormGroup[];
  }
}
