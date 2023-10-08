import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  AfterViewInit,
} from '@angular/core';
import { StateList } from 'src/app/shared/shareService/model/state.model';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CountryService } from 'src/app/shared/shareService/country-service.service';
import { Router } from '@angular/router';
import { Areauser } from '../../user-management/models/area.model';
import { Common } from '../models/common.model';

import { ProjectManagementService } from '../project-management.service';
import { getDecryptedData } from 'src/app/shared/shareService/storageData';
import {
  AlphaNumericSpecialValidation,
  AlphaNumericValidation,
  UserNamespecialValidation,
  loginIdSearchValidation,
  onlyNumberValidation,
} from 'src/app/shared/utility/validation';
import { ProjectUserAllocDelloc } from '../models/user-alloc-dealloc.model';
import { UserManagementService } from '../../user-management/user-management.service';

@Component({
  selector: 'app-user-allocation-serach',
  templateUrl: './user-allocation-serach.component.html',
  styleUrls: ['./user-allocation-serach.component.css'],
})
export class UserAllocationSerachComponent implements OnInit {
  @Output() filterDataEvent = new EventEmitter<any>();
  @Output() filterDataEventDeallcation = new EventEmitter<any>();
  public searchForm: FormGroup;
  public data: any[] = [];
  public isLoadingSpinner: boolean = false;
  public stateList: StateList[] = [];
  public districtList: Areauser[] = [];
  public roleList: any[] = [];
  public userType: Common[];
  public admin_livestack: Common[];
  public orglist: any;
  public searchBy: any;
  public inputType: string = 'text';
  public maxLength: string = '30';
  public searchType: string | number = 'userName';
  public errorMsg: string = '';
  public dataType: string = '';
  public isSearchButton: boolean = true;
  public isSearchInput: boolean = false;
  public dataArray = [];

  constructor(
    private _formBuilder: FormBuilder,
    private projectService: ProjectManagementService,
    private countryService: CountryService,
    private router: Router,
    private userService: UserManagementService
  ) {}

  ngOnInit(): void {
    let projectId = getDecryptedData('AESSHA256ProjectList').id;
    this.searchForm = new FormGroup({
      projectId: new FormControl(projectId),
      state: new FormControl(null),
      districts: new FormControl(null),
      organization: new FormControl(null),
      type: new FormControl(null),
      optRadio: new FormControl('userName'),
      searchValue: new FormControl(''),
      roleCds: new FormControl(null),
    });
    this.onGetProjectDetail();
    this.getCommonAPIData();

    this.searchForm.valueChanges.subscribe((response) => {
      if (response) {
        this.getSearchCatgory(response);
        this.getUserAllocationDataByFilter(response);
      }
    });
  }

  getUserAllocationDataByFilter(response: ProjectUserAllocDelloc) {
    if (response.state && response.districts && response.roleCds) {
      // this.searchForm.get('searchValue').disable({ emitEvent: false });
      // this.searchForm.get('searchValue').patchValue('', { emitEvent: false });
      this.isSearchButton = false;
    } else {
      //this.searchForm.get('searchValue').enable({ emitEvent: false });
      //this.isSearchButton = false;
    }
  }

  getSearchCatgory(response?: ProjectUserAllocDelloc) {
    let state$ = this.searchForm.get('state').value;
    let district$ = this.searchForm.get('districts').value;
    let role$ = this.searchForm.get('roleCds').value;
    let data =
      (state$ != null &&
        state$ != '' &&
        district$ != null &&
        district$ != '' &&
        role$ != null &&
        role$ != '') ||
      ((!response.state || !response.organization || !response.type) &&
        response.searchValue != '' &&
        this.searchForm.get('searchValue').valid);

    switch (data) {
      case true:
        this.isSearchButton = false;
        break;
      case null:
        this.isSearchButton = false;
        break;
      default:
        this.isSearchButton = true;
    }
  }
  getClearInputValue() {
    this.searchForm.get('state').patchValue('');
    this.searchForm.get('districts').patchValue('');
    this.searchForm.get('organization').patchValue('');
    this.searchForm.get('type').patchValue('');
    this.searchForm.get('searchValue').patchValue('');
    this.searchForm.get('roleCds').patchValue('');
  }

  onGetProjectDetail() {
    this.isLoadingSpinner = true;
    let projectId = getDecryptedData('AESSHA256ProjectList').id;
    let userlogin = JSON.parse(sessionStorage.getItem('user'));
    let isLivesatckAdmin = JSON.parse(
      sessionStorage.getItem('isLivesatckAdmin')
    );

    this.projectService.getProjectDetail(projectId).subscribe((response) => {
      if (isLivesatckAdmin != true) {
        this.stateList = response['projectLocationMap'].filter((data: any) => {
          if (data.stateCd == userlogin.baseLocation.stateCd) {
            this.searchForm.get('state').patchValue(data.stateCd);
            this.searchForm.get('state').disable();
            this.getDistrictList(data);
          }

          return data.stateCd == userlogin.baseLocation.stateCd;
        });
        this.orglist = response['projectLocationMap'].filter((data: any) => {
          if (data.orgSuborgId == userlogin.orgId) {
            this.onGetRole(data);
            this.searchForm.get('organization').patchValue(data.orgSuborgId);
            this.searchForm.get('organization').disable();
            this.getDistrictList(data);
          }
          return data.orgSuborgId == userlogin.orgId;
        });

        this.isLoadingSpinner = false;
        this.data = response;
      } else {
        this.stateList = response['projectLocationMap'];
        this.orglist = response['projectLocationMap'];
        this.isLoadingSpinner = false;
        this.data = response;
      }
    });
  }

  selectAllForDropdownItems(items: any[]) {
    let allSelect = (items) => {
      items.forEach((element) => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };
    allSelect(items);
  }

  getCommonAPIData() {
    this.projectService.getCommonList('user_type').subscribe(
      (user_type) => {
        this.isLoadingSpinner = false;
        this.userType = user_type;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  resetValue() {
    this.searchForm.patchValue({ searchValue: '' });
  }
  resetSearch() {
    // this.getSearchCatgory()
    this.getClearInputValue();
  }
  getDistrictList(Event) {
    if (!Event) {
      return;
    }

    this.searchForm.get('districts').setValue('');
    this.districtList = [];
    this.districtList = Event.districtsArray;
    this.selectAllForDropdownItems(Event.districtsArray);
  }

  onGetRole(data: string | number) {
    this.searchForm.get('roleCds').patchValue('');
    if (!data) {
      this.roleList = [];
      return;
    }

    let payload = {
      orgId: data['orgSuborgId'],
    };
    this.roleList = [];
    this.userService.getRoleListHierarchyWise(payload).subscribe(
      (res) => {
        this.isLoadingSpinner = false;
        if (res && res.length) {
          this.roleList = res;
        }
        this.selectAllForDropdownItems(this.roleList);
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  onGetUserList() {
    let key = this.searchForm.get('optRadio').value;
    const data = {
      state: this.searchForm.get('state').value,
      districts:
        this.searchForm.get('districts').value != null
          ? this.searchForm.get('districts').value != ''
            ? [this.searchForm.get('districts').value]
            : []
          : [],
      type: this.searchForm.get('type').value,
      organization: this.searchForm.get('organization').value,
      projectId: this.searchForm.get('projectId').value,
      roleCds:
        this.searchForm.get('roleCds').value != null
          ? this.searchForm.get('roleCds').value != ''
            ? [this.searchForm.get('roleCds').value]
            : []
          : [],
    };

    (data[key] = this.searchForm.get('searchValue').value),
      this.filterDataEvent.emit(data);
    this.filterDataEventDeallcation.emit(data);
  }
  enterInputType() {
    this.errorMsg = '';
    switch (this.searchType) {
      case 'userName':
        this.searchForm
          .get('searchValue')
          .addValidators([UserNamespecialValidation]);
        this.errorMsg = 'User Name Invalid';
        this.maxLength = '30';
        this.dataType = 'character';
        break;
      case 'mobileNo':
        this.searchForm
          .get('searchValue')
          .addValidators([onlyNumberValidation]);
        this.errorMsg = 'Please Enter Valid Mobile Number';
        this.maxLength = '10';
        this.dataType = 'Digits';
        break;

      case 'userId':
        this.searchForm
          .get('searchValue')
          .addValidators([AlphaNumericSpecialValidation]);
        this.errorMsg = 'Please Enter Valid loginId';
        this.maxLength = '30';
        this.dataType = 'Alpha Numeric character';
        break;
      default:
        this.searchForm
          .get('searchValue')
          .removeValidators([
            onlyNumberValidation,
            UserNamespecialValidation,
            loginIdSearchValidation,
          ]);
    }
  }

  onSelectingSearchBy(event) {
    this.searchForm
      .get('searchValue')
      .removeValidators([
        onlyNumberValidation,
        UserNamespecialValidation,
        AlphaNumericValidation,
      ]);
    this.searchType = (event.target as HTMLInputElement).value;
    this.searchForm.addControl('optRadio', new FormControl(''));
    this.searchForm.get('optRadio').patchValue(this.searchType);
    this.searchForm.get('searchValue').patchValue('');
  }
}
