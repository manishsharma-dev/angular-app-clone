import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import {
  MobileValidation,
  NamespecialValidation,
} from 'src/app/shared/utility/validation';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { FIRService } from '../../fir/fir.service';
import { MasterSpecies } from '../../fir/models/species.model';
import { FirstAidService } from '../../first-aid/first-aid.service';
import { MinorAilment } from '../../first-aid/models/minor-ailment.model';
import { IntimationReportService } from '../../intimation-report/intimation-report.service';
import { Village } from '../../intimation-report/models/village.model';
import { VaccinationFor } from '../../vaccination/models/vacc-For.model';
import { VaccinationService } from '../../vaccination/vaccination.service';
import { NoTagging } from '../models/noTagging.model';
import { PreviewDetailDialogComponent } from '../preview-detail-dialog/preview-detail-dialog.component';
import { UntaggedAnimalService } from '../untagged-animal.service';
import moment from 'moment';
import { HealthService } from '../../health.service';
import { TreatmentResponseDialogComponent } from '../../treatment-response-dialog/treatment-response-dialog.component';
export type CurrentRoute = 'untagged-treatment' | 'untagged-first-aid';

@Component({
  selector: 'app-untagged-form',
  templateUrl: './untagged-form.component.html',
  styleUrls: ['./untagged-form.component.css'],
  providers: [TranslatePipe],
})
export class UntaggedFormComponent implements OnInit {
  isLoadingSpinner = false;
  currentRoute: CurrentRoute;
  untaggedForm: FormGroup;
  minor_ailment: MinorAilment[] = [];
  minor_ailmentMaster: MinorAilment[] = [];
  speciesMaster: MasterSpecies[] = [];
  getVaccinationFor: VaccinationFor[] = [];
  validationMsg = animalHealthValidations.untagged;
  villages: Village[] = [];
  temVillageList: Village[];
  noTaggingData: NoTagging[];
  treatmentMinDateValue: any;
  constructor(
    private readonly route: ActivatedRoute,
    private location: Location,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private firstAidService: FirstAidService,
    private firService: FIRService,
    private vaccinationService: VaccinationService,
    private intimationReportService: IntimationReportService,
    private untaggedService: UntaggedAnimalService,
    private healthService: HealthService,
    private translateService: TranslateService,
  ) { }

  ngOnInit(): void {
    this.currentRoute = this.route.snapshot.url[
      this.route.snapshot.url.length - 1
    ].path as CurrentRoute;

    this.untaggedForm = this.formBuilder.group({
      requestorName: [
        null,
        [Validators.required, Validators.maxLength(50), NamespecialValidation],
      ],
      treatmentRecordDate: [
        { value: moment(this.today).format('DD/MM/YYYY'), disabled: true },
      ],
      treatmentDate: [this.today, [Validators.required]],
      requestorMobNo: [null, [Validators.required, MobileValidation]],
      villages: [[], [Validators.required]],
      ailmentCd: [null],
      speciesCd: [null, Validators.required],
      sex: [null, Validators.required],
      diseaseCd: [],
      noTagReason: [null, Validators.required],
      prescription: [null, [Validators.required, Validators.maxLength(1000)]],
      specifyReason: [null, [Validators.maxLength(50), NamespecialValidation]],
    });

    if (this.currentRoute === 'untagged-first-aid') {
      this.untaggedForm.get('ailmentCd')?.addValidators(Validators.required);
    } else {
      this.untaggedForm.get('diseaseCd')?.addValidators(Validators.required);
    }
    this.getMasterData();

    const specifyReasonControl = this.untaggedForm.get('specifyReason');
    this.untaggedForm.get('noTagReason')?.valueChanges.subscribe((value) => {
      if (value?.cd === 0) {
        specifyReasonControl.setValidators([
          Validators.required,
          Validators.maxLength(50),
          NamespecialValidation,
        ]);
      } else {
        specifyReasonControl.setValidators([
          Validators.maxLength(50),
          NamespecialValidation,
        ]);
      }
    });
    this.untaggedForm.get('sex').valueChanges.subscribe((value: any) => {
      this.untaggedForm.get('ailmentCd').patchValue(null);
      if (value == 'F') {
        this.minor_ailment = this.minor_ailmentMaster.filter((r) => r.cd != 7);
      }
      else if (value == 'M') {
        this.minor_ailment = this.minor_ailmentMaster.map((value) => value);
      }
    })
  }

  getMasterData() {
    const minorAilment = this.firstAidService
      .get_Minor_Ailment('minor_ailment')
      .pipe(catchError((err) => of(null)));
    const getSpecies = this.firService
      .getSpecies('species')
      .pipe(catchError((err) => of(null)));
    const diseasesReport = this.vaccinationService
      .getVaccinationFor()
      .pipe(catchError((err) => of(null)));
    const VillageReport = this.intimationReportService
      .getVillagesByUser(AnimalHealthConfig.campaignUserID)
      .pipe(catchError((err) => of(null)));
    const reasonForNotTag = this.untaggedService
      .getnoTagging('reason_for_not_tagging')
      .pipe(catchError((err) => of(null)));
    const treatmentConfig = this.healthService
      .getDefaultConfig('treatmentMinDate')
      .pipe(catchError((err) => of(7)))
    this.isLoadingSpinner = true;
    forkJoin([
      minorAilment,
      getSpecies,
      diseasesReport,
      VillageReport,
      reasonForNotTag,
      treatmentConfig
    ]).subscribe(
      ([
        minorAilmentRes,
        speciesRes,
        diseasesRes,
        villages,
        reasonForNotTagRes,
        treatmentDateConfig
      ]: any) => {
        this.minor_ailmentMaster = minorAilmentRes;
        this.minor_ailment = this.minor_ailmentMaster.map((res) => res);
        this.speciesMaster = speciesRes;
        this.temVillageList = villages;
        this.getVaccinationFor = diseasesRes;
        this.noTaggingData = reasonForNotTagRes;
        this.treatmentMinDateValue = treatmentDateConfig.defaultValue - 1;
        this.isLoadingSpinner = false;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  goBack() {
    this.location.back();
  }

  get f() {
    return this.untaggedForm.controls;
  }
  openPreviewDialog(): void {
    if (this.untaggedForm.invalid) {
      this.untaggedForm.markAllAsTouched();
      return;
    }

    this.dialog.open(PreviewDetailDialogComponent, {
      width: '500px',
      height: '100vh',
      panelClass: 'custom-dialog-container',
      position: {
        right: '0px',
        top: '0px',
      },
      data: {
        formData: this.untaggedForm.getRawValue(),
        currentRoute: this.currentRoute,
      },
    });
  }

  resetForm() {
    this.dialog
      .open(TreatmentResponseDialogComponent, {
        data: {
          title: this.translateService.instant('diseaseTesting.warning'),
          icon: 'assets/images/info.svg',
          message: this.translateService.instant(
            'diseaseTesting.reset_the_page'
          ),
          primaryBtnText: this.translateService.instant('registration.Yes'),
          secondaryBtnText: this.translateService.instant('registration.No'),
        },
        panelClass: 'common-info-dialog',
      })
      .afterClosed()
      .subscribe((res: boolean) => {
        if (res) {
          this.untaggedForm.reset();
          this.untaggedForm.get('specifyReason').clearValidators();
          if (this.currentRoute === 'untagged-first-aid') {
            this.untaggedForm.get('ailmentCd')?.addValidators(Validators.required);
          } else {
            this.untaggedForm.get('diseaseCd')?.addValidators(Validators.required);
          }
          this.untaggedForm.patchValue({
            treatmentRecordDate: moment(this.today).format('DD/MM/YYYY'),
            treatmentDate: this.today
          })
          this.untaggedForm.updateValueAndValidity({ emitEvent: false })
        }
      });
  }

  get today() {
    return moment(sessionStorage.getItem('serverCurrentDateTime')).format('YYYY-MM-DD');
  }
  get minDate() {
    return moment(sessionStorage.getItem('serverCurrentDateTime'))
      .subtract(this.treatmentMinDateValue, 'days')
      .format('YYYY-MM-DD');
  }
}
