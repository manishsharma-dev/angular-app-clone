import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-group-dialog',
  templateUrl: './group-dialog.component.html',
  styleUrls: ['./group-dialog.component.css']
})
export class GroupDialogComponent implements OnInit {
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
