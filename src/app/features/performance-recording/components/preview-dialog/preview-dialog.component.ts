import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-preview-dialog',
  templateUrl: './preview-dialog.component.html',
  styleUrls: ['./preview-dialog.component.css'],
})
export class PreviewDialogComponent implements OnInit {
  values = [];

  constructor(@Inject(MAT_DIALOG_DATA) private data: any) {}

  ngOnInit(): void {
    this.values.push(...Object.entries(this.data));
  }
}
