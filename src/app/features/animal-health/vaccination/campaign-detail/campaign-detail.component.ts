import { Location } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { forkJoin } from 'rxjs';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { mimeType } from 'src/app/shared/utility/mime-type.validator';
import { AlphaNumericSpecialValidation } from 'src/app/shared/utility/validation';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { SaveVaccination } from '../models/submit-Vacc.model';
import {
  UploadImageCampaign,
  UploadImageWithoutCampaign,
} from '../models/uploadImage.model';
import { VaccinationDetails } from '../models/vacc-details.model';
import { RepeatVaccReason, VaccinationType } from '../models/vacc-Name.model';
import { VaccinationDialogComponent } from '../vaccination-dialog/vaccination-dialog.component';
import { VaccinationService } from '../vaccination.service';
import { TreatmentResponseDialogComponent } from '../../treatment-response-dialog/treatment-response-dialog.component';

@Component({
  selector: 'app-campaign-detail',
  templateUrl: './campaign-detail.component.html',
  styleUrls: ['./campaign-detail.component.css'],
  providers: [TranslatePipe]
})
export class CampaignDetailComponent implements OnInit {
  spotTestingDisplayedColumns: string[] = [
    'sr_no',
    'tagId',
    'lastVaccinationType',
    'last_vacc_date',
    'sex',
    'species',
    'form',
    'route',
    'dose',
    'unit',
    'age',
    'vaccinationType',
    'reason',
    'PhotoUrl',
    'delete',
  ];
  public isShowError: string = '';
  data1 = new MatTableDataSource<VaccinationDetails>([]);
  submitted = false;
  img: any;
  preventSubmit = false;
  withOutCampaign: boolean;
  isDisable: boolean | string = true;
  vaccinationDateForm: FormGroup;
  validationMsg = animalHealthValidations.newCase;
  selectedMedicineListRows!: FormArray;
  DetailList: VaccinationDetails[] = [];
  isLoadingSpinner: boolean = false;
  SubmitReport: SaveVaccination[] = [];
  Successmessage: SaveVaccination[] = [];
  supervisorName: SaveVaccination[] = [];
  transactionId: SaveVaccination[] = [];
  getVaccinationType: VaccinationType[] = [];
  getRepeatVaccination: RepeatVaccReason[] = [];
  ImageCampaign: UploadImageCampaign[] = [];
  defaultValue: number;
  CampaignList: any;
  campID: any;
  startDate: any;
  DataEntryEndDate: string;
  DataEntryEndDateDisplay: string;
  taggingDateDisplay: string;
  taggingDate: string;
  startDateDisplay: string;
  endDateDisplay: string;
  endDate: any;
  batchno: number | string;
  disease: string;
  vaccName: string;
  id: number | string;
  manuFacName: string;
  DiseaseCode: number;
  projectID: number;
  VaccineCode: number;
  vaccineSubTypeCode: number;
  vaccineTypeCode: number;
  ownerID: number;
  imageUrl: any;
  file_: UploadImageCampaign;

  fileList = [];
  formCd: any;
  routeCd: any;
  doseCd: any;
  unitCd: any;
  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private _fb: FormBuilder,
    private location: Location,
    private vaccinationService: VaccinationService,
    private router: Router,
    private readonly translateService: TranslateService,
    private translatePipe: TranslatePipe,
    private dialogReference: MatDialogRef<CampaignDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  public minDate: Object = new Date(this.today);
  public maxDate: Object = new Date(this.today);
  public campMaxDate: Object = this.today;
  // public campMaxDate: Date;
  public campMinDate: Date;
  public currentDate: Object = this.today;
  ngOnInit(): void {
    this.vaccinationDateForm = this._fb.group({
      vaccinationDeWormingRecordDate: [
        { value: moment(this.today).format('DD/MM/YYYY'), disabled: true },
        [Validators.required],
      ],
      vaccinationDate: [{ value: moment(this.today).format('DD/MM/YYYY') }, [Validators.required]],
      // vaccinationDate: ['', [Validators.required]],
      // vaccinationDate: [(new FormControl(new Date()), [Validators.required])],
      selected_tagId_details: this._fb.array([]),
    });

    // Vaccination Type
    this.vaccinationService.getVaccinationType('vaccination_type').subscribe(
      (res: any[]) => {
        this.getVaccinationType = res;
      },
      (error) => {
      }
    );
    // getRepeatVaccinationReason Type
    this.vaccinationService
      .getRepeatVaccinationReason('repeat_vaccination_reason')
      .subscribe(
        (res: any[]) => {
          this.getRepeatVaccination = res;
        },
        (error) => {
        }
      );

    this.withCampaignSelected();

  }

  withCampaignSelected(flag = true) {
    let dataID = this.data.campdata;
    this.id = this.data.campdata['campaignId'];
    this.isLoadingSpinner = true;
    this.vaccinationService.getSelectedCampaignDetails(dataID).subscribe(
      async (res: any[]) => {
        this.CampaignList = res;
        let vaccinationTypeDisplay = this.vaccinationDateForm.get('selected_tagId_details') as FormArray;
        vaccinationTypeDisplay.controls.forEach(control => {
          control.patchValue({
            vaccinationType: this.CampaignList.vaccinationType,
          });
        })

        this.startDate = this.CampaignList.campaignStartDate;
        this.startDateDisplay =
          moment(this.CampaignList.campaignStartDate).format('DD/MM/YYYY') ==
            'Invalid date'
            ? ''
            : moment(this.CampaignList.campaignStartDate).format('DD/MM/YYYY');
        this.endDate = this.CampaignList.campaignEndDate;
        this.endDateDisplay =
          moment(this.CampaignList.campaignEndDate).format('DD/MM/YYYY') ==
            'Invalid date'
            ? ''
            : moment(this.CampaignList.campaignEndDate).format('DD/MM/YYYY');

        this.batchno = this.CampaignList.batchNumber;
        this.DataEntryEndDate = this.CampaignList.campaignDataEntryEndDate;
        this.DataEntryEndDateDisplay =
          moment(this.CampaignList.campaignDataEntryEndDate).format(
            'DD/MM/YYYY'
          ) == 'Invalid date'
            ? ''
            : moment(this.CampaignList.campaignDataEntryEndDate).format(
              'DD/MM/YYYY'
            );

        this.disease = this.CampaignList.diseaseDesc;
        this.vaccName = this.CampaignList.vaccineName;
        this.manuFacName = this.CampaignList.manufacturer;
        this.DiseaseCode = this.CampaignList.diseaseCd;
        this.projectID = this.CampaignList.projectId;
        this.VaccineCode = this.CampaignList.vaccineCd;
        this.vaccineTypeCode = this.CampaignList.vaccineTypeCd;
        this.vaccineSubTypeCode = this.CampaignList.vaccineSubtypeCd;

        if (flag) { await this.withCampaignVaccDetails(); }
        this.campMinDate = this.startDate;
        this.campMaxDate = moment(this.currentDate).isAfter(this.endDate) ? moment(this.endDate).format('YYYY-MM-DD') : moment(this.currentDate).format('YYYY-MM-DD');
        // this.campMaxDate = this.endDate;
        this.isLoadingSpinner = false;
        this.vaccinationDateFunction();
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  async withCampaignVaccDetails() {
    let res = this.data['selectedtagId']
    this.ownerID = res.map((a) => a.ownerId);
    this.isLoadingSpinner = true;
    const SendingData = {
      animalIdList: this.data['selectedtagId'],
      vaccinationDewormingFlag: 'V',
      vaccineCd: this.VaccineCode,
      vaccineTypeCd: this.vaccineTypeCode,
      vaccineSubtypeCd: this.vaccineSubTypeCode,
      diseaseCd: this.DiseaseCode
    }

    const res1 = await this.vaccinationService
      .getVaccinationOrDewarmerDetail(SendingData).toPromise()
    // .subscribe(
    try {
      this.DetailList = res1 ?? [];
      for (let data of this.DetailList) {
        this.formCd = data.formCd;
        this.routeCd = data.routeCd;
        this.doseCd = data.dosage;
        this.unitCd = data.unitCd;
      }

      // this.isLoadingSpinner = false;
      this.data1.data = res1.filter((r) => r != null);

      this.setUsersForm();
      this.withCampaignSelected(false)
      this.vaccinationDateFunction();
    } catch {
      this.isLoadingSpinner = false;
    }

  }

  vaccTypeSelected(event, index) {
    if (event.value == 4 || event.value == 3) {
      this.isDisable = '';
      this.tableRowsControl.controls[index].get('repeatVaccinationReasonCd').addValidators([Validators.required]);

    } else {
      this.isDisable = true;
      this.tableRowsControl.controls[index].get('repeatVaccinationReasonCd').clearValidators();
    }
    this.tableRowsControl.controls[index].get('repeatVaccinationReasonCd').updateValueAndValidity();
    this.tableRowsControl.controls[index].get('repeatVaccinationReasonCd').markAsUntouched();
  }

  dateFormatChange(date: String) {
    date = date.substring(0, 10);
    return date.split('-').reverse().join('/');
  }

  // WithCampaign Function
  get tableRowsControl() {
    return this.vaccinationDateForm.get('selected_tagId_details') as FormArray;
  }
  private setUsersForm() {
    const userCtrl = this.vaccinationDateForm.get(
      'selected_tagId_details'
    ) as FormArray;
    this.fileList = new Array(this.data1.data.length);
    this.data1.data.forEach((user) => {
      if (user != null) userCtrl.push(this.setUsersFormArray(user));
    });
  }
  private setUsersFormArray(user) {
    return this._fb.group({
      vaccinationType: [''],
      PhotoUrl: ['', { asyncValidators: [mimeType] }],
      vaccinationDeWormingPhotoUrl: [''],
      repeatVaccinationReasonCd: ['', [AlphaNumericSpecialValidation]],
      tagId: [user.tagId.toString()],
      speciesCd: [user.speciesCd]
    });
  }


  uploadImage(event, index) {
    this.img = event.target.files[0];
    //Show image preview
    let reader = new FileReader();
    reader.onload = (event: any) => {
      this.imageUrl = event.target.result;
    };
    reader.readAsDataURL(this.img);
    let formdata = new FormData();
    formdata.append('uploadType', 'uploadSampleImage');
    formdata.append('moduleFilePath', 'uploadSampleImageTreatmentPath');
    formdata.append('id', this.data1.data[index].animalId.toString());
    formdata.append('file', this.img);
    this.isLoadingSpinner = true;
    let CampaignTagId = this.vaccinationDateForm['controls'][
      'selected_tagId_details'
    ] as FormArray;
    CampaignTagId.at(index).patchValue({
      PhotoUrl: this.img,
    });
    // this.fileList.push(formdata);
    this.fileList[index] = formdata;
    this.isLoadingSpinner = false;
  }

  fileUploadSubmit() {
    if (this.fileList.length) {
      let reqArray = [];
      let CampaignTagId = this.vaccinationDateForm['controls'][
        'selected_tagId_details'
      ] as FormArray;
      this.fileList.forEach((formdata, index) => {
        this.isLoadingSpinner = true;
        reqArray.push(this.vaccinationService.uploadImage(formdata));
      });
      forkJoin(reqArray).subscribe((response: any) => {
        response.length && response.forEach((element, index) => {
          CampaignTagId.at(index).patchValue({
            vaccinationDeWormingPhotoUrl: element.file,
          });
        });
        this.submitVaccinationData();
        //this.isLoadingSpinner = false;
      }, err => {
        this.isLoadingSpinner = false;
      })
    }
  }


  get diseaseInfo() {
    return this.vaccinationDateForm.get('selected_tagId_details')['controls'];
  }

  // setDateChanged(event) {
  //   if (this.withOutCampaign) {
  //     return;
  //   }
  //   const vaccEventDate = moment(event.value).format('YYYY-MM-DD');

  //   if (vaccEventDate <= this.taggingDate) {
  //     this.preventSubmit = true;
  //     this.dialog.open(ConfirmationDialogComponent, {
  //       data: {
  //         title: 'Alert!',
  //         message: 'Vaccination Date should be later than Tagging Date',
  //         primaryBtnText: 'Ok',
  //       },
  //     });
  //   } else {
  //     this.preventSubmit = false;
  //   }
  // }

  vaccinationDateFunction() {
    const capEndDate = moment(this.endDate).format('YYYY-MM-DD');
    const capStartDate = moment(this.startDate).format('YYYY-MM-DD');
    this.campMinDate = new Date(capStartDate);
    // this.campMaxDate = new Date(capEndDate);
    if (this.today > this.endDate && this.today < this.DataEntryEndDate) {
      this.vaccinationDateForm.patchValue({
        vaccinationDate: this.endDate,
      });
    } else if (this.today > this.startDate && this.today < this.endDate) {
      this.vaccinationDateForm.patchValue({
        vaccinationDate: this.today,
      });
    }
  }

  /* Handle form errors in Angular 8 */
  public errorHandling = (control: string, error: string) => {
    return (
      this.vaccinationDateForm.controls[control].touched &&
      this.vaccinationDateForm.controls[control].hasError(error)
    );
  };

  get today() {
    return moment(sessionStorage.getItem('serverCurrentDateTime')).format('YYYY-MM-DD');
  }



  vaccinationSubmit(): void {
    this.submitted = true;
    if (this.vaccinationDateForm.invalid || this.isShowError) {
      this.vaccinationDateForm.markAllAsTouched();
      return;
    }
    if (this.fileList.some(el => el !== null)) {
      this.fileUploadSubmit();
    } else {
      this.submitVaccinationData();
    }

  }

  async submitVaccinationData(request = null, minBoosterAllowed = false) {

    try {
      if (!minBoosterAllowed) {
        let request = this.vaccinationDateForm.value;
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
        var formattedReq = this.createRequestForSubmit(request);
      }
      else {
        formattedReq = request;
      }
      // let queryParams =
      this.isLoadingSpinner = true;
      const res = await this.vaccinationService.saveVaccination(formattedReq, minBoosterAllowed).toPromise().catch((err) => { throw err })
      if (res?.msg?.msgCode === 2000) {
        var isConfirmSubmitAgain = await this.dialog
          .open(TreatmentResponseDialogComponent, {
            data: {
              title: this.translatePipe.transform('diseaseTesting.warning'),
              icon: 'assets/images/info.svg',
              message: res?.msg?.msgDesc,
              primaryBtnText: this.translatePipe.transform('common.yes'),
              secondaryBtnText: this.translatePipe.transform('common.no'),
            },
            panelClass: 'common-info-dialog',
            width: '500px',
          })
          .afterClosed()
          .toPromise();
        if (isConfirmSubmitAgain) {
          this.submitVaccinationData(formattedReq, true);
          return;
        }
        else {
          throw new Error("Error");
        }
      }
      this.handleSuccessResponse(res);
    }
    catch (err) {
      this.isLoadingSpinner = false
    }

  }

  createRequestForSubmit(request) {
    request['updateLastVaccAndDewDateReq'] = {
      vaccinationDeWormerDate: moment(this.vaccinationDateForm.value.vaccinationDate).format('YYYY-MM-DD'),
      animalId: this.data1.data.map(a => a.animalId),
      vaccinationDewormingFlag: 'V',
      searchByFlag: "NA"
    };

    request.selected_tagId_details &&
      request.selected_tagId_details.forEach((vacc, index) => {
        // const speciesCode = this.CampaignList.speciesImpactedEntity.find((a) => a.speciesCd == vacc['speciesCd'])
        vacc['vaccinationDeWormerDate'] = moment(this.vaccinationDateForm.value.vaccinationDate).format('YYYY-MM-DD');
        vacc['vaccinationDeWormingRecordDate'] = this.today;
        vacc['animalId'] = this.data1.data[index].animalId;
        vacc['batchNo'] = this.batchno;
        vacc['campaignId'] = this.id.toString();
        vacc['createdBy'] = '';
        vacc['creationDate'] = this.today;
        vacc['diseaseCd'] = this.DiseaseCode.toString();
        vacc['manufacturer'] = this.manuFacName;
        vacc['modifiedBy'] = '';
        vacc['projectId'] = this.projectID;
        vacc['vaccineTypeCd'] = this.vaccineTypeCode;
        vacc['vaccineSubtypeCd'] = this.vaccineSubTypeCode;
        vacc['formCd'] = this.formCd;
        vacc['routeCd'] = this.routeCd;
        vacc['dosage'] = this.doseCd;
        vacc['unitCd'] = this.unitCd;

        vacc['modifiedDate'] = this.today;
        vacc['ownerId'] = this.ownerID[index];
        if (vacc['vaccinationType'] == 5) {
          vacc['repeatVaccinationReasonCd'] =
            vacc['repeatVaccinationReasonCd'].toString();
          vacc['ringVaccinationReason'] = '';
        } else {
          vacc['ringVaccinationReason'] = vacc['repeatVaccinationReason'];
          vacc['repeatVaccinationReasonCd'] = '';
        }
        vacc['vaccineCd'] = this.VaccineCode.toString();
        //vacc['vaccinationDeWormingPhotoUrl'] = this.file_;
        vacc['vaccinationDewormingFlag'] = 'V';
      });
    delete request.vaccinationDate;
    return request;
  }

  handleSuccessResponse(res) {
    this.SubmitReport = res;
    this.Successmessage = res.msg.msgDesc;
    this.supervisorName = res.data.supervisorName;
    this.transactionId = res.data.transactionId;
    this.isLoadingSpinner = false;
    this.openDialogwithCampaign();
  }

  //  FOR ERROR MESSAGE DIALOG
  openDialogwithCampaignError() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        title: this.translateService.instant('common.info_label'),
        message: this.Successmessage,
        primaryBtnText: this.translateService.instant('common.ok_string'),
        panelClass: 'custom-modalbox',
        errorFlag: true,
        icon: "assets/images/info.svg",
      },
      panelClass: 'common-info-dialog',
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((res) => { });
  }

  clearWithField() {
    this.vaccinationDateForm.reset();

    this.location.back();
  }

  get selected_tagId_details() {
    return this.vaccinationDateForm.get('selected_tagId_details') as FormArray;
  }

  openDialogwithCampaign() {
    const dialogRef = this.dialog.open(VaccinationDialogComponent, {
      disableClose: true,
      data: {
        title: this.Successmessage,
        transactionId: this.transactionId,
        supervisorName: this.supervisorName,
        dataKey: this.data1.data?.length,
        dataKeyForDetails: this.CampaignList,
      },
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((res) => { });
  }

  removeRow(i: number) {
    (
      this.vaccinationDateForm.get('selected_tagId_details') as FormArray
    ).removeAt(i);
    this.data1.data = this.data1.data.filter((_, index) => i !== index);
    this.fileList.splice(i, 1);
    // this.checkTaggingDate();
  }

  // checkTaggingDate() {
  //   if (!this.withOutCampaign && this.data1.data.length) {
  //     this.taggingDate = this.data1.data[0].taggingDate;
  //     for (const animal of this.data1.data) {
  //       this.taggingDate = moment(animal.taggingDate).isAfter(
  //         moment(this.taggingDate)
  //       )
  //         ? animal.taggingDate
  //         : this.taggingDate;
  //     }
  //   }
  // }
}
