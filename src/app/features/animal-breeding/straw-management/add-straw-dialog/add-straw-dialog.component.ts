import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';
import { SnackBarMessage } from 'src/app/shared/snack-bar';
import { ArtificialInseminationService } from '../../artificial-insemination/artificial-insemination.service';
import {
  commonData,
  StatusDialogComponent,
} from '../../artificial-insemination/status-dialog/status-dialog.component';
import { SuccessDialogComponent } from '../../success-dialog/success-dialog.component';
import { StrawManagementService } from '../straw-management.service';
import FileSaver from 'file-saver';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { TranslatePipe } from '@ngx-translate/core';
import { animalBreedingPRConfig } from 'src/app/shared/animal-breeding-pr.config';

@Component({
  selector: 'app-add-straw-dialog',
  templateUrl: './add-straw-dialog.component.html',
  styleUrls: ['./add-straw-dialog.component.css'],
  providers: [TranslatePipe],
})
export class AddStrawDialogComponent implements OnInit {
  isLoadingSpinner: boolean = false;
  pregReason: commonData[] = [];
  pregStatus: commonData[] = [];
  milkingStatus: commonData[] = [];
  isCalving: boolean = false;
  isFormSubmit: boolean = false;
  isLactationNoValid: boolean = false;
  breedingMinDate: number = 30;
  fileToUpload: File = null;
  constructor(
    private aiService: ArtificialInseminationService,
    private strawManagementService: StrawManagementService,
    private dialogRef: MatDialogRef<SuccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      animal_id: string;
      tagId: any;
    },
    private _snackBar: MatSnackBar,
    private dialog: MatDialog,
    private translatePipe: TranslatePipe
  ) {}
  ngOnInit(): void {}

  submitStatus() {
    // this.aiService.updateAnimalDetails(formValue).subscribe((data:any)=>{
    //   if(data.animalId){
    //     this.dialogRef.close({data:data?.milkingStatus})
    //   }
    //   //
    //   this.isLoadingSpinner = false
    //   this.isFormSubmit = false
    // },
    // error=>{
    //   this.isLoadingSpinner = false
    // }
    // )
  }

  getMilikingStatus(): void {
    this.aiService.getCommonMaster('milking_status').subscribe((data: any) => {
      this.milkingStatus = data;
      this.milkingStatus = this.milkingStatus.filter(
        (value) => value?.cd === 3
      );
    });
  }

  onFileAreaClick(element: HTMLInputElement) {
    // if (this.uploadedMedia.length === 5) {
    //   this.showError('Alert', 'Cannot add more than 5 images!');
    //   return;
    // }

    element.click();
  }

  onFileSelect(files: FileList) {
    this.fileToUpload = files.item(0);
  }
  isUploading() {
    if (!this.fileToUpload) {
      return false;
    }

    return this.fileToUpload;
  }
  uploadFile() {
    if (this.fileToUpload) {
      this.isLoadingSpinner = true;
      const formData: FormData = new FormData();
      formData.append(
        'bullDetailExcel',
        this.fileToUpload,
        this.fileToUpload.name
      );
      // formData.append('userId','RAJ06290')
      this.strawManagementService.validateExcel(formData).subscribe(
        (data: any) => {
          this.isLoadingSpinner = false;
          this.dialogRef.close();
          this.dialog
            .open(ConfirmationDeleteDialogComponent, {
              data: {
                title: 'common.alert',
                message: 'animalBreeding.commonLabel.quantity_alter',
                icon: 'assets/images/alert.svg',
                primaryBtnText: 'common.ok',
              },
              panelClass: 'common-alert-dialog',
            })
            .afterClosed()
            .subscribe((result) => {
              this.dialog
                .open(SuccessDialogComponent, {
                  data: {
                    title: data,
                  },
                  width: '500px',
                  panelClass: 'makeItMiddle',
                })
                .afterClosed();
            });
        },
        (error) => {
          this.isLoadingSpinner = false;
        }
      );
    } else {
      const snackbarType = {
        message: 'Please add file',
        colour: 'red-snackbar',
      };
      this.snackBar(snackbarType);
    }
  }
  deleteFile() {
    this.fileToUpload = null;
  }

  private snackBar(snack_type: object): void {
    new SnackBarMessage(this._snackBar).onSucessMessage(
      snack_type['message'],
      'Ok',
      'right',
      'top',
      snack_type['colour']
    );
  }

  downloadSampleTemplate() {
    this.isLoadingSpinner = true;
    this.strawManagementService
      .getSemenStockTemplate(animalBreedingPRConfig.strawMgmtTemplateFileName)
      .subscribe(
        (res) => {
          this.isLoadingSpinner = false;
          const fileName = res.headers
            .get('Content-Disposition')
            .split('; ')[1]
            .split('=')[1];
          let blob: any = new Blob([res.body], { type: 'application/pdf' });
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
        () => (this.isLoadingSpinner = false)
      );
  }
}
