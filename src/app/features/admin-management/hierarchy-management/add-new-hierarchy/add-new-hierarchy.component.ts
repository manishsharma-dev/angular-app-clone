import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CountryService } from 'src/app/shared/shareService/country-service.service';
import { StateList } from 'src/app/shared/shareService/model/state.model';
import { HierarchyService } from '../hierarchy.service';
import { RoleArea } from '../models/hierarchy.model';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

import { getDecryptedData } from 'src/app/shared/shareService/storageData';
import { OrganizationManagementService } from '../../organization-management/organization-management.service';
import { Organization } from '../../organization-management/model/organization.model';
import { NamespecialValidation } from 'src/app/shared/utility/validation';
import { UserManagementService } from '../../user-management/user-management.service';

@Component({
  selector: 'app-add-new-hierarchy',
  templateUrl: './add-new-hierarchy.component.html',
  styleUrls: ['./add-new-hierarchy.component.css'],
})
export class AddNewHierarchyComponent implements OnInit {
  public hierarchyRegForm: FormGroup;
  public savedData: any[];
  public states: StateList[] = [];
  public isAddLevel: boolean = false;
  public levelLength: string;
  public roleNameLists: any[] = [];
  public roleList: RoleArea[] = [];
  public hierarchyId: number | string = '';
  public type: string | string = '';
  public isLoadingSpinner = true;
  public btnText: string;
  public isShowError: string = '';
  isStateDisabled: string;
  isDistrictDisabled: string;
  isTehsilDisabled: string;
  public getOrgLists: Organization[] = [];
  public stateDetails: any = [];
  admin_livestack: any;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private fb: FormBuilder,
    public countryService: CountryService,
    public HierarchySrv: HierarchyService,
    public OrgService: OrganizationManagementService,
    private userService: UserManagementService
  ) {}

  ngOnInit(): void {
    this.hierarchyId = getDecryptedData('AESSHA256Hierarchy').id;
    this.type = getDecryptedData('AESSHA256Hierarchy').type;

    this.hierarchyRegForm = new FormGroup({
      stateCd: this.fb.control('', [Validators.required]),
      hierarchyName: this.fb.control('', [
        Validators.required,
        NamespecialValidation,
      ]),
      orgId: this.fb.control('', Validators.required),
      levelsInfo: this.fb.array([]),
      hierarchyId: this.fb.control(''),
    });

    //this.getStatList();
    this.getRoleAreaList();
    this.getRoleNameList();
    if (!this.hierarchyId) {
      this.addLevel();
      this.btnText = 'Submit';
    } else if (this.hierarchyId && this.type == 'clone') {
      this.btnText = 'Clone';
      this.getHierarchyDetail();
    } else if (this.hierarchyId && this.type == 'edit') {
      this.btnText = 'Update';
      this.getHierarchyDetail();
    }
    this.getOrgNameList();
  }

  getOrgNameList() {
    this.isLoadingSpinner = true;
    let userlogin = JSON.parse(sessionStorage.getItem('user'));
    let isLivesatckAdmin = JSON.parse(
      sessionStorage.getItem('isLivesatckAdmin')
    );
    if (!isLivesatckAdmin) {
      this.OrgService.getOrgList().subscribe(
        (res: any) => {
          this.isLoadingSpinner = false;
          this.getOrgLists = res.filter(
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
          this.getOrgLists = res.filter((ele) => {
            return ele.orgStatus == 1;
          });
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
    }
  }

  getSateOnOrg(orgId: any) {
    this.isLoadingSpinner = true;
    this.states = [];
    let userlogin = JSON.parse(sessionStorage.getItem('user'));
    let isLivesatckAdmin = JSON.parse(
      sessionStorage.getItem('isLivesatckAdmin')
    );

    if (!isLivesatckAdmin) {
      this.OrgService.getOrgDetail(orgId).subscribe(
        (res: any) => {
          this.isLoadingSpinner = false;
          if (res) {
            this.states.push({
              stateCode: res.organizationContactInfo.stateCd,
              stateName: res.organizationContactInfo.stateName,
            });
          }
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
    } else {
      this.OrgService.getOrgDetail(orgId).subscribe((res: any) => {
        console.log(res.organizationBasicInfo);
        res.organizationParticipatingAreaWithNames.forEach((item) => {
          let state_array = item.state.split('-');
          if (res) {
            this.states.push({
              stateCode: state_array[0],
              stateName: state_array[1],
            });
          }
        });
        this.isLoadingSpinner = false;
      });
    }
  }

  getHierarchyDetail() {
    this.isLoadingSpinner = true;
    this.HierarchySrv.getHierarchyDetails(this.hierarchyId).subscribe(
      (response) => {
        for (let i = 0; i < response['levelsInfo'].length; i++) {
          this.addLevel();
          this.onCheckHierarchyLevel(response['levelsInfo'][i].roleArea);
        }
        this.checkDuplicateList(response);
        this.hierarchyRegForm.patchValue({
          stateCd: response['stateCd'],
          orgId: response['orgId'],
          hierarchyName: response['hierarchyName'],
          levelsInfo: response['levelsInfo'],
          hierarchyId: response['hierarchyId'],
        });

        this.isLoadingSpinner = false;
      }
    );
  }

  // getStatList() {
  //   this.isLoadingSpinner = true
  //   this.countryService.getStatesByUser().subscribe((response) => {
  //     this.states = response;
  //     this.isLoadingSpinner = false

  //   }, error => {
  //     this.isLoadingSpinner = false
  //   });
  // }
  getRoleAreaList() {
    this.isLoadingSpinner = true;
    this.HierarchySrv.getRoleArea().subscribe(
      (response) => {
        this.roleList = response;
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
  getRoleNameList() {
    this.isLoadingSpinner = true;
    this.HierarchySrv.getRoleLists().subscribe(
      (response) => {
        this.roleNameLists = response;
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  get levels() {
    return this.hierarchyRegForm.get('levelsInfo') as FormArray;
  }

  addLevel() {
    let levelLength = this.hierarchyRegForm.value.levelsInfo.length;
    if (levelLength < 10) {
      this.levels.push(this.createLevels(levelLength + 1));
    } else {
      this.isAddLevel = true;
    }
  }

  removeLevelAt(i, data) {
    this.levels.removeAt(i);
    this.onCheckHierarchyLevel(data.levelsInfo[i].roleArea - 1);
    this.checkDuplicateList(data);
    this.isAddLevel = false;
  }

  onCheckHierarchyLevel(value) {
    this.isStateDisabled = null;
    this.isDistrictDisabled = null;
    this.isTehsilDisabled = null;
    if (value == 2) {
      this.isStateDisabled = '1';
    } else if (value == 3) {
      this.isStateDisabled = '1';
      this.isDistrictDisabled = '2';
    } else if (value >= 4) {
      this.isStateDisabled = '1';
      this.isDistrictDisabled = '2';
      this.isTehsilDisabled = '3';
    }
  }

  createLevels(levelLength) {
    return this.fb.group({
      roleCd: ['', [Validators.required]],
      roleArea: ['', [Validators.required]],
      level: [levelLength],
      isActive: ['Y'],
    });
  }
  onCheckDuplicateRollName() {
    this.checkDuplicateList(this.hierarchyRegForm.value);
  }

  checkDuplicateList(data: any) {
    let dup: string;
    this.isLoadingSpinner = true;
    if (this.hierarchyId) {
      dup = data.levelsInfo
        .map((val: any) => parseInt(val.roleCd))
        .filter((val: any, i: number, breed: any[]) => breed.indexOf(val) != i);
    } else {
      dup = data.levelsInfo
        .map((val: any) => val.roleCd)
        .filter((val: any, i: number, breed: any[]) => breed.indexOf(val) != i);
    }

    const dupRecord = data.levelsInfo.filter(
      (obj: any) => obj.roleCd && dup.includes(obj.roleCd)
    );
    if (dupRecord.length >= 1) {
      this.isShowError =
        'Roll Name Already exists. Please select Another Roll Name';
    } else {
      this.isShowError = '';
    }
    this.isLoadingSpinner = false;
  }

  onSubmit() {
    if (this.hierarchyRegForm.invalid) {
      this.hierarchyRegForm.markAllAsTouched();
      return;
    }

    if (!this.hierarchyId || this.type == 'clone') {
      this.isLoadingSpinner = true;
      this.HierarchySrv.onCreateHierarchy(
        this.hierarchyRegForm.value
      ).subscribe(
        (response) => {
          this.dialog
            .open(ConfirmationDialogComponent, {
              data: {
                // id: `HierarchyName : ${response['hierarchyName']}`,
                title: 'Info',
                message:
                  this.type == 'clone'
                    ? `${response['msg'].msgDesc}`
                    : `${response['msg'].msgDesc}`,
                icon: 'assets/images/info.svg',
                primaryBtnText: 'Ok',
              },
              panelClass: 'common-info-dialog',
            })
            .afterClosed()
            .subscribe({
              next: (result) => {
                if (result) {
                  this.router.navigate(['dashboard/hierarchy-management/list']);
                }
              },
            });
          this.isLoadingSpinner = false;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    } else {
      this.isLoadingSpinner = true;
      this.HierarchySrv.onUpdateHierarchy(
        this.hierarchyRegForm.value
      ).subscribe(
        (response) => {
          this.dialog
            .open(ConfirmationDialogComponent, {
              data: {
                // id: `HierarchyName : ${response['hierarchyName']}`,
                title: 'Info',
                message: `${response['msg'].msgDesc}`,
                icon: 'assets/images/info.svg',
                primaryBtnText: 'Ok',
              },
              panelClass: 'common-info-dialog',
            })

            .afterClosed()
            .subscribe({
              next: (result) => {
                if (result) {
                  this.router.navigate([
                    '/dashboard/hierarchy-management/list',
                  ]);
                }
              },
            });
          this.isLoadingSpinner = false;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    }
  }
}
