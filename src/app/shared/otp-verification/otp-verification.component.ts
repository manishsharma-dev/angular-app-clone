import { NumericValidation } from './../utility/validation';
import { TranslatePipe } from '@ngx-translate/core';
import { OwnerDetailsService } from '../../features/animal-management/owner-registration/owner-details.service';
import {
  Component,
  EventEmitter,
  Inject,
  OnInit,
  ViewChildren,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SnackBarMessage } from '../snack-bar';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { encryptText } from 'src/app/shared/shareService/storageData';
@Component({
  selector: 'app-registration-verification',
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.css'],
  providers: [TranslatePipe],
})
export class OtpVerificationComponent implements OnInit {
  onClosed = new EventEmitter();
  timerInterval: number = 0;
  display: string = '';
  displayCount: boolean = true;
  showResend: boolean = false;
  isLoadingSpinner: boolean = false;
  form: FormGroup;
  enteredOtpLength: number = 0;
  showError = '';
  formInput: string[] = [
    'input1',
    'input2',
    'input3',
    'input4',
    'input5',
    'input6',
  ];
  @ViewChildren('formRow') rows: any;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string;
      currentComponent: string;
      otp: string;
      ownerMobileNo: string;
      ownerId: string;
      name: string;
      animalId?: string;
    },
    private dialogRef: MatDialogRef<OtpVerificationComponent>,
    private route: Router,
    private _snackBar: MatSnackBar,
    private ownerDS: OwnerDetailsService,
    private translatePipe: TranslatePipe,
    private dialog: MatDialog
  ) {
    this.form = this.toFormGroup(this.formInput);
  }

  ngOnInit(): void {
    this.startTimer();
    this.generateOtp(this.data.ownerId);
  }

  backToParent() {
    this.onClosed.emit();
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
      this.generateOtp(this.data.ownerId);
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
    let entKey = (event.target as HTMLInputElement).value;
    if (event.keyCode === 8 && event.which === 8) {
      pos = index - 1;
    } else {
      if (entKey) {
        pos = index + 1;
      }
    }
    if (pos > -1 && pos < this.formInput.length) {
      this.rows._results[pos].nativeElement.focus();
    }
  }

  skipVerification() {
    this.ownerDS.setOwnerVerifiedFlag(false);
    this.ownerDS.setOwnerRegFlag(true);
    this.route.navigateByUrl(this.data.header);
    this.dialogRef.close();
  }

  generateOtp(ownerId: string) {
    const encryptedMobNo = encryptText(this.data.ownerMobileNo);
    this.isLoadingSpinner = true;
    if (this.data.animalId) {
      this.ownerDS
        .initiateOtp(this.data.animalId, encryptedMobNo, 'animal')
        .subscribe(
          (data: any) => {
            this.dialog.open(ConfirmationDialogComponent, {
              data: {
                title: this.translatePipe.transform('common.info_label'),
                icon: 'assets/images/info.svg',
                message: data?.message,
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
              },
              panelClass: 'common-info-dialog',
            });
            if (!data?.isOtpInitiated) {
              this.skipVerification();
            }
            this.isLoadingSpinner = false;
          },
          (error) => {
            this.isLoadingSpinner = false;
          }
        );
    } else {
      this.ownerDS.initiateOtp(ownerId, encryptedMobNo).subscribe(
        (data: any) => {
          this.dialog.open(ConfirmationDialogComponent, {
            data: {
              title: this.translatePipe.transform('common.info_label'),
              icon: 'assets/images/info.svg',
              message: data?.message,
              primaryBtnText: this.translatePipe.transform('common.ok_string'),
            },
            panelClass: 'common-info-dialog',
          });
          if (!data?.isOtpInitiated) {
            this.skipVerification();
          }
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

  onVerifyContinue() {
    const encryptedMobNo = encryptText(this.data.ownerMobileNo);
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
      this.ownerDS
        .verifyOtp(
          enteredOTP,
          this.data.ownerId ? this.data.ownerId : undefined,
          mobileNumberFlag ? encryptedMobNo : undefined,
          undefined,
          this.data.animalId ? this.data.animalId : undefined
        )
        .subscribe(
          (res) => {
            // console.log('verify res', res)
            this.isLoadingSpinner = false;
            if (res.isVerified) {
              this.ownerDS.setOwnerRegFlag(true);
              this.dialog.open(ConfirmationDialogComponent, {
                data: {
                  title: this.translatePipe.transform('common.info_label'),
                  icon: 'assets/images/info.svg',
                  message: this.translatePipe.transform('common.otp_success'),
                  primaryBtnText:
                    this.translatePipe.transform('common.ok_string'),
                },
                panelClass: 'common-info-dialog',
              });
              this.backToParent();
              this.route.navigateByUrl(this.data.header);
              this.dialogRef.close();
            } else {
              this.dialog.open(ConfirmationDialogComponent, {
                data: {
                  title: this.translatePipe.transform('common.info_label'),
                  icon: 'assets/images/info.svg',
                  message: res.message,
                  primaryBtnText:
                    this.translatePipe.transform('common.ok_string'),
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
