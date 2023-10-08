import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ErrorComponent } from './error/error.component';
import { Router } from '@angular/router';
import { AuthService } from '../features/auth/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private dialog: MatDialog, private router: Router, private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          let newEvent: HttpEvent<any>;
          if (event.body.flg) {
            // if (event.body.data && !event.body.data.length && event.body.msg) {
            //   newEvent = event.clone({
            //     body: event.body.data
            //   })
            // }
            if (event.body.data && event.body.msg) {
              newEvent = event.clone({
                body: event.body,
              });
            } else if (event.body.data && !event.body.msg) {
              newEvent = event.clone({
                body: event.body.data,
              });
            } else if (!event.body.data) {
              if (event.body?.msg?.msgDesc) {
                newEvent = event.clone({
                  body: event.body.msg,
                });
              } else if (!event.body?.msg?.msgDesc) {
                newEvent = event.clone({
                  body: event.body.data,
                });
              }
            }
          } else {
            if (event.body.msg?.msgCode && event.body.msg?.msgDesc) {
              throw new HttpErrorResponse({ error: event.body.msg });
            } else if (event.body.msg?.msgCode && !event.body.msg?.msgDesc) {
              newEvent = event.clone({
                body: event.body.data,
              });
            } else {
              newEvent = event.clone({
                body: event.body,
              });
            }
          }
          return newEvent;
        } else {
          return event;
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.error) {
          let errorMessage = 'An unknown error occurred';
          errorMessage = error?.error?.message || error?.error?.error || error?.error?.details || error?.error?.msg?.msgDesc || error?.error?.msgDesc || error.message;
          // if (error.status == 401) {
          //   this.authService.clearAuthData();
          //   this.dialog.closeAll();
          //   this.router.navigate(['/auth/login']);
          // }
          if (error.status == 403) {
            if (error?.error?.msg?.msgCode == 9999) {
              this.dialog.closeAll();
              this.dialog.open(ErrorComponent, {
                width: '380px',
                data: { icon: 'assets/images/alert.svg', message: errorMessage },
                panelClass: 'common-error-dialog',
              }).afterClosed().subscribe(() => {
                this.authService.clearAuthData();
                this.router.navigate(['/auth/login']);
              })
            }
            else {
              this.authService.clearAuthData();
              this.dialog.closeAll();
              this.router.navigate(['/auth/login']);
            }
            return throwError(error);
          }
          else if (error.status != 401) {
            this.dialog.open(ErrorComponent, {
              width: '380px',
              data: { icon: 'assets/images/alert.svg', message: errorMessage },
              panelClass: 'common-error-dialog',
            });
          }
        }
        return throwError(error);
      })
    );
  }
}
