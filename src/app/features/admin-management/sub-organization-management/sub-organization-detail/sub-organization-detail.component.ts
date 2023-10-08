import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MasterConfig } from 'src/app/shared/master.config';
import {
  getDecryptedData,
  setEncryptedData,
} from 'src/app/shared/shareService/storageData';
import { OrganizationManagementService } from '../../organization-management/organization-management.service';

@Component({
  selector: 'app-sub-organization-detail',
  templateUrl: './sub-organization-detail.component.html',
  styleUrls: ['./sub-organization-detail.component.css'],
})
export class SubOrganizationDetailComponent implements OnInit {
  masterConfig = MasterConfig;
  public subOrgDetail: any;
  public isLoadingSpinner: boolean = false;
  public isLivestackAdmin = JSON.parse(
    sessionStorage.getItem('isLivesatckAdmin')
  );
  public userOrgId = JSON.parse(sessionStorage.getItem('user')).orgId;
  constructor(
    public OrgService: OrganizationManagementService,
    public router: Router
  ) {}

  ngOnInit(): void {
    const subOrgId = getDecryptedData('AESSHA256subOrgName').id;
    this.isLoadingSpinner = true;
    this.OrgService.getSubOrgDetails(subOrgId).subscribe((response) => {
      this.subOrgDetail = response;
      this.isLoadingSpinner = false;
    });
  }
  onviewEditSubOrg(subOrgId, Type: string, orgId: string) {
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
}
