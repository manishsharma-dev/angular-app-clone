import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { StepperOrientation } from '@angular/material/stepper';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import {
  AadhaarValidation,
  EmailValidation,
  getFileSize,
  MobileValidation,
  NamespecialValidation,
  PinCodeValidation,
  UserNamespecialValidation,
} from 'src/app/shared/utility/validation';
import { StateList } from 'src/app/shared/shareService/model/state.model';
import { CountryService } from 'src/app/shared/shareService/country-service.service';
import { DistrictList } from 'src/app/shared/shareService/model/district.model';
import { UserManagementService } from '../user-management.service';
import { TehsilList } from 'src/app/shared/shareService/model/tehsil.model';
import { VillageList } from 'src/app/shared/shareService/model/village.model';
import { Common } from '../models/common.model';
import moment from 'moment';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';
import { OrganizationManagementService } from '../../organization-management/organization-management.service';
import { existinguserAadhaarValidator } from '../../../../shared/utility/directives/unique-email.directive';
import { UserService } from 'src/app/shared/user/user.service';
import { encryptText } from 'src/app/shared/shareService/storageData';
import { UserAllocDeallocComponent } from '../user-alloc-dealloc/user-alloc-dealloc.component';
import { MasterConfig } from 'src/app/shared/master.config';
import { NewAreaAllocationComponent } from '../new-area-allocation/new-area-allocation.component';
import { AdditionalAreaAllocationComponent } from '../additional-area-allocation/additional-area-allocation.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-form',
  templateUrl: './add-new-user.component.html',
  styleUrls: ['./add-new-user.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AddNewUserComponent implements OnInit {
  public stateList: StateList[] = [];
  public stateAllList: StateList[] = [];
  public stateMultiList: StateList[] = [];
  public districtList: DistrictList[] = [];
  public districtAllList: DistrictList[] = [];
  public districtMultiList: DistrictList[][] = [];
  public tehsilList: TehsilList[] = [];
  public tehsilMultiList: TehsilList[][] = [];
  public villageList: VillageList[] = [];
  public villageMultiList: VillageList[][] = [];
  public selectedvillage: any[];
  public userId: number | string = '';
  public loginID: string;
  public bRunSeqNo: number | string;
  public defRunSeqNo: number | string;
  public roleRunSeqNo: any = [];
  public areaRunSeqNo: any = [];
  public userAreas: [] = [];
  public roleAreas: [] = [];
  public btnTextDynamic = 'Submit';
  public isLoadingSpinner: boolean = true;
  public title: Common[];
  public language: Common[];
  public org_type: Common[];
  public userType: Common[];
  public category: Common[];
  // public subOrgType: Common[];
  public userStatus: Common[];
  public admin_district: Common[];
  public admin_livestack: Common[];
  public orglist;
  public subOrgList;
  public aiList;
  public roleList;
  public additionalRole;
  public isLinear = true;
  public userInfoForm;
  stepperOrientation: Observable<StepperOrientation>;
  public maxDate = new Date(sessionStorage.getItem('serverCurrentDateTime'));
  public userDob;
  public isaddArea: boolean = false;
  public isaddRole: boolean = false;
  public selectedFile: File;
  public userImg: string | File = 'assets/images/dummyProfile.png';
  public aadhaarCard: string = '';
  public villageListMulti: VillageList[][] = [];
  public isShowError: string = '';
  public fromDate;
  public mappingfromDate = [];
  public isValidFileTypeOrSize: string;
  public isValidProfileTypeOrSize: string;
  public onTenureDate;
  public onCompletionDate;
  public isAssignRole: boolean = false;
  public userorgdisable: boolean = false;
  public userRegistrationProofUrl: string;
  public file: File;
  public aadhaarfile: File;
  public orgId: string;
  public baseState: string;
  public isDistrictAdmin: boolean;
  public userstateList: StateList[];
  public masterConfig = MasterConfig;
  public orgParticipatingArea: any = [];
  public multiOrgParticipatingArea: any = [];
  dialogConfig = new MatDialogConfig();
  additionalAreaAllocations: any = [];
  suborgType: any = '1';
  @ViewChild('newareaAllocation') newareaAllocation: NewAreaAllocationComponent;
  @ViewChild('updateAreaAllocation')
  updateAreaAllocation: AdditionalAreaAllocationComponent;
  personalInfoForm: FormGroup;
  professionalInfoForm: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
    private location: Location,
    private router: Router,
    private countryService: CountryService,
    private userService: UserManagementService,
    private usershareService: UserService,
    private orgService: OrganizationManagementService,
    private translateService: TranslateService
  ) {
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
  }

  ngOnInit(): void {
    this.userRegFormDeclare();
    this.userInfoFormDeclare();
    this.ageCalculate();
    this.multiReq();
    this.userImg;
    // this.getCommonAPIData();
    // this.getuserStateList();
    // this.getStateList();
    // this.getOrgName();
    this.userId = sessionStorage.getItem('data');

    if (this.userId != null) {
      this.isLoadingSpinner = true;
      this.isUserID();
    }
    //   .get('stateCd')
    //   .valueChanges.subscribe((data) => {
    //     this.baseState = data;
    //     this.getsubOrgList(this.orgId, this.baseState);
    //   });
    this.userRolechange();
  }

  userRegFormDeclare() {
    this.personalInfoForm = this._formBuilder.group({
      images: ['', Validators.required],
      title: [[], Validators.required],
      firstName: ['', [Validators.required, UserNamespecialValidation]],
      middleName: ['', UserNamespecialValidation],
      lastName: ['', [Validators.required, UserNamespecialValidation]],
      gender: ['M', Validators.required],
      aadhaarNoUuid: [
        '',
        [Validators.required, AadhaarValidation, Validators.minLength(12)],
        [existinguserAadhaarValidator(this.usershareService)],
      ],
      adhardoc: ['', Validators.required],
      fatherName: ['', [Validators.required, UserNamespecialValidation]],
      dateOfBirth: ['', Validators.required],
      category: [[], Validators.required],
      userStatus: ['1'],
      languageCd: ['9'],
      permAddress: ['', [Validators.required, NamespecialValidation]],
      stateCd: [[], Validators.required],
      districtCd: [[], Validators.required],
      pinCd: ['', [Validators.required, PinCodeValidation]],
      emailId: ['', [Validators.required, EmailValidation]],
      mobileNo: ['', [Validators.required, MobileValidation]],
      alternateNo: [''],
    });

    this.professionalInfoForm = this._formBuilder.group({
      orgId: [
        sessionStorage.getItem('data')
          ? { value: [], disabled: true }
          : { value: [], disabled: false },
        Validators.required,
      ],
      registrationNo: ['', NamespecialValidation],
      userType: [[], Validators.required],
      baseLocation: this._formBuilder.group({
        stateCd: [[], Validators.required],
        districtCd: [[], Validators.required],
        tehsilCd: [[], Validators.required],
        villageCd: [[], Validators.required],
      }),
      defaultRole: this._formBuilder.group({
        roleCd: [[], Validators.required],
      }),
      aiCenterCd: [''],
      subOrgType: [this.userId ? this.suborgType : ''],
      userValidFrom: [this.maxDate, Validators.required],
      userValidTo: ['', Validators.required],
      userAreaAllocations: this._formBuilder.array([]),
      userRoleAllocations: this._formBuilder.array([]),
    });
  }

  userInfoFormDeclare() {
    this.userInfoForm = this._formBuilder.group({
      ...this.personalInfoForm.getRawValue(),
      ...this.professionalInfoForm.value,
    });
  }

  isUserID() {
    this.personalInfoForm.get('images').clearValidators();
    this.personalInfoForm.get('adhardoc').clearValidators();
    this.personalInfoForm.get('aadhaarNoUuid').clearValidators();
    this.personalInfoForm.get('aadhaarNoUuid').clearAsyncValidators();
    // this.personalInfoForm.get('title').clearValidators();
    this.personalInfoForm.get('lastName').removeValidators(Validators.required);
    this.personalInfoForm
      .get('fatherName')
      .removeValidators(Validators.required);
    this.personalInfoForm
      .get('permAddress')
      .removeValidators(Validators.required);

    this.personalInfoForm.get('stateCd').clearValidators();
    this.personalInfoForm.get('districtCd').clearValidators();
    this.personalInfoForm.get('pinCd').clearValidators();
    // this.personalInfoForm.get('emailId').clearValidators();
    // this.personalInfoForm.get('mobileNo').clearValidators();
    this.professionalInfoForm.get('orgId').clearValidators();
    this.professionalInfoForm.get('orgId').updateValueAndValidity();
    this.personalInfoForm.get('aadhaarNoUuid').valueChanges.subscribe((val) => {
      if (val != '') {
        this.personalInfoForm
          .get('aadhaarNoUuid')
          .addValidators([Validators.required, AadhaarValidation]);
        this.personalInfoForm
          .get('aadhaarNoUuid')
          .setAsyncValidators([
            existinguserAadhaarValidator(this.usershareService),
          ]);
        this.personalInfoForm
          .get('adhardoc')
          .addValidators([Validators.required]);
      } else {
        this.personalInfoForm.get('aadhaarNoUuid').clearValidators();
        this.personalInfoForm.get('adhardoc').clearValidators();
        this.personalInfoForm.get('aadhaarNoUuid').clearAsyncValidators();
      }
      this.personalInfoForm
        .get('adhardoc')
        .updateValueAndValidity({ emitEvent: true });

      this.personalInfoForm
        .get('aadhaarNoUuid')
        .updateValueAndValidity({ emitEvent: false });
    });
    this.userDetails(this.userId);
  }

  multiReq() {
    this.isLoadingSpinner = true;
    const dropdwonlist = [];
    dropdwonlist.push(this.getCommonAPIData());
    this.getuserStateList();
    this.getStateList();
    this.getOrgName();
    forkJoin(dropdwonlist).subscribe(
      (response) => {
        this.isLoadingSpinner = false;
      },
      (err) => (this.isLoadingSpinner = false)
    );
  }

  userRolechange() {
    this.userRoles.valueChanges.subscribe((data) => {
      if (!data && !data.length) {
        return;
      }
      data.forEach((ele, index) => {
        if (ele.roleCd == '17') {
          this.professionalInfo.aiCenterCd.addValidators(Validators.required);
        } else {
          this.professionalInfo.aiCenterCd.clearValidators();
        }
        this.professionalInfo.aiCenterCd.updateValueAndValidity({
          emitEvent: false,
        });
      });
    });
  }

  userDetails(userId) {
    this.isLoadingSpinner = true;
    this.userService.getDetailsByUserID(userId).subscribe(
      (data) => {
        if (data) {
          this.isLoadingSpinner = false;
          this.orgId = data['orgId'];
          this.loginID = data['loginId'];
          this.additionalAreaAllocations = data['nonbaseLocation'];
          if (this.orgId) {
            this.getOrgDetails(this.orgId);
            this.getRoleList();
          }

          this.userRegistrationProofUrl = data.aadhaarDocUrl;
          this.userAreas = data['nonbaseLocation'];
          this.roleAreas = data['userAdditonalRoleAllocations'];
          this.userImg = data['userPhotoUrl'];
          this.roleAreas.forEach((element: any) => {
            element.userAllocationStartDate = element.userAllocationStartDate
              ? new Date(element.userAllocationStartDate)
              : null;
            element.userAllocationEndDate = element.userAllocationStartDate
              ? new Date(element.userAllocationEndDate)
              : null;
            element.userId;
            element.runSeqNo;
          });
          this.bRunSeqNo = data['baseLocation']['runSeqNo'];
          this.defRunSeqNo = data['defaultRole']['runSeqNo'];

          this.runSeqList(this.roleAreas, this.roleRunSeqNo);
          this.runSeqList(this.userAreas, this.areaRunSeqNo);

          let $baseState = data['baseLocation']['stateCd'];
          this.baseState = data['baseLocation']['stateCd'];
          // this.getAIList();
          let $baseDistrict = data['baseLocation']['districtCd'];
          let $baseTehsil = data['baseLocation']['tehsilCd'];
          let $baseVillage = data['baseLocation']['villageCd'];
          let $defaultRole = data['defaultRole']['roleCd'];
          let altermobNo =
            data['alternateNo'] != null && data['alternateNo'] != 0
              ? data['alternateNo']
              : '';
          let aiCenterCode =
            data['aiCenterCd'] != null ? data['aiCenterCd'] : '';

          this.getDistricts(data['stateCd']);

          this.getAllDistricts($baseState);

          this.getTehsil($baseDistrict);

          this.getVillage($baseTehsil);

          if (!data) {
            return;
          }
          this.btnTextDynamic = 'Update';
          const userAreaslength = data['nonbaseLocation'].length;
          const roleAreaslength = data['userAdditonalRoleAllocations'].length;
          if (data['nonbaseLocation'].length > 0) {
            this.isaddArea = true;
          } else {
            this.isaddArea = false;
          }
          if (data['userAdditonalRoleAllocations'].length > 0) {
            for (let i = 0; i < roleAreaslength; i++) {
              this.isaddRole = true;
              this.addUserRoles();
            }
          }
          if (data['alternateNo'] == 0) {
          }
          this.personalInfoForm
            .get('userStatus')
            .valueChanges.subscribe((data) => {
              if (data == 3) {
                let currentDate = sessionStorage.getItem(
                  'serverCurrentDateTime'
                );
                this.professionalInfoForm
                  .get('userValidTo')
                  .setValue(currentDate);
              }
            });
          this.personalInfoForm.patchValue({
            images: data['userPhotoUrl'],
            title: data['title'],
            firstName: data['firstName'],
            middleName: data['middleName'],
            lastName: data['lastName'],
            gender: data['gender'],

            fatherName: data['fatherName'],
            dateOfBirth: data['dateOfBirth'],
            category: data['category'],
            languageCd: data['languageCd'],
            userStatus: data['userStatus'],
            permAddress: data['permAddress'],
            stateCd: data['stateCd'],
            districtCd: data['districtCd'],
            pinCd: data['pinCd'],
            emailId: data['emailId'],
            mobileNo: data['mobileNo'],
            alternateNo: altermobNo,
          });
          this.professionalInfoForm.patchValue({
            orgId: data['orgId'],
            registrationNo: data['registrationNo'],

            employeeId: data['employeeId'],
            userType: data['userType'],
            baseLoation: this.professionalInfoForm['controls'][
              'baseLocation'
            ].patchValue({
              stateCd: $baseState,
              districtCd: $baseDistrict,
              tehsilCd: $baseTehsil,
              villageCd: $baseVillage,
            }),
            defaultRole: this.professionalInfoForm['controls'][
              'defaultRole'
            ].patchValue({
              roleCd: $defaultRole,
            }),
            subOrgType: '1',
            aiCenterCd: aiCenterCode,
            userValidFrom: data['userValidFrom'],
            userValidTo: data['userValidTo'],
            userAreaAllocations: this.userAreas,
            userRoleAllocations: this.roleAreas,
          });

          this.isDistrictAdmin = JSON.parse(
            sessionStorage.getItem('isDistrictAdmin')
          );
          if (this.isDistrictAdmin) {
            this.personalInfoForm.disable();
            this.professionalInfoForm.get('userValidFrom').disable();
            this.professionalInfoForm.get('userValidTo').disable();
            this.professionalInfoForm.get('userType').disable();
            this.professionalInfoForm.get('registrationNo').disable();
          }

          let rolecode = this.professionalInfo.defaultRole.get('roleCd').value;

          if (rolecode == '17') {
            this.professionalInfo.aiCenterCd.addValidators(Validators.required);
          } else {
            this.professionalInfo.aiCenterCd.clearValidators();
          }
          this.professionalInfo.aiCenterCd.updateValueAndValidity({
            emitEvent: false,
          });
        }
      },
      (error) => (this.isLoadingSpinner = false)
    );
    this.getsubOrgList('10', this.orgId, this.baseState);
  }

  getOrgDetails(orgID) {
    this.orgService.getOrgDetail(orgID).subscribe(
      (res) => {
        if (res) {
          this.isLoadingSpinner = false;
          this.onTenureDate = res['organizationBasicInfo'].orgOnboardDate;
          this.onCompletionDate =
            res['organizationBasicInfo'].orgTenureCompleteDate;
          this.orgParticipatingArea = res['organizationParticipatingArea'];
          this.newareaAllocation?.areaAllocationForm?.reset();
          this.getStateAllList();
        }
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  projectAllocation() {
    let userId = sessionStorage.getItem('data');
    this.dialogConfig.position = {
      right: '0',
    };
    this.dialogConfig.width = '50%';
    this.dialogConfig.height = '100vh';
    this.dialogConfig.panelClass = 'custom-dialog-container';
    this.dialogConfig.data = { userID: userId };
    this.dialog.open(UserAllocDeallocComponent, this.dialogConfig);
  }

  // Form Functions
  spaceRestict(event: KeyboardEvent) {
    if (
      (event.target as HTMLInputElement)?.selectionStart === 0 &&
      event.code === 'Space'
    ) {
      event.preventDefault();
    }
  }

  ageCalculate() {
    let year = this.maxDate.getFullYear() - 18;
    let month = this.maxDate.getMonth() + 1;
    let day = this.maxDate.getDate();
    this.userDob = new Date(`${month}/${day}/${year}`);
  }

  backListpage() {
    this.router.navigate(['dashboard/user-management/list']);
  }

  dateChange(event) {
    this.fromDate = event.value;
    this.professionalInfo?.userValidTo.reset();
  }

  mappingdateChange(event, index) {
    this.mappingfromDate[index] = event.value;
  }

  onNext() {
    if (this.personalInfoForm.invalid) {
      this.isLinear = true;
      this.personalInfoForm.markAllAsTouched();
      return;
    }
  }

  runSeqList($array, $name) {
    $array.forEach((element) => {
      $name.push(element.runSeqNo);
    });
  }

  get userRoles() {
    return this.professionalInfoForm.get('userRoleAllocations') as FormArray;
  }

  addUserRoles() {
    this.userRoles.push(this.createUserRoleAllocations());
  }

  createUserRoleAllocations() {
    return this._formBuilder.group({
      roleCd: [null, Validators.required],
      userAllocationEndDate: ['', Validators.required],
      userAllocationStartDate: ['', Validators.required],
    });
  }

  onRemoveRole(rowIndex: number) {
    this.dialog
      .open(ConfirmationDeleteDialogComponent, {
        data: {
          title: 'Alert',
          message: 'Are you sure you want to delete ?',
          icon: 'assets/images/alert.svg',
          primaryBtnText: 'Yes',
          secondaryBtnText: 'No',
        },
        panelClass: 'common-alert-dialog',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.userRoles.removeAt(rowIndex);
          if (this.userRoles.length) {
            this.isaddRole = true;
          } else {
            this.isaddRole = false;
          }
        }
      });
  }

  get rows() {
    return this.professionalInfoForm.get('userAreaAllocations') as FormArray;
  }

  addRow() {
    this.rows.push(this.createUserAreaAllocations());
  }

  createUserAreaAllocations(): FormGroup {
    return this._formBuilder.group({
      stateCd: [null],
      districtCd: [null],
      tehsilCd: [null],
      villageCd: [null],
    });
  }

  onRemoveRow(rowIndex: number) {
    this.dialog
      .open(ConfirmationDeleteDialogComponent, {
        data: {
          title: 'Alert',
          message: 'Are you sure you want to delete ?',
          icon: 'assets/images/alert.svg',
          primaryBtnText: 'Yes',
          secondaryBtnText: 'No',
        },
        panelClass: 'common-alert-dialog',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.rows.removeAt(rowIndex);
          if (this.rows.length) {
            this.isaddArea = true;
          } else {
            this.isaddArea = false;
          }
        }
      });
  }

  getOrgName = () => {
    let userlogin = JSON.parse(sessionStorage.getItem('user'));
    let isLivesatckAdmin = JSON.parse(
      sessionStorage.getItem('isLivesatckAdmin')
    );
    if (!isLivesatckAdmin) {
      this.userService.getOrgName().subscribe((res: any) => {
        this.orglist = res.filter(
          (ele) => ele.orgStatus == 1 && ele.orgId == userlogin.orgId
        );
      });
    } else {
      this.userService.getOrgName().subscribe((res: any) => {
        this.orglist = res.filter((ele) => {
          return ele.orgStatus == 1;
        });
      });
    }
  };

  getRoleList = () => {
    this.isLoadingSpinner = true;
    const data = {
      orgId: this.orgId,
    };
    this.roleList = [];
    this.additionalRole = [];
    this.userService.getRoleListHierarchyWise(data).subscribe(
      (res) => {
        this.isLoadingSpinner = false;
        if (res && res.length) {
          this.roleList = res;
        }
        this.additionalRole = this.roleList.filter((item) => {
          return (
            item.roleCd != this.professionalInfo.defaultRole.get('roleCd').value
          );
        });
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  };

  onchgRole(event) {
    this.additionalRole = [];
    if (this.professionalInfo.defaultRole.get('roleCd').value == '17') {
      this.professionalInfo.aiCenterCd.addValidators(Validators.required);
    } else {
      this.professionalInfo.aiCenterCd.clearValidators();
    }
    this.professionalInfo.aiCenterCd.updateValueAndValidity();
    this.isLoadingSpinner = false;
    this.additionalRole = this.roleList.filter((item) => {
      return item.roleCd != event.roleCd;
    });
  }

  get personalInfo() {
    return this.personalInfoForm.controls;
  }

  findInvalidControls() {
    const controls = this.personalInfoForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
      }
    }
  }

  get professionalInfo() {
    return this.professionalInfoForm.controls;
  }

  onCheckDupRole() {
    this.checkDuplicateList();
  }

  checkDuplicateList() {
    const dup = this.professionalInfoForm.value.userRoleAllocations
      .map((val: any) => val.roleCd)
      .filter((val: any, i: number, role: any[]) => role.indexOf(val) != i);
    const dupRecord =
      this.professionalInfoForm.value.userRoleAllocations.filter(
        (obj: any) => obj.roleCd && dup.includes(obj.roleCd)
      );
    if (dupRecord.length > 1) {
      this.isShowError =
        'Role name already exists. Please select another role name';
    } else {
      this.isShowError = '';
    }
  }

  getuserStateList() {
    this.countryService.getStates().subscribe((stateData: StateList[]) => {
      this.userstateList = stateData;
    });
  }

  getStateList() {
    this.countryService
      .getStatesByUser()
      .subscribe((stateData: StateList[]) => {
        this.stateList = stateData;
      });
  }

  getStateAllList() {
    this.districtList = [];
    this.villageList = [];
    this.tehsilList = [];
    this.countryService
      .getStatesByUser()
      .subscribe((stateData: StateList[]) => {
        this.orgParticipatingArea = this.orgParticipatingArea.map(
          (data) => data.state
        );
        this.stateAllList = stateData.filter((data) =>
          this.orgParticipatingArea.includes(data.stateCode)
        );
      });
  }

  getStateMultiList() {
    this.countryService
      .getStatesByUser()
      .subscribe((stateData: StateList[]) => {
        let isLivesatckAdmin = JSON.parse(
          sessionStorage.getItem('isLivesatckAdmin')
        );
        if (isLivesatckAdmin) {
          this.multiOrgParticipatingArea = this.orgParticipatingArea.map(
            (data) => data.state
          );
          this.stateMultiList = stateData.filter((data) =>
            this.multiOrgParticipatingArea.includes(data.stateCode)
          );
        } else {
          this.stateMultiList = stateData.filter((val) => {
            return (
              val.stateCode ==
              this.professionalInfo.baseLocation.get('stateCd').value
            );
          });
        }
      });
  }

  getDistricts(userState: any) {
    this.districtList = [];
    this.personalInfo.districtCd.patchValue([]);
    this.personalInfoForm.patchValue({
      ownerAddressTehsilCd: '',
      ownerAddressCityVillageCd: '',
    });
    this.countryService
      .getDistrict(userState.stateCode ? +userState.stateCode : userState)
      .subscribe((districtData: DistrictList[]) => {
        this.districtList = districtData.filter(
          (state) =>
            (state.stateCode = userState.stateCode
              ? +userState.stateCode
              : userState)
        );
      });
  }

  getAllDistricts(state: any) {
    this.districtAllList = [];
    this.tehsilList = [];
    this.villageList = [];
    this.aiList = [];
    this.professionalInfo.baseLocation?.get('districtCd').patchValue([]);
    this.professionalInfo.baseLocation?.get('tehsilCd').patchValue([]);
    this.professionalInfo.baseLocation?.get('villageCd').patchValue([]);
    this.professionalInfo.aiCenterCd.patchValue([]);

    this.personalInfoForm.patchValue({
      ownerAddressTehsilCd: '',
      ownerAddressCityVillageCd: '',
    });
    if (state) {
      this.countryService
        .getDistrict(state.stateCode ? +state.stateCode : state)
        .subscribe(
          (districtData: DistrictList[]) => {
            this.isLoadingSpinner = false;
            this.districtAllList = districtData.filter(
              (state: any) =>
                (state.stateCode = state.stateCode ? +state.stateCode : state)
            );
          },
          (err) => {
            this.isLoadingSpinner = false;
          }
        );
      this.getsubOrgList(
        this.suborgType,
        this.orgId,
        state.stateCode ? +state.stateCode : state
      );
      this.getStateMultiList();
    }
  }

  getMultiDistricts(stateCode: any, index, onEdit = false) {
    this.districtMultiList[index] = [];
    this.tehsilMultiList[index] = [];
    this.villageMultiList[index] = [];

    let userArea = (
      this.professionalInfoForm.get('userAreaAllocations') as FormArray
    )?.at(index) as FormGroup;
    if (!onEdit) {
      userArea?.get('districtCd').patchValue([]);
      userArea?.get('tehsilCd').patchValue([]);
      userArea?.get('villageCd').patchValue([]);
    }
    this.personalInfoForm.patchValue({
      ownerAddressTehsilCd: '',
      ownerAddressCityVillageCd: '',
    });
    this.isLoadingSpinner = true;
    this.countryService
      .getDistrict(
        (stateCode.target as HTMLInputElement)
          ? +(stateCode.target as HTMLInputElement)?.value
          : stateCode
      )
      .subscribe(
        (districtData: DistrictList[]) => {
          this.isLoadingSpinner = false;
          this.districtMultiList[index] = districtData.filter(
            (state) =>
              (state.stateCode = (stateCode.target as HTMLInputElement)
                ? +(stateCode.target as HTMLInputElement)?.value
                : stateCode)
          );
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
  }

  getTehsil(district: any) {
    this.villageList = [];
    this.professionalInfo.baseLocation?.get('tehsilCd').patchValue([]);
    this.professionalInfo.baseLocation?.get('villageCd').patchValue([]);
    if (district) {
      this.countryService
        .getTehsil(district.districtCd ? +district.districtCd : district)
        .subscribe(
          (tehsilData: TehsilList[]) => {
            this.tehsilList = tehsilData.filter(
              (district: any) =>
                (district.districtCd = district.districtCd
                  ? +district.districtCd
                  : district)
            );
          },
          (err) => {
            this.isLoadingSpinner = false;
          }
        );
    }
  }

  getMultiTehsil(districtCode: any, index, onEdit = false) {
    this.tehsilMultiList[index] = [];
    this.villageMultiList[index] = [];

    let userArea = (
      this.professionalInfoForm.get('userAreaAllocations') as FormArray
    )?.at(index) as FormGroup;
    if (!onEdit) {
      userArea?.get('tehsilCd').reset();
      userArea?.get('villageCd').reset();
    }
    this.isLoadingSpinner = true;
    this.countryService
      .getTehsil(
        (districtCode.target as HTMLInputElement)
          ? +(districtCode.target as HTMLInputElement)?.value
          : districtCode
      )
      .subscribe(
        (tehsilData: TehsilList[]) => {
          this.isLoadingSpinner = false;
          this.tehsilMultiList[index] = tehsilData.filter((tehsil) => {
            tehsil.districtCode = (districtCode.target as HTMLInputElement)
              ? +(districtCode.target as HTMLInputElement)?.value
              : districtCode;
            return tehsil.districtCode;
          });
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
  }

  getMultiVillage(tehsilCode: any, index: any, onEdit = false) {
    this.villageMultiList[index] = [];
    let userArea = (
      this.professionalInfoForm.get('userAreaAllocations') as FormArray
    )?.at(index) as FormGroup;
    if (!onEdit) {
      userArea?.get('villageCd').reset();
    }
    this.isLoadingSpinner = true;
    this.countryService
      .getVillages(
        (tehsilCode.target as HTMLInputElement)
          ? +(tehsilCode.target as HTMLInputElement)?.value
          : tehsilCode
      )
      .subscribe(
        (villageData: VillageList[]) => {
          this.isLoadingSpinner = false;
          this.villageMultiList[index] = villageData;
          this.selectAllForDropdownItems(this.villageMultiList[index]);
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
  }

  getVillage(tehsil: any) {
    this.isLoadingSpinner = true;
    this.professionalInfo.baseLocation.get('villageCd').patchValue([]);
    if (tehsil) {
      this.countryService
        .getVillages(tehsil.tehsilCd ? +tehsil.tehsilCd : tehsil)
        .subscribe(
          (villageData: VillageList[]) => {
            this.isLoadingSpinner = false;
            this.villageList = villageData.filter(
              (village: any) =>
                (village.tehsilCd = tehsil.tehsilCd ? +tehsil.tehsilCd : tehsil)
            );
          },
          (err) => {
            this.isLoadingSpinner = false;
          }
        );
    }
  }

  selectAllForDropdownItems(items: VillageList[]) {
    let allSelect = (items) => {
      items.forEach((element) => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };
    allSelect(items);
  }

  onFileUpload(event: Event) {
    this.isLoadingSpinner = true;
    this.file = (event.target as HTMLInputElement).files[0];
    let data = getFileSize(this.file);
    if (!data) {
      this.isValidProfileTypeOrSize =
        'File size has exceeded it max limit of 5MB';
      this.isLoadingSpinner = false;
      return;
    }
    let reader = new FileReader();
    reader.onload = (event: any) => {
      this.userImg = event.target.result;
    };
    reader.readAsDataURL(this.file);
    const formData = new FormData();
    formData.append('key', 'adminmoduleUserImage'),
      formData.append('file', this.file);
    this.personalInfoForm.get('images').updateValueAndValidity();
    this.userService.validateFile(formData).subscribe(
      (response) => {
        if (response) {
          this.isLoadingSpinner = false;
          this.personalInfoForm.patchValue({
            images: this.file,
          });
          this.personalInfoForm.get('images').updateValueAndValidity();
          this.isValidProfileTypeOrSize = '';
        } else {
          this.isLoadingSpinner = false;
          this.isValidProfileTypeOrSize =
            'Please upload a valid file(JPG/JPEG/PNG) upto 5Mb';
        }
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  onAdhaarUpload(event: Event) {
    this.isLoadingSpinner = true;
    this.aadhaarfile = (event.target as HTMLInputElement).files[0];
    let data = getFileSize(this.aadhaarfile);
    if (!data) {
      this.isValidFileTypeOrSize = 'File size has exceeded it max limit of 5MB';
      this.isLoadingSpinner = false;
      return;
    }
    const formData = new FormData();
    formData.append('key', 'adminmoduleUserReg'),
      formData.append('file', this.aadhaarfile);
    this.personalInfoForm.get('adhardoc').updateValueAndValidity();
    this.userService.validateFile(formData).subscribe(
      (response) => {
        if (response) {
          this.isLoadingSpinner = false;
          this.personalInfoForm.patchValue({
            adhardoc: this.aadhaarfile,
          });
          this.personalInfoForm.get('adhardoc').updateValueAndValidity();
          this.isValidFileTypeOrSize = '';
        } else {
          this.isLoadingSpinner = false;
          this.isValidFileTypeOrSize =
            'Please upload a valid file(JPG/JPEG/PNG/PDF) upto 5Mb';
        }
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  getCommonAPIData() {
    this.userService.getCommonList('title').subscribe((title) => {
      this.title = title;
    });

    this.userService.getCommonList('language_cd').subscribe((language_cd) => {
      this.language = language_cd;
    });

    this.userService.getCommonList('user_type').subscribe((user_type) => {
      this.userType = user_type;
    });

    this.userService
      .getCommonList('owner_category')
      .subscribe((owner_category) => {
        this.category = owner_category;
      });

    // this.userService.getCommonList('sub_org_type').subscribe((sub_org_type) => {
    //   this.subOrgType = sub_org_type;
    // });

    this.userService.getCommonList('user_status').subscribe((user_status) => {
      this.userStatus = user_status;
    });
  }

  onchangeAI(event) {
    let state = this.professionalInfo.baseLocation.get('stateCd').value;
    this.suborgType = event.target.value;
    this.professionalInfo.subOrgType.setValue(this.suborgType);
    this.getsubOrgList(this.suborgType, this.orgId, state);
  }

  getsubOrgList(subOrgType, org, state) {
    this.userService.getSubOrgList(subOrgType, org, state).subscribe(
      (data) => {
        this.aiList = data.filter((element) => element.subOrgStatus == 1);
        if (this.aiList && this.aiList.length > 0) {
          this.professionalInfo.subOrgType.setValue(subOrgType);
        } else {
          this.professionalInfo.subOrgType.setValue('');
        }
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  onChgOrg(event) {
    this.professionalInfo?.defaultRole?.get('roleCd').reset();
    this.professionalInfo?.userValidTo.reset();
    this.professionalInfo?.baseLocation.reset();
    if (event.orgId) {
      this.orgId = event.orgId;
      this.isLoadingSpinner = true;
      this.professionalInfo?.userValidTo.reset();
      this.getOrgDetails(this.orgId);
    }
    this.getRoleList();
  }

  addRole(val) {
    this.isaddRole = !this.isaddRole;
    if (this.isaddRole) {
      if (this.userId) {
        if (this.roleAreas && this.roleAreas.length) {
        } else {
          this.removeAllRole();
          this.addUserRoles();
        }
      } else {
        this.removeAllRole();
        this.addUserRoles();
      }
    }
  }

  removeAllRole() {
    const arr = this.professionalInfoForm.get(
      'userRoleAllocations'
    ) as FormArray;
    while (arr.length) {
      arr.removeAt(0);
    }
  }

  addArea(val) {
    this.isaddArea = !this.isaddArea;
    if (this.isaddArea) {
      this.addRow();
    } else {
      const arr = this.professionalInfoForm.get(
        'userAreaAllocations'
      ) as FormArray;
      while (arr.length) {
        arr.removeAt(0);
      }
    }
  }

  onSubmit() {
    if (this.professionalInfoForm.invalid) {
      this.isLinear = true;
      this.professionalInfoForm.markAllAsTouched();
      return;
    }

    let formData = new FormData();
    const dateK = [
      'userValidFrom',
      'userValidTo',
      'userAllocationStartDate',
      'userAllocationEndDate',
    ];
    const encpydata = [
      'dateOfBirth',
      'mobileNo',
      'alternateNo',
      'aadhaarNoUuid',
    ];
    const imgData = ['images', 'adhardoc'];
    for (let key of Object.keys(this.personalInfoForm.getRawValue())) {
      if (
        (key == 'images' && this.file == undefined) ||
        (key == 'adhardoc' && this.aadhaarfile == undefined)
      ) {
        continue;
      } else if (
        this.personalInfoForm.getRawValue()[key] &&
        dateK.includes(key)
      ) {
        formData.append(
          key,
          moment(this.personalInfoForm.getRawValue()[key]).format('YYYY/MM/DD')
        );
      } else if (
        this.personalInfoForm.getRawValue()[key] &&
        encpydata.includes(key)
      ) {
        if (key == 'dateOfBirth') {
          formData.append(
            key,
            encryptText(
              moment(this.personalInfoForm.getRawValue()[key]).format(
                'YYYY-MM-DD'
              )
            )
          );
        } else {
          formData.append(
            key,
            encryptText(this.personalInfoForm.getRawValue()[key].toString())
          );
        }
      } else {
        if (!this.userId) {
          if (key == 'userStatus') {
            continue;
          }
        }

        formData.append(key, this.personalInfoForm.getRawValue()[key]);
      }
    }

    for (let key of Object.keys(this.professionalInfoForm.getRawValue())) {
      if (key == 'userRoleAllocations') {
        continue;
      } else if (key == 'baseLocation' || key == 'defaultRole') {
        if (this.userId != null && key == 'baseLocation') {
          this.professionalInfoForm.getRawValue()[key]['runSeqNo'] =
            this.bRunSeqNo;
        } else {
          this.professionalInfoForm.getRawValue()[key]['runSeqNo'] =
            this.defRunSeqNo;
        }
        formData.append(
          key,
          JSON.stringify(this.professionalInfoForm.getRawValue()[key])
        );
      } else {
        if (
          this.professionalInfoForm.getRawValue()[key] &&
          dateK.includes(key)
        ) {
          formData.append(
            key,
            moment(this.professionalInfoForm.value[key]).format('YYYY/MM/DD')
          );
        } else {
          if (key == 'userAreaAllocations') {
            continue;
          }
          formData.append(key, this.professionalInfoForm.getRawValue()[key]);
        }
      }
    }
    if (this.userId) {
      formData.append('userId', sessionStorage.getItem('data'));
      if (this.isaddArea == true) {
        if (
          !this.updateAreaAllocation?.selectedState ||
          !this.updateAreaAllocation.selectedState.length
        ) {
          this.dialog.open(ConfirmationDialogComponent, {
            data: {
              title: this.translateService.instant('common.info_label'),
              message: this.translateService.instant(
                'errorMsg.no_selected_state'
              ),
              primaryBtnText: this.translateService.instant('common.ok_string'),
              errorFlag: true,
              icon: 'assets/images/info.svg',
            },
            width: '500px',
            panelClass: 'common-info-dialog',
          });
          return;
        } else if (
          !this.updateAreaAllocation?.selectedDistrict ||
          !this.updateAreaAllocation.selectedDistrict.length
        ) {
          this.dialog.open(ConfirmationDialogComponent, {
            data: {
              title: this.translateService.instant('common.info_label'),
              message: this.translateService.instant(
                'errorMsg.no_selected_district'
              ),
              primaryBtnText: this.translateService.instant('common.ok_string'),
              errorFlag: true,
              icon: 'assets/images/info.svg',
            },
            width: '500px',
            panelClass: 'common-info-dialog',
          });
          return;
        } else if (
          !this.updateAreaAllocation?.selectedTehsil ||
          !this.updateAreaAllocation.selectedTehsil.length
        ) {
          this.dialog.open(ConfirmationDialogComponent, {
            data: {
              title: this.translateService.instant('common.info_label'),
              message: this.translateService.instant(
                'errorMsg.no_selected_tehsil'
              ),
              primaryBtnText: this.translateService.instant('common.ok_string'),
              errorFlag: true,
              icon: 'assets/images/info.svg',
            },
            width: '500px',
            panelClass: 'common-info-dialog',
          });
          return;
        } else if (
          !this.updateAreaAllocation?.selectedVillage ||
          !this.updateAreaAllocation.selectedVillage.length
        ) {
          this.dialog.open(ConfirmationDialogComponent, {
            data: {
              title: this.translateService.instant('common.info_label'),
              message: this.translateService.instant(
                'errorMsg.no_selected_village'
              ),
              primaryBtnText: this.translateService.instant('common.ok_string'),
              errorFlag: true,
              icon: 'assets/images/info.svg',
            },
            width: '500px',
            panelClass: 'common-info-dialog',
          });
          return;
        }
      }
      this.isLoadingSpinner = true;
      this.userService.updateUser(formData).subscribe(
        (response) => {
          const updateRequest = [];
          if (this.isaddRole) {
            var roleAssign = this.professionalInfo.userRoleAllocations.value;
            for (let [index, role] of roleAssign.entries()) {
              role.userAllocationStartDate = moment(
                role.userAllocationStartDate
              ).format('YYYY/MM/DD');
              role.userAllocationEndDate = moment(
                role.userAllocationEndDate
              ).format('YYYY/MM/DD');
              role.userId = this.userId;
              role.runSeqNo = this.roleRunSeqNo[index];
              if (
                role.roleCd != '' &&
                (role.userAllocationStartDate && role.userAllocationEndDate) !=
                  'Invalid date'
              ) {
                this.isAssignRole = true;
              } else {
                this.isAssignRole = false;
              }
            }
          } else {
            roleAssign = [];
            roleAssign.push({
              userId: this.userId,
            });
          }
          updateRequest.push(
            this.userService
              .updateRoleArea(roleAssign)
              .pipe(catchError(() => of(null)))
          );
          if (this.isaddArea) {
            var AreaAssign = this.createFinalRequest(
              this.updateAreaAllocation.selectedVillage
            );
            AreaAssign.forEach((element, index) => {
              element.userId = this.userId;
            });
          } else {
            AreaAssign = [
              {
                userId: this.userId,
              },
            ];
          }
          updateRequest.push(
            this.userService
              .updateUserArea(AreaAssign)
              .pipe(catchError(() => of(null)))
          );
          forkJoin(updateRequest).subscribe(
            (response) => {
              this.isLoadingSpinner = false;
              this.popupupdate(response);
            },
            (err) => (this.isLoadingSpinner = false)
          );
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
    } else {
      if (this.isaddArea == true) {
        if (this.newareaAllocation.areaAllocationForm.invalid) {
          this.newareaAllocation.areaAllocationForm.markAllAsTouched();
          return;
        }
      }
      this.isLoadingSpinner = true;
      this.userService.createUser(formData).subscribe(
        (response: any) => {
          if (response) {
            this.isLoadingSpinner = false;
            sessionStorage.setItem('data', response.data.userId);
            if (this.isAssignRole) {
              let roleAssign = this.professionalInfo.userRoleAllocations.value;
              for (let role of roleAssign) {
                role['userId'] = sessionStorage.getItem('data');
                role.userAllocationStartDate = moment(
                  role.userAllocationStartDate
                ).format('YYYY/MM/DD');
                role.userAllocationEndDate = moment(
                  role.userAllocationEndDate
                ).format('YYYY/MM/DD');
                if (
                  role.roleCd != '' &&
                  (role.userAllocationStartDate &&
                    role.userAllocationEndDate) != 'Invalid date'
                ) {
                  this.isAssignRole = true;
                } else {
                  this.isAssignRole = false;
                }
              }
              this.userService.assignRoleUser(roleAssign).subscribe(
                (val) => {
                  this.isLoadingSpinner = false;
                },
                (err) => {
                  this.isLoadingSpinner = false;
                }
              );
            }
            if (this.isaddArea == true) {
              this.createRequestAreaAllocationForUser(response);
            } else if (this.isaddArea == false) {
              this.popup(response);
            }
          }
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
    }
  }

  createRequestAreaAllocationForUser(userCreationResponse?: any) {
    this.isLoadingSpinner = true;
    const formValue = this.newareaAllocation.areaAllocationForm.value;
    let areaRequest = null;
    if (formValue.selectedVillage && formValue.selectedVillage.length) {
      areaRequest = this.createFinalRequest(formValue.selectedVillage);
      this.manageAreaAllocationforUser(areaRequest, userCreationResponse);
    } else if (
      formValue.selectedTehsil &&
      formValue.selectedTehsil.length > 1
    ) {
      this.userService
        .getMultiVillages(formValue.selectedTehsil.map((teh) => teh.tehsilCd))
        .subscribe((villages: any) => {
          areaRequest = this.createFinalRequest(villages);
          this.manageAreaAllocationforUser(areaRequest, userCreationResponse);
        });
    } else if (
      formValue.selectedDistrict &&
      formValue.selectedDistrict.length > 1
    ) {
      this.userService
        .getMultiTehsils(
          formValue.selectedDistrict.map((dist) => dist.districtCd)
        )
        .subscribe((tehsils: any) => {
          this.userService
            .getMultiVillages(tehsils.map((teh) => teh.tehsilCd))
            .subscribe((villages: any) => {
              areaRequest = this.createFinalRequest(villages);
              this.manageAreaAllocationforUser(
                areaRequest,
                userCreationResponse
              );
            });
        });
    } else if (formValue.stateCd && formValue.stateCd.length > 1) {
      this.userService
        .getMultiDistricts(formValue.stateCd.map((state) => state.stateCode))
        .subscribe((dist: any) => {
          this.userService
            .getMultiTehsils(dist.map((dist) => dist.districtCd))
            .subscribe((tehsils: any) => {
              this.userService
                .getMultiVillages(tehsils.map((teh) => teh.tehsilCd))
                .subscribe((villages: any) => {
                  areaRequest = this.createFinalRequest(villages);
                  this.manageAreaAllocationforUser(
                    areaRequest,
                    userCreationResponse
                  );
                });
            });
        });
    }
  }

  createFinalRequest(arr) {
    const finalRequest = arr.reduce((grouped, obj) => {
      const parentIndex = grouped.findIndex(
        (group) => group.tehsilCd === obj.tehsilCd
      );
      if (parentIndex == -1) {
        grouped.push({
          stateCd: obj.stateCd,
          districtCd: obj.districtCd,
          tehsilCd: obj.tehsilCd,
          userId: sessionStorage.getItem('data'),
          villageCd: [obj.villageCd],
        });
      } else {
        grouped[parentIndex]['villageCd'].push(obj.villageCd);
      }
      return grouped;
    }, []);
    return finalRequest;
  }

  manageAreaAllocationforUser(areaRequest, userCreationResponse) {
    this.userService.manageUserArea(areaRequest).subscribe(
      (areaData) => {
        this.isLoadingSpinner = false;
        this.popup(userCreationResponse);
      },
      (err) => (this.isLoadingSpinner = false)
    );
  }

  popupupdate(response) {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          // title: 'User Successfully Updated',
          title: 'Info',
          message: `${response[0]['msg']?.msgDesc}`,
          icon: 'assets/images/info.svg',
          primaryBtnText: 'Ok',
          // secondaryBtnText: 'Cancel',
        },
        panelClass: 'common-info-dialog',
      })
      .afterClosed()
      .subscribe((result) => {
        // if (result) {
        this.router.navigate(['dashboard/user-management/user-details']);
        // this.router.navigate(['../'], { relativeTo: this.route });
        // }
      });
  }

  popup(response) {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          // title: 'User Successfully Created',
          title: 'Info',
          message: `${response['msg'].msgDesc}`,
          icon: 'assets/images/verified.svg',
          primaryBtnText: 'ok',
          // secondaryBtnText: 'cancel',
        },
        panelClass: 'common-info-dialog',
      })
      .afterClosed()
      .subscribe((result) => {
        // if (result) {
        this.router.navigate(['dashboard/user-management/user-details']);
        // this.router.navigate(['dashboard/user-management/list']);
        // }
      });
  }

  goBack() {
    this.location.back();
  }

  deleteAreaAllocation($event) {
    this.additionalAreaAllocations = [];
    this.isaddArea = false;
  }
}
