import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SaveGeneticRes } from '../models/save-genetic-res.model';

@Component({
  selector: 'app-save-genetic-dialog',
  templateUrl: './save-genetic-dialog.component.html',
  styleUrls: ['./save-genetic-dialog.component.css'],
})
export class SaveGeneticDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: SaveGeneticRes[]
  ) {}

  ngOnInit(): void {}
}
