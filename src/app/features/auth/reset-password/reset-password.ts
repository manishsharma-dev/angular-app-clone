import { Component, OnInit, OnDestroy, ViewEncapsulation, Inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../auth.service";
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { SnackBarMessage } from "src/app/shared/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { compareValidator } from "./password.validator";
import { AlphaNumericValidation, PasswordValidation } from "src/app/shared/utility/validation";
import { encryptText } from "src/app/shared/shareService/storageData";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  templateUrl: "./reset-password.html",
  styleUrls: ["./reset-password.css"],
  encapsulation: ViewEncapsulation.None,
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  isLoadingSpinner = false;
  resetform: FormGroup = new FormGroup({});
  public hide: boolean = true;
  public cphide: boolean = true;
  public getResetFlag = JSON.parse(sessionStorage.getItem('user'))?.passwordResetFlag;


  constructor(public authService: AuthService, private router: Router, private formBuilder: FormBuilder, private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: {
      id: number;
      title: string;
      message: string;
      icon: string;
      statusData: number;
      primaryBtnText: string;
      secondaryBtnText: string;
      colour: string

    },) {
  }

  ngOnInit() {
    this.resetform = this.formBuilder.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, PasswordValidation]],
      confirmNewPassword: ['', [Validators.required, compareValidator('newPassword')]]
    });


  }

  onResetPassword() {
    if (this.resetform.invalid) {
      return;
    }
    let payload = {
      "oldPassword": encryptText(this.resetform.get('oldPassword').value),
      // "oldPassword":encryptText(this.resetform.get('oldPassword').value),
      "newPassword": encryptText(this.resetform.get('newPassword').value),
      "confirmNewPassword": encryptText(this.resetform.get('confirmNewPassword').value)
    }

    this.isLoadingSpinner = true;

    this.authService.reset(payload).subscribe((data) => {
      new SnackBarMessage(this._snackBar).onSucessMessage('Password reset Successfully', 'Ok', 'right', 'top', 'green-snackbar');
      //this.router.navigate(['./auth/login']);
      this.isLoadingSpinner = false;
      this.resetform.reset();
      this.authService.logout();
    }
      , error => {
        this.isLoadingSpinner = false;
        // new SnackBarMessage(this._snackBar).onSucessMessage(error.message, 'Ok', 'right', 'top', 'green-snackbar');
      })
  }

  ngOnDestroy() {

  }
}
