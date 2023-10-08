import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seek-clarification-dialog',
  templateUrl: './seek-clarification-dialog.component.html',
  styleUrls: ['./seek-clarification-dialog.component.css']
})
export class SeekClarificationDialogComponent implements OnInit {
  
  constructor(private dialogRef: MatDialogRef<SeekClarificationDialogComponent>,
    private router: Router,  @Inject(MAT_DIALOG_DATA) public data:{
      title: string;
      }) { }

  ngOnInit(): void {
  }
  closeDialog(){
    window.location.reload()
  }

}
