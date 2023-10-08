import { TranslatePipe } from '@ngx-translate/core';
import {
  AadhaarValidation,
  AddressValidationFormat,
  AlphaNumericSpecialValidation,
  NameValidation,
  PanCardValidation,
  PinCodeValidation,
  SpecialNameValidation,
} from './../../../../shared/utility/validation';
import { CompleteOwnerDetails } from './../models-owner-reg/get-ownerby-ownerID.model';
import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  AlphaNumericValidation,
  EmailValidation,
  MembershipNumberValidation,
  MobileValidation,
} from '../../../../shared/utility/validation';
import { OwnerDetailsService } from '../owner-details.service';
import { SnackBarMessage } from 'src/app/shared/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
  FLWVillages,
  TehsilList,
} from 'src/app/shared/shareService/model/tehsil.model';
import { DistrictList } from 'src/app/shared/shareService/model/district.model';
import { StateList } from 'src/app/shared/shareService/model/state.model';
import { VillageList } from 'src/app/shared/shareService/model/village.model';
import { CountryService } from 'src/app/shared/shareService/country-service.service';
import { CommonData } from '../models-owner-reg/common-data.model';
import { InstitutionName } from '../models-owner-reg/village-institution-name';
import { OtpDialogComponent } from 'src/app/shared/otp-dialog/otp-dialog.component';
import { AnimalManagementConfig } from 'src/app/shared/animal-management.config';
import { DatePipe } from '@angular/common';
import { ConfigValues } from '../models-owner-reg/config-data.model';
import { AnimalManagementService } from '../../animal-registration/animal-management.service';
import { AffiliationData } from '../models-owner-reg/affiliation-data.model';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AppService } from 'src/app/shared/shareService/app.service';
import moment from 'moment';
import { encryptText } from 'src/app/shared/shareService/storageData';
@Component({
  selector: 'app-edit-owner-details',
  templateUrl: './edit-owner-details.component.html',
  styleUrls: ['./edit-owner-details.component.css'],
  providers: [DatePipe, TranslatePipe],
  // encapsulation: ViewEncapsulation.None,
})
export class EditOwnerDetailsComponent implements OnInit {
  ownerDetailsForm!: FormGroup;
  ownerInfo!: CompleteOwnerDetails;
  stateList: StateList[] = [];
  districtList: DistrictList[] = [];
  tehsilList: TehsilList[] = [];
  villageList: VillageList[] = [];
  isLoadingSpinner: boolean = false;
  addressList: FLWVillages[] = [];
  landHoldings: CommonData[] = [];
  ownerCategory: CommonData[] = [];
  villageInstitutionNames: InstitutionName[] = [];
  institutionList = [];
  isMobileNumberNotEdited: boolean = true;
  isViewOnly: boolean = false;
  ownerAge: ConfigValues = AnimalManagementConfig?.ownerAge;
  ownerName: ConfigValues = AnimalManagementConfig?.ownerNameLength;
  ownerAddress: ConfigValues = AnimalManagementConfig?.ownerAddress;
  dateToday: Date;
  affiliationData: AffiliationData[];
  agencyList = [];
  fatherNameLength = 0;
  ownerNameLength = 0;
  ownerTypeCategory: CommonData[] = [];
  typeCategorySelected = '';
  isIndividual = false;
  panErrorMessage = '';
  isPanUpdated = false;

  constructor(
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
    private ownerDS: OwnerDetailsService,
    private _snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<EditOwnerDetailsComponent>,
    private countryService: CountryService,
    private el: ElementRef,
    private datePipe: DatePipe,
    private animalMS: AnimalManagementService,
    private translatePipe: TranslatePipe,
    private appService: AppService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      ownerData: CompleteOwnerDetails;
      redirectLink: string;
      isView?: boolean;
      isIndividual: boolean;
      panNumber: string;
      dateOfIncorporation: string;
    }
  ) {}

  ngOnInit(): void {
    this.getCurrentDate();
    this.ownerInfo = this.data.ownerData;
    this.ownerNameLength = this.ownerInfo.ownerName.length;
    console.log(this.data.isIndividual);
    if (this.data.isIndividual) {
      this.fatherNameLength = this.ownerInfo.fatherName.length;
    }
    this.fetchFlwAllotedArea();
    this.getCommonAPIData();
    this.ownerDetailsForm = this._formBuilder.group({
      ownerId: this.data?.ownerData.ownerId,
      ownerMobileNo: [
        {
          value: this.ownerInfo.ownerMobileNo,
          disabled: this.isMobileNumberNotEdited,
        },
        [Validators.required, MobileValidation],
      ],
      alternateMobileNo: [
        this.ownerInfo?.alternateMobileNo || '',
        [MobileValidation],
      ],
      emailId: [this.ownerInfo?.emailId, EmailValidation],
      panNumber: [
        this.ownerInfo?.panNumber,
        [Validators.required, PanCardValidation],
      ],
      ownerName: [
        this.ownerInfo?.ownerName,
        [Validators.required, SpecialNameValidation],
      ],

      fatherName: [
        this.ownerInfo?.fatherName,
        [Validators.required, SpecialNameValidation],
      ],
      ownerDateOfBirth: [
        this.ownerInfo?.ownerDateOfbirth,
        [Validators.required],
      ],
      ownerGender: [this.ownerInfo.ownerGender || '', [Validators.required]],
      affiliatedAgencyUnionOrPc: [
        String(this.ownerInfo?.affiliatedAgencyUnionOrPc),
      ],
      villageInstitutionType: [this.ownerInfo.villageInstitutionType || ''],
      villageInstitutionCode: [null],
      agencyName: [''],
      membershipNumber: [
        this.ownerInfo.membershipNumber,
        AlphaNumericSpecialValidation,
      ],
      ownerAddress: [
        this.ownerInfo?.ownerAddress || '',
        [AddressValidationFormat],
      ],
      ownerAddressCityVillageCd: [
        this.ownerInfo.ownerAddressCityVillageCd,
        [Validators.required],
      ],
      ownerAddressTehsilCd: ['', [Validators.required]],
      ownerAddressDistrictCd: ['', [Validators.required]],
      ownerAddressStateCd: ['', [Validators.required]],
      ownerAddressPincode: [{ value: '', disabled: true }],
      ownerLandHoldingCd: [this.ownerInfo.ownerLandHoldingCd || ''],
      isOwnerBelowPovertyLine: [
        this.ownerInfo?.isOwnerBelowPovertyLine == true ? true : false,
      ],
      hhid: [this.ownerInfo?.hhid, AlphaNumericValidation],
      ownerCastCategoryCd: [
        this.ownerInfo?.ownerCastCategoryCd || '',
        [Validators.required],
      ],
      isCategoryVerified: [
        this.ownerInfo?.isCategoryVerified == true ? true : false,
      ],
      isPourerMember: [this.ownerInfo?.isPourerMember == true ? true : false],
      ownerTypeCategoryCd: [
        this.ownerInfo?.ownerTypeCategoryCd || '',
        [Validators.required],
      ],
      dateOfIncorporation: [
        this.ownerInfo?.dateOfIncorporation || '',
        [Validators.required],
      ],
    });
    this.removeControlsIfNonIndividual();
    this.checkAffilatedValidations();
    if (this.data?.isView == true) {
      this.isViewOnly = true;
      this.ownerDetailsForm.disable();
    }
    if (this.ownerInfo.affiliatedAgencyUnionOrPc == true) {
      this.ownerDetailsForm
        .get('villageInstitutionCode')
        ?.addValidators([Validators.required]);
      this.ownerDetailsForm
        .get('villageInstitutionCode')
        ?.updateValueAndValidity();
    }
    this.ownerDetailsForm.get('agencyName').disable();
  }

  get ownerDetails() {
    return this.ownerDetailsForm.controls;
  }

  removeControlsIfNonIndividual() {
    // console.log(this.data.isIndividual);
    if (!this.data.isIndividual) {
      this.ownerDetailsForm.removeControl('ownerCastCategoryCd');
      this.ownerDetailsForm.removeControl('ownerGender');
      this.ownerDetailsForm.removeControl('fatherName');
      this.ownerDetailsForm.removeControl('alternateMobileNo');
      this.ownerDetailsForm.removeControl('isCategoryVerified');
      this.ownerDetailsForm.removeControl('isOwnerBelowPovertyLine');
      this.ownerDetailsForm.removeControl('ownerDateOfBirth');

      this.ownerDetailsForm.updateValueAndValidity();
      // this.ownerDetailsForm.removeControl();
      this.ownerDetailsForm?.addControl(
        'dateOfIncorporation',
        new FormControl('', Validators.required)
      );
      this.ownerDetailsForm?.addControl(
        'ownerTypeCategoryCd',
        new FormControl('', Validators.required)
      );
      this.ownerDetailsForm?.addControl(
        'panNumber',
        new FormControl('', [Validators.required, PanCardValidation])
      );
      this.isIndividual = true;
    } else {
      // this.ownerDetailsForm.removeControl();
      this.ownerDetailsForm?.removeControl('dateOfIncorporation');
      this.ownerDetailsForm?.removeControl('ownerTypeCategoryCd');
      this.ownerDetailsForm.removeControl('panNumber');
      this.ownerDetailsForm.updateValueAndValidity();
      this.ownerDetailsForm.addControl(
        'ownerCastCategoryCd',
        new FormControl('', Validators.required)
      );
      this.ownerDetailsForm.addControl(
        'ownerGender',
        new FormControl('', Validators.required)
      );
      this.ownerDetailsForm.addControl(
        'fatherName',
        new FormControl('', Validators.required)
      );
      this.ownerDetailsForm.addControl(
        'alternateMobileNo',
        new FormControl('', Validators.required)
      );
      this.ownerDetailsForm.addControl(
        'isCategoryVerified',
        new FormControl('', Validators.required)
      );
      this.ownerDetailsForm.addControl(
        'isOwnerBelowPovertyLine',
        new FormControl('', Validators.required)
      );
      this.ownerDetailsForm.addControl(
        'ownerDateOfBirth',
        new FormControl('', Validators.required)
      );
    }
  }

  getAllLists() {
    this.populateVillageInstName();
    this.ownerDetailsForm.patchValue({
      ownerAddressCityVillageCd: this.ownerInfo.ownerAddressCityVillageCd,
    });
  }

  populateVillageInstName(event?: Event) {
    const selectedType = event
      ? +(event.target as HTMLInputElement)?.value
      : this.ownerInfo.villageInstitutionType;
    let tempType = this.institutionList.filter(
      (data) => +data.cd == selectedType
    );
    this.ownerDetailsForm.patchValue({ villageInstitutionCode: null });
    if (Array.isArray(this.affiliationData)) {
      this.affiliationData?.filter((crrRecord) => {
        if (crrRecord.villageInstitutionType == selectedType) {
          this.villageInstitutionNames = [
            ...this.villageInstitutionNames,
            {
              villageInstitutionCd: crrRecord.villageInstitutionCd,
              villageInstitutionName: crrRecord.villageInstitutionName,
            },
          ];
        }
      });
      this.ownerDetailsForm.patchValue({
        villageInstitutionCode: this.ownerInfo.villageInstitutionCode,
      });
    }
    if (!event) {
      this.onSelectingVillageInstName();
    }
  }

  onSelectingTypeCategory(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.typeCategorySelected = this.ownerTypeCategory.filter(
      (crrEle) => crrEle.cd == value
    )[0].value;
  }

  onSelectingVillageInstName(event?, isAgency?: string) {
    if (Array.isArray(this.affiliationData)) {
      this.affiliationData?.filter((crrData) => {
        if (
          crrData.villageInstitutionCd == event?.villageInstitutionCd ||
          this.ownerInfo.villageInstitutionCode
        ) {
          this.agencyList.push({
            cd: crrData.agencyCd,
            value: crrData.agencyName,
          });
          this.ownerDetailsForm.patchValue({ agencyName: crrData.agencyCd });
          return;
        }
      });
    }
    if (!event && isAgency) {
      this.ownerDetailsForm.patchValue({ agencyName: '' });
    }
  }

  addAffiliatedAgencyValidations() {
    this.ownerDetailsForm
      .get('villageInstitutionType')
      .addValidators([Validators.required]);
    this.ownerDetailsForm
      .get('villageInstitutionCode')
      ?.addValidators([Validators.required]);
    this.ownerDetailsForm
      .get('membershipNumber')
      ?.addValidators([Validators.required, MembershipNumberValidation]);
  }

  resetAffiliatedAgencyValues() {
    this.ownerDetailsForm.patchValue({
      membershipNumber: '',
      villageInstitutionCode: null,
      villageInstitutionType: '',
      agencyName: '',
    });
  }

  checkAffilatedValidations() {
    if (this.ownerInfo.affiliatedAgencyUnionOrPc == true) {
      this.addAffiliatedAgencyValidations();
    } else {
      this.resetAffiliatedAgencyValues();
    }
  }

  onSelectingRadioButton(event: Event) {
    this.villageInstitutionNames = [];
    if ((event.target as HTMLInputElement)?.value == 'true') {
      this.addAffiliatedAgencyValidations();
    } else {
      this.ownerDetailsForm.get('villageInstitutionType')?.clearValidators();
      this.ownerDetailsForm.get('villageInstitutionCode')?.clearValidators();
      this.ownerDetailsForm.get('membershipNumber')?.clearValidators();
      this.resetAffiliatedAgencyValues();
    }
    this.ownerDetailsForm
      .get('villageInstitutionType')
      ?.updateValueAndValidity();
    this.ownerDetailsForm
      .get('villageInstitutionCode')
      ?.updateValueAndValidity();
    this.ownerDetailsForm.get('membershipNumber')?.updateValueAndValidity();
    this.ownerDetailsForm.get('villageInstitutionType')?.markAsUntouched();
    this.ownerDetailsForm.get('villageInstitutionCode')?.markAsUntouched();
    this.ownerDetailsForm.get('membershipNumber')?.markAsUntouched();
  }

  // findInvalidControls() {
  //   const controls = this.ownerDetailsForm.controls;
  //   for (const name in controls) {
  //     if (controls[name].invalid) {
  //       console.log('Invalid COntrols', name);
  //     }
  //   }
  // }

  spaceRestict(event: KeyboardEvent) {
    if (
      (event.target as HTMLInputElement)?.selectionStart === 0 &&
      event.code === 'Space'
    ) {
      event.preventDefault();
    }
  }

  validatePAN(event: Event) {
    this.panErrorMessage = '';
    const pan = (event.target as HTMLInputElement).value;
    if (pan.length == 10 && !this.panErrorMessage) {
      this.isLoadingSpinner = true;
      this.panErrorMessage = '';
      this.animalMS.validatePAN(pan).subscribe(
        (data) => {
          this.isLoadingSpinner = false;
          if (!data) {
            this.panErrorMessage = 'PAN Already exists';
          }
        },
        (error) => {
          this.panErrorMessage = 'Invalid PAN';
          this.isLoadingSpinner = false;
        }
      );
    }
  }

  enableEditMobile() {
    this.isMobileNumberNotEdited = false;
    this.ownerDetailsForm.controls.ownerMobileNo.enable();
  }

  openOtpDialog(mobileNo: number) {
    if (
      mobileNo == this.ownerInfo.ownerMobileNo ||
      this.ownerDetails.ownerMobileNo.invalid
    ) {
      this.ownerDetailsForm.markAllAsTouched();
      if (this.ownerDetails.ownerMobileNo.valid) {
        this.dialog.open(ConfirmationDialogComponent, {
          data: {
            title: this.translatePipe.transform('common.info_label'),
            icon: 'assets/images/info.svg',
            message: this.translatePipe.transform('common.not_same'),
            primaryBtnText: this.translatePipe.transform('common.ok_string'),
          },
          panelClass: 'common-info-dialog',
        });
      }
    } else {
      this.appService.getModulebyUrl('/owner/modifyowner');
      const dialogRef = this.dialog.open(OtpDialogComponent, {
        data: {
          ownerId: this.ownerInfo?.ownerId,
          header:
            this.translatePipe.transform('common.owner_id') +
            ':' +
            String(this.ownerInfo?.ownerId),
          heading: this.translatePipe.transform(
            'animalDetails.mobile_verification'
          ),
          message: this.translatePipe.transform(
            'animalDetails.update_mobile_msg'
          ),
          link: this.data?.redirectLink,
          otp: '1234',
          name: 'updateMobileNumber',
          ownerMobileNo: mobileNo,
        },
        width: '500px',
      });
      dialogRef.afterClosed().subscribe((res) => {});
      dialogRef.componentInstance.onClosed.subscribe((res) => {
        this.isMobileNumberNotEdited = true;
        this.ownerDetailsForm.controls.ownerMobileNo.disable();
        this.ownerDS.seteditDetailsFlag(true);
        this.appService.getCurrentUrl(true);
        this.dialogRef.close();
      });
    }
  }

  getVillageInstName(event: Event) {
    this.ownerDetailsForm.patchValue({ villageInstitutionCode: null });
    this.isLoadingSpinner = true;
    this.ownerDS
      .getVillageInstitutionName(+(event.target as HTMLInputElement)?.value)
      .subscribe(
        (names) => {
          this.villageInstitutionNames = names;
          this.isLoadingSpinner = false;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
  }

  dateFormatChange(date: String) {
    date = date.substring(0, 10);
    return date.split('-').reverse().join('/');
  }

  getCommonAPIData() {
    this.ownerDS.getCommonData('land_holding').subscribe((landHoldings) => {
      this.landHoldings = landHoldings;
    });
    this.ownerDS.getCommonData('owner_category').subscribe((ownerCat) => {
      this.ownerCategory = ownerCat;
    });
    this.ownerDS
      .getCommonData('owner_type_category_cd')
      .subscribe((ownerType) => {
        this.ownerTypeCategory = ownerType;
      });
    this.loadRecordsForAgency();
  }

  loadRecordsForAgency() {
    this.villageInstitutionNames = [];
    this.institutionList = [];
    this.isLoadingSpinner = true;
    this.ownerDS.getRecordsForAgency().subscribe(
      (data) => {
        this.affiliationData = data;
        this.filterAffiliationData(this.affiliationData);
        this.isLoadingSpinner = false;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  filterAffiliationData(affiliationData: AffiliationData[]) {
    if (Array.isArray(affiliationData)) {
      affiliationData?.filter((crrVal) => {
        let crrType = {
          cd: crrVal.villageInstitutionType,
          value: crrVal.villageInstitutionTypeName,
        };
        if (!this.institutionList.some((inst) => inst.cd == crrType.cd)) {
          this.institutionList.push(crrType);
        }
      });
    }
    this.getAllLists();
  }

  fetchFlwAllotedArea() {
    this.isLoadingSpinner = true;
    this.countryService.fetchAddress().subscribe(
      (data: FLWVillages[]) => {
        this.addressList = data;
        this.populateAddressDropdowns(this.addressList);
        const temp = {
          villageCode: this.ownerInfo.ownerAddressCityVillageCd,
          villageName: this.ownerInfo.ownerVillageName,
        };
        this.onSelectingVillage(temp);
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  onSelectingVillage(village: VillageList) {
    this.tehsilList = [];
    this.districtList = [];
    this.stateList = [];
    if (village) {
      const selectedRegion = this.addressList.filter((value) => {
        return value.villageCd == village.villageCode;
      });
      this.populateAddressDropdowns(selectedRegion, true);
    } else {
      this.ownerDetailsForm.patchValue({
        ownerAddressTehsilCd: '',
        ownerAddressDistrictCd: '',
        ownerAddressStateCd: '',
        ownerAddressPincode: '',
      });
    }
  }

  populateAddressDropdowns(
    selectedRegion: FLWVillages[],
    fullAddressFlag?: boolean
  ) {
    for (let obj of selectedRegion) {
      if (fullAddressFlag) {
        // populating state
        this.stateList.push({
          stateCode: obj.stateCd,
          stateName: obj.stateName,
        });
        this.districtList.push({
          districtCode: obj.districtCd,
          districtName: obj.districtName,
        });
        this.tehsilList.push({
          tehsilCode: obj.tehsilCd,
          tehsilName: obj.tehsilName,
        });
        this.ownerDetailsForm.patchValue({
          ownerAddressStateCd: obj.stateCd,
          ownerAddressDistrictCd: obj.districtCd,
          ownerAddressTehsilCd: obj.tehsilCd,
          ownerAddressPincode: obj.pinCd,
        });
        // this.ownerDetailsForm.updateValueAndValidity();
      } else {
        // populating village
        let crrVillage = {
          villageCode: obj.villageCd,
          villageName: obj.villageName,
        };
        if (
          !this.villageList.some(
            (village) => village.villageCode == crrVillage.villageCode
          )
        )
          this.villageList = [...this.villageList, crrVillage];
      }
    }
  }

  getPastDate(year: number) {
    var tempDate = new Date(this.dateToday);
    tempDate.setFullYear(tempDate.getFullYear() - year);
    return tempDate;
  }

  countCharacters(enteredString: String, param?: String) {
    const len = enteredString.trim().replace(/\s+/g, ' ').length;
    if (param != undefined && param == 'fatherName') {
      this.fatherNameLength = len;
    } else {
      this.ownerNameLength = len;
    }
  }

  getCurrentDate() {
    this.isLoadingSpinner = true;
    this.animalMS.getCurrentDate().subscribe(
      (date) => {
        this.dateToday = new Date(date.value);
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  avoidSpecialChar(event: any) {
    let key;
    key = event.charCode;
    return (key > 47 && key < 58) || key == 45 || key == 46;
  }

  onSubmitEditForm() {
    // this.findInvalidControls();
    if (this.data.isIndividual) {
      if (
        this.ownerDetailsForm.invalid ||
        this.ownerNameLength < this.ownerName.rangeLowerValue ||
        this.fatherNameLength < this.ownerName.rangeLowerValue
      ) {
        this.ownerDetailsForm.markAllAsTouched();
        const controls = this.ownerDetailsForm.controls;
        for (const name in controls) {
          if (controls[name].invalid) {
            const invalidControl = this.el.nativeElement.querySelector(
              '[formcontrolname="' + name + '"]'
            );
            invalidControl?.focus();
          }
        }
        return;
      } else {
        // var categoryValue = this.ownerDetailsForm.get('isCategoryVerified').value;
        // if (categoryValue) {
        //   this.ownerDetailsForm.patchValue({ isCategoryVerified: 'Y' });
        // } else {
        //   this.ownerDetailsForm.patchValue({ isCategoryVerified: 'N' });
        // }
        if (this.isMobileNumberNotEdited) {
          this.appService.getModulebyUrl('/owner/modifyowner');
          let payload = { ...this.ownerDetailsForm.getRawValue() };
          payload.ownerDateOfBirth = moment(payload.ownerDateOfBirth).format(
            'YYYY-MM-DD'
          );
          payload.dateOfIncorporation = moment(
            payload.dateOfIncorporation
          ).format('YYYY-MM-DD');
          payload.ownerMobileNo = encryptText(payload.ownerMobileNo);
          payload.ownerDateOfBirth = encryptText(payload.ownerDateOfBirth);
          if (!this.data.isIndividual) {
            payload.dateOfIncorporation = encryptText(
              payload.dateOfIncorporation
            );
            console.log('705', this.data.panNumber == payload.panNumber);
            this.isPanUpdated = !(this.data.panNumber == payload.panNumber);
            payload.panNumber = encryptText(payload.panNumber);
          }

          if (String(payload.alternateMobileNo)?.length > 0) {
            payload.alternateMobileNo = encryptText(payload.alternateMobileNo);
          }
          // payload['locationInfo'] = AnimalManagementConfig.locationInfoObj;
          if (this.data.isIndividual) {
            this.ownerDS.editOwnerDetails(payload).subscribe((ownerData) => {
              this.ownerDS.seteditDetailsFlag(true);
              this.dialogRef.close();
              this.dialog.open(ConfirmationDialogComponent, {
                data: {
                  title: this.translatePipe.transform('common.info_label'),
                  icon: 'assets/images/info.svg',
                  message: this.translatePipe.transform(
                    'animalDetails.editSuccessfully'
                  ),
                  primaryBtnText:
                    this.translatePipe.transform('common.ok_string'),
                },
                panelClass: 'common-info-dialog',
              });
            });
          } else {
            this.isLoadingSpinner = true;
            // this.findInvalidControls();
            // this.ownerDetailsForm.get('fatherName').updateValueAndValidity();
            this.ownerDS.editNonIndOwnerDetails(payload).subscribe(
              (ownerData) => {
                this.isLoadingSpinner = false;
                // this.ownerDetailsForm.get('fatherName').updateValueAndValidity();
                this.ownerDS.seteditDetailsFlag(true);
                this.dialogRef.close();
                this.dialog.open(ConfirmationDialogComponent, {
                  data: {
                    title: this.translatePipe.transform('common.info_label'),
                    icon: 'assets/images/info.svg',
                    message: this.translatePipe.transform(
                      'animalDetails.editSuccessfully'
                    ),
                    primaryBtnText:
                      this.translatePipe.transform('common.ok_string'),
                  },
                  panelClass: 'common-info-dialog',
                });
              },
              (error) => {
                this.isLoadingSpinner = false;
              }
            );
          }
        } else {
          this.dialog.open(ConfirmationDialogComponent, {
            data: {
              title: this.translatePipe.transform('common.info_label'),
              icon: 'assets/images/info.svg',
              message: this.translatePipe.transform('common.verify_first'),
              primaryBtnText: this.translatePipe.transform('common.ok_string'),
            },
            panelClass: 'common-info-dialog',
          });
        }
      }
    } else {
      if (
        this.ownerDetailsForm.invalid ||
        this.ownerNameLength < this.ownerName.rangeLowerValue
      ) {
        this.ownerDetailsForm.markAllAsTouched();
        const controls = this.ownerDetailsForm.controls;
        for (const name in controls) {
          if (controls[name].invalid) {
            const invalidControl = this.el.nativeElement.querySelector(
              '[formcontrolname="' + name + '"]'
            );
            invalidControl?.focus();
          }
        }
        return;
      } else {
        // var categoryValue = this.ownerDetailsForm.get('isCategoryVerified').value;
        // if (categoryValue) {
        //   this.ownerDetailsForm.patchValue({ isCategoryVerified: 'Y' });
        // } else {
        //   this.ownerDetailsForm.patchValue({ isCategoryVerified: 'N' });
        // }
        if (this.isMobileNumberNotEdited && !this.panErrorMessage) {
          this.appService.getModulebyUrl('/owner/modifyowner');
          let payload = { ...this.ownerDetailsForm.getRawValue() };
          payload.ownerDateOfBirth = moment(payload.ownerDateOfBirth).format(
            'YYYY-MM-DD'
          );
          payload.dateOfIncorporation = moment(
            payload.dateOfIncorporation
          ).format('YYYY-MM-DD');
          payload.ownerMobileNo = encryptText(payload.ownerMobileNo);
          payload.ownerDateOfBirth = encryptText(payload.ownerDateOfBirth);
          payload.dateOfIncorporation = encryptText(
            payload.dateOfIncorporation
          );
          console.log(
            '804',
            this.data.ownerData?.panNumber == payload.panNumber
          );
          console.log(this.data.ownerData?.panNumber, payload?.panNumber);
          this.isPanUpdated = !(
            this.data.ownerData?.panNumber == payload.panNumber
          );
          payload.panNumber = encryptText(payload.panNumber);
          if (String(payload.alternateMobileNo)?.length > 0) {
            payload.alternateMobileNo = encryptText(payload.alternateMobileNo);
          }
          // this.findInvalidControls();
          // this.ownerDetailsForm.get('fatherName').updateValueAndValidity();
          this.isLoadingSpinner = true;
          payload['isPanUpdated'] = this.isPanUpdated;
          this.ownerDS.editNonIndOwnerDetails(payload).subscribe(
            (ownerData) => {
              this.isLoadingSpinner = false;
              // this.ownerDetailsForm.get('fatherName').updateValueAndValidity();
              this.ownerDS.seteditDetailsFlag(true);
              this.dialogRef.close();
              this.dialog.open(ConfirmationDialogComponent, {
                data: {
                  title: this.translatePipe.transform('common.info_label'),
                  icon: 'assets/images/info.svg',
                  message: this.translatePipe.transform(
                    'animalDetails.editSuccessfully'
                  ),
                  primaryBtnText:
                    this.translatePipe.transform('common.ok_string'),
                },
                panelClass: 'common-info-dialog',
              });
            },
            (error) => {
              this.isLoadingSpinner = false;
            }
          );
        } else {
          if (!this.panErrorMessage) {
            this.dialog.open(ConfirmationDialogComponent, {
              data: {
                title: this.translatePipe.transform('common.info_label'),
                icon: 'assets/images/info.svg',
                message: this.translatePipe.transform('common.verify_first'),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
              },
              panelClass: 'common-info-dialog',
            });
          }
        }
      }
    }
  }
}
