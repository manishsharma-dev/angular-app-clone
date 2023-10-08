import { Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { StepperOrientation } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import {
  NameValidation,
  EmailValidation,
  MobileValidation,
  AlphaNumericSpecialValidation,
  NamespecialValidation,
} from 'src/app/shared/utility/validation';
import { ProjectManagementService } from '../project-management.service';
import { OrganizationManagementService } from '../../organization-management/organization-management.service';
import moment from 'moment';
import {
  encryptText,
  getDecryptedData,
  setEncryptedData,
} from 'src/app/shared/shareService/storageData';
import { Common } from '../models/common.model';

@Component({
  selector: 'app-project-reg-form',
  templateUrl: './project-reg-form.component.html',
  styleUrls: ['./project-reg-form.component.css'],
  // encapsulation: ViewEncapsulation.None,
})
export class ProjectRegFormComponent implements OnInit {
  activeTab = 'on_spot';
  isLinear = true;
  isAddLevel: boolean = false;
  projectInfoForm: FormGroup;
  public orglist: any;
  public mission: any;
  public programlist: any;
  public scheme: any;
  public species: any;
  public rBreed: any;
  public dBreed: any;
  public orgType: any;
  public org_type: any;
  public uniqueOrgType: any;
  public projectOrg: any[][] = [];
  public stateDetails: any[][] = [];
  public districtDetails: any[][] = [];
  public selectedDistrictDetails: any = [];
  public uniqueDistrict: any;
  public isLoadingSpinner: boolean;
  public projectActivity: any = [];
  public minDate: any;
  public endDate: any;
  public onTenureDate: any[][] = [];
  public onCompletionDate: any[][] = [];
  public projectStartDate: any;
  public projectEndDate: any;
  public projectStatus: Common[];
  public ageArray: number[] = [];
  public ageMax: number[];
  public projectAreaMapping: any = [];
  // public minRAge: number = 0;
  // public minDAge: number = 0;
  public activityList: any;
  public projectId: number | string;
  public mappingstartDate: any[][] = [];
  public mappingendDate: any[][] = [];
  public projectform: boolean;
  public selectedProgram: any = [];
  public btnTextDynamic = 'Submit';
  public parametercode: any;
  public statelist: any = [];
  public stepperOrientation: Observable<StepperOrientation>;
  public admin_livestack: Common[];
  public orgAllList: any;
  public getProjectActionType: string;

  constructor(
    private _formBuilder: FormBuilder,
    breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
    private router: Router,
    private location: Location,
    private projectService: ProjectManagementService,
    private orgService: OrganizationManagementService,
    private chgded: ChangeDetectorRef
  ) {
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
  }

  firstFormGroup = this._formBuilder.group({
    orgName: ['', Validators.required],
    projectStatus: ['1'],
    mission: ['', Validators.required],
    program: [''],
    scheme: [''],
    projectName: ['', [Validators.required, NamespecialValidation]],
    discription: ['', [Validators.required, NamespecialValidation]],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    dataEndDate: [''],
    projectAct: ['', Validators.required],
    projectActivity: this._formBuilder.array([]),
  });
  secondFormGroup = this._formBuilder.group({
    userAllocation: ['M', Validators.required],
    r_Sex: [null],
    r_Species: [null],
    r_Breed: [null],
    r_minAge: [null],
    r_maxAge: [null],
    d_Sex: [null],
    d_Species: [null],
    d_Breed: [null],
    d_minAge: [null],
    d_maxAge: [null],
    contact_Person: ['', [Validators.required, NamespecialValidation]],
    contact_Disc: ['', NamespecialValidation],
    email: ['', [Validators.required, EmailValidation]],
    mobile: ['', [Validators.required, MobileValidation]],
    alt_Mobile: ['', MobileValidation],
  });
  thirdFormGroup = this._formBuilder.group({
    participateMore: this._formBuilder.array([]),
  });

  ngOnInit(): void {
    this.getProjectActionType = getDecryptedData('AESSHA256ProjectList').type;
    this.projectId = getDecryptedData('AESSHA256ProjectList').id;
    // console.log("protrodddbb",this.projectId)
    this.districtDetails = [];
    this.projectInfoForm = this._formBuilder.group({});
    this.getOrgNameList();
    this.getOrgListwithorgType();
    this.getCommonAPIData();
    this.getprojectActivities();
    this.increement();
    // this.secondFormGroup.get('r_Sex').enable();
    this.firstFormGroup.get('projectStatus').valueChanges.subscribe((val) => {
      if (val == 3) {
        let currentDate = sessionStorage.getItem('serverCurrentDateTime');
        this.firstFormGroup.get('endDate').setValue(currentDate);
      }
    });

    if (!this.projectId) {
      this.addLevel();
    }
  }

  bindProjectData() {
    if (this.getProjectActionType == 'edit') {
      this.btnTextDynamic = 'Update';
    } else {
      this.btnTextDynamic = 'Clone';
    }

    this.ageMax = this.ageArray.filter((item) => {
      this.isLoadingSpinner = false;
      return (
        item > this.secondFormGroup.get('d_minAge').value ||
        this.secondFormGroup.get('r_minAge').value
      );
    });
    const activityArry: any = [];

    this.projectService
      .getProjectDetail(this.projectId)
      .subscribe((data: any) => {
        data['projectValuesDetails']['restrictedSex'];
        data['projectValuesDetails']['defaultSex'];
        data['projectValuesDetails']['restrictedSpeciesCd'];
        data['projectValuesDetails']['defaultSpeciesCd'];
        data['projectLocationMap'].forEach((element, i) => {
          this.statelist.push(element.stateCd);
        });

        data['projectLocationMap'].forEach((district: any) => {
          district.districtsCdWithNames.forEach(
            (item, index) => {
              let districtlist = item.split('-');
              if (districtlist) {
                this.isLoadingSpinner = false;
                this.selectedDistrictDetails.push({
                  districtcd: districtlist[0],
                  districtName: districtlist[1],
                });
              }
            },
            (err) => {
              this.isLoadingSpinner = false;
            }
          );

          data['projectLocationMap'].forEach((item, index) => {
            item.districtcd = item.districtsCd;
          });
          this.projectAreaMapping = data['projectLocationMap'];
        });

        this.onChgOrgName(data['orgId'], true);
        let enddateval = data['projectDeEndDate'];
        let startDateval = data['projectStartDate'];
        this.dateChange(startDateval, true);
        this.endDateChange(enddateval, true);
        let projectArealength = data['projectLocationMap'].length;
        if (data['projectLocationMap'].length > 0) {
          for (let i = 0; i < projectArealength; i++) {
            this.onchgOrgType(data['projectLocationMap'][i].orgType, i, true);
            this.onChgOrg(data['projectLocationMap'][i].orgSuborgId, i, true);
            this.onChgState(this.statelist[i], i, true);
            this.mappingdateChange(
              data['projectLocationMap'][i].orgMappingStartDate,
              i,
              true
            );
            this.mappingdataEntryChange(
              data['projectLocationMap'][i].orgMappingEndDate,
              i,
              true
            );
            this.addLevel();
          }
        } else {
          this.addLevel();
        }

        data.activityCd.forEach((res) => {
          activityArry.push(res.activityCd);
        });
        if (activityArry.length) {
          this.projectService.getParameterList(activityArry).subscribe(
            (item) => {
              this.isLoadingSpinner = false;
              this.activityList = item;
              this.addParamaterList(item, data.activityCd);
            },
            (err) => {
              this.isLoadingSpinner = false;
            }
          );
        }
        this.firstFormGroup.patchValue({
          mission: data['projectMissionCd'],
          orgName: data['orgId'],
          projectStatus: data['status'],
          projectAct: activityArry,
          program: this.getSelectdId(data['programCd'], 'programCd'),
          scheme: this.getSelectdId(data['schemeCd'], 'schemeCd'),
          projectName: data['projectName'],
          discription: data['projectDesc'],
          startDate: data['projectStartDate'],
          endDate: data['projectEndDate'],
          dataEndDate: data['projectDeEndDate'],
        });
        if (data['projectValuesDetails']['defaultSpeciesCd'] != null) {
          this.projectService
            .getBreedList(data['projectValuesDetails']['defaultSpeciesCd'])
            .subscribe(
              (item) => {
                this.isLoadingSpinner = false;
                this.dBreed = item;
              },
              (err) => {
                this.isLoadingSpinner = false;
              }
            );
        } else {
          if (data['projectValuesDetails']['restrictedSpeciesCd'] != null) {
            this.projectService
              .getBreedList(data['projectValuesDetails']['restrictedSpeciesCd'])
              .subscribe(
                (item) => {
                  this.isLoadingSpinner = false;
                  this.rBreed = item;
                  // console.log('dddddd', this.rBreed)
                },
                (err) => {
                  this.isLoadingSpinner = false;
                }
              );
          }
        }
        this.secondFormGroup.patchValue({
          userAllocation: data['userAllocationprocessFlag'],
          r_Sex: data['projectValuesDetails']['restrictedSex'],
          d_Sex: data['projectValuesDetails']['defaultSex'],
          r_Species: data['projectValuesDetails']['restrictedSpeciesCd'],
          d_Species: data['projectValuesDetails']['defaultSpeciesCd'],
          r_Breed: data['projectValuesDetails']['restrictedBreedCd'],
          d_Breed: data['projectValuesDetails']['defaultBreedCd'],
          r_minAge: data['projectValuesDetails']['restrictedAgeMin'],
          d_minAge: data['projectValuesDetails']['defaultAgeMin'],
          d_maxAge: data['projectValuesDetails']['defaultAgeMax'],
          r_maxAge: data['projectValuesDetails']['restrictedAgeMax'],
          contact_Person: data['contactPersonName'],
          contact_Disc: data['designation'],
          email: data['emailId'],
          mobile: data['mobileNo'],
          alt_Mobile:
            data['alternateNo'] != null && data['alternateNo'] != 0
              ? data['alternateNo']
              : '',
          // alt_Mobile: data['alternateNo'],
        });
        // this.setthirdvalue();

        // this.projectAreaMapping.forEach(element => {

        // });

        this.chgded.detectChanges();

        let projectmore = this.thirdFormGroup.get('participateMore').value;
      });
  }

  backListpage() {
    this.router.navigate(['dashboard/project-management/list']);
  }

  setthirdvalue() {
    if (this.projectAreaMapping && this.projectAreaMapping.length > 0) {
      this.projectAreaMapping.forEach((element, i) => {
        if (this.projectAreaMapping[i]?.districtsCd?.length) {
          this.projectAreaMapping[i].districtsCd = this.projectAreaMapping[
            i
          ].districtsCd.map((x) => x.toString());
        }
      });
      this.thirdFormGroup.patchValue({
        participateMore: this.projectAreaMapping,
      });
    }
  }

  getSelectdId(list, key) {
    let selected: any = [];
    if (list && list.length > 0) {
      list.forEach((element) => {
        selected.push(element[key]);
      });
    }
    return selected;
  }

  getDecryptedData(arg0: string) {
    throw new Error('Method not implemented.');
  }

  addParamaterList(param, activitycd?) {
    // let parameterValue;
    if (param && param.length) {
      for (let [i, item] of param.entries()) {
        const index = this.getparamterList.value.findIndex(
          (p) => p.activityCd === item.subModuleCd
        );
        const activitycdIndex = activitycd?.findIndex(
          (a) => a.activityCd === item.subModuleCd
        );

        if (index !== -1) {
          continue;
        }

        const paramList = this._formBuilder.group({
          activityCd: item.subModuleCd,
          activityName: item.subModuleName,
          activityParameterList: this._formBuilder.array(
            this.addParamList(
              item.parameterList,
              activitycd && activitycd[activitycdIndex]
            )
          ),
        });
        this.getparamterList.push(paramList);
      }
    }
  }

  avoidSpecialChar(event: any) {
    let key;
    key = event.charCode;
    return (key > 47 && key < 58) || key == 45 || key == 46;
  }

  addParamList(data, activitycd?) {
    const formArray: any[] = [];
    data.length &&
      data.forEach((element, i) => {
        this.parametercode = element.parameterCd;
        formArray.push(
          this._formBuilder.group({
            parameterCd: [element.parameterCd],
            parameterValue: [
              activitycd?.activityParameterList[i]?.parameterValue ?? '',
              Validators.required,
            ],
            parameterName: [{ value: element.parameterName, disabled: false }],
          })
        );
      });
    return formArray;
  }

  get getparamterList() {
    return this.firstFormGroup.get('projectActivity') as FormArray;
  }

  parseValueOfBothFormArray(
    parentArray,
    childArray,
    parentGroup: FormGroup,
    childGroup: FormGroup
  ) {
    let parentactivityCode = parentGroup.get('activityCd').value;
    let childactivityCode = childGroup.get('activityCd').value;
    if (
      (parentactivityCode == 57 || parentactivityCode == 58) &&
      (childactivityCode == 57 || childactivityCode == 58)
    ) {
      (childGroup.get('activityParameterList') as FormArray).setValue(
        parentArray
      );
    }
  }

  enteredParamValue(data: Array<FormGroup>, item: FormGroup, event) {
    let crrForm = item.value;
    if (crrForm.activityCd == 57 || crrForm.activityCd == 58) {
      let secondCd = crrForm.activityCd == 57 ? 58 : 57;
      for (var i of data) {
        if (i.get('activityCd').value == secondCd) {
          this.parseValueOfBothFormArray(
            item.get('activityParameterList').value,
            i.get('activityParameterList').value,
            item,
            i
          );
        }
      }
    }
    // for (let x of data) {
    //   console.table(x.get('activityParameterList').value);
    // }
  }

  increement() {
    for (var i = 1; i <= 25; i++) {
      this.ageArray.push(i);
    }
  }

  onchgrMinAge(event) {
    // this.minRAge = event.target.value;
    this.isLoadingSpinner = true;
    let minAge = this.secondFormGroup.get('r_minAge').value;
    if (minAge != 'null') {
      this.secondFormGroup.get('d_minAge').disable();
      this.secondFormGroup.get('d_maxAge').disable();
    } else {
      this.secondFormGroup.get('d_minAge').enable();
      this.secondFormGroup.get('d_maxAge').enable();
    }
    this.ageMax = this.ageArray.filter(
      (item) => {
        this.isLoadingSpinner = false;
        return item > event.target.value;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  onchgdMinAge(event) {
    this.isLoadingSpinner = true;
    let minAge = this.secondFormGroup.get('d_minAge').value;
    if (minAge != 'null') {
      this.secondFormGroup.get('r_minAge').disable();
      this.secondFormGroup.get('r_maxAge').disable();
    } else {
      this.secondFormGroup.get('r_minAge').enable();
      this.secondFormGroup.get('r_maxAge').enable();
    }
    this.ageMax = this.ageArray.filter(
      (item) => {
        this.isLoadingSpinner = false;
        return item > event.target.value;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  get participates() {
    return this.thirdFormGroup.get('participateMore') as FormArray;
  }

  addLevel() {
    let levelLength = this.thirdFormGroup.value.participateMore.length;
    if (levelLength < 50) {
      this.participates.push(this.createLevels());
    } else {
      this.isAddLevel = true;
    }
  }

  removeLevelAt(i) {
    this.participates.removeAt(i);
    this.projectOrg.splice(i, 1);
    this.stateDetails.splice(i, 1);
    this.districtDetails.splice(i, 1);
    this.isAddLevel = false;
  }

  createLevels() {
    return this._formBuilder.group({
      orgType: ['', Validators.required],
      orgSuborgId: ['', Validators.required],
      stateCd: ['', Validators.required],
      districtsCd: ['', Validators.required],
      orgMappingStartDate: ['', Validators.required],
      orgMappingEndDate: ['', Validators.required],
      deEndDate: ['', Validators.required],

      // m_Start_Date: [{ value: '', disabled: true }, Validators.required],
      // m_End_Date: [{ value: '', disabled: true }, Validators.required],
    });
  }

  // get projectInfo() {
  //   return this.projectInfoForm.controls;
  // }

  mappingdateChange(event, i, onEdit = false) {
    if (!onEdit) {
      (
        (this.thirdFormGroup.get('participateMore') as FormArray)?.at(
          i
        ) as FormGroup
      )
        ?.get('orgMappingEndDate')
        .reset();
      (
        (this.thirdFormGroup.get('participateMore') as FormArray)?.at(
          i
        ) as FormGroup
      )
        ?.get('deEndDate')
        .reset();
      this.mappingstartDate[i] = event.value;
    } else {
      this.mappingstartDate[i] = event;
    }
  }

  mappingdataEntryChange(event, i, onEdit = false) {
    if (!onEdit) {
      (
        (this.thirdFormGroup.get('participateMore') as FormArray)?.at(
          i
        ) as FormGroup
      )
        ?.get('deEndDate')
        .reset();
      this.mappingendDate[i] = event.value;
    } else {
      this.mappingendDate[i] = event;
    }
  }

  get firstFormInfo() {
    return this.firstFormGroup.controls;
  }

  get secondFormInfo() {
    return this.secondFormGroup.controls;
  }

  dateChange(event, onEdit = false) {
    this.firstFormInfo.endDate.reset();
    // this.firstFormInfo.dataEndDate.reset();
    if (!onEdit) {
      this.minDate = event.value;
    } else {
      this.isLoadingSpinner = false;
      this.minDate = event;
    }
  }

  endDateChange(event, onEdit = false) {
    // this.firstFormInfo.dataEndDate.reset();
    if (!onEdit) {
      this.endDate = event.value;
    } else {
      this.isLoadingSpinner = false;
      this.endDate = event;
    }
  }

  getOrgNameList() {
    this.isLoadingSpinner = true;
    let userlogin = JSON.parse(sessionStorage.getItem('user'));
    let isLivesatckAdmin = JSON.parse(
      sessionStorage.getItem('isLivesatckAdmin')
    );
    if (!isLivesatckAdmin) {
      this.projectService.getOrgName().subscribe(
        (res: any) => {
          this.isLoadingSpinner = false;
          this.orglist = res.filter(
            (ele) => ele.orgStatus == 1 && ele.orgId == userlogin.orgId
          );
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
    } else {
      this.projectService.getOrgName().subscribe(
        (res: any) => {
          this.isLoadingSpinner = false;
          this.orglist = res.filter((ele) => {
            return ele.orgStatus == 1;
          });
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
    }
  }

  getOrgListwithorgType() {
    this.projectService.getOrgName().subscribe(
      (res: any) => {
        if (res) {
          this.isLoadingSpinner = false;
          this.orgAllList = res.filter((ele) => {
            return ele.orgStatus == 1;
          });
        }
        if (this.projectId) {
          this.bindProjectData();
        }
      },

      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  onchgOrgType(orgType: any, i, onEdit = false) {
    this.stateDetails[i] = [];
    this.districtDetails[i] = [];
    let orgtyeval: any;
    // if (!onEdit) {
    //   orgtyeval = orgType.target.value
    // } else {
    //   orgtyeval = orgType
    // }
    (
      (this.thirdFormGroup.get('participateMore') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('orgSuborgId')
      .reset();
    (
      (this.thirdFormGroup.get('participateMore') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('stateCd')
      .reset();
    (
      (this.thirdFormGroup.get('participateMore') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('districtsCd')
      .reset();
    (
      (this.thirdFormGroup.get('participateMore') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('orgMappingStartDate')
      .reset();
    (
      (this.thirdFormGroup.get('participateMore') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('orgMappingEndDate')
      .reset();
    (
      (this.thirdFormGroup.get('participateMore') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('deEndDate')
      .reset();

    this.projectOrg[i] = this.orgAllList?.filter((item: any) => {
      if (!onEdit) {
        return item.orgType == orgType.target.value;
      } else {
        return item.orgType == orgType;
      }
    });
    // console.log("projectorg>>>>>>>", this.projectOrg[i])
  }

  onChgOrg(orgId: any, i, onEdit = false) {
    let orgVal: any;
    this.stateDetails[i] = [];
    this.districtDetails[i] = [];
    if (!onEdit) {
      orgVal = orgId.target.value;
    } else {
      orgVal = orgId;
    }
    (
      (this.thirdFormGroup.get('participateMore') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('stateCd')
      .reset();
    (
      (this.thirdFormGroup.get('participateMore') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('districtsCd')
      .reset();
    (
      (this.thirdFormGroup.get('participateMore') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('orgMappingStartDate')
      .reset();
    (
      (this.thirdFormGroup.get('participateMore') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('orgMappingEndDate')
      .reset();
    (
      (this.thirdFormGroup.get('participateMore') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('deEndDate')
      .reset();

    // this.isLoadingSpinner = true;
    this.orgService.getOrgDetail(orgVal).subscribe(
      (res: any) => {
        this.isLoadingSpinner = false;
        this.onTenureDate[i] = res['organizationBasicInfo'].orgOnboardDate;
        this.onCompletionDate[i] =
          res['organizationBasicInfo'].orgTenureCompleteDate;
        // this.onTenureDate[i] = res.projectStartDate;
        // this.onCompletionDate[i] = res.res.projectEndDate;
        // console.log('chgorg', res);
        let userlogin = JSON.parse(sessionStorage.getItem('user'));
        let isLivesatckAdmin = JSON.parse(
          sessionStorage.getItem('isLivesatckAdmin')
        );
        if (!isLivesatckAdmin) {
          res.organizationParticipatingAreaWithNames.forEach((item) => {
            let state_array = item.state.split('-');
            if (res) {
              this.stateDetails[i].push({
                statecd: state_array[0],
                stateName: state_array[1],
                districtlist: item.districts,
              });
              this.stateDetails[i] = this.stateDetails[i].filter(
                (data) => data.statecd == userlogin.baseLocation.stateCd
              );
            }
            if (onEdit) {
              // (((this.firstFormGroup.get('projectActivity') as FormArray)?.at(i) as FormGroup)?.get('activityParameterList')
              let stateCd = (
                (this.thirdFormGroup.get('participateMore') as FormArray)?.at(
                  i
                ) as FormGroup
              )?.get('stateCd').value;
              this.onChgState(this.statelist[i], i, true);
            }
          });
        } else {
          res.organizationParticipatingAreaWithNames.forEach((item) => {
            let state_array = item.state.split('-');
            if (res) {
              this.stateDetails[i].push({
                statecd: state_array[0],
                stateName: state_array[1],
                districtlist: item.districts,
              });
            }
            if (onEdit) {
              // (((this.firstFormGroup.get('projectActivity') as FormArray)?.at(i) as FormGroup)?.get('activityParameterList')
              let stateCd = (
                (this.thirdFormGroup.get('participateMore') as FormArray)?.at(
                  i
                ) as FormGroup
              )?.get('stateCd').value;
              this.onChgState(this.statelist[i], i, true);
            }
          });
        }
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  onChgOrgName(orgId, onEdit = false) {
    let orgIDVal: any;
    this.isLoadingSpinner = true;
    this.firstFormInfo.startDate.reset();
    this.firstFormInfo.endDate.reset();

    if (!onEdit) {
      orgIDVal = orgId.target.value;
    } else {
      this.isLoadingSpinner = false;
      orgIDVal = orgId;
    }
    this.orgService.getOrgDetail(orgIDVal).subscribe(
      (res: any) => {
        this.isLoadingSpinner = false;
        this.projectStartDate = res['organizationBasicInfo'].orgOnboardDate;
        this.projectEndDate =
          res['organizationBasicInfo'].orgTenureCompleteDate;
        // console.log('chgorg', res);
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  onChgState(state, i, onEdit = false) {
    this.districtDetails[i] = [];
    let statecd: any;
    (
      (this.thirdFormGroup.get('participateMore') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('districtsCd')
      .reset();
    if (!onEdit) {
      statecd = state.target.value;
    } else {
      statecd = state;
    }
    let arraylist = this.stateDetails[i].filter(
      (res: any) => {
        return res.statecd == statecd;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
    // console.log('arrrrrlist:::::>>>>>', arraylist, this.stateDetails[i])
    this.onDistrict(arraylist, i, onEdit);
  }

  onDistrict(arraylist, i, onEdit?) {
    this.isLoadingSpinner = true;
    arraylist.forEach((district) => {
      district.districtlist.forEach(
        (item) => {
          let districtlist = item.split('-');
          if (districtlist) {
            this.districtDetails[i].push({
              districtcd: districtlist[0],
              districtName: districtlist[1],
            });
          }
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
      this.districtDetails[i] = [...this.districtDetails[i]];
      // this.chgded.detectChanges();
    });
    this.isLoadingSpinner = false;
    // console.log("districtdetails:::>>>>>", this.districtDetails[i]);
    this.selectAllForDropdownItems(this.districtDetails[i]);
    this.chgded.detectChanges();
    if (
      this.projectAreaMapping &&
      this.projectAreaMapping.length > 0 &&
      onEdit
    ) {
      if (this.projectAreaMapping[i]?.districtsCd?.length) {
        this.projectAreaMapping[i].districtsCd = this.projectAreaMapping[
          i
        ].districtsCd.map((x) => x.toString());
      }
      this.setthirdvalue();
      // this.participates?.controls[i]?.get('districtsCd')?.setValue(this.projectAreaMapping[i].districtsCd);
    } else {
      this.participates?.controls[i]?.get('districtsCd')?.setValue('');
    }
  }

  getprojectActivities() {
    this.projectService.getSubmodulesList().subscribe((res: any) => {
      res.forEach((item: any) => {
        if (item.subModules.length != 0) {
          this.projectActivity.push(...item.subModules);
        }
      });
      this.selectAllForDropdownItems(this.projectActivity);
      // console.log("submodules", this.projectActivity);
      this.projectActivity = [...this.projectActivity];
    });
  }

  getCommonAPIData() {
    this.isLoadingSpinner = true;
    this.projectService.getCommonList('project_mission').subscribe(
      (mission) => {
        this.mission = mission;
        this.isLoadingSpinner = false;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );

    this.projectService.getCommonList('project_program').subscribe(
      (program) => {
        this.programlist = program;
        this.selectAllForDropdownItems(this.programlist);
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );

    this.projectService.getCommonList('project_status').subscribe(
      (project_status) => {
        this.isLoadingSpinner = false;
        this.projectStatus = project_status;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );

    this.projectService.getCommonList('project_scheme').subscribe(
      (scheme) => {
        this.scheme = scheme;
        this.selectAllForDropdownItems(this.scheme);
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );

    this.projectService.getCommonList('species').subscribe(
      (species: any) => {
        this.species = species;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );

    this.projectService.getCommonList('org_type').subscribe(
      (orgType) => {
        this.org_type = orgType;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  onChgSpecies(item) {
    let speciesCd = item.target.value;
    let spaciesVal = this.secondFormGroup.get('r_Species').value;
    if (spaciesVal != 'null') {
      this.secondFormGroup.get('d_Species').disable();
      this.secondFormGroup.get('d_Species').disable();
      this.secondFormGroup.get('d_Breed').disable();
      this.secondFormGroup.get('d_Breed').disable();
      this.projectService.getBreedList(speciesCd).subscribe(
        (item) => {
          this.isLoadingSpinner = false;
          this.rBreed = item;
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
    } else {
      this.secondFormGroup.get('d_Species').enable();
      this.secondFormGroup.get('d_Species').enable();
      this.secondFormGroup.get('d_Breed').enable();
      this.secondFormGroup.get('d_Breed').enable();
    }
  }

  onChgDSpecies(item) {
    // this.isLoadingSpinner = true;
    let speciesCd = item.target.value;
    let spaciesVal = this.secondFormGroup.get('d_Species').value;
    if (spaciesVal != 'null') {
      this.secondFormGroup.get('r_Species').disable();
      this.secondFormGroup.get('r_Species').disable();
      this.secondFormGroup.get('r_Breed').disable();
      this.secondFormGroup.get('r_Breed').disable();
      this.projectService.getBreedList(speciesCd).subscribe(
        (item) => {
          this.isLoadingSpinner = false;
          this.dBreed = item;
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
    } else {
      this.secondFormGroup.get('r_Species').enable();
      this.secondFormGroup.get('r_Species').enable();
      this.secondFormGroup.get('r_Breed').enable();
      this.secondFormGroup.get('r_Breed').enable();
    }
  }

  onChgSex($event) {
    let gender = this.secondFormGroup.get('r_Sex').value;
    if (gender != 'null') {
      this.secondFormGroup.get('d_Sex').disable();
      this.secondFormGroup.get('d_Sex').disable();
    } else {
      this.secondFormGroup.get('d_Sex').enable();
      this.secondFormGroup.get('d_Sex').enable();
    }
  }

  onChgDSex(event) {
    let gender = this.secondFormGroup.get('d_Sex').value;
    if (gender != 'null') {
      this.secondFormGroup.get('r_Sex').disable();
      this.secondFormGroup.get('r_Sex').disable();
    } else {
      this.secondFormGroup.get('r_Sex').enable();
      this.secondFormGroup.get('r_Sex').enable();
    }
  }

  selectAllForDropdownItems(items: any[]) {
    let allSelect = (items) => {
      items.forEach((element) => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };
    allSelect(items);
  }

  next() {
    if (this.firstFormGroup.invalid) {
      this.isLinear = true;
      this.firstFormGroup.markAllAsTouched();
      return;
    } else {
      this.isLinear = false;
    }
  }

  nextSecond() {
    if (this.secondFormGroup.invalid) {
      this.isLinear = true;
      this.secondFormGroup.markAllAsTouched();
      return;
    } else {
      this.isLinear = false;
    }
  }

  onSubmit() {
    if (this.thirdFormGroup.invalid) {
      this.thirdFormGroup.markAllAsTouched();
      return;
    }
    let projectorgMapping = this.thirdFormGroup.get('participateMore').value;
    for (let data of projectorgMapping) {
      data.orgMappingStartDate = moment(data.orgMappingStartDate).format(
        'YYYY-MM-DD'
      );
      data.orgMappingEndDate = moment(data.orgMappingEndDate).format(
        'YYYY-MM-DD'
      );
      data.deEndDate = moment(data.deEndDate).format('YYYY-MM-DD');
    }

    const createProject: any = {
      orgId: this.firstFormGroup.get('orgName').value,
      activityCode: this.firstFormGroup.get('projectAct').value,
      projectActivity: this.firstFormGroup.get('projectActivity').value,
      projectMissionCd: this.firstFormGroup.get('mission').value,
      programCd: this.firstFormGroup.get('program').value,
      schemeCd: this.firstFormGroup.get('scheme').value,
      projectName: this.firstFormGroup.get('projectName').value,
      projectDesc: this.firstFormGroup.get('discription').value,
      projectStartDate: moment(
        this.firstFormGroup.get('startDate').value
      ).format('YYYY-MM-DD'),
      projectEndDate: moment(this.firstFormGroup.get('endDate').value).format(
        'YYYY-MM-DD'
      ),
      projectDeEndDate: moment(this.firstFormGroup.get('endDate').value).format(
        'YYYY-MM-DD'
      ),

      userAllocationprocessFlag:
        this.secondFormGroup.get('userAllocation').value,
      projectValuesDto: {
        defaultSex: this.secondFormGroup.get('d_Sex').value,
        restrictedSex: this.secondFormGroup.get('r_Sex').value,
        restrictedSpeciesCd: this.secondFormGroup.get('r_Species').value,
        defaultSpeciesCd: this.secondFormGroup.get('d_Species').value,
        defaultAgeMax: this.secondFormGroup.get('d_maxAge').value,
        defaultAgeMin: this.secondFormGroup.get('d_minAge').value,
        restrictedAgeMax: this.secondFormGroup.get('r_maxAge').value,
        restrictedAgeMin: this.secondFormGroup.get('r_minAge').value,
        defaultBreedCd: this.secondFormGroup.get('d_Breed').value,
        restrictedBreedCd: this.secondFormGroup.get('r_Breed').value,
      },
      contactPersonName: this.secondFormGroup.get('contact_Person').value,
      designation: this.secondFormGroup.get('contact_Disc').value,
      emailId: this.secondFormGroup.get('email').value,
      mobileNo: encryptText(
        this.secondFormGroup.get('mobile').value.toString()
      ),
      alternateNo: encryptText(
        this.secondFormGroup.get('alt_Mobile').value.toString()
      ),
      projectLocationMap: projectorgMapping,
    };
    // this.projectInfoForm = {...this.firstFormGroup.value, ...this.secondFormGroup.value, ...this.thirdFormGroup.value}
    // console.log('formdeatils:::::>>>>>>', createProject)
    if (this.projectId != null && this.getProjectActionType == 'edit') {
      // 'projectId': JSON.stringify(this.projectId)

      createProject.projectId = this.projectId;
      createProject.projectStatus =
        this.firstFormGroup.get('projectStatus').value;
      this.isLoadingSpinner = true;
      // formData.append("orgStatus", this.orgRegForm.get('orgstatus').value);
      this.projectService.updateProject(createProject).subscribe(
        (response) => {
          this.isLoadingSpinner = false;
          if (response) {
            this.dialog
              .open(ConfirmationDialogComponent, {
                data: {
                  // Name: `Project Name: ${response.projectName}`,
                  // title: `Project Id: ${response.projectId}`,
                  title: 'Info',
                  message: `${response['msg'].msgDesc}`,
                  icon: 'assets/images/info.svg',
                  primaryBtnText: 'Ok',
                  // secondaryBtnText: 'Cancel',
                },
                panelClass: 'common-info-dialog',
              })
              .afterClosed()
              .subscribe((result) => {
                if (result) {
                  this.router.navigate([
                    // '/dashboard/project-management/list',
                    '/dashboard/project-management/project-details',
                  ]);
                }
              });
            this.isLoadingSpinner = false;
          }
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
    } else {
      this.projectService.createProject(createProject).subscribe(
        (response: any) => {
          if (response) {
            // sessionStorage.setItem('data', response.userId)
            const storageData = {
              id: response.data.projectId,
            };
            setEncryptedData(storageData, 'AESSHA256ProjectList');
            // console.log('projectddd>>>>', response);
            this.dialog
              .open(ConfirmationDialogComponent, {
                data: {
                  // Name: `Project Name: ${response.projectName}`,
                  // title: `Project Id: ${response.projectId}`,
                  title: 'Info',
                  message: `${response['msg'].msgDesc}`,
                  icon: 'assets/images/info.svg',
                  primaryBtnText: 'Ok',
                  // secondaryBtnText: 'Cancel',
                },
                panelClass: 'common-info-dialog',
              })
              .afterClosed()
              .subscribe((result) => {
                if (result) {
                  this.router.navigate([
                    // '/dashboard/project-management/list',
                    '/dashboard/project-management/project-details',
                  ]);
                }
              });
            this.isLoadingSpinner = false;
          }
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
    }
  }

  onInactivate(event: Event) {
    if ((event.target as HTMLSelectElement).value == 'Inactive')
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: 'Are you sure?',
          message: 'Are you sure you want to Inactivate this Project',
          primaryBtnText: 'Yes',
          secondaryBtnText: 'No',
        },
      });
  }

  goBack() {
    this.location.back();
  }

  onProjectActivity(event, flag) {
    if (event?.value && 'selectedAllGroup' in event?.value && !flag) {
      if (event?.index == 0) {
        this.removeAllControls();
        return;
      } else {
        const i = this.getparamterList.value.findIndex(
          (val) => val.activityCd === event.value.subModuleCd
        );
        if (i != -1) {
          this.getparamterList.removeAt(i);
          return;
        }
        // this.getparamterList.removeAt(event?.index);
        // return;
      }
    }
    // if(event?.children == undefined && !flag){
    //   this.getparamterList.removeAt(event?.index);
    //   return;
    // }
    if (flag) {
      this.isLoadingSpinner = true;
      this.projectService
        .getParameterList(this.firstFormGroup.value.projectAct)
        .subscribe(
          (item) => {
            this.isLoadingSpinner = false;
            this.activityList = item;
            this.addParamaterList(item);
            // console.log("projectActivity:::", this.activityList, event.subModuleCd);
          },
          (err) => {
            this.isLoadingSpinner = false;
          }
        );
    } else {
      const i = this.getparamterList.value.findIndex(
        (val) => val.activityCd === event.value.subModuleCd
      );
      if (i != -1) {
        this.getparamterList.removeAt(i);
      }
    }

    if (this.firstFormGroup.get('projectAct').value) {
      const projectActivity = this.firstFormGroup.get('projectAct').value;
    }
    // console.log("proejectg activity:::>>>",this.firstFormGroup.get('projectAct').value);
  }

  removeAllControls() {
    const arr = this.firstFormGroup.get('projectActivity') as FormArray;
    while (arr.length) {
      arr.removeAt(0);
    }
  }

  get activityListControls() {
    // console.log("pasrsactivityiytyuyu::::", this.firstFormGroup.get('projectActivity'))
    return (this.firstFormGroup.get('projectActivity') as FormArray)
      .controls as FormGroup[];
  }

  parameterListControls(i) {
    return (
      (
        (this.firstFormGroup.get('projectActivity') as FormArray)?.at(
          i
        ) as FormGroup
      )?.get('activityParameterList') as FormArray
    ).controls as FormGroup[];
  }
}
