import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserRollService } from '../user-roll.service';
import { map } from 'rxjs/operators';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { UserManagementService } from '../user-management.service';
import moment from 'moment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-area-allocation-form-dialog',
  templateUrl: './area-allocation-form-dialog.component.html',
  styleUrls: ['./area-allocation-form-dialog.component.css'],
})
export class AreaAllocationFormDialogComponent implements OnInit {

  //people: Person[] = [];
  roll: any = [];
  roleList;
  userDetails;
  selectedRoll: any = [];
  selectedRollList:any[]=[];
  roles:any=[];
  constructor(private userRollService: UserRollService,
    private _formBuilder: FormBuilder,
    public router: Router,
    private dialog: MatDialog,
    private userService: UserManagementService,
    public dialogRef: MatDialogRef<AreaAllocationFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    // if( this.data.list && this.data.list.length>0 ){
    //   let idList:any[]=[];
    //   this.data.list.forEach(element => {
    //     idList.push(element.id)
    //   });
    //   this.selectedRoll=idList;
    //   this.getLabelName();
    // }
   
  }

  professionalInfoForm = this._formBuilder.group({
    userRoleAllocations: this._formBuilder.array([])
  })

  get userRoles() {
    return this.professionalInfoForm.get("userRoleAllocations") as FormArray;
  }

  addUserRoles() {
    this.userRoles.push(this.createUserRoleAllocations());
  }

  onRemoveRole(rowIndex: number) {
    this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Alert',
        message: 'Are you sure you want to delete ?',
        primaryBtnText: 'Ok',
        secondaryBtnText: 'Cancel',
      },
    })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.userRoles.removeAt(rowIndex);
        }
      });
  }

  createUserRoleAllocations() {
    return this._formBuilder.group({
      roleCd: [],
      userAllocationEndDate: [],
      userAllocationStartDate: [],
    });
  }

  ngOnInit(): void {
    this.dialogRef.updateSize('600px');
    this.userRollService.getRoll()
      .pipe(map(x => x.filter(y => !y.disabled)))
      .subscribe((res) => {
        this.roll = res;
        // this.selectedRoll = [
        //   this.roll.id, this.roll[1].id
        //];
        console.log(this.roll, "roll::::::::::::::::");
      });
      this.addUserRoles();
      this.getRoleList();
      
    // this.userRollService.selectedRoll.push(this.selectedRoll);
  }

  get professionalInfo() {
    return this.professionalInfoForm.controls;
  }

  getRoleList = () => {
    this.userService.getRoleList().subscribe((res) => {
      this.roleList = res;
    })
  }

  onRollData() {
    // const newJSON = sessionStorage.getItem("data")
    // this.userDetails = JSON.parse(newJSON);
    let roleAssign = this.professionalInfo.userRoleAllocations.value;
        for (let role of roleAssign){
          role.userAllocationStartDate = moment(role.userAllocationStartDate).format('YYYY/MM/DD');
          role.userAllocationEndDate = moment(role.userAllocationEndDate).format('YYYY/MM/DD');
        }
        roleAssign.forEach(element => {
          element.userId = sessionStorage.getItem("data");
        });
        this.userService.assignRoleUser(roleAssign).subscribe((response)=>{
          if(response){
            this.confirmPopup();
          }
        });
      
       
        
    // let data;
    //this.userRollService.setRollDetails(this.roll);
    // console.log('ssssss', this.selectedRoll);
    // this.selectedRoll.forEach(element => {
    //    data= this.roll.filter(obj => {
    //     return obj.id === element
    //   })
    //   this.roles.push(...data);
    //   this.userRollService.setRollDetails(this.roles);
    // });
    
    

    // console.log(this.roles,"sssssssssssss::::");
    // console.log(this.userRollService.selectedRoll,"rollsubmitted::::::::")
  }

  confirmPopup(){
    this.dialog
    .open(ConfirmationDialogComponent, {
      data: {
        title: 'Role Successfully Added',
        message: 'Role details saved',
        primaryBtnText: 'ok',
        secondaryBtnText: 'cancel',
      },
    })
    .afterClosed()
    .subscribe((result) => {
     
      if (result) {
        // this.userService.getDetailsByUserID(result.userId).subscribe((response)=>{
          // sessionStorage.getItem("data");
          this.router.navigate(['dashboard/user-management/user-details']);
        // })
      }
    });
  }

  getLabelName(){
    let list:any[]=[];
    this.selectedRollList=[];
    this.selectedRoll.forEach(element => {
      let index=this.roll.findIndex(x=>x.id==element);
      if(index>-1){
        list.push(this.roll[index]);
      }
    });
    this.selectedRollList=list;
    console.log("selectedRollList=>",this.selectedRollList)
  }
}
