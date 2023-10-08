import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { delay } from 'rxjs/operators';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { CountryService } from 'src/app/shared/shareService/country-service.service';
import { DistrictList } from 'src/app/shared/shareService/model/district.model';
import { StateList } from 'src/app/shared/shareService/model/state.model';
import { getDecryptedData } from 'src/app/shared/shareService/storageData';
import {
  MembershipNumberValidation,
  NameValidation,
  NamespecialValidation,
  getFileSize,
} from 'src/app/shared/utility/validation';

import { SampleExaminationSubtypeMaster } from '../../organization-management/model/subOrganization.model';
import { OrganizationManagementService } from '../../organization-management/organization-management.service';
import { semenStationCdExist } from 'src/app/shared/utility/directives/unique-email.directive';
import { UserService } from 'src/app/shared/user/user.service';
import { UserManagementService } from '../../user-management/user-management.service';

@Component({
  selector: 'app-sub-organization-registration-form',
  templateUrl: './sub-organization-registration-form.component.html',
  styleUrls: ['./sub-organization-registration-form.component.css'],
})
export class SubOrganizationRegistrationFormComponent implements OnInit {
  public states: StateList[] = [];
  public orgState: any = [];
  public districtListCnt: DistrictList[] = [];
  public subOrgRegForm: FormGroup;
  public getOrgLists: any;
  public districtListMulti: DistrictList[][] = [];
  public sampleExaminationMulti: SampleExaminationSubtypeMaster[] = [];
  public subOrgId: any;
  public orgId: any;
  public participatingAreas: [] = [];
  public isLoadingSpinner: boolean = false;
  public isdisabled = false;
  public isShowError: string;
  public status: any;
  public parentOrganizationList: any = [];
  public minDate = sessionStorage.getItem('serverCurrentDateTime');
  public subOrgIdentificationProofUrl: string;
  public isValidFileTypeOrSize: string;
  public orgDetail: any;
  public orgParticipatingArea: any;
  public orgOnBoarding: string;
  public orgTenure: string;
  public isOrgdDateisabled: boolean = true;
  public isSampleExaminationSubtype: boolean = false;
  public serviceMapList: number[] = [];
  public semenStationCd: boolean = false;
  public orgDetailsData: any;
  public file: File;
  public subOrgTypeCd = 0;
  admin_livestack: any;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    public countryService: CountryService,
    public OrgService: OrganizationManagementService,
    private fb: FormBuilder,
    private readonly translateService: TranslateService,
    private usersSrv: UserService,
    private userService: UserManagementService
  ) { }

  ngOnInit(): void {
    this.subOrgId = getDecryptedData('AESSHA256subOrgName').id;
    this.subOrgRegForm = new FormGroup({
      parentOrgName: new FormControl('', [Validators.required]),
      suborgName: new FormControl('', [
        Validators.required,
        NamespecialValidation,
      ]),
      subOrgType: new FormControl('', [Validators.required]),
      onBoardingDate: new FormControl('', [Validators.required]),
      tenureCompletionDate: new FormControl('', [Validators.required]),
      orgstatus: new FormControl(''),
      subregNounique: new FormControl('', [
        Validators.required,
        NamespecialValidation,
      ]),
      regNosprtdoc: new FormControl(''),
      sampleExamination: new FormControl(''),
      semenStationCd: new FormControl(
        '',
        [Validators.min(3)],
        [semenStationCdExist(this.usersSrv)]
      ),
      subOrganizationParticipatingArea: this.fb.array([]),
    });

    if (this.subOrgId != null) {
      this.isLoadingSpinner = true;
      this.subOrgRegForm.get('semenStationCd').clearAsyncValidators();
      this.OrgService.getSubOrgDetails(this.subOrgId).subscribe((data) => {
        this.orgDetailsData = data;
        this.orgOnBoarding = data['subOrganizationBasicInfo'].subOrgOnboardDate;
        // this.onGetOrgDetail(data['orgId']);
        this.isLoadingSpinner = false;
        this.subOrgIdentificationProofUrl =
          data['subOrganizationBasicInfo'].subOrgIdentificationProofUrl;
        this.participatingAreas = data['organizationLocationMap'];
        if (!data) {
          return;
        }
        this.isdisabled = true;
        const participatingAreaslegth =
          data['organizationParticipatingArea'].length;
        if (data['organizationParticipatingArea'] != null) {
          for (let i = 0; i < participatingAreaslegth; i++) {
            this.addRow();
          }
        }
        for (let serviceMap of data['subOrgServiceMapList']) {
          this.serviceMapList.push(parseInt(serviceMap.split('-')[0]));
        }
        this.subOrgRegForm.patchValue({
          parentOrgName: data['orgId'],
          suborgName: data['subOrganizationBasicInfo'].subOrgName,
          subregNounique:
            data['subOrganizationBasicInfo'].subOrgIdentificationNo,
          regNosprtdoc: null,
          orgstatus: data['subOrgStatus'],
          subOrgType: data['subOrganizationBasicInfo'].subOrgType,
          onBoardingDate: data['subOrganizationBasicInfo'].subOrgOnboardDate,
          tenureCompletionDate:
            data['subOrganizationBasicInfo'].subOrgTenureCompleteDate,
          subOrganizationParticipatingArea:
            data['organizationParticipatingArea'],
          sampleExamination: this.serviceMapList,
          semenStationCd: data['subOrganizationBasicInfo'].semenStationCd,
        });
        this.onChangeOrgType(data['subOrganizationBasicInfo'].subOrgType);
      });
      this.subOrgRegForm.controls.parentOrgName.disable();
      this.isLoadingSpinner = true;
    } else {
      this.addRow();
    }
    this.isLoadingSpinner = true;
    this.getParentOrganization();
    this.getStatus();
    this.getOrgType();
    this.subOrgRegForm
      .get('parentOrgName')
      .valueChanges.subscribe((orgId: number | string) => {
        this.onGetOrgDetail(orgId, true);
      });
    this.subOrgRegForm.get('orgstatus').valueChanges.subscribe((val) => {
      if (val == 3) {
        let currentDate = sessionStorage.getItem('serverCurrentDateTime');
        this.subOrgRegForm.get('tenureCompletionDate').setValue(currentDate);
      }
    });
  }

  onchgsemanStation(event) {
    if (this.subOrgTypeCd === 2 && event.target.value) {
      this.subOrgRegForm
        .get('semenStationCd')
        .setAsyncValidators([semenStationCdExist(this.usersSrv)]);
    }
  }
  checkDuplicateList() {
    const dup = this.subOrgRegForm.value.subOrganizationParticipatingArea
      .map((val: any) => val.state)
      .filter((val: any, i: number, breed: any[]) => breed.indexOf(val) != i);
    const dupRecord =
      this.subOrgRegForm.value.subOrganizationParticipatingArea.filter(
        (obj: any) => obj.state && dup.includes(obj.state)
      );
    if (dupRecord.length > 1) {
      this.isShowError =
        'State Name Already exists. Please select Another State Name';
    } else {
      this.isShowError = '';
    }
  }

  getCountryList() {
    this.orgState = [];
    this.orgParticipatingArea.forEach((item) => {
      let state_array = item.state.split('-');
      this.orgState.push({
        stateCd: state_array[0],
        stateName: state_array[1],
        districtlist: item.districts,
      });
    });
    if (this.subOrgId) {
      const participatingAreaslegth =
        this.orgDetailsData['organizationParticipatingArea'].length;
      if (this.orgDetailsData['organizationParticipatingArea'] != null) {
        for (let i = 0; i < participatingAreaslegth; i++) {
          this.getDistrictsMulti(
            this.orgDetailsData['organizationParticipatingArea'][i].state,
            i,
            true
          );
        }
      }
    }
  }

  getDistricts(stateCode: any) {
    this.isLoadingSpinner = true;
    this.countryService
      .getDistrict(stateCode)
      .pipe(delay(500))
      .subscribe((districtData: DistrictList[]) => {
        this.districtListCnt = districtData;
        this.isLoadingSpinner = false;
      });
  }

  getDistrictsMulti(stateCode: any, index, onEdit = false) {
    const selectDistricts = this.rows;
    if (!onEdit) {
      if (selectDistricts.controls.length > index) {
        selectDistricts.at(index).patchValue({
          districts: [],
        });
      }
    }
    this.districtListMulti[index] = [];
    let selectedState = this.orgState.filter(
      (item) => item.stateCd == stateCode
    );
    selectedState.forEach((district) => {
      this.checkDuplicateList();
      district.districtlist.forEach((res) => {
        let districtlist = res.split('-');
        if (districtlist) {
          this.isLoadingSpinner = false;
          this.districtListMulti[index].push({
            districtCode: +districtlist[0],
            districtName: districtlist[1],
          });
        }
      });
    });
    this.selectAllForDropdownItems(this.districtListMulti[index]);
  }

  getSampleExaminationMultiList() {
    this.isLoadingSpinner = true;
    this.OrgService.getSampleExaminationSubtypeMaster().subscribe(
      (response: SampleExaminationSubtypeMaster[]) => {
        this.sampleExaminationMulti = response;
        this.selectAllForDropdownItems(this.sampleExaminationMulti);
        this.isLoadingSpinner = false;
      }
    );
  }

  setDateChanged(event) {
    this.minDate = event.value;
    this.orgOnBoarding = event.value;
  }

  getParentOrganization() {
    this.isLoadingSpinner = true;
    let userlogin = JSON.parse(sessionStorage.getItem('user'));

    let isLivesatckAdmin = JSON.parse(
      sessionStorage.getItem('isLivesatckAdmin')
    );

    if (!isLivesatckAdmin) {
      this.OrgService.getOrgList().subscribe(
        (res: any) => {
          this.isLoadingSpinner = false;
          this.parentOrganizationList = res.filter(
            (ele) => ele.orgStatus == 1 && ele.orgId == userlogin.orgId
          );
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
    } else {
      this.OrgService.getOrgList().subscribe(
        (res: any) => {
          this.isLoadingSpinner = false;
          this.parentOrganizationList = res.filter((ele) => {
            return ele.orgStatus == 1;
          });
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
    }
  }

  onGetOrgDetail(orgId: number | string, onEdit = false) {
    this.orgState = [];
    this.isLoadingSpinner = true;
    this.OrgService.getOrgDetail(orgId).subscribe((response: any) => {
      this.subOrgRegForm.controls.onBoardingDate.enable();
      this.subOrgRegForm.controls.tenureCompletionDate.enable();
      this.isOrgdDateisabled = false;
      this.orgDetail = response['organizationBasicInfo'];
      this.orgParticipatingArea =
        response['organizationParticipatingAreaWithNames'];
      if (onEdit) {
        this.orgOnBoarding = this.orgDetail.orgOnboardDate;
      }
      this.orgTenure = this.orgDetail.orgTenureCompleteDate;
      this.isLoadingSpinner = false;
      if (this.orgParticipatingArea.length > 0) {
        this.orgState = [];
        this.getCountryList();
      }
    });
  }

  getParentOrgId(orgId: number | string) {
    this.onGetOrgDetail(orgId, false);
  }

  getStatus() {
    this.OrgService.getOrgStatusSvc().subscribe((response) => {
      this.status = response;
    });
  }

  getOrgType() {
    this.isLoadingSpinner = true;
    this.OrgService.getSubOrgTypeSvc().subscribe(
      (data) => {
        this.getOrgLists = data;
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  onChangeOrgType(event: number | string) {
    this.subOrgTypeCd = Number(event);
    let orgTypId = event;
    if (orgTypId == '5') {
      this.getSampleExaminationMultiList();
      this.subOrgRegForm.controls['sampleExamination'].setValidators([
        Validators.required,
      ]);

      this.isSampleExaminationSubtype = true;
      this.subOrgRegForm.controls['semenStationCd'].clearValidators();
      this.subOrgRegForm.controls['semenStationCd'].clearAsyncValidators();

    } else if (orgTypId == '2' || orgTypId == '11') {
      this.isSampleExaminationSubtype = false;
      this.subOrgRegForm.controls['semenStationCd'].setValidators([
        Validators.required,
      ]);
      this.semenStationCd = true;
    } else {
      this.isSampleExaminationSubtype = false;
      this.semenStationCd = false;
      this.subOrgRegForm.controls['sampleExamination'].clearValidators();
      this.subOrgRegForm.controls['sampleExamination'].clearAsyncValidators();
      this.subOrgRegForm.controls['semenStationCd'].clearValidators();
      this.subOrgRegForm.controls['semenStationCd'].clearAsyncValidators();
    }
    this.subOrgRegForm.controls['sampleExamination'].updateValueAndValidity();
    this.subOrgRegForm.controls['semenStationCd'].updateValueAndValidity();
  }

  get rows() {
    return this.subOrgRegForm.get(
      'subOrganizationParticipatingArea'
    ) as FormArray;
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

  selectAllForDropdownItems(
    items: DistrictList[] | SampleExaminationSubtypeMaster[]
  ) {
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
      this.isValidFileTypeOrSize = 'File size has exceeded it max limit of 5MB';
      this.isLoadingSpinner = false;
      return;
    }

    const formData = new FormData();
    formData.append('key', 'adminmoduleOrgReg'),
      formData.append('file', this.file);
    this.subOrgRegForm.get('regNosprtdoc').updateValueAndValidity();
    this.OrgService.validateFile(formData).subscribe(
      (response) => {
        this.isLoadingSpinner = false;
        if (response) {
          this.subOrgRegForm.patchValue({
            regNosprtdoc: this.file,
          });
          this.subOrgRegForm.get('regNosprtdoc').updateValueAndValidity();
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

  onCreateSubOrgination() {
    if (this.isShowError || this.subOrgRegForm.invalid) {
      this.subOrgRegForm.markAllAsTouched();
      return;
    }
    const formData: FormData = new FormData();
    if (this.file != undefined) {
      formData.append('identificationDocs', this.file);
    }
    formData.append('orgId', this.subOrgRegForm.get('parentOrgName').value);
    formData.append('subOrgName', this.subOrgRegForm.get('suborgName').value);
    formData.append(
      'subOrgIdentificationNo',
      this.subOrgRegForm.get('subregNounique').value
    );
    formData.append('subOrgType', this.subOrgRegForm.get('subOrgType').value);
    formData.append(
      'subOrgOnboardDate',
      moment(this.subOrgRegForm.get('onBoardingDate').value).format(
        'YYYY-MM-DD'
      )
    );
    formData.append(
      'subOrgTenureCompleteDate',
      moment(this.subOrgRegForm.get('tenureCompletionDate').value).format(
        'YYYY-MM-DD'
      )
    );
    formData.append(
      'subOrganizationParticipatingArea',
      JSON.stringify(
        this.subOrgRegForm.get('subOrganizationParticipatingArea').value
      )
    );
    formData.append(
      'serviceCd',
      this.subOrgRegForm.get('sampleExamination').value
    );
    formData.append(
      'semenStationCd',
      this.subOrgRegForm.get('semenStationCd').value
    );
    if (!this.subOrgId) {
      this.isLoadingSpinner = true;
      this.OrgService.createSubOrg(formData).subscribe(
        (response) => {
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
                this.router.navigate(['/dashboard/suborginazation/list']);
              }
            });
          this.isLoadingSpinner = false;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    } else {
      this.isLoadingSpinner = true;
      formData.append('subOrgId', this.subOrgId);
      formData.append(
        'subOrgStatus',
        this.subOrgRegForm.get('orgstatus').value
      );
      this.OrgService.updateSubOrg(formData).subscribe(
        (response) => {
          this.dialog
            .open(ConfirmationDialogComponent, {
              data: {
                title: 'Info',
                message: `${response['msg'].msgDesc}`,
                icon: 'assets/images/verified.svg',
                primaryBtnText: 'Ok',
              },
              panelClass: 'common-info-dialog',
            })
            .afterClosed()
            .subscribe((result) => {
              if (result) {
                this.router.navigate(['/dashboard/suborginazation/list']);
              }
            });
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
      this.isLoadingSpinner = false;
    }
  }
}
