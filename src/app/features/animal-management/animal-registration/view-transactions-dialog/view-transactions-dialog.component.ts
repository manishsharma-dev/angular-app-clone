import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AnimalManagementService } from '../animal-management.service';
import { AnimalTransactions } from '../models-animal-reg/animal-Transaction.model';
import moment from 'moment';

@Component({
  selector: 'app-view-transactions-dialog',
  templateUrl: './view-transactions-dialog.component.html',
  styleUrls: ['./view-transactions-dialog.component.css'],
})
export class ViewTransactionsDialogComponent implements OnInit {
  isLoadingSpinner = false;
  animalTransactionData: AnimalTransactions[] = [];
  timeOfDeath = '';

  constructor(
    private AnimalMS: AnimalManagementService,
    @Inject(MAT_DIALOG_DATA)
    public data: { animalId: string },
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.viewAnimalTransactions();
  }

  viewAnimalTransactions() {
    this.isLoadingSpinner = true;
    this.AnimalMS.viewAnimalTranactions(this.data.animalId).subscribe(
      (responseData) => {
        this.isLoadingSpinner = false;
        this.animalTransactionData = responseData;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  checkIfArray(value: any): boolean {
    return Array?.isArray(value);
  }

  dateFormatChange(date: String) {
    date = date.substring(0, 10);
    return date.split('-').reverse().join('/');
  }

  doesElementContainsDate(animalMdfcJSON): boolean {
    for (let i of animalMdfcJSON) {
      if (i.key === 'Date Of Death') {
        return true;
      }
    }
    return false;
  }

  formatDate(value: string) {
    let dateAndTime = value?.split(' ');
    let date = new Date(dateAndTime[0]);
    if (!this.timeOfDeath) {
      this.timeOfDeath = moment(new Date(value)).format('HH:mm');
      this.cdRef.detectChanges();
    }
    return moment(date).format('DD/MM/YYYY');
  }
}
