import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';

// import { ProjectUserAllocDelloc } from '../models/user-alloc-dealloc.model';
import { MatTableDataSource } from '@angular/material/table';
import { getDecryptedData } from 'src/app/shared/shareService/storageData';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import moment from 'moment';
import { UserManagementService } from '../user-management.service';

@Component({
  selector: 'app-user-alloc-dealloc',
  templateUrl: './user-alloc-dealloc.component.html',
  styleUrls: ['./user-alloc-dealloc.component.css'],
})
export class UserAllocDeallocComponent implements OnInit {
  public allocateUser = [];
  public selection = new SelectionModel<any>(true, []);
  public isLoadingSpinner: boolean = false;
  public searchForm: FormGroup;
  public dataSource = new MatTableDataSource<any>();
  public data: any[] = [];
  public value = 0;
  public userAllocationSelectStartDate: any[] = [];
  public userAllocationSelectEndDate: any[] = [];
  public userDeAllocationSelectStartDate: any = {};
  public userDeAllocationSelectEndDate: any = {};
  public todayDate: any = sessionStorage.getItem('serverCurrentDateTime');
  public isValidFileTypeOrSize: string;
  public file: File;
  public adminFilterData: any;
  public forAllocationProject: boolean = true;

  displayedColumns: string[] = [
    'select',
    'projectId',
    'runSeqNo',
    'projectName',
    'projectStartDate',
    'projectEndDate',
  ];

  // @ViewChild('myFileInput')
  // userExcelUpload: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private dialogRef: MatDialogRef<UserAllocDeallocComponent>,
    private router: Router,
    private userService: UserManagementService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.searchForm = new FormGroup({
      searchByVal: new FormControl(''),
    });
    this.onUserProjectList();
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
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }

    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.userID + 1
    }`;
  }

  onUserProjectList() {
    this.isLoadingSpinner = true;
    console.log('opendialof>>>>>>', this.dialogData.userID);
    let userID = {
      // userId: '2000307',
      userId: this.dialogData.userID,
    };
    this.userService.getProjectListForUser(userID).subscribe(
      (res: any) => {
        res.map((item) => {
          item.startDate = moment(item.startDate);
          item.endDate = moment(item.endDate);
          this.userAllocationSelectStartDate.push(this.todayDate);
          this.userAllocationSelectEndDate.push(item.endDate);
        });

        this.dataSource = new MatTableDataSource(res);
        this.data = res;
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  onUserProjectListAssigned() {
    this.isLoadingSpinner = true;
    console.log('opendialof>>>>>>', this.dialogData.userID);
    let userID = {
      // userId: '2000307',
      userId: this.dialogData.userID,
    };
    this.userService.getAssignedProjectListForUser(userID).subscribe(
      (res: any) => {
        res.map((item) => {
          item.startDate = moment(item.startDate);
          item.endDate = moment(item.endDate);
        });
        this.dataSource = new MatTableDataSource(res);
        this.data = res;
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
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
            // sessionStorage.setItem('isProfile', 'true');
            // this.userService.userUpdateList.next(true);
            this.router.navigate(['/dashboard/user-management/user-details']);
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
      data['projectId'] = data['project_id'];
      data['userId'] = this.dialogData.userID;
      allocatDta.push(data);
    });

    this.userService
      .allocateProjectForUser(allocatDta)
      .subscribe((response) => {
        this.selection.clear();
        this.dialog
          .open(ConfirmationDialogComponent, {
            data: {
              title: `Info`,
              message: `Project Allocated Successfully`,
              icon: 'assets/images/info.svg',
              primaryBtnText: 'Ok',
            },
            panelClass: 'common-info-dialog',
          })
          .afterClosed()
          .subscribe((result) => {
            if (this.dialogData.isuserDetails) {
              this.userService.userUpdateList.next(true);
              this.router.navigate(['/dashboard/user-management/user-details']);
              this.onUserProjectList();
            } else {
              this.router.navigate(['/dashboard/user-management/add-new-user']);
            }
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
            message: 'Please select Project Id.',
            icon: '/assets/images/alert.svg',
            primaryBtnText: 'Ok',
          },
          panelClass: 'common-info-dialog',
        })
        .afterClosed()
        .subscribe((result) => {
          if (result) {
            this.userService.userUpdateList.next(true);
            this.router.navigate(['/dashboard/user-management/user-details']);
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
      data['projectId'] = data['project_id'];
      data['userId'] = this.dialogData.userID;
      deallocatDta.push(data);
    });

    this.userService
      .deallocateProjectForUser(deallocatDta)
      .subscribe((response) => {
        this.isLoadingSpinner = false;
        this.selection.clear();
        this.dialog
          .open(ConfirmationDialogComponent, {
            data: {
              title: `Info`,
              message: `Project Deallocated Successfully`,
              icon: 'assets/images/verified.svg',
              primaryBtnText: 'Ok',
            },
            panelClass: 'common-info-dialog',
          })
          .afterClosed()
          .subscribe((result) => {
            if (result) {
              if (this.dialogData.isuserDetails) {
                this.userService.userUpdateList.next(true);
                this.router.navigate([
                  '/dashboard/user-management/user-details',
                ]);
              } else {
                this.router.navigate([
                  '/dashboard/user-management/add-new-user',
                ]);
              }
              // this.onGetProjectUserDeAllocation();
            }
          });
      });
  }
  onGetProjectUserDeAllocation() {
    this.isLoadingSpinner = true;
    let projectId = getDecryptedData('AESSHA256ProjectList').id;
    // this.projectService
    //   .getProjectUserDeAllocation(projectId)
    //   .subscribe((response) => {
    //     this.dataSource = new MatTableDataSource(response);
    //     this.data = response;
    //     this.isLoadingSpinner = false;
    //   });
  }

  tabClick(event: any) {
    this.isLoadingSpinner = true;
    if (event['index'] == 1) {
      this.forAllocationProject = false;
      this.displayedColumns.splice(4);
      this.onUserProjectListAssigned();
      this.isLoadingSpinner = false;
    } else {
      this.displayedColumns[4] = 'projectStartDate';
      this.displayedColumns[5] = 'projectEndDate';
      this.onUserProjectList();
      this.isLoadingSpinner = false;
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onSubmit(data) {
    if (this.forAllocationProject) {
      this.onUserAllocation(data);
    } else {
      this.onUserDeallocation(data);
    }
  }
  // onFileUpload(event: any) {
  //   this.file = (event.target as HTMLInputElement).files[0];
  //   let data = getFileSize(this.file);
  //   if (!data) {
  //     this.isValidFileTypeOrSize = 'File size should not exceed than 5MB';
  //     return;
  //   }
  // }

  // onSubmitFile() {
  //   this.isLoadingSpinner = false;
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
  //               this.onUserProjectList();
  //               //this.router.navigate(['/dashboard/user-management/user-details']);
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
