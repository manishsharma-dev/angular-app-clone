import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { animalBreedingPRConfig } from 'src/app/shared/animal-breeding-pr.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { onlyNumberValidation } from 'src/app/shared/utility/validation';
import { animalHealthValidations } from 'src/app/shared/validatator';
import {
  animalDetails,
  AnimalHistory,
  CommonDetail,
  CommonMasterDetails,
} from '../model/pd-detail.model';
import { PregnancyDiagnosisService } from '../pregnancy-diagnosis.service';
import { SaveDialogComponent } from '../save-dialog/save-dialog.component';

@Component({
  selector: 'app-newpd',
  templateUrl: './newpd.component.html',
  styleUrls: ['./newpd.component.css'],
  providers: [TranslatePipe],
})
export class NewpdComponent implements OnInit {
  validationMsg = animalHealthValidations.newCase;
  currentDate = sessionStorage.getItem('serverCurrentDateTime');
  addPDForm!: FormGroup;
  pdMonth: string = '10';
  commonDetail: CommonDetail[];
  dataSource = new MatTableDataSource<AnimalHistory>();
  isLoadingSpinner: boolean = false;
  sireIdValidation: boolean = false;
  historyDetail: any = {};
  isFormSubmit: boolean = false;
  tagId: number;
  breedingMinDate = '';
  columnsToDisplay: string[] = [
    'aiLactationNumber',
    'aiDate',
    'bullId',
    'pdDate',
    'calvingDate',
    'aiType',
    'serviceType',
    'status',
    'actualAiNumber',
    'aiDoneBy',
  ];
  lastBreedingHistory: any;
  ownerDetail: animalDetails;
  pdResults: CommonMasterDetails[] = [];
  serviceType: CommonMasterDetails[] = [];
  isPDEdit: boolean = false;
  previousDetails: any;
  pregnancyFailed:boolean = false
  commonServiceType:CommonMasterDetails[] = [];
  constructor(
    private _fb: FormBuilder,
    public dialog: MatDialog,
    private pregnancyServices: PregnancyDiagnosisService,
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataServiceService,
    private translatePipe: TranslatePipe
  ) {}

  ngOnInit(): void {
    this.tagId = this.route.snapshot.queryParams['tagId'];
    this.isPDEdit = this.route.snapshot.queryParams['isEdit'];
    this.dataService
      .getDefaultConfig(animalBreedingPRConfig.backdate.PdBackdate)
      .subscribe((res) => {
        this.breedingMinDate = moment(this.currentDate)
          .subtract(res.defaultValue, 'days')
          .format('YYYY-MM-DD');
      });
    if (!this.tagId) {
      this.router.navigate(['/not-found']);
    }
    this.initPregnancyDiagnosisForm();
    this.historyDetail = {
      compDetail: 'PD',
      newPageUrl: 'new-pd',
      apiType: 'apiUrlBreedingModule',
      apiUrl: 'animalbreeding/history/getBreedingHistory?tagId=',
      tagId: this.tagId,
      isHistory: false,
      name: 'animalBreeding.pd',
    };
    this.getServiceTypeByCommonMaster()
  }

  get formControls() {
    return this.addPDForm.controls;
  }
  // For other symptoms

  submitPregnancyDiagnosis() {
    this.isFormSubmit = true;
    if (this.addPDForm.invalid) {
      this.addPDForm.markAllAsTouched();
      this.isFormSubmit = false;
      return;
    }

    this.isLoadingSpinner = true;
    this.formControls.pdRecordDate.enable();
    const formValue = {
      ...this.addPDForm.value,
    };

    formValue.animalId = this.ownerDetail.animalId;

    formValue.pdDate = moment(formValue.pdDate).format('YYYY-MM-DD');

    formValue.pregnancyMonth = formValue.pregnancyMonth
      ? formValue.pregnancyMonth
      : 0;
    formValue.tagId = this.tagId;
    formValue.createdBy = 'system';
    formValue.modifiedBy = 'system';
    formValue.currentLactationNo = this.ownerDetail.currentLactationNo;
    if (this.isPDEdit) {
      formValue.approvalRejectionRemarks = null;
      formValue.approvalRejectionDate = null;
      formValue.approvedRejectedBy = null;
      formValue.projectId = this.previousDetails?.projectId;
      formValue.pdId = this.previousDetails?.pdId;
    }
    this.pregnancyServices[this.isPDEdit ? 'updatePDDetails' : 'registerNewAI'](
      formValue
    )
      .pipe(
        switchMap((res: any) =>
        {
          if(res && (res?.msg?.msgCode == 3558)){
            return this.dialog
            .open(ConfirmationDialogComponent, {
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
            })
            .afterClosed()
          }else{
            return this.dialog
            .open(SaveDialogComponent, {
              data: {
                title: this.isPDEdit
                  ? 'animalDetails.transaction_approval'
                  : res?.msg?.msgDesc,
                transaction_id: res?.data?.pdId ?? res?.pdId,
              },
              width: '500px',
              panelClass: 'makeItMiddle',
            })
            .afterClosed()
          }
          
        }
        )
      )
      .subscribe(
        (res) => {
          this.isFormSubmit = false;
          // this.shareDataService.setData(this.historyDetail)
          this.isLoadingSpinner = false;
          this.goBack();
        },
        (error) => {
          this.isFormSubmit = false;
          this.isLoadingSpinner = false;
          this.formControls.pdRecordDate.disable();
        }
      );
  }

  verifyBullID(): void {
    const bullId = this.formControls.bullId.value;
    if (
      bullId
      // && bullId.length == 12
    ) {
      let reqObj: any = {};
      reqObj.bullId = bullId;
      reqObj.cattleId = this.tagId;
      this.isLoadingSpinner = true;
      this.pregnancyServices.validateBullID(reqObj).subscribe(
        (data) => {
          this.isLoadingSpinner = false;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    }
  }
  verifySireId(event: Event): void {
    const sireId = event.target['value'];

    this.sireIdValidation = sireId.length !== 12 || isNaN(+sireId);

    if (!this.sireIdValidation) {
      this.ValidateSireId(sireId);
    }
  }
  getOwnerId(param) {
    this.ownerDetail = param?.animalResponse;
    this.getPDResults();
   if(!this.isPDEdit) this.getServiceType();
   else {
    this.serviceType = this.commonServiceType
    this.editPDDetails()
  }
  }
  goBack() {
    this.router.navigate(['..'], {
      relativeTo: this.route,
      queryParams: { ownerId: this.ownerDetail.ownerId },
    });
  }

  get today() {
    return moment(this.currentDate).format('YYYY-MM-DD');
  }

  private initPregnancyDiagnosisForm(): void {
    this.addPDForm = this._fb.group({
      pdRecordDate: [
        { value: this.today, disabled: true },
        Validators.required,
      ],
      pdDate: [
        this.today,
        { updateOn: 'blur', validators: [Validators.required] },
      ],

      serviceType: [null, [Validators.required]],
      pdResult: [null, [Validators.required]],
      pregnancyMonth: [null, onlyNumberValidation],
      sireTagId: [
        null,
        [
          Validators.maxLength(12),
          Validators.minLength(12),
          onlyNumberValidation,
        ],
      ],
      bullId: [''],
    });

    this.addPDForm.get('serviceType').valueChanges.subscribe((value) => {
      this.checkServiceType(value);
    });

    this.addPDForm
      .get('pdDate')
      .valueChanges.pipe(
        filter(() => !!this.ownerDetail?.taggingDate),
        distinctUntilChanged()
      )
      .subscribe((res) => {
        if(!this.isPDEdit)   this.getServiceType() ;
     
        const selectedDate = moment(res);

        const taggingDate = moment(this.ownerDetail?.taggingDate);

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
            .subscribe(() => this.addPDForm.get('pdDate').reset());
        }
      });
   
  }

  getBreedingHistoryDetail($event): void {
    this.lastBreedingHistory = $event;
  }
  checkPregnencyMonth(){
   const result =  this.addPDForm.get('pdResult')?.value
   if(result == 2){
    this.pregnancyFailed = true
    this.formControls.pregnancyMonth.setValue(0)
    this.formControls.pregnancyMonth.disable()
   }else{
    this.pregnancyFailed = false
    this.formControls.pregnancyMonth.enable()
   }
  }
  private checkServiceType(value): void {
    const serviceType = parseInt(value)
    let sireId = this.addPDForm.get('sireTagId');
    const pregnancyMonth = this.addPDForm.get('pregnancyMonth');
    const bullId = this.addPDForm.get('bullId');
    switch (serviceType) {
      case 1:
        sireId.clearValidators()
        pregnancyMonth.clearValidators();
        sireId.reset();
        pregnancyMonth.reset();
        bullId.reset();
        this.addPDForm.updateValueAndValidity()
        break;
        case 4:
          sireId.clearValidators()
          sireId.reset()
          sireId
          .setValidators([
              Validators.maxLength(12),
              Validators.minLength(12),
              onlyNumberValidation,
            ]);
          bullId.reset();
          pregnancyMonth.setValidators(Validators.required);
      this.addPDForm.updateValueAndValidity()
        break;
        case 3:
          sireId.clearValidators()
          sireId.reset();
          pregnancyMonth.setValidators(Validators.required);
          sireId.removeValidators(Validators.required); 
          this.addPDForm.updateValueAndValidity()
        break;
    
      default:
   
        sireId.clearValidators()
        sireId.reset()
        sireId
        .setValidators([
          Validators.required,
            Validators.maxLength(12),
            Validators.minLength(12),
            onlyNumberValidation,
          ]);
 
        pregnancyMonth.setValidators(Validators.required);
        bullId.reset();
      this.addPDForm.updateValueAndValidity()
        break;
    }
    this.checkPregnencyMonth()
   
  }

  private ValidateSireId(tag_id: number): void {
    this.isLoadingSpinner = true;
    let reqObj: any = {};
    reqObj.tagId = tag_id;
    reqObj.cattleId = this.tagId;
    this.pregnancyServices.validateSireId(reqObj).subscribe(
      (value) => (this.isLoadingSpinner = false),
      (error) => (this.isLoadingSpinner = false)
    );
  }
   getServiceType(): void {
    const transactionDate = this.addPDForm.get("pdDate").value ?
                            this.addPDForm.get("pdDate").value :
                            this.today

    this.isLoadingSpinner = true;
    const serviceObj = {
      tagId: this.ownerDetail?.tagId,
      currentLactationNo: this.ownerDetail?.currentLactationNo,
       transactionDate:moment(transactionDate).format('YYYY-MM-DD')
    };
    this.pregnancyServices.getServiceType(serviceObj).subscribe(
      (data: any) => {
        this.serviceType = data;
        this.isLoadingSpinner = false;
        if (!this.isPDEdit) {
          const serviceTypeValue =
            this.lastBreedingHistory?.latestBreeding?.length > 0
              ? this.lastBreedingHistory?.latestBreeding[0]?.serviceType ==
                'Internal AI'
                ? 1
                : null
              : null;

          const isServiceTypeInternal = this.serviceType.filter(
            (obj) => obj.cd === serviceTypeValue
          );
          this.addPDForm
            .get('serviceType')
            .setValue(
              isServiceTypeInternal && isServiceTypeInternal?.length > 0
                ? isServiceTypeInternal[0].cd
                : null
            );
        } else this.editPDDetails();
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  private getPDResults(): void {
    this.isLoadingSpinner = true;

    this.pregnancyServices.getCommonMaster('pd_result').subscribe(
      (data: any) => {
        this.pdResults = data;
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  private getServiceTypeByCommonMaster(): void {
    this.isLoadingSpinner = true;

    this.pregnancyServices.getCommonMaster('service_type').subscribe(
      (data: any) => {
        this.commonServiceType = data;
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  // service_type
  private editPDDetails(): void {
    this.isLoadingSpinner = true;
    this.pregnancyServices.getPDDetailsByID(this.tagId).subscribe(
      (data: any) => {
        this.previousDetails = data;
        this.addPDForm.patchValue(data);
        // const name_list = ['pdDate'];
        // this.dataService._enableDisableFormKeys(
        //   this.formControls,
        //   name_list,
        //   'disable'
        // );
        this.isLoadingSpinner = false;
        this.checkPregnencyMonth()
        // this.getServiceType()
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  convertInputToUpperCase(event: Event) {
    const element = event.target as HTMLInputElement;
    const position = element?.selectionStart;
    element.value = element?.value?.toString()?.toLocaleUpperCase();
    element?.setSelectionRange(position, position);
  }
}
