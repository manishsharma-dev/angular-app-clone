import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AccessManagementService } from '../access-management.service';
import { Module, SubModule } from '../model/role.model';
import { getDecryptedData } from 'src/app/shared/shareService/storageData';
import { AlphaNumericSpecialValidation, NamespecialValidation } from 'src/app/shared/utility/validation';




@Component({
  selector: 'app-access-management',
  templateUrl: './access-management.component.html',
  styleUrls: ['./access-management.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AccessManagementComponent implements OnInit {

  public modules: Module[] = [];
  public SubmoduleList: SubModule[] = [];
  public showAccessList = false;
  public step = 1;
  public roleRegForm: FormGroup;
  public isLoadingSpinner: boolean = false
  public roleDetail: any = []
  public isRolcode: number | string;
  public type: string;
  public btnText: string;
  public isStatusActive: string;
  public isAccessPrivileges: boolean;

  constructor(private dialog: MatDialog, private router: Router,
    private rollSrv: AccessManagementService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.isRolcode = getDecryptedData("AESSHA256roleaccess").id;
    this.type = getDecryptedData("AESSHA256roleaccess").type;

    this.roleRegForm = this.fb.group({
      roleDesc: ['', [Validators.required, NamespecialValidation]],
      isActive: [''],
      roleCode: [this.isRolcode],
      modules: this.fb.array([]),
    });

    if (!this.isRolcode) {
      this.btnText = 'Submit';
    } else if (this.type == "clone") {
      this.btnText = 'Clone';
    } else {
      this.btnText = 'Update'

    }
    this.ongetModules();

  }

  ongetModules() {
    this.isLoadingSpinner = true
    this.rollSrv.getModuleList().subscribe((response) => {
      this.modules = response;
      this.modules.forEach((item) => {
        this.setUsersForm(item);
        this.isLoadingSpinner = false;
      })
      if (this.isRolcode) {
        this.isLoadingSpinner = true;
        this.rollSrv.getRoleDetails(+this.isRolcode).subscribe((response) => {
          this.roleDetail = response;
          this.roleDetail['modules'].forEach((data) => {
            //this.ongetModules();
            this.setRoleUsersForm(data)

          })
          this.isAccessPrivileges = response['isActive'] == "Y" ? false : true;
          this.roleRegForm.patchValue({
            "roleDesc": response['roleDesc'],
            "isActive": response['isActive'],

          });
          this.isLoadingSpinner = false;
        });

      }



    });
  }

  get roleReg() {
    return this.roleRegForm.controls;
  }
  get rows() {
    return this.roleRegForm.get("modules") as FormArray;
  }

  getStatus(event: string | boolean) {
    this.isLoadingSpinner = true;
    let changeStatusValue = event;
    if (changeStatusValue == 'Y') {
      this.isAccessPrivileges = false;
      this.rows.enable()
      this.rows.value.forEach((row, index) => {
        this.rows.at(index).get('isSubModule').disable();
      });
    } else {
      this.isAccessPrivileges = true;
      this.rows.disable();
    }
    this.isLoadingSpinner = false;

  }

  private setUsersForm(item) {
    item['subModules'].forEach((data) => {
      this.rows.push(this.setUsersFormArray(data, item));
    })
  }

  private setRoleUsersForm(item) {
    this.isLoadingSpinner = true;
    this.rows.value.forEach((row, index) => {
      let tempFilter = item['subModules'].find((val) => (val.subModuleCd == row.subModuleCd && item.moduleCd == row.moduleCd));
      if (tempFilter) {
        this.rows.at(index).patchValue({
          moduleCd: item.moduleCd,
          subModuleCd: tempFilter.subModuleCd,
          subModuleName: tempFilter.subModuleDesc,
          isAdd: tempFilter.isAdd,
          isView: tempFilter.isView,
          isModify: tempFilter.isModify,
          isDelete: tempFilter.isDelete,
          isActive: tempFilter.isActive,
          runSeqNo: tempFilter.runSeqNo,
          isSubModule: (tempFilter.isView || tempFilter.isModify || tempFilter.isDelete || tempFilter.isView),
        })
      }
      this.rows.at(index).get('isSubModule').disable();
    })
    this.isLoadingSpinner = false;
  }

  onSetAllCheck($event, Submodule) {
    this.isLoadingSpinner = true;
    if ($event.checked) {
      Submodule.patchValue({
        isSubModule: true
      })
    }
    else if ((!Submodule.value.isAdd) && (!Submodule.value.isView) && (!Submodule.value.isModify) && (!Submodule.value.isDelete)) {
      Submodule.patchValue({
        isSubModule: false
      })
    }
    this.isLoadingSpinner = false;

  }


  setUsersFormArray(user, item) {
    return this.fb.group({
      moduleCd: [item.moduleCd],
      subModuleCd: [user.subModuleCd],
      subModuleName: [user.subModuleDesc],
      isSubModule: [false],
      isAdd: [false],
      isView: [false],
      isModify: [false],
      isDelete: [false],
      isActive: [true]
    });

  }



  onCreateAccessRole() {
    if (this.roleRegForm.invalid) {
      this.roleRegForm.markAllAsTouched();
      return;
    }
    var acessList = [];
    for (let subModule of this.roleRegForm.getRawValue()['modules']) {
      if (subModule['isSubModule'] == true) {
        acessList.push(subModule)
      }
    }

    let createRoleForm = {
      roleDesc: this.roleRegForm.get('roleDesc').value,
      modules: acessList
    }

    if (!this.isRolcode || this.type == "clone") {
      this.isLoadingSpinner = true;
      this.rollSrv.createUser(createRoleForm).subscribe((response) => {
        this.dialog.open(ConfirmationDialogComponent, {
          data: {
            // id: `Role: ${response['roleDesc']}`,
            title: 'Info',
            message: this.type == 'clone' ? `${response['msg'].msgDesc}` : `${response['msg'].msgDesc}`,
            icon: "assets/images/info.svg",
            primaryBtnText: 'Ok',
          },
          panelClass: 'common-info-dialog',
        })

          .afterClosed().subscribe({
            next: (result) => {

              if (result) {
                this.router.navigate([
                  '/dashboard/access-management/list'
                ]);
              }
            },
          });
        this.isLoadingSpinner = false;
      }, error => {
        this.isLoadingSpinner = false;
      })

    } else {
      this.isLoadingSpinner = true;
      createRoleForm['roleCode'] = this.isRolcode;
      createRoleForm['isActive'] = this.roleRegForm.get('isActive').value;
      this.rollSrv.updateUser(createRoleForm).subscribe((response) => {
        this.dialog.open(ConfirmationDialogComponent, {
          data: {
            // id: `Role: ${response['roleDesc']}`,
            title: 'Info',
            message: `${response['msg'].msgDesc}`,
            icon: "assets/images/info.svg",
            primaryBtnText: 'Ok',
          },
          panelClass: 'common-info-dialog',
        })

          .afterClosed().subscribe({
            next: (result) => {

              if (result) {
                this.router.navigate([
                  '/dashboard/access-management/list'
                ]);
              }
            },
          });
        this.isLoadingSpinner = false;
      }, error => {
        this.isLoadingSpinner = false;
      })

    }


  }




  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }
}
