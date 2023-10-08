import {
  Component,
  Inject,
  OnInit,
  EventEmitter,
  ViewChildren,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import fileSaver from 'file-saver';
import { take } from 'rxjs/operators';
import { TransferDetail } from '../models-owner-reg/ownership-transfer-response';
import { OwnerDetailsService } from '../owner-details.service';
import { OwnerTransferService } from '../owner-transfer/owner-transfer.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

interface ConfirmationRes {
  transferId: number;
  transferStatus: string;
  isTransferred: boolean;
  newOwnerId: string;
  newOwnerName: string;
  newOwnerMobileNo: string;
  oldOwnerId: string;
}

@Component({
  selector: 'app-owner-transfer-dialog',
  templateUrl: './owner-transfer-dialog.component.html',
  styleUrls: ['./owner-transfer-dialog.component.css'],
  providers: [TranslatePipe],
})
export class OwnerTransferDialogComponent implements OnInit {
  onClosed = new EventEmitter();
  transferIdList: Number[] = [];
  isLoadingSpinner: boolean = false;
  showResend: boolean = false;
  enteredOtpLength: number = 0;
  form: FormGroup;
  isOtpVerified = false;
  transferInitiationRes: TransferDetail[] = [];
  newOwnerMobNo = '';
  formInput: string[] = [
    'input1',
    'input2',
    'input3',
    'input4',
    'input5',
    'input6',
  ];
  displayCount: boolean = true;
  transferId = 0;
  timerInterval: number = 0;
  display: string = '';
  showError = '';
  @ViewChildren('formRow') rows: any;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      isReverify?: boolean;
      noOfAnimals?: string;
      currentOwner?: string;
      animalIds: [];
      newOwner?: any;
      otpSentTo: string;
      newOwnerId: string;
      ownerTransferDetails?: TransferDetail[];
      isClaimOwnership?: boolean;
    },
    private dialogRef: MatDialogRef<OwnerTransferDialogComponent>,
    private ownerDS: OwnerDetailsService,
    private ownerTS: OwnerTransferService,
    private translatePipe: TranslatePipe,
    private dialog: MatDialog
  ) {
    this.form = this.toFormGroup(this.formInput);
  }

  ngOnInit(): void {
    console.log('this.data', this.data);
    if (this.data.isReverify) {
      this.initiateTransferAndOTP();
    }
    this.startTimer();
    if (this.data.ownerTransferDetails) {
      for (let element of this.data.ownerTransferDetails) {
        if (this.transferIdList.indexOf(element.transferId) === -1) {
          this.transferIdList.push(element.transferId);
        }
      }
    }
  }

  initiateTransferAndOTP() {
    this.isLoadingSpinner = true;
    const initiationPayload = { animalIds: this.data.animalIds };
    this.ownerTS.ownershipTransferInitiation(initiationPayload, true).subscribe(
      (res: TransferDetail[]) => {
        if (this.data.isReverify) {
          for (let element of res) {
            if (this.transferIdList.indexOf(element.transferId) === -1) {
              this.transferIdList.push(element.transferId);
            }
          }
        }
        this.isLoadingSpinner = false;
        this.transferInitiationRes = res;
        this.newOwnerMobNo =
          String(this.transferInitiationRes[0].newOwnerMobileNo) || '';
        console.log(res);
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  toFormGroup(elements: string[]) {
    const group: any = {};
    elements.forEach((key) => {
      group[key] = new FormControl('', Validators.required);
    });
    return new FormGroup(group);
  }

  closeDialog() {
    this.onClosed.emit();
    this.dialogRef.close();
  }

  downloadTransferDetails() {
    // this.isLoadingSpinner = true;
    const payload = { transerIdList: this.transferIdList };
    this.ownerDS
      .downloadPdfSrv(payload)
      .pipe(take(1))
      .subscribe((response: any) => {
        let blob: any = new Blob([response]);
        const url = window.URL.createObjectURL(blob);
        fileSaver.saveAs(blob, 'OwnerTransferDetails.pdf');
      }),
      (error: any) => {},
      () => console.info('File downloaded successfully');
  }

  ///
  startTimer() {
    if (this.showResend) {
      this.initiateTransferAndOTP();
      this.enteredOtpLength = 0;
      // this.generateOtp(this.data.ownerId);
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
    // this.route.navigateByUrl(this.data.header);
    this.dialogRef.close();
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
    this.isLoadingSpinner = true;
    const formObj = this.form.value;
    var enteredOTP = Object.values(formObj).join('');
    const payload = {
      animalIds: this.data.animalIds,
      otp: enteredOTP,
      newOwnerId: this.data.newOwnerId,
    };
    if (this.data.isClaimOwnership) {
      this.ownerTS.takeOwnership(payload).subscribe(
        (returnedData: any) => {
          this.isLoadingSpinner = false;
          this.transferIdList = [];
          for (let element of returnedData) {
            if (this.transferIdList.indexOf(element.transferId) === -1) {
              this.transferIdList.push(element.transferId);
            }
          }
          console.log(returnedData, returnedData[0].isAnimalAllocated);
          this.dialog.open(ConfirmationDialogComponent, {
            data: {
              title: this.translatePipe.transform('common.info_label'),
              icon: 'assets/images/info.svg',
              message: returnedData[0].ownershipStatus,
              primaryBtnText: this.translatePipe.transform('common.ok_string'),
            },
            panelClass: 'common-info-dialog',
          });
          if (returnedData[0].isAnimalAllocated) {
            this.isOtpVerified = true;
            // this.closeDialog();
          } else {
            this.isOtpVerified = false;
          }
          // this.tableDataSource.data.length = 0;
          // this.searchTagIdForm.get('searchTagIdValue').setValue('');
        },
        (error: any) => {
          this.isLoadingSpinner = false;
        }
      );
    } else {
      this.ownerTS.ownershipTransferConfirmation(payload).subscribe(
        (res: ConfirmationRes) => {
          this.isLoadingSpinner = false;
          this.dialog.open(ConfirmationDialogComponent, {
            data: {
              title: this.translatePipe.transform('common.info_label'),
              icon: 'assets/images/info.svg',
              message: res.transferStatus,
              primaryBtnText: this.translatePipe.transform('common.ok_string'),
            },
            panelClass: 'common-info-dialog',
          });
          if (res.isTransferred) {
            this.isOtpVerified = true;
            this.transferId = res.transferId;
            // this.closeDialog();
          } else {
            this.isOtpVerified = false;
          }
        },
        (error: any) => {
          this.isLoadingSpinner = false;
        }
      );

      console.log(this.data.animalIds);
    }
  }
}
