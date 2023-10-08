import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NewCaseResponse } from '../models/new-case-response.model';

@Component({
  selector: 'app-submit-dialog',
  templateUrl: './submit-dialog.component.html',
  styleUrls: ['./submit-dialog.component.css'],
})
export class SubmitDialogComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<SubmitDialogComponent>,
    private _location: Location,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      ownerId: string;
      title: string;
      sub_title: string;
      followDateMessage: string;
      followDate: string;
      caseID: number;
      supervisorName: string;
      table_header: any;
      table_value: any;
      followUpNo: any;
    }
  ) { }

  ngOnInit(): void { }
  closeDialog() {
    this.dialogRef.close(this.data);
    //this._location.back();
    if (this.router.url.includes('newcase') || this.router.url.includes('updatecase')) {
      this.router.navigate(['dashboard/animal-treatment-surgery'], {
        relativeTo: this.route,
        queryParams: { ownerId: this.data.ownerId },
      });
    } else {
      this.router.navigate(['dashboard/group-disease-testing'], {
        relativeTo: this.route,
        queryParams: { ownerId: this.data.ownerId },
      });
    }
  }
}
