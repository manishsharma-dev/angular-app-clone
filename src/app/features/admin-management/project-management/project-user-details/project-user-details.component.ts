import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { UserAllocate } from '../models/user-allocate.model';
import { AllocConfirmationComponent } from './alloc-confirmation/alloc-confirmation.component';
import { DatePickerPopupComponent } from './date-picker-popup/date-picker-popup.component';

@Component({
  selector: 'app-project-user-details',
  templateUrl: './project-user-details.component.html',
  styleUrls: ['./project-user-details.component.css'],
})
export class ProjectUserDetailsComponent implements OnInit {
  expanded = false;
  showForm = false;
  projects = [];
  displayedColumns = [
    'SN No.',
    'userID',
    'userName',
    'userType',
    'role',
    'organization',
    'startDate',
    'endDate',
    'status',
  ];

  dataSource: UserAllocate[] = [
    {userID:456765, userName: 'Rajeev Kumar Gupta', 
    userType: 'Employee',role:"AI Technician",organization:"Karnataka Co-op Milk Producers Federation Ltd.",baseLocation:"Alur, Karnataka",startDate:"14/08/2001", 
    endDate:"31/08/2001",status:"Allocated"},
    {userID:456765, userName: 'Rajeev Kumar Gupta', 
    userType: 'Employee',role:"AI Technician",organization:"Karnataka Co-op Milk Producers Federation Ltd.",baseLocation:"Alur, Karnataka",startDate:"14/08/2001", 
    endDate:"31/08/2001",status:"Allocated"},
    {userID:456765, userName: 'Rajeev Kumar Gupta', 
    userType: 'Employee',role:"AI Technician",organization:"Karnataka Co-op Milk Producers Federation Ltd.",baseLocation:"Alur, Karnataka",startDate:"14/08/2001", 
    endDate:"31/08/2001",status:"Allocated"},
    {userID:456765, userName: 'Rajeev Kumar Gupta', 
    userType: 'Employee',role:"AI Technician",organization:"Karnataka Co-op Milk Producers Federation Ltd.",baseLocation:"Alur, Karnataka",startDate:"14/08/2001", 
    endDate:"31/08/2001",status:"Allocated"},
    {userID:456765, userName: 'Rajeev Kumar Gupta', 
    userType: 'Employee',role:"AI Technician",organization:"Karnataka Co-op Milk Producers Federation Ltd.",baseLocation:"Alur, Karnataka",startDate:"14/08/2001", 
    endDate:"31/08/2001",status:"Allocated"},
    {userID:456765, userName: 'Rajeev Kumar Gupta', 
    userType: 'Employee',role:"AI Technician",organization:"Karnataka Co-op Milk Producers Federation Ltd.",baseLocation:"Alur, Karnataka",startDate:"14/08/2001", 
    endDate:"31/08/2001",status:"Allocated"},
    {userID:456765, userName: 'Rajeev Kumar Gupta', 
    userType: 'Employee',role:"AI Technician",organization:"Karnataka Co-op Milk Producers Federation Ltd.",baseLocation:"Alur, Karnataka",startDate:"14/08/2001", 
    endDate:"31/08/2001",status:"Allocated"}
 ];
 @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {}

  onExpanded() {
    this.expanded = !this.expanded;
  }

  onShowForm() {
    this.showForm = true;
  }

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
  }

  onSubmit(form: NgForm) {
    const { projectName, role, startDate, endDate } = form.value;

    this.dialog
      .open(AllocConfirmationComponent, {
        data: {
          name: projectName,
          role,
          startDate,
          endDate,
        },
      })
      .afterClosed()
      .subscribe({
        next: (data) => {
          this.projects.push(form.value);
          form.reset();
          
          this.showForm = false;
          console.log(this.projects);
        },
      });
  }

  onDeallocate() {
    this.dialog.open(DatePickerPopupComponent);
  }
}
