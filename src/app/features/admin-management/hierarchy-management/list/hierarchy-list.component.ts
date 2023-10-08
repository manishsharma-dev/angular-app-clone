import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';
import { MasterConfig } from 'src/app/shared/master.config';
import {
  removeData,
  setEncryptedData,
} from 'src/app/shared/shareService/storageData';
import { HierarchyService } from '../hierarchy.service';
import { Hierarchy } from '../models/hierarchy.model';

import { PreviewHierarchyDialogComponent } from '../preview-hierarchy-dialog/preview-hierarchy-dialog.component';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-hierarchy-list',
  templateUrl: './hierarchy-list.component.html',
  styleUrls: ['./hierarchy-list.component.css'],
})
export class HierarchyListComponent implements OnInit {
  masterConfig = MasterConfig;
  public isLoadingSpinner = false;
  public isLivestackAdmin = JSON.parse(
    sessionStorage.getItem('isLivesatckAdmin')
  );
  public userOrgId = JSON.parse(sessionStorage.getItem('user')).orgId;
  public data: Hierarchy[] = [];
  displayedColumns: string[] = [
    'S.No.',
    'state',
    'orgName',
    'Hierarchy ID',
    'Hierarchy Name',
    'Created on',
    'status',
    'action',
  ];
  public dataSource = new MatTableDataSource<Hierarchy>();
  @ViewChild(MatTable) table: MatTable<any>;
  private paginator!: MatPaginator;
  @ViewChild('paginatorRef') set matPaginator(mp: MatPaginator) {
    this.dataSource.paginator = mp;
  }
  constructor(
    private hierarchyService: HierarchyService,
    private router: Router,
    private detectChange: ChangeDetectorRef,
    private dialog: MatDialog,
    private readonly translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.getHierarchy();
  }

  getHierarchy = (): void => {
    this.isLoadingSpinner = true;
    this.hierarchyService.getHierarchy().subscribe(
      (response) => {
        this.data = response;
        this.dataSource = new MatTableDataSource(this.data);
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  };

  openPreview(data: Hierarchy) {
    this.dialog.open(PreviewHierarchyDialogComponent, {
      data: data,
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onCreateHierarchy() {
    removeData();
    this.router.navigate(['/dashboard/hierarchy-management/add-new-hierarchy']);
  }

  editHierarchy(data: number, type: string) {
    if (!data) {
      return;
    }
    const storageData = {
      type: type,
      id: data,
    };
    this.router.navigate(['/dashboard/hierarchy-management/add-new-hierarchy']);
    setEncryptedData(storageData, 'AESSHA256Hierarchy');
  }

  cloneHierarchy(data, type) {
    if (!data) {
      return;
    }
    const storageData = {
      type: type,
      id: data,
    };
    setEncryptedData(storageData, 'AESSHA256Hierarchy');
    this.router.navigate(['/dashboard/hierarchy-management/add-new-hierarchy']);
  }

  onDeleteRow(data: string, index: number) {
    this.isLoadingSpinner = true;
    this.dialog
      .open(ConfirmationDeleteDialogComponent, {
        data: {
          title: this.translateService.instant('alertMsg.alert'),
          message: this.translateService.instant('alertMsg.delete_confirm'),
          icon: 'assets/images/alert.svg',
          primaryBtnText: this.translateService.instant('common.yes'),
          secondaryBtnText: this.translateService.instant('common.no'),
        },
        panelClass: 'common-alert-dialog',
      })
      .afterClosed()
      .subscribe({
        next: (result) => {
          if (result) {
            this.hierarchyService
              .deleteHierarchy(data)
              .subscribe((response) => {
                const data = this.dataSource.data;
                data.splice(index, 1);
                this.dataSource.data = data;
              });
          }
        },
      });
    this.isLoadingSpinner = false;
  }
}
