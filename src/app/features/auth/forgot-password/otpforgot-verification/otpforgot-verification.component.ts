import { Component, OnInit, Inject, ViewChildren, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AuthService } from '../../auth.service';
import { encryptText } from 'src/app/shared/shareService/storageData';

@Component({
  selector: 'app-otpforgot-verification',
  templateUrl: './otpforgot-verification.component.html',
  styleUrls: ['./otpforgot-verification.component.css'],
  providers: [TranslatePipe]
})
export class OtpforgotVerificationComponent implements OnInit {
  onClosed = new EventEmitter();
  isLoadingSpinner: boolean = false;
  showError = '';
  form: FormGroup;
  timerInterval: number = 0;
  display: string = '';
  displayCount: boolean = true;
  showResend: boolean = false;
  enteredOtpLength: number = 0;
  formInput: string[] = [
    'input1',
    'input2',
    'input3',
    'input4',
    'input5',
    'input6',
  ];
  @ViewChildren('formRow') rows: any;
  constructor(public authService: AuthService, private route: Router, private dialog: MatDialog, private translatePipe: TranslatePipe,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string;
      currentComponent: string;
      otp: string;
      ownerMobileNo: string;
      userId: string;
      name: string;
      animalId?: string;
      flag: boolean,
      mobileNumber: number
    },
    private dialogRef: MatDialogRef<OtpforgotVerificationComponent>,
    matDialog: MatDialog
  ) {
    this.form = this.toFormGroup(this.formInput);
  }

  ngOnInit(): void {
    console.log(this.data)
    this.startTimer();
    // this.generateOtp(this.data.userId);
  }
  toFormGroup(elements: string[]) {
    const group: any = {};
    elements.forEach((key) => {
      group[key] = new FormControl('', Validators.required);
    });
    return new FormGroup(group);
  }
  startTimer() {
    if (this.showResend) {
      this.enteredOtpLength = 0;
      this.generateOtp();
      this.form.reset({
        input1: '',
        input2: '',
        input3: '',
        input4: '',
        input5: '',
        input6: '',
      });
    }
    this.displayCount = true;
    this.timer(2);
    this.showResend = false;
  }
  timer(minute: number) {
    // let minute = 1;
    let seconds: number = minute * 60;
    let textSec: any = '0';
    let statSec: number = 60;
    const prefix = minute < 10 ? '0' : '';
    this.timerInterval = window.setInterval(() => {
      seconds--;
      if (statSec != 0) statSec--;
      else statSec = 59;
      if (statSec < 10) {
        textSec = '0' + statSec;
      } else textSec = statSec;
      this.display = `${prefix}${Math.floor(seconds / 60)}:${textSec}`;
      if (seconds == 0) {
        this.displayCount = false;
        this.showResend = true;
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  keyUpEvent(event: KeyboardEvent, index: number) {
    let pos = index;
    if (event.keyCode === 8 && event.which === 8) {
      pos = index - 1;
    } else {
      pos = index + 1;
    }
    if (pos > -1 && pos < this.formInput.length) {
      this.rows._results[pos].nativeElement.focus();
    }
  }

  skipVerification() {
    // this.ownerDS.setOwnerVerifiedFlag(false);
    // this.ownerDS.setOwnerRegFlag(true);
    this.route.navigateByUrl(this.data.header);
    this.dialogRef.close();
  }
  generateOtp() {
    let forgot = {
      "loginId": this.data.userId,
    }
    this.isLoadingSpinner = true;
    if (this.data.userId) {
      this.authService
        .forgotPassword(forgot)
        .subscribe(
          (data) => {
            this.isLoadingSpinner = false;
          },
          (error) => {
            this.isLoadingSpinner = false;
          }
        );
    } else {
      this.authService.forgotPassword(forgot).subscribe(
        (data) => {
          this.isLoadingSpinner = false;
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    }
  }
  checkLength() {
    const formObjs = this.form.value;
    var enteredOTP = Object.values(formObjs).join('');
    this.enteredOtpLength = enteredOTP.replace(/\s/g, '').length;
    !isNaN(+enteredOTP)
      ? (this.showError = '')
      : (this.showError = this.translatePipe.transform('common.incorrect_otp'));
  }
  backToParent() {
    this.onClosed.emit();
  }

  onVerifyContinue() {
    if (this.data['data'].flag) {
      this.isLoadingSpinner = true;
      const formObj = this.form.value;
      var enteredOTP = Object.values(formObj).join('');
      this.authService.MobileverifyOtp(enteredOTP,
        this.data.userId ? this.data.userId : undefined,
        this.data.mobileNumber ? encryptText(atob(this.data['mobileNumber'].toString())) : undefined
      ).subscribe(
        (res: any) => {
          this.isLoadingSpinner = false;
          if (res.isVerified) {
            this.dialog.open(ConfirmationDialogComponent, {
              data: {
                title: 'Info',
                icon: 'assets/images/info.svg',
                message: res.message,
                primaryBtnText: 'Ok',
              },
              panelClass: 'common-info-dialog',
            });
            this.backToParent();
            this.route.navigateByUrl(this.data.header);
            this.dialogRef.close();
          } else {
            this.dialog.open(ConfirmationDialogComponent, {
              data: {
                title: 'Info',
                icon: 'assets/images/info.svg',
                message: res.data.message,
                primaryBtnText: 'Ok',
              },
              panelClass: 'common-info-dialog',
            });
          }
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );

    } else {
      if (!this.showError) {
        this.isLoadingSpinner = true;
        const formObj = this.form.value;
        var mobileNumberFlag = false;
        if (this.data?.name) {
          if (this.data.name == 'updateMobileNumber') {
            mobileNumberFlag = true;
          }
        }
        var enteredOTP = Object.values(formObj).join('');
        this.authService.verifyOtp(
          enteredOTP,
          this.data.userId ? this.data.userId : undefined,
          mobileNumberFlag ? this.data?.ownerMobileNo : undefined
        )
          .subscribe(
            (res: any) => {
              sessionStorage.setItem('token',res.token)
              this.isLoadingSpinner = false;
              if (res.isVerified) {
                //  this.ownerDS.setOwnerRegFlag(true);
                this.dialog.open(ConfirmationDialogComponent, {
                  data: {
                    title: 'Info',
                    icon: 'assets/images/info.svg',
                    message: res.message,
                    primaryBtnText: 'Ok',
                  },
                  panelClass: 'common-info-dialog',
                });
                this.route.navigateByUrl('/auth/changePassword');
                sessionStorage.setItem('LoginID', this.data.userId);
                // this.backToParent();
                // this.route.navigateByUrl(this.data.header);
                this.dialogRef.close();
              } else {
                this.dialog.open(ConfirmationDialogComponent, {
                  data: {
                    title: 'Info',
                    icon: 'assets/images/info.svg',
                    message: res.data.message,
                    primaryBtnText: 'Ok',
                  },
                  panelClass: 'common-info-dialog',
                });
              }
            },
            (error) => {
              this.isLoadingSpinner = false;
            }
          );
      }
    }
  }

}
