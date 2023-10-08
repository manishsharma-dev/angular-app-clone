import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { StatusDialogComponent } from '../../../artificial-insemination/status-dialog/status-dialog.component';
import { EtService, User } from '../../et.service';
import {
  AccessManagementService,
  Role,
} from 'src/app/features/admin-management/access-management/access-management.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-allocate-dialog',
  templateUrl: './allocate-dialog.component.html',
  styleUrls: ['./allocate-dialog.component.css'],
})
export class AllocateDialogComponent implements OnInit {
  isLoadingSpinner: boolean = false;
  allocateEmbryoForm!: FormGroup;
  getCommonMasterDetail: Array<{}> = [];
  ognizationList: any = [];
  labsAssign = [];
  etRole: Role;
  users: User[] = [];
  constructor(
    private fb: FormBuilder,
    private etService: EtService,
    private dialogRef: MatDialogRef<StatusDialogComponent>,
    private dataService: DataServiceService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      animalDetail: any;
      action: string;
    },
    private accessService: AccessManagementService
  ) {}
  ngOnInit(): void {
    this.allocateEmbryoForm = this.fb.group({
      allocatedTo: [null, [Validators.required]],
      allocatedToId: [null],
      embryoId: [''],
    });
    this.getCommonMaster();
    this.getOrgnization();
    this._fetchUserInformation();
  }

  submitStatus() {
    if (this.allocateEmbryoForm.invalid) {
      this.allocateEmbryoForm.markAllAsTouched();
      return;
    }

    const embryoIDs = this.getEmbryoList();
    this.isLoadingSpinner = true;
    const formValue = {
      ...this.allocateEmbryoForm.value,
    };
    formValue.embryoId = embryoIDs;
    formValue.action = this.data.action;
    this.etService.allocateEmbryoIds(formValue).subscribe(
      (data: any) => {
        this.isLoadingSpinner = false;
        this.dialogRef.close(data);
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  trackByfn(index, item) {
    return item.uniqueValue;
  }

  get searchInfo() {
    return this.allocateEmbryoForm.controls;
  }
  private getCommonMaster(): void {
    this.isLoadingSpinner = true;
    const key = ['allocated_to'];
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
    this.accessService
      .getRoles()
      .pipe(
        switchMap((roles) => {
          const roleCd = roles.find(
            (role) => role.roleDesc === 'ET Technician'
          )?.roleCd;

          return this.etService.getActiveUsersByRoleCd({
            roleCd,
            orgId: JSON.parse(sessionStorage.getItem('user'))?.orgId,
          });
        })
      )
      .subscribe((res) => {
        this.users = res;
      });
  }

  private getOrgnization(): void {
    this.etService.getOrganizationList().subscribe({
      next: (data) => (this.ognizationList = data),
    });
  }

  private getEmbryoList() {
    const embryoList =
      this.data && this.data?.animalDetail?.length > 0
        ? this.data?.animalDetail
        : [];
    const embryoIdList = [];
    if (embryoList?.length > 0) {
      embryoList.forEach((element) => {
        embryoIdList.push(element?.embryoId);
      });
    }

    return embryoIdList;
  }
  _fetchUserInformation(): void {
    // this.dataService._getUserDetailsByUserId().subscribe((data: any) => {
    //   this.getLabs(data?.orgId);
    // });
  }
  // private getLabs(orgId: number): void {
  //   this.dataService._getLabsListing().subscribe((orgList: any) => {
  //     this.labsAssign =
  //       orgList?.length > 0 ? orgList.filter((org) => org?.orgId == orgId) : [];
  //   });
  // }
}
