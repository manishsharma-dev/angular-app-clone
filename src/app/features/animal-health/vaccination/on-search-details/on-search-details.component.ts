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
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { forkJoin } from 'rxjs';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { mimeType } from 'src/app/shared/utility/mime-type.validator';
import { SaveVaccination } from '../models/submit-Vacc.model';
import { UploadImageWithoutCampaign } from '../models/uploadImage.model';
import { VaccinationDetails } from '../models/vacc-details.model';
import { RepeatVaccReason, VaccinationType } from '../models/vacc-Name.model';
import { VaccinationService } from '../vaccination.service';
import { WithoutCampaignDialogComponent } from '../without-campaign-dialog/without-campaign-dialog.component';
import { AlphaNumericSpecialValidation } from 'src/app/shared/utility/validation';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { TreatmentResponseDialogComponent } from '../../treatment-response-dialog/treatment-response-dialog.component';

@Component({
  selector: 'app-on-search-details',
  templateUrl: './on-search-details.component.html',
  styleUrls: ['./on-search-details.component.css'],
  providers: [TranslatePipe],
})
export class OnSearchDetailsComponent implements OnInit {
  DisplayedColumns: string[] = [
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
  withOutCampaign: boolean;
  data2 = new MatTableDataSource<VaccinationDetails>([]);
  getRepeatVaccination: RepeatVaccReason[] = [];
  vaccinationDetailsWithoutCampaign: FormGroup;
  getVaccinationType: VaccinationType[] = [];
  validationMsg = animalHealthValidations.outbreakFollowup;
  isLoadingSpinner: boolean = false;
  defaultValue: number;
  minVaccDateWithout: Date;
  ImageWithoutCampaign: UploadImageWithoutCampaign[] = [];
  imgWithout: any;
  file_without: UploadImageWithoutCampaign;
  imageUrl: any;
  ownerIDwithoutCampaign: number;
  diseaseDescWithoutCampaign: string;
  VaccineNameWithoutCampaign: string;
  batchNumberWithoutCampaign: number;
  manufacNamewithout: any;
  vaccCDwithout: any;
  vaccTypeCode: any;
  vaccSubTypeCode: any;
  formCd: any;
  routeCd: any;
  doseCd: any;
  unitCd: any;
  DetailListWithOut: VaccinationDetails[] = [];
  isDisableWithout: boolean | string = true;
  submitted = false;
  Successmessage: SaveVaccination[] = [];
  transactionId: SaveVaccination[] = [];
  SubmitReport: SaveVaccination[] = [];
  supervisorName: SaveVaccination[] = [];
  animal: any;
  taggingDate: string;
  DiseaseCD: any;
  projectID: number;
  fileList = [];
  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private _fb: FormBuilder,
    private location: Location,
    private vaccinationService: VaccinationService,
    private router: Router,
    private readonly translateService: TranslateService,
    private dialogReference: MatDialogRef<OnSearchDetailsComponent>,
    private translatePipe: TranslatePipe,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  public minDate: Object = new Date(this.today);
  public maxDate: Object = new Date(this.today);
  public campMaxDate: Date;
  public campMinDate: Date;
  public currentDate: Object = new Date(this.today);
  ngOnInit(): void {
    this.vaccinationDetailsWithoutCampaign = this._fb.group({
      vaccinationDeWormingRecordDateWithout: [
        { value: moment(this.today).format('DD/MM/YYYY'), disabled: true },
        [Validators.required],
      ],
      vaccinationDateWithout: [{ value: moment(this.today).format('DD/MM/YYYY') }, [Validators.required]],
      selected_tagId_details: this._fb.array([]),
    });

    this.withoutCampaignVaccDetails(this.data['selectedtagIdWithOutCampaign']);

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
    this.vaccinationDateWithout();
  }

  // WithoutCampaign API for getVaccinationOrDewarmerDetail
  withoutCampaignVaccDetails(data) {
    this.diseaseDescWithoutCampaign = this.data.diseaseDesc;
    this.manufacNamewithout = this.data.manufacturer;

    this.VaccineNameWithoutCampaign = this.data.vaccineName;
    let dataWithoutCampaign = this.data.selected_tagId_OnSearch;
    this.batchNumberWithoutCampaign = this.data.batch;
    this.DiseaseCD = this.data.diseaseCodeName;
    this.projectID = this.data.projectId;
    this.vaccCDwithout = this.data.vaccineCd;

    this.vaccTypeCode = this.data.vaccineTypeCd;
    this.vaccSubTypeCode = this.data.vaccineSubtypeCd;

    this.ownerIDwithoutCampaign = dataWithoutCampaign.map((a) => a.ownerId);
    this.isLoadingSpinner = true;
    const SendingData = {
      animalIdList: dataWithoutCampaign,
      vaccinationDewormingFlag: 'V',
      vaccineCd: this.vaccCDwithout,
      vaccineTypeCd: this.vaccTypeCode,
      vaccineSubtypeCd: this.vaccSubTypeCode,
      diseaseCd: this.DiseaseCD
    };
    this.vaccinationService
      .withoutCampaignVaccinationDetail(SendingData)
      .subscribe(
        (res: any) => {
          this.DetailListWithOut = res ?? [];
          for (let data of this.DetailListWithOut) {
            this.taggingDate = data.taggingDate;
            this.formCd = data.formCd;
            this.routeCd = data.routeCd;
            this.doseCd = data.dosage;
            this.unitCd = data.unitCd;
          }
          this.isLoadingSpinner = false;
          this.data2.data = res.filter((r) => r != null);
          this.setUsersFormWithoutCampaign();
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
  }

  vaccinationDateWithout() {
    this.vaccinationService
      .getWithoutVaccinationDate('vaccinationDate')
      .subscribe((res: any) => {
        if (res) {
          this.defaultValue = res.defaultValue;
          const date = new Date(this.today);
          this.currentDate = new Date(date);
          const Without = new Date(
            date.setDate(date.getDate() - this.defaultValue)
          );
          this.minVaccDateWithout = new Date(Without);
          this.vaccinationDetailsWithoutCampaign.patchValue({
            vaccinationDateWithout: this.today,
          });
        }

      });
  }

  dateFormatChange(date: String) {
    date = date.substring(0, 10);
    return date.split('-').reverse().join('/');
  }
  // Without Function

  get tableRowsControlWithoutCampaign() {
    return this.vaccinationDetailsWithoutCampaign.get(
      'selected_tagId_details'
    ) as FormArray;
  }
  private setUsersFormWithoutCampaign() {
    const userCtrl = this.vaccinationDetailsWithoutCampaign.get(
      'selected_tagId_details'
    ) as FormArray;
    this.fileList = new Array(this.data2.data.length);
    this.data2.data.forEach((user) => {
      if (user != null)
        userCtrl.push(this.setUsersFormArrayWithoutCampaign(user));
    });
  }
  private setUsersFormArrayWithoutCampaign(user) {
    return this._fb.group({
      vaccinationType: [''],
      PhotoUrl: ['', { asyncValidators: [mimeType] }],
      vaccinationDeWormingPhotoUrl: [''],
      repeatVaccinationReasonCd: ['', [AlphaNumericSpecialValidation]],
      tagId: [user.tagId.toString()],
    });
  }
  uploadImageWithout(event, index) {
    this.imgWithout = event.target.files[0];

    //Show image preview
    let reader = new FileReader();
    reader.onload = (event: any) => {
      this.imageUrl = event.target.result;
    };
    reader.readAsDataURL(this.imgWithout);
    let formdata = new FormData();
    formdata.append('uploadType', 'uploadSampleImage');
    formdata.append('moduleFilePath', 'uploadSampleImageTreatmentPath');
    formdata.append('id', this.data2.data[index].animalId.toString());
    formdata.append('file', this.imgWithout);
    this.isLoadingSpinner = true;

    let WithoutCampaignTagId = this.vaccinationDetailsWithoutCampaign[
      'controls'
    ]['selected_tagId_details'] as FormArray;
    WithoutCampaignTagId.at(index).patchValue({
      PhotoUrl: this.imgWithout,
    });
    //this.fileList.push(formdata);
    this.fileList[index] = formdata;
    this.isLoadingSpinner = false;
  }

  fileUploadSubmit() {
    if (this.fileList.length) {
      let reqArray = [];
      let CampaignTagId = this.vaccinationDetailsWithoutCampaign['controls'][
        'selected_tagId_details'
      ] as FormArray;
      this.fileList.forEach((formdata, index) => {
        this.isLoadingSpinner = true;
        reqArray.push(this.vaccinationService.uploadImage(formdata));
        this.isLoadingSpinner = false;
      });
      forkJoin(reqArray).subscribe(
        (response: any) => {
          response.length &&
            response.forEach((element, index) => {
              CampaignTagId.at(index).patchValue({
                vaccinationDeWormingPhotoUrl: element.file,
              });
            });
          this.submitVaccinationData();
          //this.isLoadingSpinner = false;
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
    }
  }

  vaccTypeWithoutSelected(event, index) {
    if (event.value == 4 || event.value == 3) {
      this.isDisableWithout = '';
      this.tableRowsControlWithoutCampaign.controls[index].get('repeatVaccinationReasonCd').addValidators([Validators.required]);
    } else {
      this.isDisableWithout = true;
      this.tableRowsControlWithoutCampaign.controls[index].get('repeatVaccinationReasonCd').clearValidators();
    }
    this.tableRowsControlWithoutCampaign.controls[index].get('repeatVaccinationReasonCd').updateValueAndValidity();
    this.tableRowsControlWithoutCampaign.controls[index].get('repeatVaccinationReasonCd').markAsUntouched();
  }

  get today() {
    return moment(sessionStorage.getItem('serverCurrentDateTime')).format('YYYY-MM-DD');
  }

  public errorHandlingWithout = (control: string, error: string) => {
    return (
      this.vaccinationDetailsWithoutCampaign.controls[control].touched &&
      this.vaccinationDetailsWithoutCampaign.controls[control].hasError(error)
    );
  };
  vaccinationWithoutCampaignSubmit(): void {
    this.submitted = true;
    if (this.vaccinationDetailsWithoutCampaign.invalid || this.isShowError) {
      this.vaccinationDetailsWithoutCampaign.markAllAsTouched();
      return;
    }
    if (this.fileList.some((el) => el !== null)) {
      this.fileUploadSubmit();
    } else {
      this.submitVaccinationData();
    }
  }

  async submitVaccinationData(request = null, minBoosterAllowed = false) {
    try {

      if (!minBoosterAllowed) {
        let request = this.vaccinationDetailsWithoutCampaign.value;
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
      this.isLoadingSpinner = true;
      const res = await this.vaccinationService.withoutCampaignSaveVaccination(formattedReq, minBoosterAllowed).toPromise().catch(err => { throw err });
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

  checkAnimalListFlag(request) {

  }

  createRequestForSubmit(request) {
    request['updateLastVaccAndDewDateReq'] = {
      vaccinationDeWormerDate: moment(
        this.vaccinationDetailsWithoutCampaign.value.vaccinationDateWithout
      ).format('YYYY-MM-DD'),
      animalId: this.data2.data.map((a) => a.animalId),
      vaccinationDewormingFlag: 'V',
      searchByFlag: "VS"
    };

    request.selected_tagId_details &&
      request.selected_tagId_details.forEach((vacc, index) => {
        vacc['vaccinationDeWormerDate'] = moment(
          this.vaccinationDetailsWithoutCampaign.value.vaccinationDateWithout
        ).format('YYYY-MM-DD');
        vacc['vaccinationDeWormingRecordDate'] = this.today;
        vacc['animalId'] = this.data2.data[index].animalId;
        vacc['batchNo'] = this.batchNumberWithoutCampaign;
        vacc['campaignId'] = '';
        vacc['createdBy'] = '';
        vacc['creationDate'] = this.today;
        vacc['diseaseCd'] = this.DiseaseCD;
        vacc['projectId'] = this.projectID;
        vacc['vaccineTypeCd'] = this.vaccTypeCode;
        vacc['vaccineSubtypeCd'] = this.vaccSubTypeCode;
        vacc['formCd'] = this.formCd;
        vacc['routeCd'] = this.routeCd;
        vacc['dosage'] = this.doseCd;
        vacc['unitCd'] = this.unitCd;

        vacc['manufacturer'] = this.manufacNamewithout;
        vacc['modifiedBy'] = '';
        vacc['modifiedDate'] = this.today;
        vacc['ownerId'] = this.ownerIDwithoutCampaign[index];
        if (vacc['vaccinationType'] == 5) {
          vacc['repeatVaccinationReasonCd'] =
            vacc['repeatVaccinationReasonCd'].toString();
          vacc['ringVaccinationReason'] = '';
        } else {
          vacc['ringVaccinationReason'] = vacc['repeatVaccinationReason'];
          vacc['repeatVaccinationReasonCd'] = '';
        }
        vacc['vaccineCd'] = this.vaccCDwithout.toString();
        // vacc['vaccinationDeWormingPhotoUrl'] = this.file_without;
        vacc['vaccinationDewormingFlag'] = 'V';
      });

    delete request.vaccinationDateWithout;

    return request;

  }

  handleSuccessResponse(res) {
    this.SubmitReport = res;
    this.Successmessage = res.msg.msgDesc;
    this.transactionId = res.data.transactionId;
    this.supervisorName = res.data.supervisorName,
      this.isLoadingSpinner = false;
    this.openDialogWithoutCampaign();
    sessionStorage.removeItem('diseaseCode');
  }

  openDialogWithoutCampaign() {
    const dialogRef = this.dialog.open(WithoutCampaignDialogComponent, {
      disableClose: true,
      data: {
        title: this.Successmessage,
        transactionId: this.transactionId,
        dataKey: this.data2.data?.length,
        diseaseDesc: this.diseaseDescWithoutCampaign,
        VaccineName: this.VaccineNameWithoutCampaign,
        batchno: this.batchNumberWithoutCampaign,
        supervisorName: this.supervisorName,
      },
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((res) => { });
  }
  goBackWithout() {
    this.location.back();
    sessionStorage.removeItem('diseaseCode');
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
        icon: 'assets/images/info.svg',
      },
      width: '500px',
      panelClass: 'common-info-dialog',
    });
    dialogRef.afterClosed().subscribe((res) => { });
  }

  removeRow(i: number) {
    (
      this.vaccinationDetailsWithoutCampaign.get(
        'selected_tagId_details'
      ) as FormArray
    ).removeAt(i);

    this.data2.data = this.data2.data.filter((_, index) => i !== index);
    this.fileList.splice(i, 1);
    // this.checkTaggingDate();
  }

  // checkTaggingDate() {
  //   if (!this.withOutCampaign && this.data2.data.length) {
  //     this.taggingDate = this.data2.data[0].taggingDate;
  //     for (const animal of this.data2.data) {
  //       this.taggingDate = moment(animal.taggingDate).isAfter(
  //         moment(this.taggingDate)
  //       )
  //         ? animal.taggingDate
  //         : this.taggingDate;
  //     }
  //   }
  // }
}
