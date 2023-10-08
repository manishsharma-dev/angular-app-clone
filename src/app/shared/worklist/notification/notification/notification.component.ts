import { DatePipe } from '@angular/common';
import { Component, OnInit, EventEmitter } from '@angular/core';
import { NotificationService } from './notification.service';
interface Notifications {
  title: string;
  category: string;
  desc: string;
  time: string;
  tag: string;
}

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
  providers: [DatePipe],
})
export class NotificationComponent implements OnInit {
  isLoadingSpinner = false;
  notifications: Notifications[] = [];
  filterValues: Array<number> = [0];
  all: boolean = true;
  notificationData: any;
  modulesList: any;
  selectedModule: Number;
  currPageNo = 0;
  itemPerPage = 5;
  totalPages = 0;
  moduleCode = 0;
  fromDateFilter!: Date;
  toDateFilter!: Date;
  dateToday = new Date();
  currentDate: string = '';

  constructor(
    private notificationSrv: NotificationService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.getNotificationDetails(
      this.currPageNo,
      this.itemPerPage,
      this.moduleCode,
      '',
      '',
      []
    );
    this.getModulesList();
  }

  getPastDate(month: number): string {
    var tempDate = new Date(this.dateToday);
    tempDate.setMonth(tempDate.getMonth() - month);
    this.currentDate = tempDate.toISOString().split('T')[0];
    return this.currentDate;
  }

  applyReadFilter() {
    this.filterValues.length = 0;
    if (this.all) {
      this.filterValues.push(0);
    }
    this.getNotificationDetails(
      this.currPageNo,
      this.itemPerPage,
      this.moduleCode,
      '',
      '',
      this.filterValues
    );
  }

  getNotificationDetails(
    pageNo: Number,
    itemPerPage: Number,
    moduleCode: Number,
    fromDate: string,
    toDate: string,
    filter?: Array<number>
  ) {
    this.isLoadingSpinner = true;
    this.notificationSrv
      .fetchNotificationData(
        pageNo,
        itemPerPage,
        moduleCode,
        fromDate,
        toDate,
        filter || []
      )
      .subscribe(
        (data: any) => {
          this.notificationData = data.notificationAlertData;
          data.numberOfRecords
            ? (this.totalPages = Math.ceil(
                data.numberOfRecords / this.itemPerPage
              ))
            : (this.totalPages = 1);
          // this.notificationDataSource.data = data.notificationAlertData;
          // this.worklistDataSource.data.forEach((value, index) => {
          //   if (value) {
          //   } else {
          //     this.isLoadingSpinner = false;
          //   }
          // });
          this.isLoadingSpinner = false;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
  }

  applyModuleFilter(event) {
    if (this.fromDateFilter && this.toDateFilter) {
      this.applyDateFilter();
    } else {
      this.selectedModule = event.target.value;
      this.getNotificationDetails(
        this.currPageNo,
        this.itemPerPage,
        this.moduleCode,
        '',
        '',
        this.filterValues
      );
    }
  }

  applyDateFilter() {
    if (this.fromDateFilter && this.toDateFilter) {
      let fromDate = this.fromDateFilter
        ? this.datePipe.transform(this.fromDateFilter, 'yyyy-MM-dd')
        : '';
      let toDate = this.toDateFilter
        ? this.datePipe.transform(this.toDateFilter, 'yyyy-MM-dd')
        : '';
      this.getNotificationDetails(
        this.currPageNo,
        this.itemPerPage,
        this.moduleCode,
        String(fromDate),
        String(toDate),
        this.filterValues
      );
    }
  }

  getModulesList() {
    this.notificationSrv.fetchModulesList().subscribe((data) => {
      this.modulesList = data;
    });
  }

  dateFormatChange(date: String) {
    date = date.substring(0, 10);
    return date.split('-').reverse().join('/');
  }

  fetchDataFromPagination() {
    if (this.fromDateFilter && this.toDateFilter) {
      this.applyDateFilter();
    } else {
      this.getNotificationDetails(
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
}
