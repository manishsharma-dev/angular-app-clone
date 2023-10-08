import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, BehaviorSubject } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AuthData } from './auth-data.model';
import { SnackBarMessage } from 'src/app/shared/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResetPassword } from './reset-password/reset-password.model';
import { SignUpData } from './signup-data.model';
import { map, tap } from 'rxjs/operators';
import {
  ForgotOtpModel,
  ForgotPassword,
  ForgotPsd,
  MobileVerify,
} from './forgot-password/forgot-interface';
import { MatDialog } from '@angular/material/dialog';
import { MobileVerficationComponent } from './mobile-verfication/mobile-verfication.component';
import { setSessionData } from 'src/app/shared/shareService/storageData';
import { ResetPasswordComponent } from './reset-password/reset-password';

const BACKEND_URL = environment.apiURL;

@Injectable({ providedIn: 'root' })
export class AuthService {
  languageLabels = new BehaviorSubject<any>([]);
  private isAuthenticated = false;
  private token: string;
  public isLoadingSpinner = false;
  private authStatusListener = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  getToken() {
    return sessionStorage.getItem('token');
  }

  getIsAuth() {
    return this.isAuthenticated && !!sessionStorage.getItem('user');
  }

  setLanguageLabels(lang) {
    this.languageLabels.next(lang);
  }

  getLanguageLabels() {
    return this.languageLabels.asObservable();
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string, confirmPassword: string) {
    const authData: SignUpData = {
      userName: email,
      password: password,
      confirmPassword: confirmPassword,
    };
    this.http.post('' + 'signup', authData).subscribe(
      () => {
        new SnackBarMessage(this._snackBar).onSucessMessage(
          'Register Successfully',
          'Ok',
          'right',
          'top',
          'green-snackbar'
        );
        this.router.navigate(['/auth/login']);
      },
      (error) => {
        console.log(error);
        // this.authStatusListener.next(false);
      }
    );
    // this.router.navigate(["/dashboard"]);
  }

  reset(reset: ResetPassword) {
    return this.http.post(BACKEND_URL + 'admin/user/resetPassword', reset);
  }

  login(username: string, password: string | any) {
    this.isLoadingSpinner = true;
    const authData: AuthData = { userName: username, password: password };
    this.http
      .post<{
        access_token: string;
        refresh_expires_in: number;
        expires_in: number;
        refresh_token: string;
      }>(BACKEND_URL + 'admin/livestock/login', authData)
      .subscribe(
        (response) => {
          let httpHeaders = new HttpHeaders();
          httpHeaders = httpHeaders.append(
            'Authorization',
            'Bearer ' + response.access_token
          );
          // httpHeaders = httpHeaders.append("roleCd", '1179');

          this.http
            .get(BACKEND_URL + 'admin/user/userAutherization', {
              headers: httpHeaders,
            })
            .subscribe(
              (userDate) => {
                setSessionData(9, 'language');
                this.isLoadingSpinner = false;
                const token = response.access_token;
                this.token = token;
                if (token && userDate) {
                  const expiresInDuration = response.expires_in;
                  //this.setAuthTimer(expiresInDuration);
                  this.isAuthenticated = true;
                  this.authStatusListener.next(true);
                  const now = new Date(
                    sessionStorage.getItem('serverCurrentDateTime')
                  );
                  const expirationDate = new Date(
                    now.getTime() + expiresInDuration * 1000
                  );
                  this.saveAuthData(
                    token,
                    expirationDate,
                    userDate,
                    response.refresh_token
                  );

                  if (!userDate['passwordResetFlag']) {
                    console.log(!userDate['passwordResetFlag'])
                    this.resetDialogPopup();
                    return;

                  } else if (!userDate['mobileFlag']) {
                    this.mobileNumberVerificationPopup();
                  }
                  this.router.navigate(['/dashboard']);
                }
              },
              (error) => {
                this.isLoadingSpinner = false;
                //new SnackBarMessage(this._snackBar).onSucessMessage(`${error.error.message}`,'Try Again !','center','top','red-snackbar');
              }
            );
        },
        (error) => {
          //new SnackBarMessage(this._snackBar).onSucessMessage(`${error.error.message}`,'Try Again !','center','top','red-snackbar');
          this.isLoadingSpinner = false;
          this.authStatusListener.next(false);
        }
      );
  }
  forgotPassword(data: ForgotPsd) {
    const payload = {
      loginId: data.loginId,
      user: data.user,
      mobile: data.mobile,
    };
    return this.http.post<ForgotPsd[]>(
      BACKEND_URL + 'admin/livestock/initiateOtp',
      payload
    );
  }

  mobileVerify(mobile: any, userId: string) {
    const payload = {
      userId: userId,
      mobileNo: mobile,
    };
    return this.http.post<ForgotPsd[]>(
      BACKEND_URL + 'admin/user/initiateOtpUpdation',
      payload
    );
  }

  verifyOtp(userOtp: string, userId?: string, mobileNumberForUpdate?: string) {
    var payload = {};
    if (mobileNumberForUpdate) {
      payload = {
        loginId: userId,
        userOtp: userOtp,
      };
      return this.http.post<ForgotOtpModel>(
        BACKEND_URL + 'admin/livestock/verifyOtp',
        payload
      );
    } else {
      payload = { loginId: userId, userOtp: userOtp };
      return this.http.post<ForgotOtpModel>(
        BACKEND_URL + 'admin/livestock/verifyOtp',
        payload
      );
    }
  }

  MobileverifyOtp(
    enteredOTP: number | string,
    userId: string,
    mobilNo: number | string
  ) {
    let payload = {
      userOtp: enteredOTP,
      userId: userId,
      mobileNo: mobilNo,
    };

    return this.http.post<MobileVerify>(
      BACKEND_URL + 'admin/user/verifyOtpUpdation',
      payload
    );
  }

  changeforgotPassword(payload: any) {
    return this.http.post<[]>(
      BACKEND_URL + 'admin/livestock/forgotPassword',
      payload
    );
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    this.token = authInformation.token;
    this.isAuthenticated = true;
    this.authStatusListener.next(true);
  }

  logout() {
    this.dialog.closeAll();
    let refreshToken = {
      refreshToken: sessionStorage.getItem('refreshToken'),
    };

    this.http
      .post(BACKEND_URL + 'admin/livestock/logout', refreshToken)
      .subscribe((response) => {
        this.token = null;
        this.isAuthenticated = false;
        this.authStatusListener.next(false);
        this.clearAuthData();
        this.router.navigate(['/auth/login']);
        this.isLoadingSpinner = false;
      });
  }

  // private setAuthTimer(duration: number) {
  //   this.tokenTimer = setTimeout(() => {
  //    // this.logout();
  //   }, duration*100);
  // }

  private saveAuthData(
    token: string,
    expirationDate: Date,
    userData: any,
    refresh_token: string
  ) {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('expiration', expirationDate.toISOString());
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('refreshToken', refresh_token);
  }

  clearAuthData() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('expiration');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('storageData');
    sessionStorage.removeItem('storageRoleData');
    sessionStorage.removeItem('storageProjectData');
    sessionStorage.removeItem('sessionData');
    sessionStorage.removeItem('animalMgmtConfig');
    sessionStorage.clear();
    this.token = null;
  }

  private getAuthData() {
    const token = sessionStorage.getItem('token');
    const expirationDate = sessionStorage.getItem('expiration');
    const user = sessionStorage.getItem('user');
    if (!token || !expirationDate) {
      return null;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      user: user,
    };
  }

  refreshToken() {
    return this.http
      .post<any>(`${BACKEND_URL}admin/livestock/refresh`, {
        refreshToken: sessionStorage.getItem('refreshToken'),
      })
      .pipe(
        tap((tokens: any) => {
          sessionStorage.setItem('refreshToken', tokens.refresh_token);
        })
      );
  }

  getSidenavLabels() {
    return this.http
      .post(`${BACKEND_URL}commonutility/getLabelByLanguageCd`, {})
      .pipe(
        tap((languages: any) => {
          this.setLanguageLabels(languages);
        })
      );
  }
  mobileNumberVerificationPopup() {
    this.dialog.open(MobileVerficationComponent, {
      data: {
        title: 'Info',
        //message: `${response['msg'].msgDesc}`,
        icon: 'assets/images/info.svg',
        primaryBtnText: 'Submit',
        secondaryBtnText: 'Cancel',
      },
      panelClass: 'common-info-dialog',
    });
  }
  resetDialogPopup() {
    this.dialog.open(ResetPasswordComponent, {
      data: {
        title: 'Reset Password',
        //message: `${response['msg'].msgDesc}`,
        icon: 'assets/images/info.svg',
        primaryBtnText: 'Submit',
        secondaryBtnText: 'Cancel',

      },
      disableClose: true,
      hasBackdrop: true,
      panelClass: 'common-info-dialog',
    });
  }


}
