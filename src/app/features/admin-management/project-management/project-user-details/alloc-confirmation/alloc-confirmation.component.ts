import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-alloc-confirmation',
  templateUrl: './alloc-confirmation.component.html',
  styleUrls: ['./alloc-confirmation.component.css'],
})
export class AllocConfirmationComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      name: string;
      role: string;
      startDate: string;
      endDate: string;
    }
  ) {}

  ngOnInit(): void {}
}
