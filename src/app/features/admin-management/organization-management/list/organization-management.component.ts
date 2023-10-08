import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Route, Router } from '@angular/router';
import { Organization } from 'src/app/features/admin-management/organization-management/model/organization.model';
import { MasterConfig } from 'src/app/shared/master.config';
import {
  removeData,
  setEncryptedData,
} from 'src/app/shared/shareService/storageData';
import { OrganizationManagementService } from '../organization-management.service';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-organization-management',
  templateUrl: './organization-management.component.html',
  styleUrls: ['./organization-management.component.css'],
})
export class OrganizationManagementComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  masterConfig = MasterConfig;
  public isLivestackAdmin = JSON.parse(
    sessionStorage.getItem('isLivesatckAdmin')
  );
  public userOrgId = JSON.parse(sessionStorage.getItem('user')).orgId;
  displayedColumns: string[] = [
    'id',
    'name',
    'type',
    'state',
    'status',
    'action',
  ];

  public dataSource = new MatTableDataSource<Organization>();
  public orgDetail: any;
  public isLoadingSpinner: boolean = false;
  public data: Organization[] = [];
  @ViewChild(MatSort) sort: MatSort;
  private paginator!: MatPaginator;
  @ViewChild('paginatorRef') set matPaginator(mp: MatPaginator) {
    this.dataSource.paginator = mp;
  }
  
  constructor(
    private dialog: MatDialog,
    public OrgService: OrganizationManagementService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.isLoadingSpinner = true;
    this.OrgService.getOrgList().subscribe((response) => {
      this.data = response;
      this.dataSource = new MatTableDataSource(this.data);
      this.isLoadingSpinner = false;
    });

   // this.dataSource.paginator = this.paginator;
  }
  

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  addNewOrg() {
    removeData();
    this.router.navigate(['/dashboard/organization-management/add-new-org']);
  }
  onEditOrg(data) {
    if (!data) {
      return;
    }
    const storageData = {
      id: data,
    };
    setEncryptedData(storageData, 'AESSHA256OrgName');
    this.router.navigate(['/dashboard/organization-management/add-new-org']);
  }
  onViewOrgDetail(data) {
    if (!data) {
      return;
    }
    const storageData = {
      id: data,
    };
    setEncryptedData(storageData, 'AESSHA256OrgName');
    this.router.navigate(['/dashboard/organization-management/org-details']);
  }

  ngOnDestroy(): void {}
}
