import { catchError } from 'rxjs/operators';
import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import moment from 'moment';
import { forkJoin, of } from 'rxjs';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { Campaign } from '../../deworming/models/campaign.model';
import { DewormingService } from '../deworming.service';
import { DewormingDetails } from '../models/deworming-details.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TreatmentResponseDialogComponent } from '../../treatment-response-dialog/treatment-response-dialog.component';
import { Config } from '../models/config.model';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { decimalWithLengthValidation } from 'src/app/shared/utility/decimalWithLengthValidator';

@Component({
  selector: 'app-deworming-details',
  templateUrl: './deworming-details.component.html',
  styleUrls: ['./deworming-details.component.css'],
})
export class DewormingDetailsComponent implements OnInit {
  spotTestingDisplayedColumns: string[] = [
    'sr_no',
    'tagId',
    'lastDewormingDate',
    'taggingDate',
    'sex',
    'age',
    'speciesName',
    'routeName',
    'formName',
    'dosage',
    'unitDesc',
    'delete',
  ];
  data1 = new MatTableDataSource<DewormingDetails>([]);
  private paginator!: MatPaginator;

  //data1 = new BehaviorSubject<AbstractControl[]>([]);
  submitted = false;

  selectedVacc: string = '';
  dewormingCampaign: Campaign;
  withOutCampaign: boolean;
  dewormingDateForm: FormGroup;
  validationMsg = animalHealthValidations.newCase;
  selectedMedicineListRows!: FormArray;
  isLoadingSpinner = false;
  dataEntryEndDate = '';
  campaignDataEntryEndDate = '';
  endDate = '';
  startDate = '';
  public minDate = moment(
    sessionStorage.getItem('serverCurrentDateTime')
  ).format('YYYY-MM-DD');
  public maxDate = moment(
    sessionStorage.getItem('serverCurrentDateTime')
  ).format('YYYY-MM-DD');
  public campMaxDate: Date;
  public campMinDate: Date;
  animals: DetailsID[];
  medicine: any;
  taggingDate = '';
  preventSubmit = false;

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<DewormingDetailsComponent>,
    private _fb: FormBuilder,
    private dewormingService: DewormingService,
    private readonly translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      animalDetail: any[];
      withOutCampaign: boolean;
      campaignId?: number;
      selectedMedicine: any;
      medicineCd: number;
      unitName: string;
      formName: string;
      routeName: string;
      searchByFlag?: 'DS';
      campaign: any;
    }
  ) {}

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.data1.sort = ms;
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.data1.paginator = mp;
  }

  ngOnInit(): void {
    this.animals = this.data.animalDetail;
    const medData = this.data.selectedMedicine;
    if (medData.medicineCd) {
      this.medicine = medData.medicineControl;
    } else {
      this.medicine = medData;
    }

    // this.animals = data.map(animal=>animal.animalId)

    this.withOutCampaign = this.data.withOutCampaign;
    // if (this.withOutCampaign) {

    this.isLoadingSpinner = true;
    const requests: any[] = [
      this.dewormingService
        .getDefualtConfig('dewormingDate')
        .pipe(catchError((e) => of(null))),
      this.dewormingService.getVaccinationOrDewarmerDetail(
        this.animals as any,
        !this.withOutCampaign
          ? this.data.medicineCd
          : this.data.selectedMedicine.medicineCd
      ),
    ];

    if (this.withOutCampaign) {
      requests.push(of(null));
    } else {
      requests.push(
        this.dewormingService.getSelectedCampaignDetails({
          campaignId: this.data.campaignId,
          campaignType: 2,
        } as any)
      );
    }

    forkJoin(requests).subscribe(
      ([dateConfig, data, campaignDetails]: [
        Config | null,
        DewormingDetails[],
        Campaign | null
      ]) => {
        if (dateConfig) {
          this.minDate = moment(sessionStorage.getItem('serverCurrentDateTime'))
            .subtract(+dateConfig.defaultValue - 1, 'd')
            .format('YYYY-MM-DD');
        }

        this.data1.data = data;
        this.setUsersForm();

        if (campaignDetails) {
          this.dewormingCampaign = campaignDetails;
          this.minDate = this.dewormingCampaign.campaignStartDate
            .split('/')
            .reverse()
            .join('-');

          this.endDate = moment(this.dewormingCampaign.campaignEndDate).format(
            'DD/MM/YYYY'
          );
          this.startDate = moment(
            new Date(this.dewormingCampaign.campaignStartDate)
          ).format('DD/MM/YYYY');

          if (
            moment(
              sessionStorage.getItem('serverCurrentDateTime')
            ).isSameOrBefore(moment(this.endDate))
          ) {
            this.maxDate = moment(
              new Date(sessionStorage.getItem('serverCurrentDateTime'))
            ).format('YYYY-MM-DD');
          } else {
            this.maxDate = moment(this.endDate).format('YYYY-MM-DD');
          }
        }

        this.isLoadingSpinner = false;
      },
      () => (this.isLoadingSpinner = false)
    );

    this.maxDate = moment(
      sessionStorage.getItem('serverCurrentDateTime')
    ).format('YYYY-MM-DD');

    this.dewormingDateForm = this._fb.group({
      dewormingRecordDate: [
        {
          value: moment(sessionStorage.getItem('serverCurrentDateTime')).format(
            'DD/MM/YYYY'
          ),
          disabled: true,
        },
        [Validators.required],
      ],
      dewormingDate: [
        new Date(sessionStorage.getItem('serverCurrentDateTime')),
        Validators.required,
      ],
      selected_tagId_details: this._fb.array([]),
    });
  }

  setDataSourceAttributes() {
    this.data1.paginator = this.paginator;
  }

  get today() {
    return moment(sessionStorage.getItem('serverCurrentDateTime')).format(
      'YYYY-MM-DD'
    );
  }

  get tableRowsControl() {
    return this.dewormingDateForm.get('selected_tagId_details') as FormArray;
  }
  private setUsersForm() {
    const userCtrl = this.dewormingDateForm.get(
      'selected_tagId_details'
    ) as FormArray;
    this.data1.data.forEach((user) => {
      userCtrl.push(this.setUsersFormArray(user));
    });
  }
  private setUsersFormArray(user) {
    return this._fb.group({
      tagId: [user.tagId.toString()],
      dosage: [
        this.data.selectedMedicine?.medicineDosage,
        [decimalWithLengthValidation(6, 2), Validators.required],
      ],
    });
  }

  dewormingDateFunction() {
    const capEndDate = new Date('2022-07-20');
    const capStartDate = new Date('2022-07-01');
    const currentDate = new Date(this.today);
    this.campMinDate = capStartDate;
    this.campMaxDate = currentDate > capEndDate ? capEndDate : currentDate;
  }

  get formControl() {
    return this.dewormingDateForm.controls;
  }

  openDialog1(count: number, res: any) {
    this.dialogRef.close({
      submitted: true,
      count,
      res,
      vaccName: this.withOutCampaign
        ? this.medicine.medicineName
        : this.dewormingCampaign.dewormerName,
    });
  }

  dateFormatChange(date: String) {
    date = date.substring(0, 10);
    return date.split('-').reverse().join('/');
  }

  onSubmit(): void {
    const formattedDateFrom =
      moment(this.dewormingDateForm.value.DateOfFA).format('MM-DD-YYYY') ==
      'Invalid date'
        ? ''
        : moment(this.dewormingDateForm.value.DateOfFA).format('MM-DD-YYYY');
    if (this.dewormingDateForm.invalid) {
      this.dewormingDateForm.markAllAsTouched();
      return;
    } else {
      const selectedMedicine = this.data.selectedMedicine;
      let request = this.dewormingDateForm.value;

      if (!request.selected_tagId_details.length) {
        this.dialog.open(TreatmentResponseDialogComponent, {
          data: {
            title: this.translateService.instant('common.info_label'),

            icon: 'assets/images/info.svg',
            primaryBtnText: this.translateService.instant('common.ok_string'),
            message: this.translateService.instant(
              'deworming.no_animals_selected'
            ),
          },
          panelClass: 'common-info-dialog',
          width: '350px',
        });

        return;
      }

      for (let [index, vacc] of request.selected_tagId_details.entries()) {
        vacc['animalId'] = this.animals[index].animalId;
        vacc['campaignId'] = this.dewormingCampaign?.campaignId.toString();

        vacc['createdBy'] = '0';
        vacc['creationDate'] = moment(
          sessionStorage.getItem('serverCurrentDateTime')
        );
        vacc['modifiedBy'] = '0';
        vacc['modifiedDate'] = moment(
          sessionStorage.getItem('serverCurrentDateTime')
        );
        vacc['vaccinationDeWormerDate'] = moment(
          this.dewormingDateForm.value.dewormingDate
        ).format('YYYY-MM-DD');
        vacc['vaccinationDeWormingRecordDate'] = moment(
          sessionStorage.getItem('serverCurrentDateTime')
        ).format('YYYY-MM-DD');
        vacc['vaccinationDewormingFlag'] = 'D';
        vacc['dewormerCd'] = this.withOutCampaign
          ? selectedMedicine.medicineCd
          : this.dewormingCampaign.dewormerCd ?? '';
        vacc['newDewormer'] = this.withOutCampaign
          ? selectedMedicine.medicineName
          : '';
        vacc['dosage'] = this.tableRowsControl.at(index)?.get('dosage')?.value;
        vacc['newDewormerRemarks'] = this.withOutCampaign
          ? selectedMedicine.medcineSalt
          : '';
        vacc['formCd'] = this.withOutCampaign
          ? selectedMedicine.medicineFormCd
          : this.data1.data[index]['formCd'] ?? '';
        vacc['unitCd'] = this.withOutCampaign
          ? selectedMedicine.medicineUnitCd
          : this.data1.data[index]['unitCd'] ?? '';
        vacc['routeCd'] = this.withOutCampaign
          ? selectedMedicine?.medicineRouteCd
          : this.data1.data[index]['routeCd'] ?? '';

        vacc['ownerId'] = this.animals[index].ownerId;
        vacc['manufacturer'] = !this.withOutCampaign
          ? this.dewormingCampaign.manufacturer
          : '';
        vacc.projectId = this?.data?.campaign?.projectId;
      }

      request.updateLastVaccAndDewDateReq = {
        vaccinationDeWormerDate: moment(request.dewormingDate).format(
          'YYYY-MM-DD'
        ),
        vaccinationDewormingFlag: 'D',

        searchByFlag: this.data.searchByFlag,
        animalId: request.selected_tagId_details.map(
          (details) => details.animalId
        ),
      };

      delete request.dewormingDate;
      // let queryParams =
      this.isLoadingSpinner = true;
      this.dewormingService.saveDewormingDetails(request).subscribe(
        (res: any) => {
          this.isLoadingSpinner = false;
          this.openDialog1(this.data1.data.length, res);
        },
        () => (this.isLoadingSpinner = false)
      );
    }
  }

  // setDateChanged(event) {
  //   if (this.withOutCampaign) {
  //     return;
  //   }

  //   const vaccEventDate = moment(event.value).format('YYYY-MM-DD');

  //   if (vaccEventDate <= this.taggingDate) {
  //     this.preventSubmit = true;
  //     this.dialog.open(TreatmentResponseDialogComponent, {
  //       data: {
  //         title: 'Alert!',
  //         message: 'Deworming Date should be later than Tagging Date',
  //         primaryBtnText: 'Ok',
  //       },
  //     });
  //   } else {
  //     this.preventSubmit = false;
  //   }
  // }

  onReset() {
    this.dewormingDateForm.reset({
      dewormingRecordDate: moment(
        sessionStorage.getItem('serverCurrentDateTime')
      ).format('DD/MM/YYYY'),
    });
  }

  removeRow(i: number) {
    this.data1.data = this.data1.data.filter((_, index) => i !== index);

    this.animals.splice(i, 1);

    (
      this.dewormingDateForm.get('selected_tagId_details') as FormArray
    ).removeAt(i);
  }
}

export interface DetailsID {
  tagId: number;
  animalId: number;
  ownerId: string;
}
