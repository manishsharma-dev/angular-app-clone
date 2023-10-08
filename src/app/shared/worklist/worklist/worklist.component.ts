import { Router } from '@angular/router';
import { WorklistService } from './../worklist.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ViewWorkListComponent } from '../view-worklist/view-worklist.component';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RemarksDialogComponent } from '../../remarks-dialog/remarks-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from '../notification/notification/notification.service';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
@Component({
  selector: 'app-worklist',
  templateUrl: './worklist.component.html',
  styleUrls: ['./worklist.component.css'],
  providers: [DatePipe],
})
export class WorkListComponent implements OnInit {
  displayedColumns: string[] = [
    'cb',
    'requestId',
    'requestorName',
    'supervisorName',
    'moduleName',
    'subModuleName',
    'creationDate',
    'transactionApprovalStatus',
    'action',
  ];
  //dataSource = new MatTableDataSource<any>();
  worklistDataSource = new MatTableDataSource<any>();
  activeTab: 'pending' | 'approved' | 'rejected' = 'pending';
  private worklistPaginatorRef!: MatPaginator;
  private sort!: MatSort;
  filterValues: Array<number> = [1];
  dataToBeFiltered = { transactionApprovalStatus: [], searchData: '' };
  pending = true;
  approved = false;
  rejected = false;
  isLoadingSpinner = false;
  searchValue = '';
  workListData: any;
  workListFilterData: any;
  workListDataArray: any;
  transactionDetails: any;
  filteredWorklistData: any = [];
  filteredRequestId: any = [];
  role = 'supervisor';
  noOfPendingReq = 0;
  moduleCode = 0;
  selectedModule: Number;
  fromDateFilter!: Date;
  toDateFilter!: Date;
  dateToday = new Date();
  currentDate = '';
  modulesList: any;
  currPageNo = 0;
  itemPerPage = 5;
  totalPages = 0;
  selectedUserTab = false;

  constructor(
    public dialog: MatDialog,
    private ws: WorklistService,
    private _snackBar: MatSnackBar,
    private router: Router,
    private notificationSrv: NotificationService,
    private datePipe: DatePipe
  ) {
    //this.dataSource = new MatTableDataSource<any>();
  }

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild('worklistPaginatorRef') set worklistPaginator(mp: MatPaginator) {
    this.worklistPaginatorRef = mp;
    this.setDataSourceAttributes();
  }

  ngOnInit(): void {
    this.isLoadingSpinner = true;
    this.selectedUserTab = JSON.parse(
      sessionStorage.getItem('selectedWorklistTab')
    );
    this.getWorkListDetails(
      0,
      this.itemPerPage,
      this.moduleCode,
      '',
      '',
      this.filterValues
    );
    // this.filterWorklistData();
    this.getModulesList();
  }

  getModulesList() {
    this.notificationSrv.fetchModulesList().subscribe((data) => {
      this.modulesList = data;
    });
  }

  applyDateFilter() {
    if (this.fromDateFilter && this.toDateFilter) {
      let fromDate = this.fromDateFilter
        ? this.datePipe.transform(this.fromDateFilter, 'yyyy-MM-dd')
        : '';
      let toDate = this.toDateFilter
        ? this.datePipe.transform(this.toDateFilter, 'yyyy-MM-dd')
        : '';
      this.getWorkListDetails(
        this.currPageNo,
        this.itemPerPage,
        this.moduleCode,
        String(fromDate),
        String(toDate),
        this.filterValues
      );
    }
  }

  applyModuleFilter(event) {
    if (this.fromDateFilter && this.toDateFilter) {
      this.applyDateFilter();
    } else {
      this.selectedModule = event.target.value;
      this.getWorkListDetails(
        0,
        this.itemPerPage,
        this.moduleCode,
        '',
        '',
        this.filterValues
      );
    }
  }

  dateFormatChange(date: String) {
    date = date.substring(0, 10);
    return date.split('-').reverse().join('/');
  }

  getPastDate(month: number): string {
    var tempDate = new Date(this.dateToday);
    tempDate.setMonth(tempDate.getMonth() - month);
    this.currentDate = tempDate.toISOString().split('T')[0];
    return this.currentDate;
  }

  // isJsonString(str) {
  //   try {
  //     if (Number(str)) {
  //       return false;
  //     }
  //     JSON.parse(str);
  //   } catch (e) {
  //     return false;
  //   }
  //   return true;
  // }

  // filterWorklistData() {
  //   this.dataSource.filterPredicate = (
  //     data: UserData,
  //     filter: string
  //   ): boolean => {
  //     let searchString = JSON.parse(filter);
  //     let isStatusAvailable = false;
  //     if (searchString.status.length > 0) {
  //       for (const d of searchString.status) {
  //         if (data.transactionApprovalStatus.trim() === d) {
  //           isStatusAvailable = true;
  //         }
  //       }
  //     } else {
  //       isStatusAvailable = true;
  //     }
  //     const resultValue =
  //       isStatusAvailable &&
  //       data.requestId
  //         .toString()
  //         .trim()
  //         .toLowerCase()
  //         .indexOf(searchString.searchData?.toLowerCase()) !== -1;
  //     return resultValue;
  //   };
  //   this.dataSource.filter = JSON.stringify(this.dataToBeFiltered);
  // }

  fetchDataFromPagination() {
    if (this.fromDateFilter && this.toDateFilter) {
      this.applyDateFilter();
    } else {
      this.getWorkListDetails(
        this.currPageNo,
        this.itemPerPage,
        this.moduleCode,
        '',
        '',
        this.filterValues
      );
    }
  }

  fetchPageData(navigateTo: string) {
    if (navigateTo == 'pre' && this.currPageNo > 0) {
      this.currPageNo -= 1;
      this.fetchDataFromPagination();
    } else if (navigateTo == 'next' && this.currPageNo + 1 < this.totalPages) {
      this.currPageNo += 1;
      this.fetchDataFromPagination();
    }
  }

  setDataSourceAttributes() {
    this.worklistDataSource.paginator = this.worklistPaginatorRef;
    this.worklistDataSource.sort = this.sort;
  }

  searchInWorklist() {
    this.dataToBeFiltered.searchData = this.searchValue.trim().toLowerCase();
    this.worklistDataSource.filter = this.searchValue.trim().toLowerCase();
    if (this.worklistDataSource.paginator) {
      this.worklistDataSource.paginator.firstPage();
    }
  }

  openRemarksDialog(action: number, requestId) {
    this.dialog
      .open(RemarksDialogComponent, {
        panelClass: 'custom-dialog-container',
        width: '400px',
        data: {
          crrData: this.filteredRequestId,
          actionToPerform: action,
          selectedUserTab: this.selectedUserTab,
        },
      })
      .afterClosed()
      .subscribe((res: boolean) => {
        if (res != undefined) {
          this.getWorkListDetails(
            0,
            this.itemPerPage,
            this.moduleCode,
            '',
            '',
            this.filterValues
          );
        }
      });
  }

  applyFilter() {
    this.filterValues.length = 0;
    if (this.pending) {
      this.filterValues.push(1);
    }
    if (this.approved) {
      this.filterValues.push(2);
    }
    if (this.rejected) {
      this.filterValues.push(3);
    }
    this.getWorkListDetails(
      0,
      this.itemPerPage,
      this.moduleCode,
      '',
      '',
      this.filterValues
    );
  }

  viewWorkListDialog(worklistData) {
    this.filteredRequestId = [];
    this.filteredRequestId.push(worklistData);
    const dialogRef = this.dialog.open(ViewWorkListComponent, {
      data: {
        crrData: this.filteredRequestId,
        selectedUserTab: this.selectedUserTab,
      },
      width: '500px',
      height: '100vh',
      autoFocus: false,
      panelClass: 'custom-dialog-container',
      position: {
        right: '0px',
        top: '0px',
      },
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res != undefined) {
        this.getWorkListDetails(
          0,
          this.itemPerPage,
          this.moduleCode,
          '',
          '',
          this.filterValues
        );
      }
      this.filteredRequestId = [];
    });
  }

  getWorkListDetails(
    pageNo: Number,
    itemPerPage: Number,
    moduleCode: Number,
    fromDate: string,
    toDate: string,
    filter?: Array<number>
  ) {
    this.filteredRequestId = [];
    this.noOfPendingReq = 0;
    this.isLoadingSpinner = true;
    if (!this.selectedUserTab) {
      this.ws
        .fetchWorkListData(
          pageNo,
          itemPerPage,
          moduleCode,
          fromDate,
          toDate,
          filter || []
        )
        .subscribe(
          (data: any) => {
            this.workListData = data;
            if (data.workListData) {
              this.worklistDataSource.data = data.workListData;
              this.worklistDataSource.data.forEach((value, index) => {
                if (value.transactionApprovalStatusCd == '1') {
                  this.noOfPendingReq += 1;
                }
              });
              this.totalPages = Math.ceil(
                data.numberOfRecords / this.itemPerPage
              );
            } else {
              this.worklistDataSource.data = [];
              this.worklistDataSource.data.length = 0;
              this.totalPages = 1;
            }
            this.isLoadingSpinner = false;
          },
          (error) => {
            this.isLoadingSpinner = false;
          }
        );
    } else {
      this.ws
        .fetchWorkListDataUser(
          pageNo,
          itemPerPage,
          moduleCode,
          fromDate,
          toDate,
          filter || []
        )
        .subscribe(
          (data: any) => {
            if (data.workListData) {
              this.worklistDataSource.data = data.workListData;
              this.worklistDataSource.data.forEach((value, index) => {
                if (value.transactionApprovalStatusCd == '1') {
                  this.noOfPendingReq += 1;
                }
              });
              this.totalPages = Math.ceil(
                data.numberOfRecords / this.itemPerPage
              );
            } else {
              this.worklistDataSource.data = [];
              this.worklistDataSource.data.length = 0;
              this.totalPages = 1;
            }
            this.isLoadingSpinner = false;
          },
          (error) => {
            this.isLoadingSpinner = false;
          }
        );
    }
  }

  checkAllBoxes(event: Event) {
    this.filteredRequestId = [];
    // this.filteredWorklistData.length = 0;
    if ((event.target as HTMLInputElement)?.checked) {
      for (var i = 0; i < this.worklistDataSource.filteredData.length; i++) {
        if (
          this.worklistDataSource.filteredData[i].transactionApprovalStatusCd ==
          '1'
        ) {
          this.filteredRequestId.push(
            this.worklistDataSource.filteredData[i].requestId
          );
        }
        // }
      }
    }
  }

  onCheckboxChange(event: Event, clickedRequest: any) {
    if ((event.target as HTMLInputElement)?.checked) {
      this.filteredRequestId.push(clickedRequest);
    } else {
      this.filteredRequestId.forEach((value, index) => {
        if (value == clickedRequest) {
          this.filteredRequestId.splice(index, 1);
        }
      });
    }
    //this.noOfBoxes = this.animalData.length;
  }

  checkIfInSelectedList(data) {
    if (this.filteredRequestId.length > 0) {
      return this.filteredRequestId.includes(data);
    } else {
      return false;
    }
  }
}
