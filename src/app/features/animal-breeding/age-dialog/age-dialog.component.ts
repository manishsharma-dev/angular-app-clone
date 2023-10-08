import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-age-dialog',
  templateUrl: './age-dialog.component.html',
  styleUrls: ['./age-dialog.component.css']
})
export class AgeDialogComponent implements OnInit {

  constructor( @Inject(MAT_DIALOG_DATA)
  public data: {
    breedActivity: string;
  }) { }

  ngOnInit(): void {
  }

}
