import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForgotPasswordComponent } from './forgot-password';
import { OtpforgotVerificationComponent } from './otpforgot-verification/otpforgot-verification.component';
import { PasswordSentDialogComponent } from './password-sent-dialog/password-sent-dialog.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ForgotPasswordRoutingModule } from './forgot-password-routing.module';
import { ChangePasswordComponent } from './change-password/change-password.component';


@NgModule({
  declarations: [
    ForgotPasswordComponent,
    OtpforgotVerificationComponent,
    PasswordSentDialogComponent,
    ChangePasswordComponent
  ],
  imports: [
    CommonModule,
    ForgotPasswordRoutingModule,
    SharedModule
  ]
})
export class ForgotPasswordModule { }
