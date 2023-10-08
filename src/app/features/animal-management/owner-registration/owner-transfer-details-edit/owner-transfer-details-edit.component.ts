import { AnimalManagementService } from './../../animal-registration/animal-management.service';
import { GetAllOwners } from './../models-owner-reg/getAllOwners.model';
import { OwnerDetailsService } from './../owner-details.service';
import { Component, Inject, OnInit, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  NameValidation,
  MobileValidation,
  TagIdSearchValidation,
} from '../../../../shared/utility/validation';
import { OwnerTransferDialogComponent } from '../owner-transfer-dialog/owner-transfer-dialog.component';
import { OwnerTransferService } from '../owner-transfer/owner-transfer.service';
import { CommonData } from '../models-owner-reg/common-data.model';
import { DatePipe } from '@angular/common';
import {
  AnimalRegistrationList,
  CompleteOwnerDetails,
} from '../models-owner-reg/get-ownerby-ownerID.model';
import { OwnerData } from '../models-owner-reg/get-owner-details.model';
import { TransferDetail } from '../models-owner-reg/ownership-transfer-response';
import { OwnerTransferInitiation } from '../models-owner-reg/ownership-transfer.model';
import { AnimalManagementConfig } from 'src/app/shared/animal-management.config';
import { TranslatePipe } from '@ngx-translate/core';
import { AppService } from 'src/app/shared/shareService/app.service';
import moment from 'moment';
import { ConfirmationDialogComponent } from '../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { Router } from '@angular/router';
import { encryptText } from 'src/app/shared/shareService/storageData';
import { AnimalResult } from '../../animal-registration/models-animal-reg/tagId-search.model';
import { OrgList } from '../../animal-registration/models-animal-reg/org-list.model';
import { AnimalDetailService } from '../../animal-registration/animal-details/animal-detail.service';
import { MatTableDataSource } from '@angular/material/table';
@Component({
  selector: 'app-owner-transfer-details-edit',
  templateUrl: './owner-transfer-details-edit.component.html',
  styleUrls: ['./owner-transfer-details-edit.component.css'],
  providers: [DatePipe, TranslatePipe],
})
export class OwnerTransferDetailsEditComponent implements OnInit {
  onClosed = new EventEmitter();
  detailNotFound: boolean = false;
  isLoadingSpinner: boolean = false;
  buyerDetailForm!: FormGroup;
  miscDetailsForm!: FormGroup;
  searchForm!: FormGroup;
  buyerinfofill: boolean = false;
  isBuyerTableVisible: boolean = false;
  ownerDetailsRecord: OwnerData[] = [];
  confSection: boolean = false;
  animalTagIds: string[] = [];
  animalData: AnimalRegistrationList[] = [];
  dateToday: Date;
  orgsList!: OrgList[];
  orgValue?: number;
  registrationDateToday = '';
  searchedNumber: string = '';
  searchedName: string = '';
  newOwnerId: string = '';
  ownershipTransferPayload!: OwnerTransferInitiation;
  ownerDetailsByID!: CompleteOwnerDetails;
  noOfAnimalsSelected: number = 0;
  disableButtons: boolean = false;
  errorMessage: string = '';
  isInactiveAadhaarUser = false;
  animalIds: string[] = [];
  reasonForTransfer: CommonData[] = [];
  transferredAnimalDetails: TransferDetail[] = [];
  allOwners!: GetAllOwners;
  currentDate: string = '';
  lastTranscDate = new Date(null);
  isOwnershipTransfer: boolean = true;
  searchBy: string = 'individual';
  tableDataSourceOwner = new MatTableDataSource<OwnerData>();
  ownerSearchResult: string[] = ['ownerId', 'ownerName', 'arrow'];
  animalPageIndex = 0;
  animalPageSize = 10;
  animalsCount = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { oldOwnerId: string },
    public dialog: MatDialog,
    private ownerTS: OwnerTransferService,
    private fb: FormBuilder,
    private ownerDS: OwnerDetailsService,
    private animalMS: AnimalManagementService,
    private animalDS: AnimalDetailService,
    private datePipe: DatePipe,
    private translatePipe: TranslatePipe,
    private appService: AppService,
    private route: Router,
    private dialogRef: MatDialogRef<OwnerTransferDetailsEditComponent>
  ) {}

  ngOnInit(): void {
    this.getCurrentDate();
    this.animalData = this.ownerTS.getAnimalData();
    this.animalDS.getOrgs().subscribe((data: OrgList[]) => {
      this.orgsList = data;
    });
    if (this.animalData[0].animalStatusCd == 1) {
      this.isOwnershipTransfer = true;
    } else if (
      this.animalData[0].animalStatusCd == 5 ||
      this.animalData[0].animalStatusCd == 6
    ) {
      this.isOwnershipTransfer = false;
    }
    this.ownerDS
      .getCommonData('reason_for_transfer')
      .subscribe((reasonForTransfer) => {
        this.reasonForTransfer = reasonForTransfer.filter(
          (ele) => +ele.cd != 4
        );
      });
    this.searchForm = this.fb.group({
      optRadio: [this.searchBy],
      searchValue: ['', [Validators.required, TagIdSearchValidation]],
    });
    this.buyerDetailForm = this.fb.group({
      newOwnerName: [this.searchedName, [Validators.required, NameValidation]],
      newOwnerMobileNo: [
        this.searchedNumber,
        [Validators.required, MobileValidation],
      ],
      newOwnerAddress: [],
    });
    this.miscDetailsForm = this.fb.group({
      oldOwnerId: [this.data?.oldOwnerId],
      ownershipTransferDate: [this.dateToday, Validators.required],
      reasonForTransfer: [null, [Validators.required]],
    });
    this.noOfAnimalsSelected = this.animalData.length;
    this.getCommonData();
    this.getLastTransactiondate();
  }

  addAnimalIdsToList() {
    this.animalIds = [];
    for (let i = 0; i < this.animalData.length; i++) {
      this.animalIds.push(String(this.animalData[i].animalId));
    }
  }

  getCurrentDate() {
    this.isLoadingSpinner = true;
    this.animalMS.getCurrentDate().subscribe(
      (date) => {
        this.dateToday = new Date(Date.parse(date.value));
        this.registrationDateToday = date.value;
        this.miscDetailsForm.patchValue({
          ownershipTransferDate: this.dateToday,
        });
        this.miscDetailsForm.updateValueAndValidity();
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  getOrgDetails() {
    if (this.orgValue != 0 && String(this.orgValue).startsWith('2')) {
      this.getOwnerDetailsByID(String(this.orgValue));
    } else if (this.orgValue == undefined) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translatePipe.transform('common.info_label'),
          icon: 'assets/images/info.svg',
          message: this.translatePipe.transform('animalDetails.select_org'),
          primaryBtnText: this.translatePipe.transform('common.ok_string'),
        },
        panelClass: 'common-info-dialog',
      });
    } else {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translatePipe.transform('common.info_label'),
          icon: 'assets/images/info.svg',
          message: this.translatePipe.transform('errorMsg.not_valid_org'),
          primaryBtnText: this.translatePipe.transform('common.ok_string'),
        },
        panelClass: 'common-info-dialog',
      });
    }
  }

  getLastTransactiondate() {
    this.isLoadingSpinner = true;
    this.addAnimalIdsToList();
    this.animalMS.getLastTransactionDate(this.animalIds).subscribe(
      (date) => {
        this.isLoadingSpinner = false;
        if (date.value) {
          this.lastTranscDate = new Date(Date.parse(date.value));
        }
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  getPastDate(): string {
    var tempDate = new Date(this.dateToday);
    let transferDate =
      +AnimalManagementConfig.ownershipTransferDateLimit?.defaultValue || 30;
    tempDate.setDate(tempDate.getDate() - transferDate);
    this.currentDate = (
      tempDate > this.lastTranscDate ? tempDate : this.lastTranscDate
    )
      .toLocaleString()
      .split(',')[0];
    let date = moment(Date.parse(this.currentDate)).format('YYYY-MM-DD');
    return date;
  }

  searchResults(searchValue: string) {
    // this.animalData = [];
    this.animalPageIndex = 0;
    this.animalPageSize = 10;
    this.animalsCount = 0;
    if (this.searchForm.invalid) {
      // this.isTableVisible = false;
      // this.isOwnerTabVisible = false;
      // this.isAnimalTabVisible = false;
      this.searchForm.markAllAsTouched();
      // if (!isNaN(Number(this.searchForm.get('searchValue')?.value))) {
      //   if ((this.searchForm.get('searchValue')?.value).length < 10) {
      //     this.errorMessage = this.translatePipe.transform(
      //       'errorMsg.mobile_start'
      //     );
      //   } else {
      //     this.errorMessage = this.translatePipe.transform(
      //       'errorMsg.invalid_input'
      //     );
      //   }
      // } else {
      //   this.errorMessage = this.translatePipe.transform(
      //     'errorMsg.owner_name_err'
      //   );
      // }
      if (!isNaN(Number(searchValue)) && searchValue.length > 0) {
        if (searchValue.length > 10) {
          this.errorMessage = this.translatePipe.transform(
            'errorMsg.check_field'
          );
        } else {
          this.errorMessage = this.translatePipe.transform(
            'errorMsg.mobile_start'
          );
        }
      } else if (searchValue.length == 0) {
        this.errorMessage = this.translatePipe.transform(
          'errorMsg.enter_value'
        );
      } else {
        this.errorMessage = this.translatePipe.transform(
          'errorMsg.owner_name_err'
        );
      }
      return;
    } else {
      this.miscDetailsForm.markAsUntouched();
      if (
        (searchValue.length == 8 ||
          searchValue.length == 11 ||
          searchValue.length == 12) &&
        !isNaN(+searchValue)
      ) {
        this.getDetailsByTagID(searchValue);
      } else {
        this.errorMessage = '';
        this.detailNotFound = false;
        this.buyerinfofill = false;
        this.confSection = false;
        this.isLoadingSpinner = true;
        this.miscDetailsForm.patchValue({ reasonForTransfer: null });
        this.miscDetailsForm.get('reasonForTransfer').markAsUntouched;
        this.ownerDS
          .getOwnerByMobile(
            searchValue,
            this.searchBy == 'nonIndividual' ? true : false
          )
          .subscribe(
            (data: OwnerData[]) => {
              this.tableDataSourceOwner = new MatTableDataSource(data);
              this.ownerDetailsRecord = data;
              this.isLoadingSpinner = false;
              this.isBuyerTableVisible = true;
              if (this.ownerDetailsRecord.length > 1) {
                // this.isTableVisible = true;
                // this.isOwnerTabVisible = false;
                // this.isAnimalTabVisible = false;
              } else if (this.ownerDetailsRecord.length == 1) {
                // this.isTableVisible = false;
                this.getOwnerDetailsByID(this.ownerDetailsRecord[0].ownerId);
              } else {
                this.checkSearchValidity(true);
                this.isBuyerTableVisible = false;
                this.buyerDetailForm.patchValue({
                  newOwnerMobileNo: '',
                  newOwnerName: '',
                });
                if (
                  this.searchForm.controls.searchValue.value.length == 10 &&
                  !isNaN(Number(this.searchForm.controls.searchValue.value))
                ) {
                  this.buyerDetailForm.controls['newOwnerMobileNo'].setValue(
                    this.searchForm.controls.searchValue.value
                  );
                  this.buyerDetailForm.get('newOwnerMobileNo')?.markAsTouched();
                } else if (
                  isNaN(Number(this.searchForm.controls.searchValue.value))
                ) {
                  this.buyerDetailForm.controls['newOwnerName'].setValue(
                    this.searchForm.controls.searchValue.value
                  );
                }
              }
            },
            (error) => {
              this.isLoadingSpinner = false;
            }
          );
      }
    }
  }

  getDetailsByTagID(searchValue: string) {
    this.errorMessage = '';
    this.isLoadingSpinner = true;
    this.confSection = false;
    this.detailNotFound = false;
    this.buyerinfofill = false;
    this.animalMS.getDetailsByTagID(searchValue).subscribe(
      (searchResult: AnimalResult) => {
        this.isLoadingSpinner = false;
        this.ownerDetailsByID = searchResult.ownerDetails;
        this.animalsCount = 1;
        // this.isOwnerActive =
        //   this.ownerDetailsByID.registrationStatus == '2' ? false : true;
        // for (let key of this.animalKeys) {
        //   animalList[key] = searchResult[key];
        // }
        // this.tableDataSource = new MatTableDataSource([animalList]);
        // this.isTableVisible = false;
        if (searchResult.ownerDetails.ownerId) {
          this.searchForm.patchValue({
            optRadio:
              searchResult.ownerDetails?.ownerTypeCd === 1
                ? 'individual'
                : 'nonIndividual',
          });
          this.searchBy = String(searchResult.ownerDetails.ownerId).startsWith(
            '1'
          )
            ? 'individual'
            : 'nonIndividual';
          // this.ownerDetailsSection = true;
          // this.animalDetailsSection = true;
          // this.isOrgTabVisible = false;
        } else {
          // this.isOrgTabVisible = true;
          this.searchForm.patchValue({ optRadio: 'organization' });
          // this.searchBy = 'organization';
          // this.isOrgTabVisible = true;
          // this.ownerDetailsSection = false;
          // this.animalDetailsSection = true;
        }
        if (searchResult.ownerDetails) {
          this.detailNotFound = false;
          this.buyerinfofill = false;
          this.isBuyerTableVisible = false;
          this.newOwnerId = this.ownerDetailsByID.ownerId
            ? this.ownerDetailsByID.ownerId
            : this.ownerDetailsByID.orgId;
          this.buyerDetailForm.patchValue({
            newOwnerName: this.ownerDetailsByID.ownerName
              ? this.ownerDetailsByID.ownerName
              : this.ownerDetailsByID.orgName,
            newOwnerMobileNo: this.ownerDetailsByID.ownerMobileNo
              ? this.ownerDetailsByID.ownerMobileNo
              : this.ownerDetailsByID.orgMobileNo,
            newOwnerAddress: this.ownerDetailsByID.ownerAddress
              ? this.ownerDetailsByID.ownerAddress
              : this.ownerDetailsByID?.orgAddress,
          });
          this.confSection = true;
        } else {
          this.checkSearchValidity();
          this.isBuyerTableVisible = false;
          this.buyerDetailForm.patchValue({
            newOwnerMobileNo: '',
            newOwnerName: '',
          });
        }
      },
      (error) => {
        this.isLoadingSpinner = false;
        this.checkSearchValidity();
        this.buyerinfofill = false;
        this.isBuyerTableVisible = false;
        this.buyerDetailForm.patchValue({
          newOwnerMobileNo: '',
          newOwnerName: '',
        });
      }
    );
  }

  onFormClick() {
    if (this.searchForm.invalid) {
      if (!isNaN(Number(this.searchForm.get('searchValue')?.value))) {
        if ((this.searchForm.get('searchValue')?.value).length < 10) {
          this.errorMessage = this.translatePipe.transform(
            'errorMsg.mobile_start'
          );
        } else {
          this.errorMessage = this.translatePipe.transform(
            'errorMsg.invalid_input'
          );
        }
      } else {
        this.errorMessage = this.translatePipe.transform(
          'errorMsg.owner_name_err'
        );
      }
    } else {
      this.errorMessage = '';
      this.detailNotFound = false;
      this.buyerinfofill = false;
      this.confSection = false;
      this.isLoadingSpinner = true;
      this.miscDetailsForm.patchValue({ reasonForTransfer: null });
      this.miscDetailsForm.get('reasonForTransfer').markAsUntouched();
      this.ownerDS
        .getAllOwners(this.searchForm.get('searchValue')?.value)
        .subscribe(
          (ownersFound) => {
            this.isLoadingSpinner = false;
            this.allOwners = ownersFound;
            if (
              this.allOwners?.individualOwners?.length > 0 ||
              this.allOwners?.orgOwners?.length > 0
            ) {
              this.isBuyerTableVisible = true;
            } else if (
              this.allOwners.individualOwners == undefined &&
              this.allOwners.orgOwners == undefined
            ) {
              this.isLoadingSpinner = false;
              this.isBuyerTableVisible = false;
              this.detailNotFound = true;
              this.buyerinfofill = false;
              this.confSection = false;
              this.buyerDetailForm.patchValue({
                newOwnerMobileNo: '',
                newOwnerName: '',
              });
              if (
                this.searchForm.controls.searchValue.value.length == 10 &&
                !isNaN(Number(this.searchForm.controls.searchValue.value))
              ) {
                this.buyerDetailForm.controls['newOwnerMobileNo'].setValue(
                  this.searchForm.controls.searchValue.value
                );
                this.buyerDetailForm.get('newOwnerMobileNo')?.markAsTouched();
              } else if (
                isNaN(Number(this.searchForm.controls.searchValue.value))
              ) {
                this.buyerDetailForm.controls['newOwnerName'].setValue(
                  this.searchForm.controls.searchValue.value
                );
              }
            }
          },
          (error) => {
            this.isLoadingSpinner = false;
          }
        );
    }
  }

  getOwnerDetailsByID(ownerId: string) {
    this.isLoadingSpinner = true;
    this.confSection = false;
    this.detailNotFound = false;
    this.ownerDS
      .getOwnerByOwnerID(
        ownerId,
        this.searchBy == 'nonIndividual' ? true : false,
        this.animalPageIndex,
        this.animalPageSize
      )
      .subscribe(
        (data: CompleteOwnerDetails) => {
          this.isLoadingSpinner = false;
          this.ownerDetailsByID = data;
          this.animalsCount = data.animalsCount;
          if (data) {
            this.detailNotFound = false;
            this.buyerinfofill = false;
            this.isBuyerTableVisible = false;
            this.newOwnerId = this.ownerDetailsByID.ownerId
              ? this.ownerDetailsByID.ownerId
              : this.ownerDetailsByID.orgId;
            this.buyerDetailForm.patchValue({
              newOwnerName: this.ownerDetailsByID.ownerName
                ? this.ownerDetailsByID.ownerName
                : this.ownerDetailsByID.orgName,
              newOwnerMobileNo: this.ownerDetailsByID.ownerMobileNo
                ? this.ownerDetailsByID.ownerMobileNo
                : this.ownerDetailsByID.orgMobileNo,
              newOwnerAddress: this.ownerDetailsByID.ownerAddress
                ? this.ownerDetailsByID.ownerAddress
                : this.ownerDetailsByID?.orgAddress,
            });
            this.confSection = true;
          }
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
  }

  continueWithoutReg() {
    this.detailNotFound = false;
    this.newOwnerId = '';
    this.buyerinfofill = true;
  }

  onSelectingSearchBy(event: Event) {
    this.searchBy = (event.target as HTMLInputElement)?.value;
    this.isBuyerTableVisible = false;
    this.detailNotFound = false;
    this.buyerinfofill = false;
    this.confSection = false;
    this.animalPageIndex = 0;
    this.animalPageSize = 10;
    this.animalsCount = 0;
  }

  checkSearchValidity(isOwnerSearch?: boolean) {
    this.detailNotFound = true;
    // if (isOwnerSearch) {
    //   this.dialog.open(ConfirmationDialogComponent, {
    //     data: {
    //       title: this.translatePipe.transform('common.info_label'),
    //       icon: 'assets/images/info.svg',
    //       message: this.translatePipe.transform('errorMsg.no_owner_found'),
    //       primaryBtnText: this.translatePipe.transform('common.ok_string'),
    //     },
    //     panelClass: 'common-info-dialog',
    //   });
    // }
    if (
      this.searchForm.get('searchValue')?.value.length == 10 &&
      !isNaN(Number(this.searchForm.get('searchValue')?.value))
    ) {
      // this.ownerInfoForm.patchValue({
      //   ownerMobileNo: this.searchForm.get('searchValue')?.value,
      //   ownerName: '',
      // });
    } else if (isNaN(Number(this.searchForm.get('searchValue')?.value))) {
      // this.ownerInfoForm.patchValue({
      //   ownerName: this.searchForm.get('searchValue')?.value,
      //   ownerMobileNo: '',
      // });
    }
    // this.isTableVisible = false;
    // this.ownerDetailsSection = false;
    // this.isOrgTabVisible = false;
    // this.animalDetailsSection = false;
  }

  resetValue() {
    this.searchForm.patchValue({ searchValue: '' });
    this.errorMessage = '';
    this.isBuyerTableVisible = false;
    this.confSection = false;
    this.buyerinfofill = false;
    this.detailNotFound = false;
  }

  onSaveExit() {
    if (this.buyerDetailForm.invalid || this.disableButtons) {
      this.buyerDetailForm.markAllAsTouched();
    } else {
      this.buyerinfofill = false;
      this.confSection = true;
    }
  }

  get searchInfo() {
    return this.searchForm.controls;
  }

  onClosingDialog() {
    this.animalData = this.ownerTS.getAnimalData();
  }

  onClickingRemove(data: AnimalRegistrationList) {
    this.animalData.forEach((value, index) => {
      if (value == data) this.animalData.splice(index, 1);
    });
    this.ownerTS.setSelectedTags(this.animalTagIds);
    if (this.noOfAnimalsSelected > 1) {
      this.noOfAnimalsSelected -= 1;
    } else {
      this.disableButtons = true;
      this.dialogRef.close();
    }
    this.getLastTransactiondate();
  }

  getCommonData() {
    this.ownerDS.getCommonData('reason_for_transfer').subscribe((reasons) => {
      this.reasonForTransfer = reasons.filter((ele) => +ele.cd != 4);
    });
    if (this.animalData[0].ownerId) {
      this.ownerDS
        .getOwnerByOwnerID(
          this.animalData[0].ownerId,
          this.searchBy == 'nonIndividual' ? true : false,
          this.animalPageIndex,
          this.animalPageSize
        )
        .subscribe((data) => {
          if (data.registrationStatus === '3') {
            this.isInactiveAadhaarUser = true;
          }
        });
    } else {
      this.isInactiveAadhaarUser = false;
    }
  }

  openOwnerTransferDialog() {
    if (this.miscDetailsForm.invalid && this.isOwnershipTransfer) {
      this.miscDetailsForm.markAllAsTouched();
    } else if (!this.isOwnershipTransfer && this.miscDetailsForm.invalid) {
      this.isLoadingSpinner = true;
      this.ownerTS
        .generateOtpForTransfer(this.newOwnerId, this.animalIds)
        .subscribe(
          (data: any) => {
            if (!data?.isOtpInitiated) {
              this.skipVerification();
            }
            this.isLoadingSpinner = false;
            this.dialogRef.close();
            const dialogRef = this.dialog.open(OwnerTransferDialogComponent, {
              data: {
                noOfAnimals: this.animalData.length,
                currentOwner: this.ownerTS.getOwnerName(),
                newOwner: this.buyerDetailForm.value,
                otpSentTo: String(
                  this.buyerDetailForm?.get('newOwnerMobileNo')?.value
                ),
                animalIds: this.animalIds,
                newOwnerId: this.newOwnerId,
                isClaimOwnership: true,
              },
              width: '500px',
            });
            dialogRef.afterClosed().subscribe((res) => {
              this.animalData.length = 0;
              this.ownerTS.setSoldFlagStatus(true);
              this.onClosed.emit();
            });
          },
          (err) => {
            this.isLoadingSpinner = false;
          }
        );
    } else {
      this.animalIds = [];
      this.isLoadingSpinner = true;
      this.ownerTS.setSoldFlagStatus(true);
      const formValue = this.miscDetailsForm.value;
      formValue.ownershipTransferDate = moment(
        formValue.ownershipTransferDate
      ).format('YYYY-MM-DD');
      for (let i = 0; i < this.animalData.length; i++) {
        this.animalIds.push(String(this.animalData[i].animalId));
      }
      if (this.newOwnerId) {
        var newID = { newOwnerId: this.newOwnerId, animalIds: this.animalIds };
        this.ownershipTransferPayload = {
          ...this.miscDetailsForm.value,
          ...newID,
        };
        // this.ownershipTransferPayload['locationInfo'] =
        //   AnimalManagementConfig.locationInfoObj;
      } else {
        let buyerDetailsValue = JSON.parse(
          JSON.stringify(this.buyerDetailForm.value)
        );
        buyerDetailsValue.newOwnerMobileNo = encryptText(
          buyerDetailsValue.newOwnerMobileNo
        );
        const animalId = { animalIds: this.animalIds };
        this.ownershipTransferPayload = {
          ...this.miscDetailsForm.value,
          ...buyerDetailsValue,
          ...animalId,
        };
        // this.ownershipTransferPayload['locationInfo'] = {
        //   userId: 101,
        //   latitude: 'latitude1',
        //   longitude: 'longitude1',
        //   roleCd: 1,
        //   projectId: 2878,
        //   subModuleCd: 3,
        //   villageCd: 76,
        // };
      }
      this.ownershipTransferPayload.isInactiveAadhaarUser =
        this.isInactiveAadhaarUser;
      console.log(this.ownershipTransferPayload);
      this.appService.getModulebyUrl('/owner/ownertransfer');
      this.ownerTS
        .ownershipTransferInitiation(this.ownershipTransferPayload, false)
        .subscribe(
          (transferRes: TransferDetail[]) => {
            this.transferredAnimalDetails = transferRes;
            this.isLoadingSpinner = false;

            const dialogRef = this.dialog.open(OwnerTransferDialogComponent, {
              data: {
                noOfAnimals: this.animalData.length,
                currentOwner: this.ownerTS.getOwnerName(),
                newOwner: this.buyerDetailForm.value,
                otpSentTo: String(
                  this.buyerDetailForm.get('newOwnerMobileNo').value
                ),
                ownerTransferDetails: this.transferredAnimalDetails,
                animalIds: this.animalIds,
              },
              width: '500px',
            });
            if (transferRes[0]['supervisorName']) {
              this.dialog.open(ConfirmationDialogComponent, {
                data: {
                  title: this.translatePipe.transform('common.info_label'),
                  icon: 'assets/images/info.svg',
                  message:
                    this.translatePipe.transform(
                      'animalDetails.owner-transfer-success-supervisor'
                    ) + String(transferRes[0]['supervisorName']),
                  primaryBtnText:
                    this.translatePipe.transform('common.ok_string'),
                },
                panelClass: 'common-info-dialog',
              });
            }
            this.dialogRef.close();
            dialogRef.afterClosed().subscribe((res) => {
              this.animalData.length = 0;
              this.onClosed.emit();
            });
          },
          (err) => {
            this.isLoadingSpinner = false;
          }
        );
    }
  }

  skipVerification() {
    this.ownerDS.setOwnerVerifiedFlag(false);
    this.ownerDS.setOwnerRegFlag(true);
    // this.route.navigateByUrl(this.data.header);
    this.dialogRef.close();
  }
}
