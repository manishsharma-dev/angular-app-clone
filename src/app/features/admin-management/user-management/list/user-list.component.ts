import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { UserManagementService } from 'src/app/features/admin-management/user-management/user-management.service';
import { User } from '../models/user.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { MasterConfig } from 'src/app/shared/master.config';
import { CountryService } from 'src/app/shared/shareService/country-service.service';
import { StateList } from 'src/app/shared/shareService/model/state.model';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export default class UserListComponent implements OnInit {
  masterConfig = MasterConfig;
  pageIndex = 0;
  pageSize = 10;
  length = 0;
  public searchForm: FormGroup;
  public dataSource = new MatTableDataSource<User>([]);
  public data: any[] = [];
  public isLoadingSpinner: boolean = false;
  public stateList: StateList[] = [];
  public adminFilterData: any;
  // public isUserFilter: boolean = true;
  public filterName: string = 'Hide Filter';
  public filterClass: string = 'fa fa-chevron-up';
  userName;
  public fullName: string = '';
  public isTableShow = false;
  public isLivestackAdmin = JSON.parse(
    sessionStorage.getItem('isLivesatckAdmin')
  );
  public userOrgId = JSON.parse(sessionStorage.getItem('user')).orgId;
  isDisable: boolean = true;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginatorRef') set paginator(pg: MatPaginator) {
    this.dataSource.paginator = pg;
  }

  displayedColumns: string[] = [
    // '#',
    'id',
    'name',
    'userType',
    'orgName',
    'mobile',
    'role',
    // 'validTo',
    'status',
    'action',
  ];

  constructor(
    private userService: UserManagementService,
    private countryService: CountryService,
    private router: Router
  ) {}

  pageSizes = [20, 40, 80, 100];

  ngOnInit(): void {
    this.getStateList();
    this.searchForm = new FormGroup({
      searchByVal: new FormControl(''),
    });
  }

  receiveData($event) {
    this.adminFilterData = $event;
    this.isLoadingSpinner = true;
    // this.isUserFilter = false;
    this.userService.getUserListFilterData(this.adminFilterData).subscribe(
      (data: any) => {
        if (data) {
          if (data.length) {
            this.isTableShow = true;
          } else {
            this.isTableShow = true;
          }
          this.isLoadingSpinner = false;
          //this.isUserFilter = false;
          this.dataSource.data = data;
        }
      },
      (err) => {
        this.isTableShow = false;
        this.isLoadingSpinner = false;
      }
    );
  }

  onshowFilter() {
    //this.isUserFilter = !this.isUserFilter;
    // this.filterName = 'Show Filter';
    // this.filterClass = 'fa fa-chevron-down';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onGetUserList() {
    this.isLoadingSpinner = true;
    this.userService.getUserList(this.searchForm.value.searchByVal).subscribe(
      (res) => {
        this.dataSource.data = res;
        this.isLoadingSpinner = false;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  getStateList() {
    this.countryService
      .getStatesByUser()
      .subscribe((stateData: StateList[]) => {
        this.stateList = stateData;
      });
    this.selectAllForDropdownItems(this.stateList);
  }

  onExtrafilter() {
    this.router.navigate(['/dashboard/user-management/list-filter']);
  }

  addNewUser() {
    sessionStorage.removeItem('data');
    this.router.navigate(['/dashboard/user-management/add-new-user']);
  }

  selectAllForDropdownItems(items: StateList[]) {
    let allSelect = (items) => {
      items.forEach((element) => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };
    allSelect(items);
  }

  onUserDetails(userId: string) {
    this.isLoadingSpinner = true;
    sessionStorage.setItem('isProfile', 'false');
    this.userService.userUpdateList.next(false);
    sessionStorage.setItem('data', userId);
    if (userId != undefined) {
      this.isLoadingSpinner = false;
      this.router.navigate(['dashboard/user-management/user-details']);
    }
  }

  onEditUser(userId: string) {
    this.isLoadingSpinner = true;
    sessionStorage.setItem('data', userId);
    if (userId != undefined) {
      this.isLoadingSpinner = false;
      this.router.navigate(['dashboard/user-management/add-new-user']);
    }
  }
}
