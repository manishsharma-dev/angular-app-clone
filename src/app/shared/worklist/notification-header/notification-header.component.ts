import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-notification-header',
  templateUrl: './notification-header.component.html',
  styleUrls: ['./notification-header.component.css']
})
export class NotificationHeaderComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      id: number;
      subTitle?: string,
      title: string;
      message: string;
      primaryBtnText: string;
      secondaryBtnText: string;
      colour: string;
    },
    private dialogRef: MatDialogRef<NotificationHeaderComponent>
  ) { }

  ngOnInit(): void {
  }

}
