import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UserManagementService } from '../user-management.service';
import { MatSort } from '@angular/material/sort';
import { StateList } from 'src/app/shared/shareService/model/state.model';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup } from '@angular/forms';
import { MasterConfig } from 'src/app/shared/master.config';
import { CountryService } from 'src/app/shared/shareService/country-service.service';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { Areauser } from '../models/area.model';

@Component({
  selector: 'app-user-list-filter',
  templateUrl: './user-list-filter.component.html',
  styleUrls: ['./user-list-filter.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class UserListFilterComponent implements OnInit {
  masterConfig = MasterConfig;
  pageIndex = 0;
  pageSize = 10;
  length = 0;
  public searchForm: FormGroup;
  public dataSource = new MatTableDataSource<User>();
  public data: any[] = [];
  public isLoadingSpinner: boolean = false;
  public stateList: StateList[] = [];
  public districtList: Areauser[] = [];
  public tehsilList: Areauser[] = [];
  public villageList: Areauser[] = [];
  public roleList: any[] = [];

  userName;
  isDisable: boolean = true;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = [
    // '#',
    'id',
    'name',
    'userType',
    'orgName',
    'mobile',
    // 'validFrom',
    // 'validTo',
    'status',
    'action',
  ];

  constructor(
    private userService: UserManagementService,
    private countryService: CountryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getStateList();
    this.getRoleList();

    this.searchForm = new FormGroup({
      stateCd: new FormControl([]),
      districtCd: new FormControl([]),
      tehsilCd: new FormControl([]),
      villageCd: new FormControl([]),
      roleCd: new FormControl([]),
    });
    this.formFieldChange();
  }

  formFieldChange() {
    this.searchForm.get('stateCd').valueChanges.subscribe((data) => {
      if (data?.length > 1) {
        this.searchForm.get('districtCd').disable({ emitEvent: false });
        this.searchForm.get('tehsilCd').disable({ emitEvent: false });
        this.searchForm.get('villageCd').disable({ emitEvent: false });
        this.searchForm.get('districtCd').patchValue([], { emitEvent: false });
        this.searchForm.get('tehsilCd').patchValue([], { emitEvent: false });
        this.searchForm.get('villageCd').patchValue([], { emitEvent: false });
      } else {
        this.searchForm.get('districtCd').enable();
        this.searchForm.get('tehsilCd').enable();
        this.searchForm.get('villageCd').enable();
      }
    });

    this.searchForm.get('districtCd').valueChanges.subscribe((data) => {
      if (data?.length > 1) {
        this.searchForm.get('tehsilCd').disable({ emitEvent: false });
        this.searchForm.get('villageCd').disable({ emitEvent: false });
        this.searchForm.get('tehsilCd').patchValue([], { emitEvent: false });
        this.searchForm.get('villageCd').patchValue([], { emitEvent: false });
      } else {
        this.searchForm.get('tehsilCd').enable();
        this.searchForm.get('villageCd').enable();
      }
    });

    this.searchForm.get('tehsilCd').valueChanges.subscribe((data) => {
      if (data?.length > 1) {
        this.searchForm.get('villageCd').disable({ emitEvent: false });
        this.searchForm.get('villageCd').patchValue([], { emitEvent: false });
      } else {
        this.searchForm.get('villageCd').enable();
      }
    });
  }

  // formFieldDisable(){
  //   let controlName, stateCd, districtCd, tehsilCd, villageCd;
  //   switch (this.searchForm.get(controlName).value.length >1) {
  //   case stateCd:
  //     this.searchForm.get('districtCd').disable();
  //     this.searchForm.get('tehsilCd').disable();
  //     this.searchForm.get('villageCd').disable();
  //     break;
  //   case districtCd:

  //   }
  //   if(this.searchForm.get('stateCd').value.length > 1){
  //     this.searchForm.get('districtCd').disable();
  //     this.searchForm.get('tehsilCd').disable();
  //     this.searchForm.get('villageCd').disable();
  //     return
  //   }else{
  //     this.searchForm.get('districtCd').enable();
  //     this.searchForm.get('tehsilCd').enable();
  //     this.searchForm.get('villageCd').enable();
  //     return
  //   }

  //    if(this.searchForm.get('districtCd').value.length > 1){
  //     this.searchForm.get('tehsilCd').disable();
  //     this.searchForm.get('villageCd').disable();
  //     return
  //   }else{
  //     this.searchForm.get('tehsilCd').enable();
  //     this.searchForm.get('villageCd').enable();
  //     return
  //   }

  //   if(this.searchForm.get('tehsilCd').value.length > 1){
  //     this.searchForm.get('villageCd').disable();
  //     return
  //   }else{
  //     this.searchForm.get('villageCd').enable();
  //     return
  //   }
  // }

  // applyFilter(event: Event) {
  //   const filterValue = (event.target as HTMLInputElement).value;
  //   this.dataSource.filter = filterValue.trim().toLowerCase();
  // }

  onGetUserList() {
    this.isLoadingSpinner = true;
    const data = {
      stateCd: this.searchForm.get('stateCd').value,
      districtCd: this.searchForm.get('districtCd').value,
      tehsilCd: this.searchForm.get('tehsilCd').value,
      villageCd: this.searchForm.get('villageCd').value,
      roleCd: this.searchForm.get('roleCd').value,
    };
    // let stddd = this.searchForm.get('stateCd').value;
    this.userService.getUserRecord(data).subscribe(
      (data) => {
        if (data) {
          this.isLoadingSpinner = false;
          console.log('totalRecord is >>>>>>', data);
        }
      },
      (err) => {
        this.isLoadingSpinner = false;
        console.log('tototrecerrr>>>>', err.error.errorDesc);
      }
    );
    // console.log('stattecd::>>>>>', payload);
    // this.isLoadingSpinner = true
    // this.userService.getUserList(this.searchForm.value.searchByVal).subscribe((res) => {
    //   this.dataSource = new MatTableDataSource(res);
    //   this.isLoadingSpinner = false
    // }, err => {
    //   this.isLoadingSpinner = false;
    // });
  }

  resetSearch() {
    this.searchForm.get('stateCd').reset();
    this.searchForm.get('districtCd').reset();
    this.searchForm.get('tehsilCd').reset();
    this.searchForm.get('villageCd').reset();
    this.searchForm.get('roleCd').reset();
  }

  getStateList() {
    this.countryService
      .getStatesByUser()
      .subscribe((stateData: StateList[]) => {
        this.stateList = stateData;
        this.selectAllForDropdownItems(this.stateList);
      });
  }

  getDistrictList() {
    // console.log("chgesdistrct>>>>",this.searchForm.get('stateCd').value)
    let statecode = this.searchForm.get('stateCd').value;
    this.userService.getdistrict(statecode).subscribe((data) => {
      this.districtList = data;
      this.selectAllForDropdownItems(this.districtList);
    });
  }

  getTehsilList() {
    // console.log("chgesdistrct>>>>",this.searchForm.get('stateCd').value)
    let districtcode = this.searchForm.get('districtCd').value;
    this.userService.gettehsil(districtcode).subscribe((data) => {
      this.tehsilList = data;
      this.selectAllForDropdownItems(this.tehsilList);
    });
  }

  getvillageList() {
    let tehsilcode = this.searchForm.get('tehsilCd').value;
    this.userService.getVillage(tehsilcode).subscribe((data) => {
      this.villageList = data;
      this.selectAllForDropdownItems(this.villageList);
    });
  }

  getRoleList() {
    this.userService.getRoleList().subscribe((data) => {
      this.roleList = data.filter((item) => {
        return item.roleStatus == 'Active';
      });
      this.selectAllForDropdownItems(this.roleList);
    });
  }

  // onExtrafilter(){
  //   this.router.navigate(['/dashboard/user-management/list-filter']);
  // }

  selectAllForDropdownItems(items: any[]) {
    let allSelect = (items) => {
      items.forEach((element) => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };
    allSelect(items);
  }

  onUserDetails(userId: string) {
    this.isLoadingSpinner = true;
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
