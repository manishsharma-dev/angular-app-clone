import { StatusReportService } from './../miscellaneous/status-report/status-report.service';
import { switchMap, tap } from 'rxjs/operators';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as d3 from 'd3';
import { NotificationService } from 'src/app/shared/worklist/notification/notification/notification.service';
import { ViewWorkListComponent } from 'src/app/shared/worklist/view-worklist/view-worklist.component';
import { WorklistService } from 'src/app/shared/worklist/worklist.service';
import {
  getDecryptedRoleData,
  getSessionData,
  setSessionData,
} from 'src/app/shared/shareService/storageData';

import { AnimalManagementService } from '../animal-management/animal-registration/animal-management.service';
import { MemberList } from './member-list';
import { DashBoardService } from './dashboard.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { FormGroup, Validators } from '@angular/forms';
import { NumericValidation } from 'src/app/shared/utility/validation';
import moment from 'moment';
import { HealthService } from '../animal-health/health.service';
import { HealthHistoryComponent } from '../animal-health/components/health-history/health-history.component';
import { Animal } from '../animal-health/vaccination/models/animal.model';
import { AnimalResult } from '../animal-management/animal-registration/models-animal-reg/tagId-search.model';
import { OwnerDetailsService } from '../animal-management/owner-registration/owner-details.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  selected: any;
  getAccesRoles: any;
  isLoadingSpinner: boolean = false;
  recentWorkListData: any;
  recentDashboardListData: any = [];
  filteredRequestId: any = [];
  @Output() onSelected = new EventEmitter<any>();
  seletcedRole: any;
  selectedDefaultRole: any;
  isUserWorklistTabSelected = false;
  errorMessage: string = '';
  searchForm!: FormGroup;
  animal: AnimalResult;

  public userData: MemberList;

  constructor(
    private dashboardSrv: DashBoardService,
    private notificationSrv: NotificationService,
    public dialog: MatDialog,
    private ws: WorklistService,
    private _snackBar: MatSnackBar,
    private animalMS: AnimalManagementService,
    private statusReportService: StatusReportService,
    private healthService: HealthService,
    private ownerDS: OwnerDetailsService
  ) {}

  ngOnInit() {
    this.userData = JSON.parse(sessionStorage.getItem('user'));
    this.fetchRecentWorkListForSupervisor();
    this.fetchRecentNotificationsList();
    // this.fetchRecentWorkList();
    this.getAdminRoleMaster();
  }

  fetchRecentWorkListForSupervisor() {
    this.isLoadingSpinner = true;
    this.ws.getRecentWorkListForSupervisor().subscribe(
      (data: any) => {
        if (Array.isArray(data)) {
          this.recentWorkListData = data;
        } else {
          this.recentWorkListData = data.data;
        }
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  fetchRecentWorklistForUser() {
    this.isLoadingSpinner = true;
    this.ws.getRecentWorkListForUser().subscribe(
      (data: any) => {
        if (Array.isArray(data)) {
          this.recentWorkListData = data;
        } else {
          this.recentWorkListData = data.data;
        }
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  changeWorlistTab(event: MatTabChangeEvent) {
    let tab = event.index;
    if (tab === 0) {
      this.isUserWorklistTabSelected = false;
      this.fetchRecentWorkListForSupervisor();
    } else if (tab === 1) {
      this.isUserWorklistTabSelected = true;
      this.fetchRecentWorklistForUser();
    }
  }

  setTabs(selectedTab: boolean) {
    this.isUserWorklistTabSelected = selectedTab;
    sessionStorage.setItem('selectedWorklistTab', JSON.stringify(selectedTab));
  }

  viewWorkListDialog(worklistData) {
    const dialogRef = this.dialog.open(ViewWorkListComponent, {
      data: {
        crrData: [worklistData],
        selectedUserTab: this.isUserWorklistTabSelected,
      },
      width: '500px',
      height: '100vh',
      autoFocus: false,
      panelClass: 'custom-dialog-container',
      position: {
        right: '0px',
        top: '0px',
      },
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res != undefined) {
        this.fetchRecentWorkListForSupervisor();
      }
    });
  }

  fetchRecentNotificationsList() {
    this.isLoadingSpinner = true;
    this.notificationSrv.fetchRecentNotificationsList().subscribe(
      (data: any) => {
        if (Array.isArray(data)) {
          this.recentDashboardListData = data;
        } else {
          this.recentDashboardListData = data.data;
        }
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  roleAccess() {
    this.getAccesRoles = JSON.parse(sessionStorage.getItem('user'));
    this.selected = this.getAccesRoles;
    const selectedRole = getDecryptedRoleData('AESSHA256userDataRole')?.id;
    if (selectedRole && this.selected) {
      const defaultRole = this.selected?.additionalRoleAccess?.find(
        (role) => role.roleCd == selectedRole
      );
      if (defaultRole) {
        this.selectedDefaultRole = `${selectedRole}-${defaultRole?.roleDesc}`;
        this.setCurrentModules(this.selected.defaultRoleAccess.modules);
      } else {
        this.selectedDefaultRole = `${this.selected.defaultRoleAccess.roleCd}-${this.selected.defaultRoleAccess.roleDesc}`;
        this.setCurrentModules(this.selected.defaultRoleAccess.modules);
      }
    } else {
      this.selectedDefaultRole = `${this.selected?.defaultRoleAccess?.roleCd}-${this.selected?.defaultRoleAccess?.roleDesc}`;
      this.setCurrentModules(this.selected?.defaultRoleAccess?.modules);
    }
    this.setAdminRole(selectedRole ?? this.selected?.defaultRoleAccess?.roleCd);
  }
  getRole(event: Event) {
    this.seletcedRole = (event.target as HTMLInputElement).value;
    this.dashboardSrv.getSelctedRole(this.seletcedRole);
    this.checkCurrentModule(this.seletcedRole);
    this.setAdminRole(this.seletcedRole.split('-')[0]);
  }

  checkCurrentModule(role: string) {
    const roleId = role.split('-')[0];
    this.ownerDS.getCommonData('admin_livestack').subscribe(
      (adminCd) => {
        let adminCds = adminCd[0].value.split(',');
        // adminCds.push('1');
        if (adminCds.indexOf(String(roleId)) !== -1) {
          sessionStorage.setItem('isLivesatckAdmin', 'true');
        } else {
          sessionStorage.setItem('isLivesatckAdmin', 'false');
        }
      },
      (err) => {}
    );
    this.ownerDS.getCommonData('admin_district').subscribe(
      (adminCd) => {
        let adminCds = adminCd[0].value.split(',');
        // adminCds.push('1');
        if (adminCds.indexOf(String(roleId)) !== -1) {
          sessionStorage.setItem('isDistrictAdmin', 'true');
        } else {
          sessionStorage.setItem('isDistrictAdmin', 'false');
        }
      },
      (err) => {}
    );
    if (roleId == this.selected.defaultRoleAccess.roleCd) {
      this.setCurrentModules(this.selected.defaultRoleAccess.modules);
    } else {
      const roleData = this.selected?.additionalRoleAccess?.find(
        (role) => role.roleCd == roleId
      );
      if (roleData) {
        this.setCurrentModules(roleData.modules);
      }
    }
  }

  onAnimalSearch({ searchValue }: { searchValue: string }) {
    this.isLoadingSpinner = true;
    this.animalMS.getDetailsByTagID(searchValue).subscribe({
      next: (res) => {
        this.animal = res;
        this.dialog.open(HealthHistoryComponent, {
          data: {
            animalData: this.animal,
            animalHistoryCd: 1,
            parent: 'status-report',
            ownerDetails: this.animal?.ownerDetails,
          },
          width: '700px',
          height: '100vh',
          panelClass: 'custom-dialog-container',
          position: {
            right: '0px',
            top: '0px',
          },
        });
        this.isLoadingSpinner = false;
      },
      error: () => (this.isLoadingSpinner = false),
    });
  }

  setCurrentModules(currentModules) {
    setSessionData(currentModules, 'moduleList');
  }

  getAdminRoleMaster() {
    const requestList = ['admin_livestack', 'admin_state', 'admin_district'];

    return this.dashboardSrv
      .getCommonMasterDetails(requestList)
      .subscribe((res: any) => {
        if (res) {
          const adminMaster = [];
          for (let obj in res) {
            adminMaster.push(res[obj][0]);
          }
          setSessionData(JSON.stringify(adminMaster), 'adminMasterList');
        }
        this.roleAccess();
      });
  }

  setAdminRole(currentRole) {
    const adminMasterList = getSessionData('adminMasterList')
      ? JSON.parse(getSessionData('adminMasterList'))
      : [];
    const adminUser = adminMasterList.find((role) =>
      role.value.split(',').includes(currentRole)
    );
    if (adminUser) {
      setSessionData(adminUser, 'adminUser');
    } else {
      setSessionData(null, 'adminUser');
    }
  }
}
