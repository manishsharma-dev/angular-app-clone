import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-intimation-submit-dialog',
  templateUrl: './intimation-submit-dialog.component.html',
  styleUrls: ['./intimation-submit-dialog.component.css'],
})
export class IntimationSubmitDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { intimationId: number; message: string }
  ) {}

  ngOnInit(): void {}
}
