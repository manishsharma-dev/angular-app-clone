import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { TreatmentResponseDialogComponent } from '../../treatment-response-dialog/treatment-response-dialog.component';
import { UntaggedAnimalService } from '../untagged-animal.service';

@Component({
  selector: 'app-save-download-dialog',
  templateUrl: './save-download-dialog.component.html',
  styleUrls: ['./save-download-dialog.component.css'],
  providers: [TranslatePipe],
})
export class SaveDownloadDialogComponent {
  isLoadingSpinner = false;

  constructor(
    private dialog: MatDialog,
    private untaggedService: UntaggedAnimalService,
    private translatePipe: TranslatePipe,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      transactionId: number;
      title: string;
    }
  ) {}

  viewReport(transactionId: number) {
    this.isLoadingSpinner = true;
    this.untaggedService.downloadUntaggedReport(transactionId).subscribe(
      (res: any) => {
        this.isLoadingSpinner = false;
        // const fileName = res.headers
        //   .get('Content-Disposition')
        //   .split('; ')[1]
        //   .split('=')[1];
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
        this.isLoadingSpinner = false;
      }
    );
  }
  closeDialog() {
    window.location.reload();
  }
}
