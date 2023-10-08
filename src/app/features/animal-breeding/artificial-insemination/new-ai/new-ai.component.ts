import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { forkJoin, iif, Observable, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  filter,
  map,
  startWith,
  switchMap,
  distinctUntilChanged,
} from 'rxjs/operators';
import { animalBreedingPRConfig } from 'src/app/shared/animal-breeding-pr.config';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import {
  getDecryptedProjectData,
  getSessionData,
} from 'src/app/shared/shareService/storageData';

import {
  AlphaNumericSpecialValidation,
  amountValidation,
  onlyNumberValidation,
} from 'src/app/shared/utility/validation';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { SaveDialogComponent } from '../../pregnancy-diagnosis/save-dialog/save-dialog.component';
import { AICommonDetail, animalDetails } from '../ai-model/ai-details.model';
import { ArtificialInseminationService } from '../artificial-insemination.service';
import { Location } from '@angular/common';
const semenType = [
  { type: 'S', cd: 1 },
  { type: 'C', cd: 2 },
  { type: 'B', cd: 3 },
];

@Component({
  selector: 'app-new-ai',
  templateUrl: './new-ai.component.html',
  styleUrls: ['./new-ai.component.css'],
  providers: [TranslatePipe],
})
export class NewAiComponent implements OnInit {
  @ViewChild('topScrollAnchor') topScroll: ElementRef;
  validationMsg = animalHealthValidations.newCase;
  currentDate = sessionStorage.getItem('serverCurrentDateTime');
  addArtificialInseminationForm: FormGroup;
  showAdditionalInfo: boolean = false;
  options: string[] = [];
  filteredOptions: Observable<any>;
  commonDetail: AICommonDetail;
  selectedAIType: number;
  animalHistoryDetail!: any;
  isLoadingSpinner: boolean = false;
  aiType: Array<any> = [];
  isbullId: boolean = false;
  historyDetail: any;
  selectedTimeZone: string = 'AM';
  ownerDetails: animalDetails;
  submitAIForm: boolean = false;
  breedingMinDate: string;
  tagId: number;
  aiTransactionStatus: number;
  aiPregnancyReason: number;
  userInformation: Object = {};
  getStrawDetail: any;
  isUniqueIdAvailable: boolean = false;
  userInfo: any;
  getHeatPermission = [];
  aiCenterList = [];
  projectId: any;
  uniqueStrawFlag: string;
  isAIEdit:boolean = false;
  aiDetails:any
  semenList:any
  approvalReasonCd:any
  projectSemenType = []
  projectsemenStock =[]
  bullDetails:any
  projectDetails = []
  isprojectDetailsMatch:boolean = false
  planWarning:string
  onNavigate(): any {
    this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }
  constructor(
    private _fb: FormBuilder,
    public dialog: MatDialog,
    private aiService: ArtificialInseminationService,
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataServiceService,
    private translatePipe: TranslatePipe,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        filter((params) => {
          if (!params['tagId']) {
            this.router.navigate(['/not-found']);
            return false;
          }
          this.tagId = params['tagId'];
          this.isAIEdit = params['isEdit'];
          this.aiTransactionStatus = params['aiTransactionStatus'];
          this.aiPregnancyReason = params['aiPregnancyReason'];
          this.approvalReasonCd = params['approvalReasonCd']
          return true;
        }),
        switchMap(() =>
          forkJoin([
            this.aiService
              .getCommonMaster('ai_type')
              .pipe(catchError((err) => of(null))),

            this.aiService
              .getCommonMaster('cervical_mucus')
              .pipe(catchError((err) => of(null))),
            this.aiService
              .getCommonMaster('micturition')
              .pipe(catchError((err) => of(null))),
            this.aiService
              .getCommonMaster('mounting_on_herd')
              .pipe(catchError((err) => of(null))),
            this.aiService
              .getCommonMaster('standing_to_mounted')
              .pipe(catchError((err) => of(null))),
            this.aiService
              .getCommonMaster('swollen_vulva')
              .pipe(catchError((err) => of(null))),
            this.aiService
              .getCommonMaster('vocalization')
              .pipe(catchError((err) => of(null))),
            this.aiService
              .getCommonMaster('semen_type')
              .pipe(catchError((err) => of(null))),
            this.dataService.getDefaultConfig(
              animalBreedingPRConfig.backdate.AiBackdate
            ),
          ])
        )
      )
      .subscribe(
        ([
          aiType,
          carvicalMucus,
          micturition,
          mountingHerd,
          standingMounted,
          swollenVulva,
          vocalization,
          semenType,
          dateConfig,
        ]) => {
          this.commonDetail = {
            aiType,
            carvicalMucus,
            micturition,
            mountingHerd,
            standingMounted,
            swollenVulva,
            vocalization,
            semenType,
          };
          this.breedingMinDate = moment(this.currentDate)
            .subtract(dateConfig.defaultValue, 'days')
            .format('YYYY-MM-DD');
          if (this.isAIEdit) this.editAIDetails();
          this.semenList = this.commonDetail.semenType;
        }
      );

    this.newAIFormInit();
    this.historyDetail = {
      compDetail: 'AI',
      newPageUrl: './dashboard/animal-breeding/artificial-insemination/newai',
      apiType: 'apiURL',
      apiUrl: 'animalbreeding/history/getBreedingHistory?tagId=',
      tagId: this.tagId,
      isHistory: false,
      name: 'animalBreeding.ai',
    };

    this.detectStorageforProject();
    this.detectProject();
  }

  get formControls() {
    return this.addArtificialInseminationForm?.controls;
  }
  // For other symptoms

  submitCase() {
    this.submitAIForm = true;
    if (this.addArtificialInseminationForm.invalid) {
      if (this.formControls?.uniqueStrawId?.errors?.required)
        this.alertDialog('errorMsg.unique_id_mandatory');
      this.addArtificialInseminationForm.markAllAsTouched();
      this.onNavigate();
      this.submitAIForm = false;
      return;
    }
   
    if (
      this.formControls.semenType.value == 1 &&
      !this.isUniqueIdAvailable &&
      this.uniqueStrawFlag == 'Y'
    ) {
      this.addArtificialInseminationForm.markAllAsTouched();
      this.onNavigate();
      this.submitAIForm = false
      return;
    }

    if(this.isprojectDetailsMatch) {
      this.alertDialog(this.planWarning)
      return;
    };
    
if (this.projectId &&
  this.projectsemenStock?.length > 0
  && this.projectsemenStock[0]?.parameterValue?.toLowerCase() == 'yes') {
 if(!this.formControls?.uniqueStrawId?.value && !this.formControls?.batchNo?.value)
{ 
  this.alertDialog('animalBreeding.semen_stock_available');
 this.onNavigate();
 this.submitAIForm = false
 return;
}
}

 
    this.isLoadingSpinner = true;
    const formValue = {
      ...this.addArtificialInseminationForm.getRawValue(),
    };
    let aiDate =  moment(
      new Date(
        moment(formValue.aiDate).format('YYYY-MM-DD') + ' ' + formValue.aiTimestamp
      )
    )
      .add(5, 'hour')
      .add(30, 'minute');
      formValue.aiDate = aiDate?.utc()?.format()
    formValue.animalId = this.ownerDetails.animalId;
    formValue.tagId = this.tagId;
    formValue.aiPregnancyReason = this.aiPregnancyReason
      ? this.aiPregnancyReason
      : null;
    formValue.aiTransactionStatus = this.aiTransactionStatus
      ? this.aiTransactionStatus
      : 3;
      formValue.approvalReasonCd  = this.approvalReasonCd
      formValue.bullId = formValue?.bullId?.toUpperCase()
      if(this.isAIEdit){
        formValue.approvalRejectionRemarks =null;
        formValue.approvalRejectionDate=null;
        formValue.approvedRejectedBy=null;
        formValue.projectId = this.aiDetails?.projectId
        formValue.aiId = this.aiDetails.aiId
      }
    delete formValue.aiTimestamp;
    this.aiService[this.isAIEdit ? 'udateAIDetails' : 'registerNewAI'](
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
                title: this.isAIEdit
                  ? 'animalDetails.transaction_approval'
                  : res?.msg?.msgDesc,
                transaction_id: res?.data?.aid ?? res?.aiId,
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
        
          // this.dataService._enableDisableFormKeys(
          //   this.formControls,
          //   formList,
          //   'disable'
          // );
          this.isLoadingSpinner = false;
          this.submitAIForm = false;
          this.addArtificialInseminationForm.reset({
            aiDate:this.addArtificialInseminationForm
                   .get('aiDate').value,
            aiRecordDate: formValue.aiRecordDate,
            aiTimestamp : formValue.aiTimestamp
                  },{emitEvent :false})
          this.goBack();   
        },
        (error) => {
          this.isLoadingSpinner = false;
          this.submitAIForm = false;
          this.addArtificialInseminationForm.reset({
            aiDate:this.addArtificialInseminationForm
                   .get('aiDate').value,
            aiRecordDate: formValue.aiRecordDate,
            aiTimestamp : formValue.aiTimestamp
                  },{emitEvent :false})
          // this.goBack();
        }
      );
  }

  selectedBullId(type: any): void {
    this.selectedAIType = type && type.length < 2 ? type[0] : null;
    this.addArtificialInseminationForm.patchValue({
      aiType: this.selectedAIType,
    });
  }

  get today() {
    return moment(this.currentDate).format('YYYY-MM-DD');
  }

  private changeFormat(date: Date) {
    return moment(date).format('YYYY-MM-DD');
  }

  private newAIFormInit() {
    this.addArtificialInseminationForm = this._fb.group({
      aiRecordDate: [
        { value: this.today, disabled: true },
        [Validators.required],
      ],
      aiDate: [
        this.today,
        { updateOn: 'blur', validators: [Validators.required] },
      ],
      uniqueStrawId: ['', AlphaNumericSpecialValidation],
      batchNo: ['', [AlphaNumericSpecialValidation]],
      aiType: [{ value: null, disabled: true }, [Validators.required]],
      semenType: [null, [Validators.required]],
      aiCenterId: [null, [Validators.required]],
      aiCharges: ['', amountValidation],
      receiptNo: ['', onlyNumberValidation],
      bullId: [
        '',
        {
          updateOn: 'blur',
          validators: [
            Validators.required,
            // Validators.maxLength(12),
            // Validators.minLength(12),
          ],
        },

        ,
      ],
      aiTimestamp: [
        moment(this.currentDate).format('HH:mm'),
        [Validators.required],
      ],
      standingToMounted: [null],
      mountingOnHerd: [null],
      vocalization: [null],
      micturition: [null],
      swollenVulva: [null],
      cervicalMucus: [null],
      doka: [null],
    });
    this.addArtificialInseminationForm
      .get('aiDate')
      .valueChanges.pipe(
        filter(() => !!this.ownerDetails?.taggingDate),
        distinctUntilChanged()
      )
      .subscribe((res) => {
        const selectedDate = moment(res);

        const taggingDate = moment(this.ownerDetails?.taggingDate);

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
              this.addArtificialInseminationForm.get('aiDate').reset()
            );
        } else {
          this.isLoadingSpinner = true;
          const aiDate = moment(res).format('YYYY-MM-DD');
          this.aiService
            .validateAiHeatNumber(this.tagId, aiDate)
            .subscribe((data: any) => {
              this.isLoadingSpinner = false;
              if (data && data?.msgDesc) {
                this.dialog
                  .open(ConfirmationDialogComponent, {
                    data: {
                      title: this.translatePipe.transform('common.info_label'),
                      message: data?.msgDesc,
                      primaryBtnText:
                        this.translatePipe.transform('common.ok_string'),
                      icon: 'assets/images/alert.svg',
                    },
                    panelClass: 'common-info-dialog',
                  })
                  .afterClosed();
              }
            });
        }
      });
    this.getAICenterDetail();
    this.filteredOptions = this.addArtificialInseminationForm
      .get('bullId')
      .valueChanges.pipe(
        // startWith(''),
        // debounceTime(400),
        switchMap((val) => {
          return this._filter(val?.toUpperCase());
        })
      );

      this.addArtificialInseminationForm
      .get('aiType')
      .valueChanges
      .pipe(filter((value)=> value !== null))
      .subscribe(value=>{
        if(value == 2 && this.projectDetails?.length > 0){
          this.isTestPlanSelectedValidation(true)
        }else{
          this.isprojectDetailsMatch = false
        }
      })
  }
  detectBullDetails() {
    this.filteredOptions = this.addArtificialInseminationForm
      .get('bullId')!
      .valueChanges.pipe(
        startWith(''),
        debounceTime(400),
        switchMap((val) => {
          return this._filter(val?.toUpperCase());
        })
      );
  }
  geBatchDetail(): void {
    const batch = this.formControls.batchNo?.value;
    let bullid = this.addArtificialInseminationForm.get('bullId').value;
    bullid = bullid.toUpperCase()
    this.isbullId = bullid ? false : true;
    this.isLoadingSpinner = true;
    if (!this.isbullId && batch) {
      this.aiService.validateBatchNo(batch, bullid).subscribe(
        (response: any) => {
          this.isLoadingSpinner = false;
          this.getStrawDetail = response;
          const isBatchAvailable = this.commonDetail.semenType.filter(type=>type?.cd == response?.semenType[0]?.cd)
          if(isBatchAvailable && isBatchAvailable?.length > 0){
            if( this.projectId  
              && this.projectSemenType 
              && this.projectSemenType?.length > 0 ){
                const semenType = (response?.semenType[0]?.cd == this.projectSemenType[0]?.value
                                    || this.projectSemenType[0]?.parameterValue == 'B')
                                     ?  response?.semenType[0]?.cd
                                      : null;
                
                if(semenType)
                this.addArtificialInseminationForm
                .get('semenType')
                .setValue(semenType)
                else{
                  this.addArtificialInseminationForm
                  .get('semenType')
                  .reset()
                  this.alertDialog("animalBreeding.semen_type_mapped")
                  this.commonDetail.semenType = []
                }
                 
            }else{
             
              this.addArtificialInseminationForm
              .get('semenType')
              .setValue(response?.semenType[0]?.cd);
              
  
            }
            
            this.formControls.semenType.disable();
            // this.isSemenTypeAvailable()
            if (
              response &&
              response?.semenType?.length > 0 &&
              response?.semenType[0]?.cd == 1 &&
              response?.uniqueStrawFlag == 'Y'
            ) {
              this.uniqueStrawFlag = response?.uniqueStrawFlag;
              this.alertDialog('errorMsg.unique_id_mandatory');
              this.formControls.uniqueStrawId.setValidators([
                Validators.required,
              ]);
              this.formControls.uniqueStrawId.updateValueAndValidity();
            } else {
              this.formControls.uniqueStrawId.removeValidators([
                Validators.required,
              ]);
              this.formControls.uniqueStrawId.updateValueAndValidity();
            }
          }else{
            this.alertDialog("animalBreeding.semen_type_mapped")
          }
      
        },
        (error) => {
          this.isLoadingSpinner = false;
          this.formControls.semenType.enable();
          this.formControls.semenType.reset();
          this.formControls.batchNo.reset();
          this.formControls.semenType.updateValueAndValidity();
          if (this.bullDetails && this.bullDetails?.length > 0 && this.bullDetails[0]?.cd != 3) {
            this.commonDetail.semenType = this.semenList.filter(
              (obj) => obj.cd == this.bullDetails[0]?.cd
            );
          } else {
            this.commonDetail.semenType = this.semenList;
          }
        }
      );
    } else {
      this.isLoadingSpinner = false;
      this.formControls.semenType.enable();
      this.formControls.semenType.reset();
      if (this.isAIEdit)
        this.formControls.semenType.patchValue(this.aiDetails?.semenType);
    }
  }
  getOwnerId(param: any) {
    this.ownerDetails = param?.animalResponse;
    this.ownerDetails.villageCd = param.villageCd;
  }
  goBack() {
    // this.router.navigate(['..'], {
    //   relativeTo: this.route,
    //   queryParams: { ownerId: this.ownerDetails?.ownerId },
    // });
    this.location.back();
  }
  getUniqueStrawIdDetails(event: Event): void {
    const uniqueId = event.target['value'];
    this.fetchDataFromUniqueId(uniqueId)
  
  }
  private _filter(value: string) {
    if (
      value
      // && value.length == 12
    ) {
      const bullObj = {
        aiDate: this.changeFormat(this.formControls.aiDate.value),
        isElite: this.ownerDetails?.isElite ? this.ownerDetails?.isElite : false,
        bullId: value,
        villageCd: this.ownerDetails?.villageCd,
        tagId: this.tagId,
      };
      this.aiType = [];
      this.isLoadingSpinner = true;
      return this.aiService.getBullIdSuggestion(bullObj).pipe(
        map((response) => {
          this.isLoadingSpinner = false;
          const idType = [];
          this.bullDetails = []
          const isInbreedBull =
            response?.msg &&
            Object.keys(response?.msg).length > 0 &&
            response?.msg?.msgDesc
              ? true
              : false;
              this.bullDetails = response?.bullType
              this.projectDetails = response?.projectIds ? response?.projectIds : []
              this.bullDetails = response?.bullType
            ? semenType.filter((semen) => semen?.type == response?.bullType)
            : response?.data && response?.data?.bullType
            ? semenType.filter(
                (semen) => semen?.type == response?.data?.bullType
              )
            : [];

          if (this.bullDetails && this.bullDetails?.length > 0 && this.bullDetails[0]?.cd != 3) {
            this.commonDetail.semenType = this.semenList.filter(
              (obj) => obj.cd == this.bullDetails[0]?.cd
            );
          } else {
            this.commonDetail.semenType = this.semenList;
          }
          const isUniqueIdAvailable = this.addArtificialInseminationForm.get("uniqueStrawId").value
          if (!isUniqueIdAvailable) this.isSemenTypeAvailable()
          if (isInbreedBull && !this.isAIEdit) this.inBreedDialog(response?.msg?.msgDesc);
          idType.push(
            response?.aiType ? response : response?.data ? response?.data : null
          );
          this.getServiceType(
            response?.aiType
              ? response?.aiType
              : response?.data
              ? response?.data?.aiType
              : null
          );

          return idType;
        }),
        catchError((err) => of(this.getServiceType(err)))
      );
    } else {
      this.isLoadingSpinner = false;
      this.aiType = [];
      this.formControls.aiType.disable();
      this.formControls.batchNo.reset();
      this.commonDetail.semenType = this.semenList;
      this.formControls.semenType.reset();
      
      return [];
    }
  }
  private getServiceType(type) {
    this.isLoadingSpinner = false;
    if (type && (type?.status == 400|| type?.status == 404)) {
      this.aiType = [];
      this.formControls.aiType.disable();
      this.commonDetail.semenType = this.semenList;
      this.formControls.semenType.reset();
      this.formControls.uniqueStrawId.reset()
      this.formControls.bullId.reset()
      this.formControls.bullId.enable({emitEvent:false})
      this.formControls.batchNo.enable({emitEvent:false})
      this.formControls.semenType.enable()
    } else {
      const numberOfTypes = type ? type.length : 0;
      this.aiType =
        numberOfTypes > 0
          ? this.commonDetail['aiType'].filter((o) =>
              type.some((k) => o.cd === k)
            )
          : [];
      if (!this.isUniqueIdAvailable) this.geBatchDetail();
      if (numberOfTypes > 0 && numberOfTypes < 2) {
        this.formControls.aiType.setValue(type[0]);
        this.formControls.aiType.disable();
      } else if (numberOfTypes > 0 && numberOfTypes > 1) {
        // this.formControls.aiType.setValue(type[0]);
        this.formControls.aiType.enable();
      } else {
        this.formControls.aiType.reset();
        this.formControls.aiType.disable();
      }
    }
  }
  private getAIDateTimeStamp() {
    const completeTime = this.formControls.aiTimestamp.value;
    const date: any = new Date(this.formControls.aiDate.value);
    const yy = new Date(date).getFullYear();
    const mm = new Date(date).getMonth();
    const dd = new Date(date).getDate();
    let times: any = completeTime.split(' ')[0].split(':');
    const completeDate = new Date(yy, mm, dd, times[0], times[1]);
    return completeDate;
  }

  private getAICenterDetail() {
    this.dataService._getUserDetailsByUserId().subscribe((data) => {
      this.userInformation = data;
      const isArray = Array.isArray(this.userInformation['aiCenterName']);
      if (isArray) {
        const aiCenterName = this.userInformation['aiCenterName'];
        const aiCenterCd = this.userInformation['aiCenterCd'];

        aiCenterName.forEach((element, index) => {
          this.aiCenterList.push({ name: element, cd: aiCenterCd[index] });
        });
        if (this.aiCenterList.length > 1)
          this.addArtificialInseminationForm.get('aiCenterId').enable();
        else {
          if (this.aiCenterList.length > 0) {
            this.addArtificialInseminationForm.patchValue({
              aiCenterId: this.aiCenterList[0].cd,
            });
            this.addArtificialInseminationForm.get('aiCenterId').disable();
          }
        }
      } else {
        this.addArtificialInseminationForm.patchValue({
          aiCenterId: this.userInformation['aiCenterName'],
        });
      }
    });
  }
  private alertDialog(alert: string): void {
    this.dialog
      .open(ConfirmationDeleteDialogComponent, {
        data: {
          id: '',
          title: 'common.alert_string',
          message: alert,
          icon: 'assets/images/alert.svg',
          primaryBtnText: 'common.ok',
        },
        panelClass: 'common-alert-dialog',
      })
      .afterClosed();
  }
  private inBreedDialog(inbreed_available: string) {
    this.isLoadingSpinner = true;

    this.dialog
      .open(ConfirmationDeleteDialogComponent, {
        data: {
          id: '',
          title: 'Alert',
          message: inbreed_available,
          icon: 'assets/images/alert.svg',
          primaryBtnText: 'Yes',
          secondaryBtnText: 'No',
        },
        panelClass: 'common-alert-dialog',
      })
      .afterClosed()
      .subscribe({
        next: (result) => {
          if (!result) {
            this.addArtificialInseminationForm.get('batchNo').reset();
            // this.addArtificialInseminationForm.get('bullId').reset();
            this.formControls.bullId.reset()
            this.addArtificialInseminationForm.updateValueAndValidity();
          }
        },
      });
    this.isLoadingSpinner = false;
  }

  detectProject(): void {
    this.dataService.fetchProjectInfo.subscribe((projectID) => {
      if ((projectID != '0' || projectID != 0) && projectID) {
        this.isLoadingSpinner = true;
        this.projectId = projectID;
        this.getSelectedProjectId();
        this.isTestPlanSelectedValidation(false)
      } else {
        this.projectId = null;
        this.projectSemenType = []
        this.projectsemenStock = []
       this.formControls.bullId.reset()
       this.formControls.aiType.reset()
       this.formControls.semenType.reset()
      if (this.commonDetail && this.commonDetail?.semenType) {
        this.resetForm()
              // const isUniqueIdAvailable = this.addArtificialInseminationForm.get('uniqueStrawId').value
              // const batchNumberAvailable = this.addArtificialInseminationForm.get('batchNo').value
              // const bullId = this.addArtificialInseminationForm.get('bullId').value
              // if(isUniqueIdAvailable && isUniqueIdAvailable?.length > 0)
              // this.fetchDataFromUniqueId(isUniqueIdAvailable)
              // else if(batchNumberAvailable){
              //   this.geBatchDetail()
              // } 
              // else{
               
              //  this.addArtificialInseminationForm.reset(
              //   {
              //     aiDate:this.today,
              //     aiRecordDate:this.today,
              //     aiTimestamp: moment(this.currentDate).format('HH:mm')
              //   }
              //  )
              //  this.formControls.aiType.disable()
              // }
              
      }
      this.isTestPlanSelectedValidation(false)
        
      }
     
    }
    );
  }

  getSelectedProjectId(): void {
    const currentSection = getSessionData('subModuleCd');
    let getPermission = [];
    this.dataService._getProjectDetail(this.projectId).subscribe(
      (data: any) => {
        this.isLoadingSpinner = false;
        getPermission = data?.activityCd?.filter(
          (obj) => obj.activityCd == currentSection?.subModuleCd
        );
        const activityPermissionList =
          getPermission && getPermission?.length > 0
            ? getPermission[0].activityParameterList
            : [];
            this.getHeatPermission = this.getActivityValue(activityPermissionList,1)
            this.projectSemenType =  this.getActivityValue(activityPermissionList,10)
            this.projectsemenStock =  this.getActivityValue(activityPermissionList,9)
            if(this.projectSemenType?.length > 0){
              this.projectSemenType =  this.projectSemenType.map(v => ({...v, value: v?.parameterValue == 'S'? 
              1 :v?.parameterValue == 'C' ? 2 : v?.parameterValue == 'B' ? 3 : null}))
              this.isSemenTypeAvailable()
            }else{

              this.resetForm()
              // this.commonDetail.semenType = this.semenList
              // const isUniqueIdAvailable = this.addArtificialInseminationForm.get('uniqueStrawId').value
              // const batchNumberAvailable = this.addArtificialInseminationForm.get('batchNo').value
              // const bullId = this.addArtificialInseminationForm.get('bullId').value
              //  this.addArtificialInseminationForm.reset(
              //   {
              //     aiDate:this.today,
              //     aiRecordDate:this.today,
              //     aiTimestamp: moment(this.currentDate).format('HH:mm')
              //   }
              //  )
              //  this.formControls.aiType.disable()
              // if(isUniqueIdAvailable && isUniqueIdAvailable?.length > 0)
              // this.fetchDataFromUniqueId(isUniqueIdAvailable)
              // else if(batchNumberAvailable){
              //   this.geBatchDetail()
              // } 
              // else{
               
              //   this.addArtificialInseminationForm.reset(
              //     {
              //       aiDate:this.today,
              //       aiRecordDate:this.today,
              //       aiTimestamp: moment(this.currentDate).format('HH:mm')
              //     },{emitEvent:false}
              //    )
              //    this.formControls.aiType.disable()
              // }
            }
            
            
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  detectStorageforProject(): void {
    this.projectId = getDecryptedProjectData('AESSHA256storageProjectData')?.id;
    if (this.projectId != '0' || this.projectId != 0) {
      this.isLoadingSpinner = true;
      this.getSelectedProjectId();
      this.isTestPlanSelectedValidation(false)
    } else {
      this.projectId = null;
      this.projectSemenType = []
      this.projectsemenStock = []
      this.isTestPlanSelectedValidation(false)
    }
   
  }
  private editAIDetails(): void {
    this.isLoadingSpinner = true;
    this.aiService.getAIDetailsByID(this.tagId).subscribe(
      (data: any) => {
        this.isLoadingSpinner = false;
        this.aiDetails = data;
        this.addArtificialInseminationForm.patchValue(this.aiDetails);
        // const name_list = ['aiDate','aiTimestamp'];
        // this.dataService._enableDisableFormKeys(
        //   this.formControls,
        //   name_list,
        //   'disable'
        // );
        this.fetchTimeOnEditAI()
        this.addArtificialInseminationForm.updateValueAndValidity();
      },
      (error) => {
        // this.goBack()
        this.isLoadingSpinner = false;
      }
    );
  }

  fetchTimeOnEditAI():void{
    const dateTime = moment(this.formControls.aiDate.value).subtract(5, 'hour')
    .subtract(30, 'minute')
    this.addArtificialInseminationForm.get('aiTimestamp').setValue(dateTime.format('HH:mm'))
  }
  getActivityValue(activityPermissionList,code){
    const activity = activityPermissionList && activityPermissionList.length > 0
    ? activityPermissionList?.filter((obj) => obj.parameterCd == code)
    : [];
    return activity
  }
  fetchDataFromUniqueId(uniqueId:any){
    if (uniqueId) {
      this.isLoadingSpinner = true;
      this.aiService.getUniqueIdDetail(uniqueId).subscribe(
        (data: any) => {
          this.isUniqueIdAvailable = true;
          this.isLoadingSpinner = false;
          this.getStrawDetail = data;
        if(this.commonDetail &&this.commonDetail?.semenType)  
        this.commonDetail.semenType = this.semenList;
          this.addArtificialInseminationForm.patchValue({
            batchNo: data?.batchNo,
            bullId: data?.bullId
          },{emitEvent:false});
                if( this.projectId  
                  && this.projectSemenType 
                  && this.projectSemenType?.length > 0 ){
                    const semenType = (data?.semenType[0]?.cd == this.projectSemenType[0]?.value
                                        || this.projectSemenType[0]?.parameterValue == 'B')
                                         ?  data?.semenType[0]?.cd
                                          : null;
                    if(semenType){
                      this.commonDetail.semenType = this.commonDetail.semenType.filter(
                        obj=>obj.cd == semenType
                      )
                      this.addArtificialInseminationForm
                    .get('semenType')
                    .setValue(semenType)
                    this.addArtificialInseminationForm
                    .get('semenType')
                    .disable()
                    this.addArtificialInseminationForm.get('bullId').disable(); 
                    this.addArtificialInseminationForm.get('batchNo').disable();        
                    this.addArtificialInseminationForm.updateValueAndValidity();
                    }
                    
                    else{
                      this.resetForm()
                       this.alertDialog("animalBreeding.semen_type_mapped")
                      this.commonDetail.semenType = []
                    }
          }else{
            this.addArtificialInseminationForm
            .get('semenType')
            .setValue(data?.semenType[0]?.cd);
            this.addArtificialInseminationForm
                    .get('semenType')
                    .disable()
            this.addArtificialInseminationForm.get('bullId').disable(); 
          this.addArtificialInseminationForm.get('batchNo').disable();        
          this.addArtificialInseminationForm.updateValueAndValidity();
        
            this.formControls.semenType.disable();
          }
          this.isLoadingSpinner = false;
         
        },
        (error) => {
          this.isUniqueIdAvailable = false;
          this.isLoadingSpinner = false;
          this.formControls.semenType.enable();
          this.formControls.semenType.reset();
          this.addArtificialInseminationForm.get('batchNo').enable();
          this.addArtificialInseminationForm.get('bullId').enable();
          this.addArtificialInseminationForm.get('batchNo').reset();
          this.addArtificialInseminationForm.get('bullId').reset();
          this.addArtificialInseminationForm.get('aiType').reset();
          this.addArtificialInseminationForm.updateValueAndValidity();
        }
      );
    } else {
      this.isUniqueIdAvailable = false;
      this.isLoadingSpinner = false;
      this.addArtificialInseminationForm.get('batchNo').enable();
      this.addArtificialInseminationForm.get('bullId').enable();
      this.addArtificialInseminationForm.get('batchNo').reset();
      this.addArtificialInseminationForm.get('bullId').reset();
      this.addArtificialInseminationForm.get('aiType').reset();
      this.addArtificialInseminationForm.updateValueAndValidity();
    }
  }
  isSemenTypeAvailable(){
    const isUniqueIdAvailable = this.addArtificialInseminationForm.get("uniqueStrawId").value
    if(isUniqueIdAvailable){
      this.resetForm()
    }
    else if(this.projectId && this.projectSemenType 
        && this.projectSemenType?.length > 0
        && this.formControls?.bullId?.value){
    this.sortDataAcordingToProject(this.projectSemenType)
      }
    // }else{
    //   this.resetForm()
    // }
   
  }
  sortDataAcordingToProject(projectObj){
    const semenType :any = this.bullDetails?.filter((el) => {
      return projectObj.some((f) => {
        return (f?.value == el?.cd || f?.parameterValue == 'B' || ((f?.value == 1 || f?.value == 2) && el?.cd == 3) );
      });
    });
            if(semenType?.length > 0){
              this.commonDetail.semenType =  this.semenList.filter(c => projectObj
               .find(s => (s?.value == c?.cd || semenType[0].cd ==c?.cd && s?.value == 3 || semenType[0].cd == s?.value && semenType[0].cd == 3) ))
               this.formControls.semenType.enable()
            }else{
              this.alertDialog("animalBreeding.semen_type_mapped")
              this.commonDetail.semenType.length = 0
              this.formControls.semenType.setValue(null)
              this.formControls.semenType.enable()
            }
  }
  resetForm():void{
    this.commonDetail.semenType = this.semenList
    const formList = [
      'semenType',
      'batchNo',
      'aiCenterId',
    ];
    this.dataService._enableDisableFormKeys(
      this.formControls,
      formList,
      'enable'
    );
    this.formControls.aiType.disable()
    this.formControls.bullId.enable({emitEvent:false})
    this.addArtificialInseminationForm.reset(
      {
        aiDate:this.today,
        aiRecordDate:this.today,
        aiTimestamp: moment(this.currentDate).format('HH:mm'),
      },{emitEvent:false}
     )
     
  }

  isTestPlanSelectedValidation(isWarningVisible?:boolean){
    if(this.projectId && (this.projectId != '0' || this.projectId != 0)){
      const selected_project = this.projectDetails.filter(project=>project == this.projectId)
      if(selected_project && selected_project?.length == 0){
        this.planWarning ='animalBreeding.test-plan-project-warning'
        if(isWarningVisible)this.alertDialog(this.planWarning); 
        this.isprojectDetailsMatch = true
      }else{
        this.isprojectDetailsMatch = false
      }
    }else{
      this.isprojectDetailsMatch = true
      this.planWarning ='animalBreeding.commonLabel.select_project'
     if(isWarningVisible) this.alertDialog(this.planWarning); 
    }

  }
}
