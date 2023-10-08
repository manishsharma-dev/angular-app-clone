import { ViewOrgDetailsComponent } from './../view-org-details/view-org-details.component';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MasterConfig } from 'src/app/shared/master.config';
import { getDecryptedData, setEncryptedData } from 'src/app/shared/shareService/storageData';
import { ProjectManagementService } from '../project-management.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css'],
})
export class ProjectDetailsComponent implements OnInit {
  masterConfig = MasterConfig;
  public data: any = [];
  public projectId: number;
  public isLoadingSpinner: boolean = false;
  public isLivestackAdmin = JSON.parse(
    sessionStorage.getItem('isLivesatckAdmin')
  );
  public userOrgId = JSON.parse(sessionStorage.getItem('user')).orgId;
  constructor(
    private projectService: ProjectManagementService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.onGetProjectDetail();
    this.projectId = getDecryptedData('AESSHA256ProjectList').id;
  }
  onGetProjectDetail() {
    this.isLoadingSpinner = true;
    let projectId = getDecryptedData('AESSHA256ProjectList').id;
    if (projectId) {
      this.projectService.getProjectDetail(projectId).subscribe((response) => {
        this.isLoadingSpinner = false;
        this.data = response;
      });
    }
  }

  viewOrgDetailsDialog(orgDetails) {
    const dialogRef = this.dialog.open(ViewOrgDetailsComponent, {
      data: {
        selectedItem: orgDetails,
        icon: 'assets/images/alert.svg',
        primaryBtnText: "Ok",

      },
      panelClass: 'common-org-dialog',
    });

  }

  onEditProject(data: number, type: string) {
    console.log(data)

    if (!data) {
      return;
    }
    const storageData = {
      id: data,
      type: type
    };
    setEncryptedData(storageData, 'AESSHA256ProjectList');
    this.router.navigate(['/dashboard/project-management/add-new-project']);
  }


}
