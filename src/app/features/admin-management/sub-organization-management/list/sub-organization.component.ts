import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { MasterConfig } from 'src/app/shared/master.config';
import {
  removeData,
  setEncryptedData,
} from 'src/app/shared/shareService/storageData';
import { subOrganization } from '../../organization-management/model/subOrganization.model';
import { OrganizationManagementService } from '../../organization-management/organization-management.service';
import { MatPaginator } from '@angular/material/paginator';
import { Common } from '../../user-management/models/common.model';
import { FormControl, FormGroup } from '@angular/forms';
import { map } from 'rxjs/internal/operators/map';
import { Organization } from '../../organization-management/model/organization.model';
import { StateList } from 'src/app/shared/shareService/model/state.model';
import { CountryService } from 'src/app/shared/shareService/country-service.service';
import { delay } from 'rxjs/operators';
import { DistrictList } from 'src/app/shared/shareService/model/district.model';
import { NamespecialValidation } from 'src/app/shared/utility/validation';

@Component({
  selector: 'app-sub-organization',
  templateUrl: './sub-organization.component.html',
  styleUrls: ['./sub-organization.component.css'],
})
export class SubOrganizationComponent implements OnInit {
  masterConfig = MasterConfig;
  displayedColumns: string[] = [
    'S.No.',
    'id',
    'subOrganization',
    'parentOrganization',
    'Type',
    // 'state',
    // 'district',
    'status',
    'Action',
  ];
  public dataSource = new MatTableDataSource<subOrganization>();
  public orgDetail: any;
  public isLoadingSpinner: boolean = false;
  public data: subOrganization[] = [];
  public isSearchButton: boolean = true;
  public isLivestackAdmin = JSON.parse(
    sessionStorage.getItem('isLivesatckAdmin')
  );
  public userType: Common[];
  public userOrgId = JSON.parse(sessionStorage.getItem('user')).orgId;
  @ViewChild(MatSort) sort: MatSort;
  private paginator!: MatPaginator;
  @ViewChild('paginatorRef') set matPaginator(mp: MatPaginator) {
    this.dataSource.paginator = mp;
  }
  public searchForm: FormGroup;
  public orgLists: Organization[] = [];
  public getOrgTypes: any = [];
  public states: StateList[] = [];
  public orgState: any = [];
  public districtListMulti: DistrictList[] = [];

  constructor(
    public OrgService: OrganizationManagementService,
    public router: Router,
    private countryService: CountryService
  ) { }

  ngOnInit(): void {
    (this.searchForm = new FormGroup({
      orgId: new FormControl(null),
      stateCd: new FormControl(null),
      districtCd: new FormControl(null),
      subOrgType: new FormControl(null),
      subOrgName: new FormControl('', [NamespecialValidation]),
    })),
      this.searchForm.controls['subOrgType'].disable();
    this.isLoadingSpinner = true;

    this.getOrgList();
    this.getOrgType();
    this.getStateList();

    this.searchForm.valueChanges.subscribe((response) => {
      this.getSearchCatgory(response);
    });
  }

  getSearchCatgory(response: subOrganization) {
    let data =
      (response.orgId != null ||
        response.stateCd != null ||
        response.subOrgType != null) &&
      response.subOrgName != '' && response.subOrgName.length > 2;
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  oncreateSubOrg() {
    removeData();
    this.router.navigate(['/dashboard/suborginazation/regform']);
  }

  getSelectedDistrict(data) {
    // console.log('dgfh ', data)
  }

  onviewEditSubOrg(subOrgId: string, Type: string, orgId: string) {
    const storageData = {
      id: subOrgId,
      type: orgId,
    };
    setEncryptedData(storageData, 'AESSHA256subOrgName');
    if (!subOrgId) {
      return;
    }

    if (Type == 'edit') {
      this.router.navigate(['/dashboard/suborginazation/regform']);
    } else {
      this.router.navigate(['/dashboard/suborginazation/detail']);
    }
  }
  //======================Search functionality==================//
  getOrgId(event: Event) {
    if (!event) {
      this.searchForm.controls['subOrgType'].disable();
      return null;
    }

    this.searchForm.controls['subOrgType'].enable();
  }

  getOrgList() {
    this.isLoadingSpinner = true;
    this.OrgService.getOrgList().subscribe(
      (res: any) => {
        this.isLoadingSpinner = false;
        this.orgLists = res.filter((ele) => {
          return ele.orgStatus == 1;
        });
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  getOrgType() {
    this.isLoadingSpinner = true;
    this.OrgService.getSubOrgTypeSvc().subscribe(
      (data) => {
        this.getOrgTypes = data;
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  getStateList() {
    this.countryService.getStatesByUser().subscribe((response) => {
      this.states = response;
      if (this.states.length == 1) {
        for (let data of this.states) {
          this.searchForm
            .get('stateCd')
            .patchValue(data['stateCode']);
          this.getDistrictsMulti(data);
          // this.searchForm.get('stateCd').disable();

        }
      } else {
        this.states = response;
        if (this.states.length == 1) {
          for (let data of this.states) {
            this.searchForm.get('stateCd').patchValue(data['stateCode']);
            this.searchForm.get('stateCd').disable();
          }
        } else {
          this.states = response;
        }
      }
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

  onChange(data) {
    if (!data) {
      this.districtListMulti = [];
    }
  }

  getDistrictsMulti(stateCode: any) {
    this.searchForm.controls['districtCd'].setValue('');
    this.isLoadingSpinner = true;
    if (stateCode) {
      this.countryService
        .getDistrict(stateCode.stateCode)
        .pipe(delay(500))
        .subscribe(
          (districtData: DistrictList[]) => {
            this.districtListMulti = districtData;
            this.selectAllForDropdownItems(this.districtListMulti);
            this.isLoadingSpinner = false;
          },
          (error) => { }
        );
    } else {
      this.districtListMulti = [];
      this.isLoadingSpinner = false;
    }
  }
  resetSearch() {
    // this.searchForm.reset();
    this.searchForm.controls['subOrgType'].disable();
    this.searchForm.get('subOrgName').patchValue('');
  }

  onSearch() {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
    const serachData = {
      subOrgName: this.searchForm.get('subOrgName').value,
      orgId:
        this.searchForm.get('orgId').value != null
          ? [this.searchForm.get('orgId').value]
          : [],
      stateCd:
        this.searchForm.get('stateCd').value != null
          ? [this.searchForm.get('stateCd').value]
          : [],
      districtCd:
        this.searchForm.get('districtCd').value != ''
          ? this.searchForm.get('districtCd').value
          : [],
      subOrgType:
        this.searchForm.get('subOrgType').value != null
          ? [this.searchForm.get('subOrgType').value]
          : [],
    };

    this.isLoadingSpinner = true;
    this.OrgService.getSubOrgList(serachData).subscribe(
      (response) => {
        this.data = response;
        this.dataSource = new MatTableDataSource(this.data);
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }
}
