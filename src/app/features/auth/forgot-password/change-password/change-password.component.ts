import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  EventEmitter,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { compareValidator } from '.././password.validator';
import {
  AlphaNumericValidation,
  PasswordValidation,
} from 'src/app/shared/utility/validation';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { AuthService } from '../../auth.service';
import { SnackBarMessage } from 'src/app/shared/snack-bar';
import { encryptText } from 'src/app/shared/shareService/storageData';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent implements OnInit {
  public isLoadingSpinner = false;
  public hide: boolean = true;
  public cphide: boolean = true;
  forgotForm: FormGroup = new FormGroup({});
  public maxDate =sessionStorage.getItem('serverCurrentDateTime');
  public userDob;
  onClosed = new EventEmitter();
  userIDInput: string;

  constructor(
    public dialog: MatDialog,
    public authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.forgotForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, PasswordValidation]],
      reEnterPassword: [
        '',
        [Validators.required, compareValidator('newPassword')],
      ],
    });
  }

  get f() {
    return this.forgotForm.controls;
  }

  onForgot() {
    let loginId = sessionStorage.getItem('LoginID');
    let token = sessionStorage.getItem('token');
    if (this.forgotForm.invalid) {
      return;
    }
    let payload = {
      value: encryptText(this.forgotForm.get('reEnterPassword').value),
      //"value":(this.forgotForm.get('reEnterPassword').value),
      loginId: loginId,
    };
    this.isLoadingSpinner = true;
    this.authService.changeforgotPassword(payload).subscribe(
      (res: any) => {
        this.isLoadingSpinner = false;
        //new SnackBarMessage(this._snackBar).onSucessMessage(res.responce, 'Ok', 'right', 'top', 'green-snackbar');
        this.router.navigate(['./auth/login']);

        this.forgotForm.reset();
        // this.authService.logout();
      },
      (error) => {
        this.isLoadingSpinner = false;
        // new SnackBarMessage(this._snackBar).onSucessMessage(error.message, 'Ok', 'right', 'top', 'green-snackbar');
      }
    );
  }
}
