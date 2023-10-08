import { Component, Inject, ViewEncapsulation } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
// import { Subscription } from "rxjs";

// import { ErrorService } from "./error.service";

@Component({
  templateUrl: './error.component.html',
  selector: 'app-error',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./error.component.css'],
})
export class ErrorComponent {
  // data: { message: string };
  // private errorSub: Subscription;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { icon: string; message: string },
    private dialogRef: MatDialogRef<ErrorComponent>
  ) {}
  // constructor(private errorService: ErrorService) {}

  ngOnInit() {
    this.dialogRef.updateSize('400px');
  }

  // onHandleError() {
  //   this.errorService.handleError();
  // }

  // ngOnDestroy() {
  //   this.errorSub.unsubscribe();
  // }
}
