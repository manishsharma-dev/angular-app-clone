import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';

import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { MasterConfig } from 'src/app/shared/master.config';
import { setEncryptedData } from 'src/app/shared/shareService/storageData';
import { AccessManagementService, Role } from '../access-management.service';
import { AccessPrivilegeDetailsComponent } from '../access-privilege-details/access-privilege-details.component';
import { MatPaginator } from '@angular/material/paginator';




@Component({
  selector: 'app-roll-list',
  templateUrl: './roll-list.component.html',
  styleUrls: ['./roll-list.component.css']
})

export class RollListComponent implements OnInit {
  masterConfig = MasterConfig;
  public dataSource = new MatTableDataSource<any>();
  public data: any;
  public isLoadingSpinner: boolean = false;
  public filterValue: string = "";
  readonly isLivesatckAdmin: string | number | boolean;

  displayedColumns: string[] = [
    'S.No.',
    'roleId',
    'role',
    'module',
    'status',
    'action'
  ];

  @ViewChild(MatTable) table: MatTable<any>;
  private paginator!: MatPaginator;
  @ViewChild('paginatorRef') set matPaginator(mp: MatPaginator) {
    this.dataSource.paginator = mp;
  }

  constructor(public dialog: MatDialog, private router: Router, private roleservice: AccessManagementService, private detectChange: ChangeDetectorRef, private readonly translateService: TranslateService) {
    this.isLivesatckAdmin = JSON.parse(
      sessionStorage.getItem('isLivesatckAdmin')
    );
  }


  ngOnInit(): void {
    this.getRoles();
  }


  getRoles = (): void => {
    this.isLoadingSpinner = true
    this.roleservice.getRoles().subscribe((response) => {
      this.data = response;

      this.dataSource = new MatTableDataSource(this.data);
      this.isLoadingSpinner = false
    })


  }
  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = this.filterValue.trim().toLowerCase();

  }
  onAddNewRoll() {
    const storageData = {
      type: "",
      id: ""
    }
    setEncryptedData(storageData, "AESSHA256roleaccess");
    this.router.navigate(['/dashboard/access-management/add-new-roll'])

  }


  onViewDetail(data: number) {
    const dialogRef = this.dialog.open(AccessPrivilegeDetailsComponent, {
      data: {
        index: data,
      }

    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.delete) {
        // this.deleteSelectedRow(result.index);
      }
    })


    // const dialogRef = this.dialog.open(AccessPrivilegeDetailsComponent);
  }
  onCloneAcess(data: number, type: string) {
    if (!data) {
      return;
    }
    const storageData = {
      type: type,
      id: data
    }
    setEncryptedData(storageData, "AESSHA256roleaccess");

  }

  onAddEditAcess(data: number, type: string) {
    if (!data) {
      return;
    }
    const storageData = {
      type: type,
      id: data
    }
    setEncryptedData(storageData, "AESSHA256roleaccess");


  }

  // deleteRow(index: any) {
  //   this.deleteSelectedRow(index);
  // }


  deleteRow(roleCd: number, index) {
    this.isLoadingSpinner = true;

    this.dialog
      .open(ConfirmationDeleteDialogComponent, {
        data: {
          title: this.translateService.instant('alertMsg.alert'),
          message: this.translateService.instant('alertMsg.delete_confirm'),
          icon: "assets/images/alert.svg",
          primaryBtnText: this.translateService.instant('common.yes'),
          secondaryBtnText: this.translateService.instant('common.no')
        },
        panelClass: 'common-alert-dialog'
      }).afterClosed()
      .subscribe({
        next: (result) => {
          if (result) {
            this.roleservice.deleteRole(roleCd).subscribe((response) => {
              const data = this.dataSource.data;
              data.splice(index, 1);
              this.dataSource.data = data;
              (<HTMLInputElement>document.getElementById("search")).value = "";
              this.getRoles();

            });
          }
        },
      });
    this.isLoadingSpinner = false;


  }



  sortData(sort: Sort) {
    if (sort.active && sort.direction !== "") {
      this.dataSource.data = this.dataSource.data.sort((a, b) => {
        const isAsc = sort.direction === "asc";
        switch (sort.active) {
          case "roleId":
            return this.compare(a.roleId, b.roleId, isAsc);
          case "role":
            return this.compare(a.role, b.role, isAsc);
          case "status":
            return this.compare(a.status, b.status, isAsc);
          default:
            return 0;
        }
      });
    }
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

}
