import { Component, OnInit ,Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-submit-dialog',
  templateUrl: './submit-dialog.component.html',
  styleUrls: ['./submit-dialog.component.css']
})
export class SubmitDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<SubmitDialogComponent>,
    private router: Router,  @Inject(MAT_DIALOG_DATA) public data:{
      title: string;
      outbreakId:number
      }) { }

  ngOnInit(): void {
  }
  closeDialog(){
    window.location.reload()
  }
}


