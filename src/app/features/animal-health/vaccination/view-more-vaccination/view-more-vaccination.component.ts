import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Animal } from '../models/animal.model';

@Component({
  selector: 'app-view-more-vaccination',
  templateUrl: './view-more-vaccination.component.html',
  styleUrls: ['./view-more-vaccination.component.css']
})
export class ViewMoreVaccinationComponent implements OnInit {
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
