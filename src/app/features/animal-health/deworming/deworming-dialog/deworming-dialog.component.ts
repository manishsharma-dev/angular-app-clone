import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Route, Router } from '@angular/router';
@Component({
  selector: 'app-deworming-dialog',
  templateUrl: './deworming-dialog.component.html',
  styleUrls: ['./deworming-dialog.component.css'],
})
export class DewormingDialogComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<DewormingDialogComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA)
    public data: { count: number; vaccName: string; res: any;}
  ) {
  }

  ngOnInit(): void {
  }
  closeDialog() {
    this.dialogRef.close();
    this.router.navigate(['/dashboard/deworming']);
  }
}
