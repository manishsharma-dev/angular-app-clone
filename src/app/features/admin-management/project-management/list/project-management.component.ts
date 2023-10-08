import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { MasterConfig } from 'src/app/shared/master.config';
import {
  removeData,
  setEncryptedData,
} from 'src/app/shared/shareService/storageData';
import { Project } from '../models/project.model';
import { ProjectExtensionComponent } from '../project-extension/project-extension.component';
import { ProjectManagementService } from '../project-management.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-project-management',
  templateUrl: './project-management.component.html',
  styleUrls: ['./project-management.component.css'],
})
export class ProjectManagementComponent implements OnInit {
  isShow: boolean;
  topPosToStartShowing = 100;
  public isLivestackAdmin = JSON.parse(
    sessionStorage.getItem('isLivesatckAdmin')
  );
  public userOrgId = JSON.parse(sessionStorage.getItem('user')).orgId;

  @HostListener('window:scroll')
  checkScroll() {
    // window의 scroll top
    // Both window.pageYOffset and document.documentElement.scrollTop returns the same result in all the cases. window.pageYOffset is not supported below IE 9.

    const scrollPosition =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    if (scrollPosition >= this.topPosToStartShowing) {
      this.isShow = true;
    } else {
      this.isShow = false;
    }
  }

  gotoTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  // TODO: Cross browsing

  masterConfig = MasterConfig;
  dialogConfig = new MatDialogConfig();
  ischeck: boolean = true;
  public isLoadingSpinner: boolean = false;
  public searchForm: FormGroup;
  public dataSource = new MatTableDataSource<Project>();
  userData = JSON.parse(sessionStorage.getItem('user'));

  displayedColumns: string[] = [
    ' ',
    'projectId',
    'projectName',
    'parentOrgName',
    // 'userAllocation',
    'startDate',
    'endDate',
    'status',
    'action',
  ];

  private paginator!: MatPaginator;
  @ViewChild('paginatorRef') set matPaginator(mp: MatPaginator) {
    this.dataSource.paginator = mp;
  }
  public data: Project[] = [];
  constructor(
    private projectService: ProjectManagementService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.searchForm = new FormGroup({
      searchByVal: new FormControl(''),
    });
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onSetCheck(event, data: Project) {
    this.gotoTop();
    const storageData = {
      id: data.projectId,
    };
    setEncryptedData(storageData, 'AESSHA256ProjectList');
    this.ischeck = !event.target.checked;
  }

  openDialog() {
    this.dialogConfig.position = {
      right: '0',
    };
    this.dialogConfig.width = '55%';
    this.dialogConfig.height = '100vh';
    this.dialogConfig.panelClass = 'custom-dialog-container';
    this.dialogConfig.data = {};

    this.dialog.open(ProjectExtensionComponent, this.dialogConfig);
  }

  onEditProject(data: number, type: string) {
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
  onCloneProject(data: number, type: string) {
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

  addNewProject() {
    removeData();
    this.router.navigate(['/dashboard/project-management/add-new-project']);
  }

  onGetProjectList() {
    this.isLoadingSpinner = true;
    this.projectService
      .getProjectList(this.searchForm.value.searchByVal)
      .subscribe(
        (response) => {
          this.data = response;
          this.dataSource = new MatTableDataSource(this.data)
          this.isLoadingSpinner = false;
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
  }
  onGetProjectDetail(project: number) {
    const storageData = {
      id: project,
    };
    setEncryptedData(storageData, 'AESSHA256ProjectList');
    this.router.navigate(['/dashboard/project-management/project-details']);
  }
}
