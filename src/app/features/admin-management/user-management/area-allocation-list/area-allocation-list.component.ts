import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Location } from '@angular/common';
import { AreaAllocationFormDialogComponent } from '../area-allocation-form-dialog/area-allocation-form-dialog.component';
import { ConfirmationDialogComponent } from '../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { Area } from '../models/area.model';

@Component({
  selector: 'app-area-allocation-list',
  templateUrl: './area-allocation-list.component.html',
  styleUrls: ['./area-allocation-list.component.css'],
})
export class AreaAllocationListComponent implements OnInit {
  displayedColumns: string[] = [
    '#',
    'name',
    'role',
    'state',
    'district',
    'tehsil',
    'village',
    'hamlet',
    'more',
  ];

  dataSource = new MatTableDataSource<Area>(ELEMENT_DATA);

  constructor(private dialog: MatDialog, private location: Location) {}

  ngOnInit(): void {}

  openEditDialog() {
    this.dialog.open(AreaAllocationFormDialogComponent);
  }

  openDeleteDialog() {
    this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirmation Require!',
        message: 'Are you sure you want to delete this allocated area?',
        primaryBtnText: 'Yes',
        secondaryBtnText: 'No',
      },
    });
  }

  goBack() {
    this.location.back();
  }
}

const ELEMENT_DATA: Area[] = [
  {
    name: 'Nil',
    role: 'Nil',
    state: 'Gujrat',
    district: 'Ahmedabad',
    tehsil: 'Ahmedabad',
    village: 'Solgam, Sujpura',
    hamlet: 'Nil',
  },
  {
    name: 'Amul',
    role: 'Nil',
    state: 'Gujrat',
    district: 'Surat',
    tehsil: 'Adajan',
    village: 'Amroli, Kosad, Palanpur',
    hamlet: 'Nil',
  },
];
