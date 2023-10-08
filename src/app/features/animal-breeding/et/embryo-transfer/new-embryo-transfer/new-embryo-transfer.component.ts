import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { animalBreedingPRConfig } from 'src/app/shared/animal-breeding-pr.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { AlphaNumericSpecialValidation } from 'src/app/shared/utility/validation';
import { SaveDialogComponent } from '../../../pregnancy-diagnosis/save-dialog/save-dialog.component';
import { EtService } from '../../et.service';
import { Location } from '@angular/common';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-new-embryo-transfer',
  templateUrl: './new-embryo-transfer.component.html',
  styleUrls: ['./new-embryo-transfer.component.css'],
  providers: [TranslatePipe],
})
export class NewEmbryoTransferComponent implements OnInit {
  currentDate = sessionStorage.getItem('serverCurrentDateTime');
  addEmbryoTransferForm!: FormGroup;
  animalHistoryDetail!: any;
  isLoadingSpinner: boolean = false;
  isbullId: boolean = false;
  historyDetail: object = {};
  getCommonMasterDetail: Array<{}> = [];
  animalDetals: object = {};
  breedingMinDate = '';
  tagId: number;
  ownerDetails: any;
  embryoList: any[] = [];
  constructor(
    private _fb: FormBuilder,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private etService: EtService,
    private dataService: DataServiceService,
    private translatePipe: TranslatePipe,
    private location: Location
  ) {}

  get today() {
    return moment(this.currentDate).format('YYYY-MM-DD');
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (!params['tagId']) {
        this.router.navigate(['/not-found']);
        return false;
      }
      this.tagId = params['tagId'];
      return true;
    });
    this.historyDetail = {
      compDetail: 'ET',
      newPageUrl: 'new-embryo-transfer',
      apiType: 'apiUrlBreedingModule',
      apiUrl: 'animalbreeding/history/getBreedingHistory?tagId=',
      tagId: this.tagId,
      isHistory: false,
      name: 'animalBreeding.et',
    };
    this.initHeatTransactionForm();
    this.getCommonMaster();

    const req1 = this.dataService.getDefaultConfig(
      animalBreedingPRConfig.backdate.EmbryoTransferBackdate
    );

    const req2 = this.etService.getAssociatedEmbryoIds();

    this.isLoadingSpinner = true;
    forkJoin([req1, req2]).subscribe(
      ([config, embryos]) => {
        this.breedingMinDate = moment(this.currentDate)
          .subtract(config.defaultValue, 'days')
          .format('YYYY-MM-DD');

        this.embryoList = embryos;
        this.isLoadingSpinner = false;
      },
      () => (this.isLoadingSpinner = false)
    );
  }
  submitHeatTransaction(): void {
    if (this.addEmbryoTransferForm.invalid) {
      this.addEmbryoTransferForm.markAllAsTouched();
      return;
    }
    this.isLoadingSpinner = true;
    const formValue = {
      ...this.addEmbryoTransferForm.value,
    };

    formValue.animalId = this.ownerDetails.animalId;
    formValue.tagId = this.tagId;
    formValue.etRecordDate = this.today;
    formValue.heatType = 1;
    this.etService
      .saveETDetails(formValue)
      .pipe(
        switchMap((res: any) => 
        {
          if(res && (res?.msg?.msgCode == 3558)){
            return this.dialog
            .open(ConfirmationDialogComponent, {
              data: {
                title: this.translatePipe.transform('common.info_label'),
                icon: 'assets/images/info.svg',
                message: res?.msg?.msgDesc,
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
                title: res?.msg?.msgDesc,
                transaction_id: res?.data?.etId ?? res?.etId,
              },
              width: '500px',
              panelClass: 'makeItMiddle',
            })
            .afterClosed();
          }
          
        }
       
        )
      )
      .subscribe(
        (res) => {
          this.addEmbryoTransferForm.reset({
            etRecordDate: this.addEmbryoTransferForm.get('etRecordDate').value,
            etDate: this.addEmbryoTransferForm.get('etDate').value,
          });
          // this.shareDataService.setData(this.historyDetail)
          this.isLoadingSpinner = false;
          this.goBack();
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
  }

  verifyIds(event): void {
    const id = event;
    if (id == null) {
      return;
    }
    this.isLoadingSpinner = true;
    this.etService.verifyEmbryoID(id).subscribe(
      (data) => {
        this.isLoadingSpinner = false;
        this.animalDetals = data;
        if (this.animalDetals) {
          this.addEmbryoTransferForm.patchValue({
            donorTagId: this.animalDetals['donorTagId'],
            sireId: this.animalDetals['sireId'],
            embryoAge: this.animalDetals['embryoAge'],
            embryoGrade: this.animalDetals['embryoGrade'],
            embryoType: this.animalDetals['embryoType'],
            embryoStage: this.animalDetals['embryoStage'],
            breed: this.animalDetals['sireBreed'],
          });
        }
      },
      (error) => {
        this.isLoadingSpinner = false;
        this.formControls.embryoId.reset();
      }
    );
  }
  getOwnerId(param: any) {
    this.ownerDetails = param?.animalResponse;
  }
  get formControls() {
    return this.addEmbryoTransferForm.controls;
  }
  private initHeatTransactionForm(): void {
    this.addEmbryoTransferForm = this._fb.group({
      etRecordDate: [
        { value: this.today, disabled: true },
        [Validators.required],
      ],
      etDate: [
        this.today,
        { updateOn: 'blur', validators: [Validators.required] },
      ],
      embryoId: [null, [Validators.required]],
      breed: [{ value: '', disabled: true }],
      sireId: [{ value: '', disabled: true }],
      donorTagId: [{ value: '', disabled: true }],
      embryoType: [{ value: '', disabled: true }],
      recipientGrade: [null, [Validators.required]],
      clGrade: [null, [Validators.required]],
      transferHorn: [null, [Validators.required]],
      transferHornSite: [null, [Validators.required]],
      transferGrade: [null, [Validators.required]],
      // modifiedBy:['RAJ06290'],
      // createdBy:['RAJ06290'],
      embryoAge: [{ value: '', disabled: true }],
      embryoGrade: [{ value: '', disabled: true }],
      embryoStage: [{ value: '', disabled: true }],
      remarks: ['', AlphaNumericSpecialValidation],
    });
    this.addEmbryoTransferForm
      .get('etDate')
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
            .subscribe(() => this.addEmbryoTransferForm.get('etDate').reset());
        }
      });
  }
  private getCommonMaster(): void {
    this.isLoadingSpinner = false;
    const key = [
      'transfer_grade',
      'transfer_horn',
      'transfer_horn_site',
      'cl_grade',
      'recipient_grade',
      'embryo_type',
      'embryo_grade',
      'embryo_stage',
    ];
    key.forEach((val) => {
      this.etService.getCommonMaster(val).subscribe(
        (data) => {
          this.isLoadingSpinner = false;
          this.getCommonMasterDetail[val] = data;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    });
  }
  goBack() {
    this.location.back();
  }
}
