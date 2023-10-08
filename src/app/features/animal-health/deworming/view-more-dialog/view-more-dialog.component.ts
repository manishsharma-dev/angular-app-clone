import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Animal } from '../models/animal.model';

@Component({
  selector: 'app-view-more-dialog',
  templateUrl: './view-more-dialog.component.html',
  styleUrls: ['./view-more-dialog.component.css']
})
export class ViewMoreDialogComponent implements OnInit {

  constructor( @Inject(MAT_DIALOG_DATA)
  public data: {
    selectedTagIds:Animal[];

  }) { }

  ngOnInit(): void {
  }

  onClickingRemove(element: Animal) {
    this.data.selectedTagIds.forEach((value, index) => {
      if (value.tagId === element.tagId) this.data.selectedTagIds.splice(index, 1);
    });
  }
}
