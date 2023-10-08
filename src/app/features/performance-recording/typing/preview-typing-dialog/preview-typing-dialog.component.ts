import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SaveTypingReq } from '../models/save-typing-req.model';

@Component({
  selector: 'app-preview-typing-dialog',
  templateUrl: './preview-typing-dialog.component.html',
  styleUrls: ['./preview-typing-dialog.component.css'],
})
export class PreviewTypingDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SaveTypingReq,
    private dialogRef: MatDialogRef<PreviewTypingDialogComponent>
  ) {}

  ngOnInit(): void {
  }

  onClose(flag: boolean) {
    this.dialogRef.close(flag);
  }
}
