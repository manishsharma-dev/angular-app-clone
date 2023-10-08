import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AnimalTreatmentService } from '../animal-treatment.service';
import fileSaver from 'file-saver';
import { PrescriptionRes } from '../models/prescription.model';
import { HealthService } from '../../health.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-view-prescription',
  templateUrl: './view-prescription.component.html',
  styleUrls: ['./view-prescription.component.css'],
  providers: [TranslatePipe],
})
export class ViewPrescriptionComponent implements OnInit {
  prescriptionRes!: PrescriptionRes;
  isLoadingSpinner = false;
  private translatePipe: TranslatePipe;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { caseId: number; followUpNo: number },
    private treatmentService: AnimalTreatmentService,
    private healthService: HealthService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.isLoadingSpinner = true;

    this.treatmentService
      .viewPrescription(this.data.caseId, this.data.followUpNo)
      .subscribe((res) => {
        if (this.healthService.isErrorResponse(res)) {
          return;
        }
        this.isLoadingSpinner = false;
        this.prescriptionRes = res;
      });
  }

  formatDate(date: string) {
    return moment(date).format('DD/MM/YYYY');
  }

  getAnimalAge(dob: string) {
    const monthCount = moment(sessionStorage.getItem('serverCurrentDateTime')).diff(moment(dob), 'months');

    return this.treatmentService.getWords(monthCount);
  }

  downloadPrescription(prescriptionDetails) {
    this.isLoadingSpinner = true;

    this.treatmentService

      .downloadPrescription({
        caseId: prescriptionDetails.caseId,

        followUpNo: this.data.followUpNo,
      })

      .subscribe(
        (res: any) => {
          this.isLoadingSpinner = false;
          const fileName = res.headers
            .get('Content-Disposition')
            .split('; ')[1]
            .split('=')[1];
          let blob: any = new Blob([res.body], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);

          fileSaver.saveAs(blob, fileName);
          this.dialog.open(ConfirmationDialogComponent, {
            data: {
              title: this.translatePipe.transform('common.info_label'),
              icon: 'assets/images/info.svg',
              message: this.translatePipe.transform(
                'animalTreatmentSurgery.prescription_downloaded'
              ),
              primaryBtnText: this.translatePipe.transform('common.ok_string'),
            },
            panelClass: 'common-info-dialog',
          });
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
  }
}
