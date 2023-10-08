import { Router } from '@angular/router';
import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { OwnerDetailsService } from '../../features/animal-management/owner-registration/owner-details.service';
import { OtpVerificationComponent } from '../otp-verification/otp-verification.component';

@Component({
  selector: 'app-registration-dialog',
  templateUrl: './otp-dialog.component.html',
  styleUrls: ['./otp-dialog.component.css'],
})
export class OtpDialogComponent implements OnInit {
  onClosed = new EventEmitter();
  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      isDisplayIcon?: boolean;
      ownerId: string;
      header: string;
      heading: string;
      tagid: string;
      message: string;
      link: string;
      name: string;
      otp: string;
      animalId?: string;
      ownerMobileNo: string;
    },
    private ownerDS: OwnerDetailsService,
    private dialogRef: MatDialogRef<OtpDialogComponent>,
    private route: Router
  ) {}

  ngOnInit(): void {}

  openVerificationDialog() {
    const dialogRef = this.dialog.open(OtpVerificationComponent, {
      data: {
        header: this.data?.link,
        currentComponent: this.data?.name,
        otp: this.data?.otp,
        ownerMobileNo: this.data?.ownerMobileNo,
        ownerId: this.data?.ownerId,
        name: this.data?.name,
        animalId: this.data.animalId || undefined,
      },
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((res) => {
      this.onClosed.emit();
    });

    // this.genrateOtp(this.data.ownerId);
  }

  skipVerification() {
    this.ownerDS.setOwnerVerifiedFlag(false);
    this.ownerDS.setOwnerRegFlag(true);
    this.route.navigateByUrl(this.data.link);
    this.dialogRef.close();
  }

  // genrateOtp(ownerId: string) {
  //   if (this.data.animalId) {
  //     this.ownerDS
  //       .initiateOtp(this.data.animalId, 'animal')
  //       .subscribe((data) => {});
  //   } else {
  //     this.ownerDS.initiateOtp(ownerId).subscribe((data) => {});
  //   }
  // }
}
