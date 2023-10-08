import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
  OnDestroy,
} from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AreaAllocationFormDialogComponent } from '../area-allocation-form-dialog/area-allocation-form-dialog.component';
import { UserRollService } from '../user-roll.service';
import { UserManagementService } from '../user-management.service';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { MasterConfig } from 'src/app/shared/master.config';
import { UserAllocDeallocComponent } from '../user-alloc-dealloc/user-alloc-dealloc.component';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
  // encapsulation: ViewEncapsulation.None
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  public isLoadingSpinner: boolean = true;
  public visible: boolean = true;
  public selectable: boolean = true;
  public removable: boolean = true;
  public selectedRollList: any[] = [];
  public userDetails: any;
  public fullName: string = '';
  public profileImg = '';
  public masterConfig = MasterConfig;
  dialogConfig = new MatDialogConfig();
  // addOnBlur: boolean = false;
  public isProfile: any = 'false';
  private refreshSubscription: Subscription;
  separatorKeysCodes = [ENTER, COMMA];
  public isLivestackAdmin = JSON.parse(
    sessionStorage.getItem('isLivesatckAdmin')
  );
  public userOrgId = JSON.parse(sessionStorage.getItem('user')).orgId;

  constructor(
    public dialog: MatDialog,
    private userRollService: UserRollService,
    public userService: UserManagementService,
    private router: Router
  ) {
    // this.fruits;
    // const newJSON = sessionStorage.getItem("data")
    // this.userDetails = JSON.parse(newJSON);
    // this.userDetails = this.userService.getDetails();
    // console.log("detailsPage=>", this.userDetails);
    // this.fullName = this.userDetails.titleDesc+'.'+' '+ this.userDetails.firstName +' '+ this.userDetails.middleName +' '+ this.userDetails.lastName
    // this.fruits = this.userRollService.getRollDetails()
    // console.log(this.userRollService.getRollDetails(),"dddddddddddd:::")
  }

  onUserDetails() {
    // alert(userId)
    let data = sessionStorage.getItem('data');
    this.isLoadingSpinner = true;
    this.userService.getDetailsByUserID(data).subscribe(
      (response) => {
        this.userDetails = response;
        // console.log('userDetails::>>>', this.userDetails.defaultRole.roleDesc);
        if (this.userDetails) {
          // this.fullName = this.userDetails.titleDesc+'.'+' '+ this.userDetails.firstName  +' '+ this.userDetails.middleName +' '+ this.userDetails.lastName;
          let firstName =
            this.userDetails.firstName != null &&
            this.userDetails.firstName != 'null'
              ? this.userDetails.firstName
              : '';
          let middleName =
            this.userDetails.middleName != null &&
            this.userDetails.middleName != 'null'
              ? this.userDetails.middleName
              : '';
          let lastName =
            this.userDetails.lastName != null &&
            this.userDetails.lastName != 'null'
              ? this.userDetails.lastName
              : '';

          this.fullName =
            this.userDetails.titleDesc +
            '.' +
            ' ' +
            firstName +
            ' ' +
            middleName +
            ' ' +
            lastName;
          this.profileImg = this.userDetails.userPhotoUrl;

          this.isLoadingSpinner = false;
        }

        // console.log("profileimg",this.profileImg)
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  @ViewChild('fruitInput') fruitInput: ElementRef;

  ngOnInit(): void {
    this.onUserDetails();
    this.refreshSubscription = this.userService.userUpdateList.subscribe(
      (response) => {
        this.isProfile = sessionStorage.getItem('isProfile');
        //this.router.navigate(['dashboard/user-management/user-details']);
        this.onUserDetails();
      }
    );
  }

  projectAllocation() {
    let userId = this.userDetails.userId;
    console.log('userId is >>>>>', userId);
    this.dialogConfig.position = {
      right: '0',
    };
    this.dialogConfig.width = '50%';
    this.dialogConfig.height = '100vh';
    this.dialogConfig.panelClass = 'custom-dialog-container';
    this.dialogConfig.data = { userID: userId, isuserDetails: true };

    this.dialog.open(UserAllocDeallocComponent, this.dialogConfig);
  }

  onEditUser(data) {
    if (!data) {
      return;
    }
    sessionStorage.getItem('data');
    this.router.navigate(['/dashboard/user-management/add-new-user']);
    // console.log(data,"eduttt::::::")
  }

  openDialog() {
    const dialogRef = this.dialog.open(AreaAllocationFormDialogComponent);
    // this.isLoadingSpinner =true;
    dialogRef.afterClosed().subscribe((result) => {
      // console.log('The dialog was closed',result);
      this.onUserDetails();
      if (result && result.length > 0) {
        // this.isLoadingSpinner =false;
        // this.selectedRollList=result
      }

      // this.animal = result;
    });
  }

  // remove(fruit: any): void {
  //   const index = this.selectedRollList.indexOf(fruit);
  //   if (index >= 0) {
  //     this.selectedRollList.splice(index, 1);
  //   }
  //   console.log("selectedRollList==>",this.selectedRollList);
  // }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
}
