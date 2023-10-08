import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { index } from 'd3';
import { AccessManagementService } from '../access-management.service';

@Component({
  selector: 'app-access-privilege-details',
  templateUrl: './access-privilege-details.component.html',
  styleUrls: ['./access-privilege-details.component.css'],
})
export class AccessPrivilegeDetailsComponent implements OnInit {
  public isLoadingSpinner:boolean=false;
  public role:any[]=[];
  constructor(public dialogRef: MatDialogRef<AccessPrivilegeDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private rollSrv:AccessManagementService) {}

  ngOnInit(): void {
    this.isLoadingSpinner=true
   if(this.data.index){
    this.dialogRef.updateSize('700px');
    this.rollSrv.getRoleDetails(this.data.index).subscribe((response)=>{
          this.role = response;
      this.isLoadingSpinner=false
    })
   }
    
  }

  deleteData(val): void {
   this.data.action;
  }
}
