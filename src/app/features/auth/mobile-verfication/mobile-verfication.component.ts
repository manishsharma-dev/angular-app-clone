import { Component, OnInit, Inject, ViewEncapsulation, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
;
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PasswordSentDialogComponent } from '../forgot-password/password-sent-dialog/password-sent-dialog.component';
import { AuthService } from '../auth.service';
import { MobileValidation } from 'src/app/shared/utility/validation';
import { encryptText } from 'src/app/shared/shareService/storageData';

@Component({
  selector: 'app-mobile-verfication',
  templateUrl: './mobile-verfication.component.html',
  styleUrls: ['./mobile-verfication.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class MobileVerficationComponent implements OnInit {

  public mobileNumberVerfyForm: FormGroup;
  onClosed = new EventEmitter();

  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    id: number;
    title: string;
    message: string;
    icon: string;
    statusData: number;
    primaryBtnText: string;
    secondaryBtnText: string;
    colour: string

  },
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<MobileVerficationComponent>,
    private authsrv: AuthService

  ) { }
  ngOnInit(): void {
    this.mobileNumberVerfyForm = new FormGroup({
      "mobileNo": new FormControl('', [Validators.required,MobileValidation]),

    });
    if (sessionStorage.getItem('user')) {
      this.mobileNumberVerfyForm.patchValue({
        "mobileNo": JSON.parse(sessionStorage.getItem('user'))?.mobileNo
      })
    }
    this.dialogRef.updateSize('400px');

  }

  onSubmit() {
    if (this.mobileNumberVerfyForm.value) {
      let userId = JSON.parse(sessionStorage.getItem('user')).userId
      let mobile=encryptText(this.mobileNumberVerfyForm.get('mobileNo').value.toString())
      this.authsrv.mobileVerify(mobile,userId).subscribe((response) => {
        this.openPasswordSentDialog(response)

      })
      this.dialogRef.close(true);
    }


  }

  openPasswordSentDialog(data:any) {
    const dialogRef = this.dialog.open(PasswordSentDialogComponent, {
      disableClose: false,
      data: {
        title: data.message,
        //  header: this.data?.link,
        // currentComponent: this.data?.name,
        // otp: this.data?.otp,
        // ownerMobileNo: this.data?.ownerMobileNo,
        userId: JSON.parse(sessionStorage.getItem('user')).userId,
        // name: this.data?.name,
        // animalId: this.data.animalId || undefined,
        mobileNumber: data.mobileNo,
        flag: true
      },
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((res) => {
      this.onClosed.emit();
    });
  }



}
