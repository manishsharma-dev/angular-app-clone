import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { GroupDialogComponent } from '../group-dialog/group-dialog.component';
import { Location } from '@angular/common';
@Component({
  selector: 'app-pool-dialog',
  templateUrl: './pool-dialog.component.html',
  styleUrls: ['./pool-dialog.component.css']
})
export class PoolDialogComponent implements OnInit {
  animalCount: any;
  constructor(private dialogRef: MatDialogRef<GroupDialogComponent>, private _location: Location,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {

  }

  closeDialog() {
    this.dialogRef.close();
    //this._location.back();
    if (this.router.url.includes('newcase')) {
      this.router.navigate(['dashboard/group-disease-testing']);
    } else {
      this._location.back();
    }
  }
}
