import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Idle } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { AuthService } from 'src/app/features/auth/auth.service';

@Component({
  selector: 'app-idle-session-dialog',
  templateUrl: './idle-session-dialog.component.html',
  styleUrls: ['./idle-session-dialog.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class IdleSessionDialogComponent implements OnInit {
  idleState = 'Not started.';
  timedOut = true;
  lastPing?: Date = null;
  isLoadingSpinner=true

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private idle: Idle, private authService: AuthService, private keepalive: Keepalive, private dialogRef: MatDialogRef<IdleSessionDialogComponent>) {
    idle.onTimeoutWarning.subscribe((countdown) => {
      this.idleState = countdown + ' sec.'
    });

    idle.onIdleEnd.subscribe(() => {
      this.idleState = 'No longer idle.'
      console.log(this.idleState)
      this.reset();
    });

  }

  ngOnInit(): void {
    console.log(this.data)
  }

  reset() {
    this.idle.watch();
    //xthis.idleState = 'Started.';
    this.timedOut = false;
    this.dialogRef.close();
  }

  hideChildModal(): void {
    // this.childModal.hide();
  }

  stay() {
    this.dialogRef.close();
    // this.reset();
  }
  logout() {
    this.dialogRef.close();
    this.authService.logout();
  }

}
