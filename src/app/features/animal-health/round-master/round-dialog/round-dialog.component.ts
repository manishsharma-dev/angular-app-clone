import { Component, OnInit ,Inject} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Location } from '@angular/common';

@Component({
  selector: 'app-round-dialog',
  templateUrl: './round-dialog.component.html',
  styleUrls: ['./round-dialog.component.css']
})
export class RoundDialogComponent implements OnInit {
  constructor(private dialogRef: MatDialogRef<RoundDialogComponent>,private _location: Location,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      message: string;
      roundID: number;
      primaryBtnText: string;
      secondaryBtnText: string;
    }) { }

  ngOnInit(): void {
  }
  closeDialog(){
    window.location.reload()
  }

}
