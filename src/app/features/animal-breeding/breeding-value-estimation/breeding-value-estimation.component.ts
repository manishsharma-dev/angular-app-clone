import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslatePipe } from '@ngx-translate/core';
import FileSaver from 'file-saver';
import moment from 'moment';
import { filter, switchMap } from 'rxjs/operators';
import { animalBreedingPRConfig } from 'src/app/shared/animal-breeding-pr.config';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { StrawManagementService } from '../straw-management/straw-management.service';
import { BreedingValueEstimationService } from './breeding-value-estimation.service';
import { UploadFileDialogComponent } from './upload-file-dialog/upload-file-dialog.component';

@Component({
  selector: 'app-breeding-value-estimation',
  templateUrl: './breeding-value-estimation.component.html',
  styleUrls: ['./breeding-value-estimation.component.css'],
  providers: [TranslatePipe],
})
export class BreedingValueEstimationComponent implements OnInit {
  isLoading = false;
  animalDetailsSection = true;
  displayedColumns = ['#', 'name', 'date', 'action', 'delete'];
  tableDataSource = new MatTableDataSource([]);

  @ViewChild(MatPaginator) set paginator(mp: MatPaginator) {
    this.tableDataSource.paginator = mp;
  }

  constructor(
    private dialog: MatDialog,
    private breedingValueService: BreedingValueEstimationService,
    private translatePipe: TranslatePipe,
    private strawManagementService: StrawManagementService
  ) {}

  ngOnInit(): void {}

  searchInTable(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
    if (this.tableDataSource.paginator) {
      this.tableDataSource.paginator.firstPage();
    }
  }

  openImportDialog() {
    this.dialog
      .open(UploadFileDialogComponent, {
        panelClass: 'common-info-dialog',
      })
      .afterClosed()
      .pipe(
        filter((file) => !!file),
        switchMap((file) => {
          this.isLoading = true;
          return this.breedingValueService.saveBreedingValueEstimation(file);
        })
      )
      .subscribe(
        (res) => {
          this.isLoading = false;
          this.dialog.open(ConfirmationDialogComponent, {
            data: {
              title: res?.msg?.msgDesc,
              id:
                this.translatePipe.transform(
                  'performanceRecording.total_no_records_of_saved'
                ) + res?.data?.numOfRecord,
              message: res?.data?.invalidTagIdAndBullId?.length
                ? this.translatePipe.transform(
                    'performanceRecording.records_not_saved_for_following_tagId/bullId'
                  ) +
                  '\n' +
                  res.data?.invalidTagIdAndBullId.join(', ')
                : 'common.success',
              primaryBtnText: 'common.ok_string',
              icon: 'assets/images/tick-icon.svg',
            },
            panelClass: 'common-info-dialog',
          });
        },
        () => (this.isLoading = false)
      );
  }

  downloadSampleTemplate() {
    this.isLoading = true;
    // this.dialogRef.close();
    this.strawManagementService
      .getSemenStockTemplate(
        animalBreedingPRConfig.breedingValueTemplateFileName
      )
      .subscribe(
        (res) => {
          this.isLoading = false;
          const fileName = res.headers
            .get('Content-Disposition')
            .split('; ')[1]
            .split('=')[1];
          let blob: any = new Blob([res.body]);
          const url = window.URL.createObjectURL(blob);

          FileSaver.saveAs(blob, fileName);
          this.dialog.open(ConfirmationDialogComponent, {
            data: {
              title: this.translatePipe.transform('common.info_label'),
              icon: 'assets/images/info.svg',
              message: this.translatePipe.transform(
                'performanceRecording.template_downloaded'
              ),
              primaryBtnText: this.translatePipe.transform('common.ok_string'),
            },
            panelClass: 'common-info-dialog',
          });
        },
        () => (this.isLoading = false)
      );
  }
}
