import { Component, OnInit } from '@angular/core';
import { MasterConfig } from 'src/app/shared/master.config';
import { getDecryptedData } from 'src/app/shared/shareService/storageData';
import { OrganizationManagementService } from '../organization-management.service';

@Component({
  selector: 'app-organization-details',
  templateUrl: './organization-details.component.html',
  styleUrls: ['./organization-details.component.css'],
})
export class OrganizationDetailsComponent implements OnInit {
  masterConfig = MasterConfig;
  public orgDetail: any;
  public isLivestackAdmin = JSON.parse(
    sessionStorage.getItem('isLivesatckAdmin')
  );
  public userOrgId = JSON.parse(sessionStorage.getItem('user')).orgId;
  public isLoadingSpinner: boolean = false;
  public orgId: number | string;
  constructor(public OrgService: OrganizationManagementService) {}

  ngOnInit(): void {
    this.orgId = getDecryptedData('AESSHA256OrgName').id;
    if (!this.orgId) {
      return;
    }
    this.onGetOrgDetail(this.orgId);
  }

  onGetOrgDetail(orgId: number | string) {
    this.isLoadingSpinner = true;
    this.OrgService.getOrgDetail(orgId).subscribe((response) => {
      this.orgDetail = response;
      this.isLoadingSpinner = false;
    });
  }
}
