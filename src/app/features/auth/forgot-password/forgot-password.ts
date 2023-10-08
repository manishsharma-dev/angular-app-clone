import { Component, OnInit, OnDestroy, Inject, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from "@angular/router";

import { AuthService } from "../auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { compareValidator } from "../reset-password/password.validator";
import moment from "moment";
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { OtpVerificationComponent } from "src/app/shared/otp-verification/otp-verification.component";
import { PasswordSentDialogComponent } from "./password-sent-dialog/password-sent-dialog.component";
import { SnackBarMessage } from "src/app/shared/snack-bar";
import { ForgotPsd } from "./forgot-interface";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";




@Component({
  templateUrl: "./forgot-password.html",
  styleUrls: ["./forgot-password.css"]
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  public isLoadingSpinner = false;
  forgotForm: FormGroup = new FormGroup({});
  public maxDate = new Date(sessionStorage.getItem('serverCurrentDateTime'));
  public userDob;
  onClosed = new EventEmitter();
  userIDInput : string;
  Successmessage: ForgotPsd[] = [];
  mobileNumber:ForgotPsd[] = [];
  constructor(    public dialog: MatDialog,
    public authService: AuthService, private router: Router,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.ageCalculate();
 
      this.forgotForm = this.formBuilder.group({
        userId: ['',[Validators.required]],
       // dob: [{ value:  moment(this.today).format('DD/MM/YYYY') }, [Validators.required]],
      });
  
    
    this.forgotForm.updateValueAndValidity();

    
  }

  ageCalculate() {
    let year = this.maxDate.getFullYear() - 18;
    let month = this.maxDate.getMonth() + 1;
    let day = this.maxDate.getDate();
    this.userDob = new Date(`${month}/${day}/${year}`)
  }
  get today() {
    return moment().format('YYYY-MM-DD');
  }

  get f() {
    return this.forgotForm.controls;
  }
  onForgot() {
    this.userIDInput = this.forgotForm.value.userId;
      let forgot = {
        
          "loginId": this.forgotForm.value.userId,
          // "dob": formattedDateFrom

      }
    if (this.forgotForm.invalid) {
      return;
    }
    this.isLoadingSpinner = true;
    this.authService.forgotPassword(forgot).subscribe((res: any) => {
      if(res.isOtpInitiated == true){
        this.Successmessage = res.message;
        this.mobileNumber = res.mobileNo;
        this.isLoadingSpinner = false;
       // new SnackBarMessage(this._snackBar).onSucessMessage('Password change Successfully', 'Ok', 'right', 'top', 'green-snackbar');
        this.forgotForm.reset();
        this.openPasswordSentDialog();
      }
      else{
        this.Successmessage = res.data.message;
        this.isLoadingSpinner = false;
        this.forgotForm.reset();
        this.openDialogError();
      }
     
     
    }
      , error => {
        this.isLoadingSpinner = false;
       // new SnackBarMessage(this._snackBar).onSucessMessage(error.message, 'Ok', 'right', 'top', 'green-snackbar');
      })
     
  }

  openDialogError() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        title:'Info',
        message: this.Successmessage,
        primaryBtnText: 'Ok',
        panelClass: 'custom-modalbox',
        errorFlag: true,
        icon: "assets/images/info.svg",
      },
      panelClass: 'common-info-dialog',
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((res) => { });
  }
  openPasswordSentDialog() {
    const dialogRef = this.dialog.open(PasswordSentDialogComponent, {
      disableClose: true,
      data: {
        title: this.Successmessage,
        //  header: this.data?.link,
        // currentComponent: this.data?.name,
        // otp: this.data?.otp,
        // ownerMobileNo: this.data?.ownerMobileNo,
        userId: this.userIDInput,
        mobileNumber: this.mobileNumber,
        // name: this.data?.name,
        // animalId: this.data.animalId || undefined,
      },
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((res) => {
      this.onClosed.emit();
    });
  }

  ngOnDestroy() {

  }


  numberNotAllow(evt: any) {
    var ASCIICode = (evt.which) ? evt.which : evt.keyCode
    if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
      return false;
    return true;
  }

}
