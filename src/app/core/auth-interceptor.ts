import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse,
  HttpClient,
  HttpEvent,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';

import { AuthService } from '../features/auth/auth.service';
import {
  getDecryptedData,
  getDecryptedProjectData,
  getDecryptedRoleData,
  getSessionData,
} from '../shared/shareService/storageData';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) { }
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.authService.getToken()) {
      request = this.addToken(request, sessionStorage.getItem('token'));
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        } else {
          return throwError(error);
        }
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        roleCd: getDecryptedRoleData('AESSHA256userDataRole').id || '',
        projectId:
          getDecryptedProjectData('AESSHA256storageProjectData').id &&
            getDecryptedProjectData('AESSHA256storageProjectData').id != '0'
            ? getDecryptedProjectData('AESSHA256storageProjectData').id
            : '',
        subModuleCd: getSessionData('subModuleCd')?.subModuleCd
          ? getSessionData('subModuleCd')?.subModuleCd.toString()
          : '0',
        langCd: getSessionData('language')
          ? getSessionData('language').toString()
          : '',
      },
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((token: any) => {
          this.isRefreshing = false;
          sessionStorage.setItem('token', token.access_token);
          sessionStorage.setItem('refresh_token', token.refresh_token);
          this.refreshTokenSubject.next(token);
          sessionStorage.setItem('token', token.access_token);
          sessionStorage.setItem('refreshToken', token.refresh_token);
          return next.handle(this.addToken(request, token.access_token));
        })
        , catchError((error) => {

          this.isRefreshing = false;

          return throwError(error);

        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((token) => {
          return next.handle(this.addToken(request, token.access_token));
        })
      );
    }
  }
}
