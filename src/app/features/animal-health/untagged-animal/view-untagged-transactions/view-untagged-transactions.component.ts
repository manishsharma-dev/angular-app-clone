import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UntaggedTransaction } from '../models/untagged-transaction.model';
import { UntaggedAnimalService } from '../untagged-animal.service';
import { TreatmentResponseDialogComponent } from '../../treatment-response-dialog/treatment-response-dialog.component';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-view-untagged-transactions',
  templateUrl: './view-untagged-transactions.component.html',
  styleUrls: ['./view-untagged-transactions.component.css'],
  providers: [TranslatePipe],
})
export class ViewUntaggedTransactionsComponent implements OnInit {
  isLoading = false;
  columnsToDisplay: string[] = [
    'sno',
    'requestorName',
    'diseaseDesc',
    'speciesName',
    'sex',
    'villageName',
    'prescription',
  ];
  dataSource = new MatTableDataSource<UntaggedTransaction>([]);

  @ViewChild('listPaginator') set paginator(pg: MatPaginator) {
    this.dataSource.paginator = pg;
    
  }

  @ViewChild(MatSort) set sort(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  constructor(
    private readonly untaggedService: UntaggedAnimalService,
    private readonly translatePipe: TranslatePipe,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.untaggedService.getUntaggedAnimalTreatmentDetails().subscribe(
      (res) => {
        this.isLoading = false;
        this.dataSource.data = res;
      },
      () => (this.isLoading = false)
    );
  }

  viewReport(transactionId: number) {
    this.isLoading = true;
    this.untaggedService.downloadUntaggedReport(transactionId).subscribe(
      (res: any) => {
        this.isLoading = false;

        const blob = new Blob([res.body], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const popUp = window.open(url, '_blank');
        if (popUp == null || typeof popUp == 'undefined') {
          this.dialog.open(TreatmentResponseDialogComponent, {
            data: {
              title: this.translatePipe.transform('errorMsg.popup_blocked'),
              icon: 'assets/images/info.svg',
              message: this.translatePipe.transform(
                'errorMsg.please_disable_your_popup_blocker_and_click_the_view_link_again'
              ),
              primaryBtnText: this.translatePipe.transform('common.ok_string'),
            },
            panelClass: 'common-info-dialog',
          });
        } else {
          popUp.focus();
        }
      },
      (err) => {
        this.isLoading = false;
      }
    );
  }

  searchInTable(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
