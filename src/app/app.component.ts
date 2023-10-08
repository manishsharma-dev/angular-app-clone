import { AnimalManagementService } from './features/animal-management/animal-registration/animal-management.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from './features/auth/auth.service';

import {
  Router,
  RouteConfigLoadStart,
  RouteConfigLoadEnd,
} from '@angular/router';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarMessage } from './shared/snack-bar';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public getResetFlag = JSON.parse(sessionStorage.getItem('user'))?.passwordResetFlag;
  public isResetFlag: boolean;

  animalMgmtConfigKeys = [
    'ownerAge',
    'ownerNameLength',
    'ownerAddress',
    'animalDOBLimit',
    'minAgeForPregnancy',
    'taggingDateLimit',
    'ownershipTransferDateLimit',
    'earTagChangeDateLimit',
  ];
  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date = null;
  isLoadingSpinner = false;
  isLogOut = false;

  constructor(
    private authService: AuthService,
    private animalMS: AnimalManagementService,
    private router: Router,
    private idle: Idle,
    private keepalive: Keepalive,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {


    this.router.events.subscribe((event) => {
      // if (event instanceof NavigationEnd) {
      //   if (event.urlAfterRedirects === '/not-found') {
      //     this.isLogOut = true;
      //   } else {
      //     this.isLogOut = false;
      //   }
      // } else
      if (event instanceof RouteConfigLoadStart) {
        this.isLoadingSpinner = true;
      } else if (event instanceof RouteConfigLoadEnd) {
        this.isLoadingSpinner = false;
      }

      // if (this.isLogOut) {
      //   sessionStorage.clear()
      // }
    });
    // sets an idle timeout of 900 seconds, for testing purposes.
    this.idle.setIdle(900);
    // sets a timeout period of 15 seconds. after 10 seconds of inactivity, the user will be considered timed out.
    this.idle.setTimeout(5);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    this.idle.onTimeout.subscribe(() => {
      //this.childModal.hide();
      this.idleState = 'Timed out!';
      this.timedOut = true;
      this.authService.logout();
      new SnackBarMessage(this._snackBar).onSucessMessage(
        `Session has expired.Please login again !`,
        '',
        'center',
        'top',
        'red-snackbar'
      );
      //this.dialog.open(IdleSessionDialogComponent, dialogConfig);
      // console.log(this.idleState);
    });

    let dialogConfig = new MatDialogConfig();
    dialogConfig.hasBackdrop = true;
    dialogConfig.autoFocus = false;
    dialogConfig.disableClose = true;
    dialogConfig.backdropClass = '';
    dialogConfig.panelClass = 'idle-info-dialog';
    dialogConfig.data = {
      width: '400px',
      data: {
        title: 'Session Expire',
        icon: 'assets/images/info.svg',
      },
    };

    this.idle.onIdleStart.subscribe(() => {
      this.idleState = "You've gone idle!";

      //this.dialog.open(IdleSessionDialogComponent, dialogConfig);
    });

    // sets the ping interval to 15 seconds
    this.keepalive.interval(5);

    this.keepalive.onPing.subscribe(() => (this.lastPing = new Date()));

    this.authService.getAuthStatusListener().subscribe((userLoggedIn) => {
      if (userLoggedIn) {
        this.idle.watch();
        this.timedOut = false;
      } else {
        this.idle.stop();
        console.log(this.idle.stop());
      }
    });
    // this.reset();
    this.authService.autoAuthUser();
    if (this.getResetFlag == false) {
      this.authService.resetDialogPopup();

    }



  }
}
