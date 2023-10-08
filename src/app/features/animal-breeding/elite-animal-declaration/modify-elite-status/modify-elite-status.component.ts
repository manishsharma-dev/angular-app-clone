import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { forkJoin } from 'rxjs';
import { distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { AnimalDetailService } from 'src/app/features/animal-management/animal-registration/animal-details/animal-detail.service';
import { AnimalDetails } from 'src/app/features/animal-management/animal-registration/models-animal-reg/animal-details.model';
import { animalBreedingPRConfig } from 'src/app/shared/animal-breeding-pr.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { AlphaNumericSpecialValidation } from 'src/app/shared/utility/validation';
import { animalBreedingValidations } from 'src/app/shared/validatator';
import { SuccessDialogComponent } from '../../success-dialog/success-dialog.component';
import { EliteAnimalService } from '../elite-animal.service';

@Component({
  selector: 'app-modify-elite-status',
  templateUrl: './modify-elite-status.component.html',
  styleUrls: ['./modify-elite-status.component.css'],
  providers: [TranslatePipe],
})
export class ModifyEliteStatusComponent implements OnInit {
  isLoadingSpinner = false;
  cmnValidationMsg = animalBreedingValidations.common;
  validationMsg = animalBreedingValidations.eliteAnimal;
  eliteForm: FormGroup;
  animal!: AnimalDetails;
  animalId!: string;
  minDate = '';
  currentDate = sessionStorage.getItem('serverCurrentDateTime')
  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private animalMgmtService: AnimalDetailService,
    private eliteAnimalService: EliteAnimalService,
    private dataService: DataServiceService,
    private translatePipe: TranslatePipe
  ) {}

  ngOnInit(): void {
    this.isLoadingSpinner = true;
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
        switchMap((params) =>
          forkJoin([
            this.animalMgmtService.getAnimalDetails(this.animalId),
            this.dataService.getDefaultConfig(
              animalBreedingPRConfig.backdate.EAIBackdate
            ),
          ])
        )
      )
      .subscribe(
        (res) => {
          this.animal = res[0];
          this.minDate = moment(this.currentDate)
            .subtract(res[1].defaultValue, 'days')
            .format('YYYY-MM-DD');
          this.isLoadingSpinner = false;
          this.initForm(this.animal);
        },
        () => (this.isLoadingSpinner = false)
      );

    this.initForm();
  }

  initForm(animal?: AnimalDetails) {
    this.eliteForm = this.fb.group({
      eadRecordDate: [{ value: moment(this.currentDate).format('DD/MM/YYYY'), disabled: true }],
      eadDate: [moment(this.currentDate).format('YYYY-MM-DD'), { updateOn: 'blur',
      validators: [
        Validators.required,
      ],}],
      isElite: [
        animal && typeof animal?.isElite !== 'undefined'
          ? animal.isElite
          : null,
        [Validators.required],
      ],
      reason: [
        null,
        [
          Validators.required,
          Validators.maxLength(250),
          AlphaNumericSpecialValidation,
        ],
      ],
    });

    this.eliteForm
      .get('eadDate')
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
            .subscribe(() => this.eliteForm.get('eadDate').reset());
        }
      });
  }

  goBack() {
    this.router.navigate(['..'], {
      relativeTo: this.route,
      queryParams: { ownerId: this.animal.ownerId },
    });
  }

  onReset() {
    this.eliteForm.reset({
      eadRecordDate: moment(this.currentDate).format('DD/MM/YYYY'),
    });
  }

  get today() {
    return moment(this.currentDate).format('YYYY-MM-DD');
  }

  get basicDetailFormControls() {
    return this.eliteForm.controls;
  }

  getAnimalAge(age: number) {
    return this.eliteAnimalService.getWords(age);
  }

  onSubmit() {
    if (this.eliteForm.invalid) {
      this.eliteForm.markAllAsTouched();
      return;
    }

    const reqObj = this.eliteForm.getRawValue();
    reqObj.eadRecordDate = moment(this.currentDate).format('YYYY-MM-DD');
    reqObj.eadDate = moment(reqObj.transactionDate).format('YYYY-MM-DD');

    reqObj.tagId = this.animal.tagId;

    this.isLoadingSpinner = true;
    this.eliteAnimalService.saveEliteDeclarationDetails(reqObj).subscribe(
      (res) => {
        this.isLoadingSpinner = false;
        this.dialog
          .open(SuccessDialogComponent, {
            data: {
              title: 'animalDetails.elite_submit',
              transaction_id: res.eadId,
            },
            disableClose: true,
          })
          .afterClosed()
          .subscribe(() => {
            this.goBack();
          });
      },
      () => (this.isLoadingSpinner = false)
    );
  }

  isControlValid(control: string) {
    return (
      (this.eliteForm.get(control).dirty &&
        this.eliteForm.get(control).invalid) ||
      this.eliteForm.get(control).touched
    );
  }
}
