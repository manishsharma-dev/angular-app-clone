import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from '@angular/core';
import { StateList } from 'src/app/shared/shareService/model/state.model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CountryService } from 'src/app/shared/shareService/country-service.service';
import { Router } from '@angular/router';
import { Areauser } from '../user-management/models/area.model';
import { UserManagementService } from '../user-management/user-management.service';
import { Common } from '../user-management/models/common.model';
import {
  AlphaNumericValidation,
  UserNamespecialValidation,
  loginIdSearchValidation,
  onlyNumberValidation,
} from 'src/app/shared/utility/validation';

@Component({
  selector: 'app-admin-common-filter',
  templateUrl: './admin-common-filter.component.html',
  styleUrls: ['./admin-common-filter.component.css'],
})
export class AdminCommonFilterComponent implements OnInit {
  @Output() filterDataEvent = new EventEmitter<any>();

  public searchForm: FormGroup;
  public data: any[] = [];
  public isLoadingSpinner: boolean = false;
  public stateList: StateList[] = [];
  public selectedStateList: StateList[] = [];
  public districtList: Areauser[] = [];
  public tehsilList: Areauser[] = [];
  public villageList: Areauser[] = [];
  public roleList: any[] = [];
  public userType: Common[];
  public admin_livestack: Common[];
  public orglist: any;
  public searchBy: any;
  public inputType: string = 'text';
  public maxLength: string = '20';
  public isfilterField: boolean = false;
  public searchType: string | number = 'userName';
  public errorMsg: string = '';
  constructor(
    private _formBuilder: FormBuilder,
    private userService: UserManagementService,
    private countryService: CountryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.filterForm();
    this.getStateList();
    this.getCommonAPIData();
    this.getOrgName();
    this.checksearchtype();
    this.formFieldChange();
    this.checkfieldSearch();
  }

  filterForm() {
    this.searchForm = this._formBuilder.group({
      stateCd: [[]],
      districtCd: [[]],
      tehsilCd: [[]],
      villageCd: [[]],
      orgId: [null],
      userTypes: [null],
      roleCd: [[]],
      optRadio: ['userName'],
      searchValue: [],
    });
  }

  onSelectingSearchBy(event) {
    this.searchForm
      .get('searchValue')
      .removeValidators([
        onlyNumberValidation,
        AlphaNumericValidation,
        UserNamespecialValidation,
      ]);
    this.searchType = (event.target as HTMLInputElement).value;
    this.searchForm.addControl('optRadio', new FormControl(''));
    this.searchForm.get('optRadio').patchValue(this.searchType);
    this.searchForm.get('searchValue').patchValue('');
  }

  resetValue() {
    this.searchForm.patchValue({ searchValue: '' });
  }

  getOrgName() {
    this.isLoadingSpinner = true;
    let userlogin = JSON.parse(sessionStorage.getItem('user'));
    let isLivesatckAdmin = JSON.parse(
      sessionStorage.getItem('isLivesatckAdmin')
    );
    if (!isLivesatckAdmin) {
      this.userService.getOrgName().subscribe(
        (res: any) => {
          this.isLoadingSpinner = false;
          this.orglist = res.filter(
            (ele) => ele.orgStatus == 1 && ele.orgId == userlogin.orgId
          );
          if (this.orglist.length == 1) {
            this.autoselectOrg();
            this.searchForm.get('orgId').disable();
          }
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
    } else {
      this.userService.getOrgName().subscribe(
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

  autoselectOrg() {
    this.searchForm.get('orgId').patchValue(this.orglist[0].orgId);
    const data = {
      orgId: this.orglist[0].orgId,
    };
    this.getRoleListHierarchyWise(data);
  }

  getRoleListHierarchyWise(data) {
    this.userService.getRoleListHierarchyWise(data).subscribe(
      (res) => {
        this.isLoadingSpinner = false;
        if (res && res.length) {
          this.roleList = res;
        }
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
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
        this.searchForm.get('districtCd').patchValue([], { emitEvent: false });
        this.searchForm.get('tehsilCd').patchValue([], { emitEvent: false });
        this.searchForm.get('villageCd').patchValue([], { emitEvent: false });
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
        this.searchForm.get('tehsilCd').patchValue([], { emitEvent: false });
        this.searchForm.get('villageCd').patchValue([], { emitEvent: false });
      }
    });

    this.searchForm.get('tehsilCd').valueChanges.subscribe((data) => {
      if (data?.length > 1) {
        this.searchForm.get('villageCd').disable({ emitEvent: false });
        this.searchForm.get('villageCd').patchValue([], { emitEvent: false });
      } else {
        this.searchForm.get('villageCd').enable();
        this.searchForm.get('villageCd').patchValue([], { emitEvent: false });
      }
    });
  }

  onselectOrg(data: string | number) {
    this.searchForm.get('roleCd').patchValue([]);
    if (!data) {
      this.roleList = [];
      return;
    }

    let payload = {
      orgId: data['orgId'],
    };

    this.roleList = [];
    this.getRoleListHierarchyWise(payload);
  }

  onGetUserList() {
    // this.isLoadingSpinner = true;
    let key = this.searchForm.get('optRadio').value;
    const data = {
      stateCd: this.searchForm.get('stateCd').value,
      districtCd: this.searchForm.get('districtCd').value,
      tehsilCd: this.searchForm.get('tehsilCd').value,
      villageCd: this.searchForm.get('villageCd').value,
      orgId:
        this.searchForm.get('orgId').value == null
          ? ''
          : this.searchForm.get('orgId').value,
      userTypes:
        this.searchForm.get('userTypes').value == null
          ? ''
          : this.searchForm.get('userTypes').value,
      roleCd: this.searchForm.get('roleCd').value,
    };
    (data[key] = this.searchForm.get('searchValue').value),
      // console.log('search filter>>>>>>>', data);
      this.filterDataEvent.emit(data);
  }

  checksearchtype() {
    this.searchForm.get('searchValue').valueChanges.subscribe((data) => {
      this.enterInputType();
    });
  }

  checkfieldSearch() {
    this.searchForm.valueChanges.subscribe((data) => {
      let statecd = this.searchForm.get('stateCd').value;
      let districtcd = this.searchForm.get('districtCd').value;
      let orgId = this.searchForm.get('orgId').value;
      let userTypes = this.searchForm.get('userTypes').value;
      let roleCd = this.searchForm.get('roleCd').value;
      let searchValue = this.searchForm.get('searchValue').value;
      if (
        (statecd.length && districtcd.length && orgId && roleCd.length) ||
        ((statecd.length || orgId || userTypes || roleCd.length) &&
          searchValue &&
          this.searchForm.get('searchValue').valid)
      ) {
        this.isfilterField = true;
      } else {
        this.isfilterField = false;
      }
    });
  }

  enterInputType() {
    this.errorMsg = '';
    switch (this.searchType) {
      case 'userName':
        this.searchForm
          .get('searchValue')
          .addValidators([UserNamespecialValidation]);
        this.errorMsg = 'validationMessage.user_Name_Invalid';
        this.maxLength = '30';
        break;
      case 'mobileNo':
        this.searchForm
          .get('searchValue')
          .addValidators([onlyNumberValidation]);
        this.errorMsg = 'validationMessage.Mobile_Number_pattern';
        this.maxLength = '10';
        break;

      case 'loginId':
        this.searchForm
          .get('searchValue')
          .addValidators([loginIdSearchValidation]);
        this.errorMsg = 'validationMessage.enter_Valid_LoginId';
        this.maxLength = '30';
        break;
      default:
        this.searchForm
          .get('searchValue')
          .removeValidators([
            onlyNumberValidation,
            loginIdSearchValidation,
            UserNamespecialValidation,
          ]);
    }
  }

  resetSearch() {
    this.searchForm.get('stateCd').patchValue([]);
    this.searchForm.get('districtCd').patchValue([]);
    this.searchForm.get('tehsilCd').patchValue([]);
    this.searchForm.get('villageCd').patchValue([]);
    this.searchForm.get('roleCd').patchValue([]);
    this.searchForm.get('orgId').patchValue('');
    this.searchForm.get('userTypes').patchValue('');
  }

  getCommonAPIData() {
    this.userService.getCommonList('user_type').subscribe(
      (user_type) => {
        this.isLoadingSpinner = false;
        this.userType = user_type;
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
        if (this.stateList.length == 1) {
          this.searchForm
            .get('stateCd')
            .patchValue([this.stateList[0].stateCode]);
          this.searchForm.get('stateCd').disable();
          this.getDistrictList();
        }
        this.selectAllForDropdownItems(this.stateList);
      });
  }

  getDistrictList() {
    let statecode = this.searchForm.get('stateCd').value;
    this.userService.getdistrict(statecode).subscribe((data) => {
      this.districtList = data;
      this.selectAllForDropdownItems(this.districtList);
    });
  }

  getTehsilList() {
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

  selectAllForDropdownItems(items: any[]) {
    let allSelect = (items) => {
      items.forEach((element) => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };
    allSelect(items);
  }
}
