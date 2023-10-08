import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';

import { ProjectUserAllocDelloc } from '../models/user-alloc-dealloc.model';
import { ProjectManagementService } from '../project-management.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

import moment from 'moment';
import { getFileSize } from 'src/app/shared/utility/validation';
import { MatPaginator } from '@angular/material/paginator';
import { ViewOrgDetailsComponent } from '../view-org-details/view-org-details.component';
import { TranslateService } from '@ngx-translate/core';
import { ViewUserAllDeallocComponent } from '../view-user-all-dealloc/view-user-all-dealloc.component';

@Component({
  selector: 'app-project-alloc-dealloc',
  templateUrl: './project-alloc-dealloc.component.html',
  styleUrls: ['./project-alloc-dealloc.component.css'],
})
export class ProjectAllocDeallocComponent implements OnInit {
  public allocateUser = [];
  public selection = new SelectionModel<ProjectUserAllocDelloc>(true, []);
  public isLoadingSpinner: boolean = false;
  public searchForm: FormGroup;
  public dataSource = new MatTableDataSource<ProjectUserAllocDelloc>([]);
  public dataSourceAloc = new MatTableDataSource<ProjectUserAllocDelloc>([]);
  public data: ProjectUserAllocDelloc[] = [];
  public value = 0;
  public userAllocationSelectStartDate: any = {};
  public userAllocationSelectEndDate: any = {};
  public userDeAllocationSelectStartDate: any = {};
  public userDeAllocationSelectEndDate: any = {};
  public todayDate: any = sessionStorage.getItem('serverCurrentDateTime');
  public isValidFileTypeOrSize: string;
  public file: File;
  public adminFilterData: any;
  public serachDate: any = [];
  @ViewChild('paginatorRef') set matPaginator(mp: MatPaginator) {
    this.dataSourceAloc.paginator = mp;
  }

  @ViewChild('paginatorRefde') set matPaginatorde(mp: MatPaginator) {
    this.dataSource.paginator = mp;
  }
  @ViewChild('input') input: ElementRef;
  @ViewChild('inputdeallocation') inputdeallocation: ElementRef;


  displayedColumns: string[] = [
    'select',
    'projectId',
    'runSeqNo',
    'userID',
    'userName',
    'userType',
    // 'role',
    // 'baseLocation',
    // 'role',
    // 'baseLocation',
    'projectStartDate',
    'projectEndDate',
  ];

  @ViewChild('myFileInput')
  userExcelUpload: ElementRef;
  public itemsSelected = [];
  public numItems: number;
  public ischecked: boolean;
  public startPage: number = 0;
  public paginationLimit: number = 8;
  private readonly translateService: TranslateService

  constructor(
    private router: Router,
    private projectService: ProjectManagementService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.searchForm = new FormGroup({
      searchByVal: new FormControl(''),
    });
  }


  selctItems(event) {
    //this.ischecked = event.checked
    this.itemsSelected = [];
    this.itemsSelected = this.selection.selected;
    this.numItems = this.selection.selected.length;
  }
  ngAfterViewInit() {

  }

  deSelecteItem(row: any) {
    this.itemsSelected.forEach((val, index) => {
      if (val.loginId === row.loginId) {
        this.itemsSelected.splice(index, 1);
        this.numItems--
        this.ischecked = false;

      }

    })
  }

  showMoreItemsDialog(selectedItem: any) {
    this.dialog
      .open(ViewUserAllDeallocComponent, {
        data: {
          selectedItem: selectedItem,
          title: "Users",
          icon: 'assets/images/alert.svg',
          primaryBtnText: "Ok",

        },
        height: '100%',
        autoFocus: false,
        panelClass: 'common-alldeall-dialog',
      })

  }



  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: ProjectUserAllocDelloc): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.userId + 1
      }`;
  }


  onUserProjectList(searchData: ProjectUserAllocDelloc) {
    this.isLoadingSpinner = true;
    this.projectService.GetUserlistAreaWise(searchData).subscribe(
      (res) => {
        this.dataSourceAloc.data = res;
        this.data = res;
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  receiveData(event: Event) {
    this.serachDate = event;
    this.onUserProjectList(this.serachDate)
  }

  receiveDataDeallaction(event: Event) {
    this.serachDate = event;
    this.onGetProjectUserDeAllocation(this.serachDate)
  }

  dateChange(event, i) {
    this.userAllocationSelectStartDate[i] = event.value;
  }

  onUserAllocation(data) {
    if (this.selection.selected.length <= 0) {
      this.dialog
        .open(ConfirmationDialogComponent, {
          data: {
            title: 'Alert',
            message: 'Please select User Id.',
            icon: '/assets/images/alert.svg',
            primaryBtnText: 'Ok',
          },
          panelClass: 'common-info-dialog',
        })
        .afterClosed()
        .subscribe((result) => {
          if (result) {
            this.router.navigate([
              '/dashboard/project-management/userallocationdeallocation',
            ]);
          }
        });

      return;
    }
    let allocatDta = [];
    this.selection.selected.forEach((data, index) => {
      data['userAllocationStartDate'] = moment(
        this.userAllocationSelectStartDate[index]
      ).format('YYYY/MM/DD');
      data['userAllocationEndDate'] = moment(
        this.userAllocationSelectEndDate[index]
      ).format('YYYY/MM/DD');
      data['runSeqNo'] = '';
      allocatDta.push(data);
    });

    this.projectService.getUserAllocated(allocatDta).subscribe((response) => {
      this.selection.clear();
      this.dialog
        .open(ConfirmationDialogComponent, {
          data: {
            title: `Info`,
            message: `Users Allocated Successfully`,
            icon: 'assets/images/info.svg',
            primaryBtnText: 'Ok',
          },
          panelClass: 'common-info-dialog',
        })
        .afterClosed()
        .subscribe((result) => {
          this.onUserProjectList(this.serachDate);
        });
    });
  }

  onUserDeallocation(data) {
    this.isLoadingSpinner = true;
    if (this.selection.selected.length <= 0) {
      this.dialog
        .open(ConfirmationDialogComponent, {
          data: {
            title: 'Alert',
            message: 'Please select User Id.',
            icon: '/assets/images/alert.svg',
            primaryBtnText: 'Ok',
          },
          panelClass: 'common-info-dialog',
        })
        .afterClosed()
        .subscribe((result) => {
          if (result) {
            this.router.navigate([
              '/dashboard/project-management/userallocationdeallocation',
            ]);
          }
        });

      return;
    }
    let deallocatDta = [];
    this.selection.selected.forEach((data, index) => {
      data['userAllocationStartDate'] = moment(
        data['userAllocationStartDate']
      ).format('YYYY/MM/DD');
      data['userAllocationEndDate'] = moment(
        this.userDeAllocationSelectEndDate[index]
      ).format('YYYY/MM/DD');
      data['runSeqNo'] = '';
      deallocatDta.push(data);
    });

    this.projectService
      .getUserDeAllocated(deallocatDta)
      .subscribe((response) => {
        this.isLoadingSpinner = false;
        this.selection.clear();
        this.dialog
          .open(ConfirmationDialogComponent, {
            data: {
              title: `Info`,
              message: `Users Deallocated Successfully`,
              icon: 'assets/images/verified.svg',
              primaryBtnText: 'Ok',
            },
            panelClass: 'common-info-dialog',
          })
          .afterClosed()
          .subscribe((result) => {
            this.onGetProjectUserDeAllocation(this.serachDate);
          });
      });
  }
  onGetProjectUserDeAllocation(searchData?: ProjectUserAllocDelloc) {
    this.isLoadingSpinner = true;
    this.projectService
      .getProjectUserDeAllocation(searchData)
      .subscribe((response) => {
        this.dataSource.data = response;
        this.data = response;
        this.isLoadingSpinner = false;
      });
  }

  tabClick(event: any) {
    // this.isLoadingSpinner = true;
    if (event['index'] == 1) {
      this.displayedColumns.splice(8);
      //this.onGetProjectUserDeAllocation(this.serachDate);
      this.dataSourceAloc = new MatTableDataSource([]);
      this.itemsSelected = [];
      this.selection.clear();

      this.inputdeallocation.nativeElement.value = "";

    } else {
      this.displayedColumns[6] = 'projectStartDate';
      this.displayedColumns[7] = 'projectEndDate';
      this.dataSource = new MatTableDataSource([]);
      this.itemsSelected = [];
      this.selection.clear();
      // document.querySelector("#searchAllocation") as HTMLInputElement.value="";
      //this.onUserProjectList(this.serachDate);
      //this.isLoadingSpinner = false;
      this.input.nativeElement.value = "";
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceAloc.filter = filterValue.trim().toLowerCase();
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  onFileUpload(event: any) {
    this.file = (event.target as HTMLInputElement).files[0];
    let data = getFileSize(this.file);
    if (!data) {
      this.isValidFileTypeOrSize = 'File size should not exceed than 5MB';
      return;
    }
  }

  // downloadExcel() {
  //   this.isLoadingSpinner = true;
  //   let projectId = getDecryptedData("AESSHA256ProjectList").id;
  //   this.projectService.downloadBulkUserExcel(projectId).subscribe((response) => {
  //     this.isLoadingSpinner = true;
  //     if (response) {
  //       const fileName = response.headers
  //         .get('Content-Disposition')
  //         .split('; ')[1]
  //         .split('=')[1];
  //       let blob: any = new Blob([response.body]);
  //       const url = window.URL.createObjectURL(blob);
  //       FileSaver.saveAs(blob, fileName);
  //       this.dialog.open(ConfirmationDialogComponent, {
  //         data: {
  //           title: 'Info',
  //           message: `Excel downloaded sucessfully`,
  //           icon: "assets/images/info.svg",
  //           primaryBtnText: 'Ok'
  //         },
  //         panelClass: 'common-info-dialog',
  //       })
  //         .afterClosed()
  //         .subscribe((result) => {
  //           if (result) {
  //             this.onUserProjectList(this.serachDate);
  //             this.router.navigate(['/dashboard/project-management/userallocationdeallocation']);
  //           }
  //         });
  //       this.isLoadingSpinner = false;
  //     }
  //   }, error => {
  //     this.isLoadingSpinner = false;
  //   });
  // }

  // onSubmitFile() {
  //   this.isLoadingSpinner = true;
  //   let projectId = getDecryptedData('AESSHA256ProjectList').id;
  //   const formData = new FormData();
  //   formData.append('projectId', projectId), formData.append('file', this.file);
  //   this.projectService.uploadProjectUserDeAllocation(formData).subscribe(
  //     (response) => {
  //       this.isLoadingSpinner = true;
  //       this.userExcelUpload.nativeElement.value = '';
  //       if (response) {
  //         this.dialog
  //           .open(ConfirmationDialogComponent, {
  //             data: {
  //               title: 'Info',
  //               message: `${response['msgDesc']}`,
  //               icon: 'assets/images/info.svg',
  //               primaryBtnText: 'Ok',
  //             },
  //             panelClass: 'common-info-dialog',
  //           })
  //           .afterClosed()
  //           .subscribe((result) => {
  //             if (result) {
  //               // this.onUserProjectList();
  //               //this.router.navigate(['/dashboard/project-management/userallocationdeallocation']);
  //             }
  //           });
  //         this.isLoadingSpinner = false;
  //       }
  //     },
  //     (error) => {
  //       this.userExcelUpload.nativeElement.value = '';
  //       this.isLoadingSpinner = false;
  //     }
  //   );
  // }
}
