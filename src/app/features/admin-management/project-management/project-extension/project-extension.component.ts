import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ProjectManagementService } from '../project-management.service';
import { OrganizationManagementService } from '../../organization-management/organization-management.service';
import { DistrictList } from 'src/app/shared/shareService/model/district.model';
import { getDecryptedData } from 'src/app/shared/shareService/storageData';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import moment from 'moment';
import { Common } from '../../user-management/models/common.model';

@Component({
  selector: 'app-project-extension',
  templateUrl: './project-extension.component.html',
  styleUrls: ['./project-extension.component.css'],
})
export class ProjectExtensionComponent implements OnInit {
  dialogConfig = new MatDialogConfig();

  public orglist: any;
  public projectOrg: any[][] = [];
  public stateDetails: any[][] = [];
  public districtDetails = [];
  public isLoadingSpinner: boolean;
  public onTenureDate: any[][] = [];
  public org_type;
  public mappingstartDate: any[][] = [];
  public mappingendDate: any[][] = [];
  public onCompletionDate: any[][] = [];
  public isMappingFormInvalid: boolean = true;
  public admin_livestack: Common[];

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private _formBuilder: FormBuilder,
    private projectService: ProjectManagementService,
    private orgService: OrganizationManagementService,
    @Inject(MAT_DIALOG_DATA)
    public data: any
  ) {}

  isAddLevel: boolean = false;
  projectExtensionForm: FormGroup;

  ngOnInit(): void {
    let projectId = getDecryptedData('AESSHA256ProjectList').id;
    this.projectExtensionForm = this._formBuilder.group({
      projectExtensionList: this._formBuilder.array([]),
      projectId: [projectId],
    });
    this.onGetOrgType();
    this.addLevel();
    this.onGetProjectDetail();
  }

  get projectExtensionList() {
    return this.projectExtensionForm.get('projectExtensionList') as FormArray;
  }

  addLevel() {
    let levelLength =
      this.projectExtensionForm.value.projectExtensionList.length;
    if (levelLength < 10) {
      this.projectExtensionList.push(this.createLevels());
    } else {
      this.isAddLevel = true;
    }
  }

  removeLevelAt(i) {
    this.projectExtensionList.removeAt(i);
    this.isAddLevel = false;
  }

  createLevels() {
    return this._formBuilder.group({
      orgType: [''],
      orgSuborgId: ['null', Validators.required],
      stateCd: ['null', Validators.required],
      districtsCd: ['null', Validators.required],
      orgMappingStartDate: ['null', Validators.required],
      orgMappingEndDate: ['null', Validators.required],
      deEndDate: ['null', Validators.required],
    });
  }
  // onGetrOganizationList(index?) {
  //   this.isLoadingSpinner = true;
  //   this.projectService.getOrgName().subscribe((res: any) => {
  //     if (res) {
  //       this.isLoadingSpinner = false;
  //       this.projectOrg[index] = res.filter((ele) => {
  //         return ele.orgStatus == 1
  //       });
  //     }

  //     // this.uniqueOrgType = [...this.orglist.reduce((map, obj) => map.set(obj.orgType, obj), new Map()).values()];
  //   }, err => {
  //     this.isLoadingSpinner = false;
  //   })
  // }

  onOrgType(orgType, i) {
    (
      (this.projectExtensionForm.get('projectExtensionList') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('orgSuborgId')
      .reset();
    (
      (this.projectExtensionForm.get('projectExtensionList') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('stateCd')
      .reset();
    (
      (this.projectExtensionForm.get('projectExtensionList') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('districtsCd')
      .reset();
    (
      (this.projectExtensionForm.get('projectExtensionList') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('orgMappingStartDate')
      .reset();
    (
      (this.projectExtensionForm.get('projectExtensionList') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('orgMappingEndDate')
      .reset();
    let userlogin = JSON.parse(sessionStorage.getItem('user'));
    let isLivesatckAdmin = JSON.parse(
      sessionStorage.getItem('isLivesatckAdmin')
    );
    if (!isLivesatckAdmin) {
      this.projectService.getOrgName().subscribe(
        (res: any) => {
          this.isLoadingSpinner = false;
          this.projectOrg[i] = res.filter((ele) => ele.orgStatus == 1);
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
    } else {
      this.projectService.getOrgName().subscribe(
        (res: any) => {
          this.isLoadingSpinner = false;
          this.projectOrg[i] = res.filter((ele) => {
            return ele.orgStatus == 1;
          });
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
    }
  }

  mappingdateChange(event, i) {
    (
      (this.projectExtensionForm.get('projectExtensionList') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('orgMappingEndDate')
      .reset();
    (
      (this.projectExtensionForm.get('projectExtensionList') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('deEndDate')
      .reset();

    this.mappingstartDate[i] = event.value;
  }
  mappingdataEntryChange(event, i) {
    this.mappingendDate[i] = event.value;
  }

  onChgOrg(orgId, i) {
    this.stateDetails[i] = [];
    this.districtDetails = [];
    this.isLoadingSpinner = true;
    (
      (this.projectExtensionForm.get('projectExtensionList') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('stateCd')
      .reset();
    (
      (this.projectExtensionForm.get('projectExtensionList') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('districtsCd')
      .reset();
    (
      (this.projectExtensionForm.get('projectExtensionList') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('orgMappingStartDate')
      .reset();
    (
      (this.projectExtensionForm.get('projectExtensionList') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('orgMappingEndDate')
      .reset();
    (
      (this.projectExtensionForm.get('projectExtensionList') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('deEndDate')
      .reset();
    this.orgService.getOrgDetail(orgId.target.value).subscribe(
      (res: any) => {
        this.isLoadingSpinner = false;
        // this.onTenureDate = res['organizationBasicInfo'].orgOnboardDate;
        this.onTenureDate[i] = res['organizationBasicInfo'].orgOnboardDate;
        // this.onCompletionDate = res['organizationBasicInfo'].orgTenureCompleteDate;
        this.onCompletionDate[i] =
          res['organizationBasicInfo'].orgTenureCompleteDate;
        let userlogin = JSON.parse(sessionStorage.getItem('user'));
        let isLivesatckAdmin = JSON.parse(
          sessionStorage.getItem('isLivesatckAdmin')
        );
        console.log(isLivesatckAdmin, typeof isLivesatckAdmin);
        if (isLivesatckAdmin != true) {
          res.organizationParticipatingAreaWithNames.forEach((item) => {
            let state_array = item.state.split('-');
            this.stateDetails[i].push({
              statecd: state_array[0],
              stateName: state_array[1],
              districtlist: item.districts,
            });
            this.stateDetails[i] = this.stateDetails[i].filter(
              (data) => data.statecd == userlogin.baseLocation.stateCd
            );
          });
        } else {
          res.organizationParticipatingAreaWithNames.forEach((item) => {
            let state_array = item.state.split('-');
            this.stateDetails[i].push({
              statecd: state_array[0],
              stateName: state_array[1],
              districtlist: item.districts,
            });
          });
        }
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  onGetOrgType() {
    this.isLoadingSpinner = true;
    this.projectService.getCommonList('org_type').subscribe(
      (orgType) => {
        this.isLoadingSpinner = false;
        this.org_type = orgType;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  onState($state, i) {
    this.districtDetails = [];
    (
      (this.projectExtensionForm.get('projectExtensionList') as FormArray)?.at(
        i
      ) as FormGroup
    )
      ?.get('districtsCd')
      .reset();
    let arraylist = this.stateDetails[i].filter(
      (res) => {
        return res.statecd == $state.target.value;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
    this.getDistricts(arraylist);
  }
  getDistricts(arraylist) {
    this.isLoadingSpinner = true;
    arraylist.forEach(
      (district, index) => {
        district.districtlist.forEach((item, index) => {
          let districtlist = item.split('-');
          if (districtlist) {
            this.districtDetails.push({
              districtcd: districtlist[0],
              districtName: districtlist[1],
            });
          }
        });
        this.districtDetails = [...this.districtDetails];

        this.selectAllForDropdownItems(this.districtDetails);
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  selectAllForDropdownItems(items: DistrictList[]) {
    let allSelect = (items) => {
      items.forEach((element) => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };

    allSelect(items);
  }

  onGetProjectDetail() {
    this.isLoadingSpinner = true;
    let projectId = getDecryptedData('AESSHA256ProjectList').id;
    if (projectId) {
      this.projectService.getProjectDetail(projectId).subscribe((response) => {
        this.isLoadingSpinner = false;
        this.data = response;
      });
    }
  }

  onAddProjectExtension() {
    this.isLoadingSpinner = true;

    let projectId = getDecryptedData('AESSHA256ProjectList').id;
    let projectExtensionMapping = this.projectExtensionForm.get(
      'projectExtensionList'
    ).value;
    for (let data of projectExtensionMapping) {
      data.orgMappingStartDate = moment(data.orgMappingStartDate).format(
        'YYYY-MM-DD'
      );
      data.orgMappingEndDate = moment(data.orgMappingEndDate).format(
        'YYYY-MM-DD'
      );
      data.deEndDate = moment(data.deEndDate).format('YYYY-MM-DD');
    }

    const payload = {
      projectExtensionList: projectExtensionMapping,
      projectId: projectId,
    };

    this.projectService
      .createProjectExtension(payload)
      .subscribe((response) => {
        this.isLoadingSpinner = false;
        if (response) {
          this.dialog
            .open(ConfirmationDialogComponent, {
              data: {
                title: 'Info',
                message: `Project Extended sucessfully. `,
                icon: 'assets/images/info.svg',
                primaryBtnText: 'Ok',
              },
              panelClass: 'common-info-dialog',
            })
            .afterClosed()
            .subscribe((result) => {
              if (result) {
                this.router.navigate(['/dashboard/project-management/list']);
              }
            });
        }
      });
  }
}
