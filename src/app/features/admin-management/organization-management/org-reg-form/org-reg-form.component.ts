import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import moment from 'moment';
import { MatDialog } from '@angular/material/dialog';

import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import {
  EmailValidation,
  LandlineValidation,
  MembershipNumberValidation,
  MobileValidation,
  NameValidation,
  PinCodeValidation,
  getFileSize,
  AlphaNumericSpecialValidation,
  NamespecialValidation,
  AddressValidation,
} from 'src/app/shared/utility/validation';
import { OrganizationManagementService } from '../organization-management.service';
import { delay } from 'rxjs/operators';
import { CountryService } from 'src/app/shared/shareService/country-service.service';
import { StateList } from 'src/app/shared/shareService/model/state.model';
import { DistrictList } from 'src/app/shared/shareService/model/district.model';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';
import { getDecryptedData } from 'src/app/shared/shareService/storageData';
import { TranslateService } from '@ngx-translate/core';
import { encryptText } from 'src/app/shared/shareService/storageData';
@Component({
  selector: 'app-org-reg-form',
  templateUrl: './org-reg-form.component.html',
  styleUrls: ['./org-reg-form.component.css'],
})
export class OrgRegFormComponent implements OnInit {
  public orgRegForm: FormGroup;
  public selectedFile: File;
  public states: StateList[] = [];
  public districtListCnt: DistrictList[] = [];
  public districtListMulti: DistrictList[][] = [];
  public getOrgLists: any;
  public participatingAreas: [] = [];
  public districtCd: any;
  public isLoadingSpinner: boolean = false;
  public orgId: number | string;
  public isShowBreedError: string = '';
  public status: any;
  public changesSaved: boolean = false;
  public isShowError: string;
  public orgRegistrationProofUrl: string;
  public minDate = new Date();
  public OnBoardingMinDate: any;
  public organizationBasicInfo: any;
  public isValidFileTypeOrSize: string;
  public file: File;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private fb: FormBuilder,
    private OrgService: OrganizationManagementService,
    private countryService: CountryService,
    private route: ActivatedRoute,
    private readonly translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.orgId = getDecryptedData('AESSHA256OrgName').id;

    this.orgRegForm = new FormGroup({
      orgName: new FormControl('', [
        Validators.required,
        NamespecialValidation,
      ]),
      orgType: new FormControl('', [Validators.required]),
      orgOnboardDate: new FormControl('', [Validators.required]),
      orgTenureCompleteDate: new FormControl('', [Validators.required]),
      orgRegistrationNo: new FormControl('', [
        Validators.required,
        NamespecialValidation,
      ]),
      orgAddress: new FormControl('', [Validators.required, AddressValidation]),
      stateCd: new FormControl('', [Validators.required]),
      districtCd: new FormControl('', [Validators.required]),
      orgPin: new FormControl('', [Validators.required, PinCodeValidation]),
      contactPersonName: new FormControl('', [
        Validators.required,
        NamespecialValidation,
      ]),
      contactPersonDesignation: new FormControl('', [
        Validators.required,
        NamespecialValidation,
      ]),
      mobileNo: new FormControl('', [Validators.required, MobileValidation]),
      emailId: new FormControl('', [Validators.required, EmailValidation]),
      landlineNo: new FormControl('', [LandlineValidation]),
      faxNo: new FormControl('', [MobileValidation]),
      orgstatus: new FormControl(''),
      registrationDocs: new FormControl('', {
        validators: [Validators.required],
      }),
      organizationParticipatingArea: this.fb.array([]),
    });

    if (this.orgId != null) {
      this.isLoadingSpinner = true;
      this.OrgService.getOrgDetail(this.orgId).subscribe(
        (data) => {
          this.orgRegistrationProofUrl =
            data['organizationBasicInfo'].orgRegistrationProofUrl;
          this.organizationBasicInfo = data['organizationBasicInfo'];
          this.minDate = this.organizationBasicInfo.orgOnboardDate;

          this.participatingAreas = data['organizationParticipatingArea'];
          if (!data) {
            return;
          }
          const participatingAreaslegth =
            data['organizationParticipatingArea'].length;
          if (data['organizationParticipatingArea'] != null) {
            for (let i = 0; i < participatingAreaslegth; i++) {
              this.getDistrictsMulti(
                data['organizationParticipatingArea'][i].state,
                i
              );
              this.addRow();
            }
          }

          this.orgRegForm.patchValue({
            orgName: data['organizationBasicInfo'].orgName,
            orgType: data['organizationBasicInfo'].orgType,
            orgOnboardDate: data['organizationBasicInfo'].orgOnboardDate,
            orgTenureCompleteDate:
              data['organizationBasicInfo'].orgTenureCompleteDate,
            orgRegistrationNo: data['organizationBasicInfo'].orgRegistrationNo,
            orgAddress: data['organizationContactInfo'].orgAddress,
            stateCd: data['organizationContactInfo'].stateCd,
            districtCd: data['organizationContactInfo'].districtCd,
            orgPin: data['organizationContactInfo'].orgPin,
            contactPersonName:
              data['organizationContactInfo'].contactPersonName,
            contactPersonDesignation:
              data['organizationContactInfo'].contactPersonDesignation,
            mobileNo: data['organizationContactInfo'].mobileNo,
            emailId: data['organizationContactInfo'].emailId,
            landlineNo: data['organizationContactInfo'].landlineNo,
            faxNo: data['organizationContactInfo'].faxNo,
            orgstatus: data['orgStatus'],
            registrationDocs:
              data['organizationBasicInfo'].orgRegistrationProofUrl,
            organizationParticipatingArea: this.participatingAreas,
          });
          this.isLoadingSpinner = false;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
      this.orgRegForm.get('registrationDocs').clearValidators();
      this.orgRegForm.get('registrationDocs').updateValueAndValidity();
    } else {
      this.addRow();
    }

    this.getCountryList();
    this.getOrgType();

    this.getStatus();
    this.orgRegForm.get('orgstatus').valueChanges.subscribe((val) => {
      if (val == 3) {
        let currentDate = new Date();
        this.orgRegForm.get('orgTenureCompleteDate').setValue(currentDate);
      }
    });
  }

  checkDuplicateList() {
    const dup = this.orgRegForm.value.organizationParticipatingArea
      .map((val: any) => val.state)
      .filter((val: any, i: number, breed: any[]) => breed.indexOf(val) != i);
    const dupRecord =
      this.orgRegForm.value.organizationParticipatingArea.filter(
        (obj: any) => obj.state && dup.includes(obj.state)
      );
    if (dupRecord.length > 1) {
      this.isShowError =
        'State Name Already exists. Please select Another State Name';
    } else {
      this.isShowError = '';
    }
  }

  setDateChanged(event) {
    this.minDate = event.value;
  }

  setDateTenure(event) {
    this.OnBoardingMinDate = event.value;
  }

  getCountryList() {
    this.countryService.getStatesByUser().subscribe((response) => {
      this.states = response;
    });
  }

  getDistrictsMulti(stateCode: any, index: any) {
    const selectDistricts = this.rows;
    if (selectDistricts.controls.length > index) {
      selectDistricts.at(index).patchValue({
        districts: [],
      });
    }

    this.isLoadingSpinner = true;
    if (stateCode) {
      this.checkDuplicateList();
      this.countryService
        .getDistrict(stateCode)
        .pipe(delay(500))
        .subscribe((districtData: DistrictList[]) => {
          this.districtListMulti[index] = districtData;
          this.selectAllForDropdownItems(this.districtListMulti[index]);
          this.isLoadingSpinner = false;
        });
    }
  }

  getDistricts(stateCode: any) {
    this.isLoadingSpinner = true;
    if (stateCode) {
      this.countryService
        .getDistrict(stateCode)
        .pipe(delay(500))
        .subscribe(
          (districtData: DistrictList[]) => {
            this.districtListCnt = districtData;
            this.isLoadingSpinner = false;
          },
          (error) => {
            this.isLoadingSpinner = false;
          }
        );
    }
  }

  getOrgType() {
    this.OrgService.getOrgTypeSvc().subscribe(
      (data) => {
        this.getOrgLists = data;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  get rows() {
    return this.orgRegForm.get('organizationParticipatingArea') as FormArray;
  }

  addRow() {
    this.rows.push(this.createItemFormGroup());
  }

  onRemoveRow(rowIndex: number) {
    this.dialog
      .open(ConfirmationDeleteDialogComponent, {
        data: {
          title: this.translateService.instant('alertMsg.alert'),
          message: this.translateService.instant('alertMsg.delete_confirm'),
          icon: 'assets/images/alert.svg',
          primaryBtnText: this.translateService.instant('common.yes'),
          secondaryBtnText: this.translateService.instant('common.no'),
        },
        panelClass: 'common-alert-dialog',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.rows.removeAt(rowIndex);
        }
      });
  }

  selectAllForDropdownItems(items: DistrictList[]) {
    let allSelect = (items) => {
      items.forEach((element) => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };

    allSelect(items);
  }

  createItemFormGroup(): FormGroup {
    return this.fb.group({
      state: new FormControl('', [Validators.required]),
      districts: new FormControl('', [Validators.required]),
    });
  }
  onFileUpload(event: Event) {
    this.isLoadingSpinner = true;
    this.file = (event.target as HTMLInputElement).files[0];

    let data = getFileSize(this.file);
    if (!data) {
      this.isValidFileTypeOrSize = 'File size should not exceed than 5MB';
      this.isLoadingSpinner = false;
      return;
    }

    const formData = new FormData();
    formData.append('key', 'adminmoduleOrgReg'),
      formData.append('file', this.file);
    this.orgRegForm.get('registrationDocs').updateValueAndValidity();
    this.OrgService.validateFile(formData).subscribe(
      (response) => {
        this.isLoadingSpinner = false;
        if (response) {
          this.orgRegForm.patchValue({
            registrationDocs: this.file,
          });
          this.orgRegForm.get('registrationDocs').updateValueAndValidity();
          this.isValidFileTypeOrSize = '';
        } else {
          this.isValidFileTypeOrSize =
            'Please upload a valid file(JPG/JPEG/PNG/PDF) upto 5Mb';
        }
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  getStatus() {
    this.isLoadingSpinner = true;
    this.OrgService.getOrgStatusSvc().subscribe(
      (response) => {
        this.status = response;
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  onCreateOrg() {
    if (this.isShowError || this.orgRegForm.invalid) {
      this.orgRegForm.markAllAsTouched();
      return;
    }

    const formData: FormData = new FormData();

    if (this.file != undefined) {
      formData.append('registrationDocs', this.file);
    }
    formData.append("orgName", this.orgRegForm.get('orgName').value);
    formData.append("orgType", this.orgRegForm.get('orgType').value);
    formData.append("orgOnboardDate", moment(this.orgRegForm.get('orgOnboardDate').value).format("YYYY-MM-DD"));
    formData.append("orgTenureCompleteDate", moment(this.orgRegForm.get('orgTenureCompleteDate').value).format("YYYY-MM-DD"));
    formData.append("orgRegistrationNo", this.orgRegForm.get('orgRegistrationNo').value);
    formData.append("orgAddress", this.orgRegForm.get('orgAddress').value);
    formData.append("stateCd", this.orgRegForm.get('stateCd').value);
    formData.append("districtCd", this.orgRegForm.get('districtCd').value);
    formData.append("orgPin", this.orgRegForm.get('orgPin').value);
    formData.append("contactPersonName", this.orgRegForm.get('contactPersonName').value);
    formData.append("contactPersonDesignation", this.orgRegForm.get('contactPersonDesignation').value);
    formData.append("mobileNo", encryptText(this.orgRegForm.get('mobileNo').value.toString()));
    formData.append("emailId", this.orgRegForm.get('emailId').value);
    formData.append("landlineNo", encryptText((this.orgRegForm.get('landlineNo').value) == null ? '' : this.orgRegForm.get('landlineNo').value.toString()));
    formData.append("faxNo", (this.orgRegForm.get('faxNo').value) == null ? '' : this.orgRegForm.get('faxNo').value);
    formData.append("organizationParticipatingArea", JSON.stringify(this.orgRegForm.get('organizationParticipatingArea').value));
    // formData.append("registrationDocs", this.orgRegForm.get('registrationDocs').value);

    if (this.orgId) {
      this.isLoadingSpinner = true;
      formData.append('orgId', JSON.stringify(this.orgId));
      formData.append('orgStatus', this.orgRegForm.get('orgstatus').value);
      this.OrgService.upadateOrg(formData).subscribe(
        (response) => {
          this.changesSaved = true;
          // this.router.navigate(['/dashboard/organization-management/list']);
          if (response) {
            this.dialog
              .open(ConfirmationDialogComponent, {
                data: {
                  title: 'Info',
                  message: `${response['msg'].msgDesc}`,
                  icon: 'assets/images/info.svg',
                  primaryBtnText: 'Ok',
                },
                panelClass: 'common-info-dialog',
              })
              .afterClosed()
              .subscribe((result) => {
                if (result) {
                  this.router.navigate([
                    '/dashboard/organization-management/list',
                  ]);
                }
              });
            this.isLoadingSpinner = false;
          }
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    } else {
      this.isLoadingSpinner = true;
      this.OrgService.createOrg(formData).subscribe(
        (response) => {
          if (response) {
            this.dialog
              .open(ConfirmationDialogComponent, {
                data: {
                  title: 'Info',
                  message: `${response['msg'].msgDesc}`,
                  icon: 'assets/images/info.svg',
                  primaryBtnText: 'Ok',
                },
                panelClass: 'common-info-dialog',
              })
              .afterClosed()
              .subscribe((result) => {
                if (result) {
                  this.router.navigate([
                    '/dashboard/organization-management/list',
                  ]);
                }
              });
            this.isLoadingSpinner = false;
          }
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    }
  }
}
