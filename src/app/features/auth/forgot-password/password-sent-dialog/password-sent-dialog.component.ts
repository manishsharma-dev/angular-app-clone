import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { OtpforgotVerificationComponent } from '../otpforgot-verification/otpforgot-verification.component';

@Component({
  selector: 'app-password-sent-dialog',
  templateUrl: './password-sent-dialog.component.html',
  styleUrls: ['./password-sent-dialog.component.css']
})
export class PasswordSentDialogComponent implements OnInit {
  onClosed = new EventEmitter();
  mob: any;
  constructor(public dialog: MatDialog, private route: Router,
    private dialogRef: MatDialogRef<PasswordSentDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      isDisplayIcon?: boolean;
      userId: string;
      title: string;
      mobileNumber: any;
    }) {

  }

  ngOnInit(): void {
    let mob = atob(this.data.mobileNumber);
    this.mob = "******" + mob.slice(6);
    // this.mob = atob(this.data.mobileNumber);
  }

  openVerificationDialog() {
    const dialogRef = this.dialog.open(OtpforgotVerificationComponent, {
      disableClose: true,
      data: {
        userId: this.data.userId,
        mobileNumber:this.data.mobileNumber,
        data: this.data

      },

      width: '500px',
    });
    dialogRef.afterClosed().subscribe((res) => {
      this.onClosed.emit();
    });

    // this.genrateOtp(this.data.ownerId);
  }
  skipVerification() {
    // this.route.navigateByUrl();
    this.dialogRef.close();
  }

}
