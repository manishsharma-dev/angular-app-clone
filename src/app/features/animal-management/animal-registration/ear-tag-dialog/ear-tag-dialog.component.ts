import { AnimalManagementService } from './../animal-management.service';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/shared/user/user.service';
import { existingEarTagValidator } from 'src/app/shared/utility/directives/unique-email.directive';
import { SnackBarMessage } from '../../../../shared/snack-bar';
import {
  EartagValidation,
  getFileSize,
} from '../../../../shared/utility/validation';
import { EarTagChangeService } from '../ear-tag-change/ear-tag-change.service';
import { AnimalManagementConfig } from 'src/app/shared/animal-management.config';
import { OwnerDetailsService } from '../../owner-registration/owner-details.service';
import { CommonData } from '../../owner-registration/models-owner-reg/common-data.model';
import { AppService } from 'src/app/shared/shareService/app.service';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import moment from 'moment';

@Component({
  selector: 'app-ear-tag-dialog',
  templateUrl: './ear-tag-dialog.component.html',
  styleUrls: ['./ear-tag-dialog.component.css'],
  providers: [TranslatePipe],
})
export class EarTagDialogComponent implements OnInit {
  earTagForm!: FormGroup;
  isLoadingSpinner: boolean = false;
  dateToday: Date;
  taggingDate: string = '';
  currentDate: string = '';
  istransactionHistory: any;
  lastTranscDate = new Date(null);
  earTagReasons!: CommonData[];
  selectedFile: File = {} as File;
  uploadedFileError: string = '';
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      tagNumber: string;
      animalId: string;
      taggingDate: Date;
      registrationDate: string;
    },
    private _snackBar: MatSnackBar,
    private fb: FormBuilder,
    private earTS: EarTagChangeService,
    private dialog: MatDialog,
    private animalMS: AnimalManagementService,
    private ownerDS: OwnerDetailsService,
    private userService: UserService,
    private appService: AppService,
    private dialogRef: MatDialogRef<EarTagDialogComponent>,
    private translatePipe: TranslatePipe
  ) {}

  ngOnInit(): void {
    // this.earTS.checkAnyAnimalTransactionForTagId();
    // this.ownerDS.getCommonData('reason_for_tag_change').subscribe((reason) => {
    //   this.earTagReasons = reason;
    //   this.earTagReasons = this.earTagReasons.filter(
    //     (crrObj) => +crrObj.cd != 3
    //   );
    // });
    this.checkTransactionForTagId(this.data.tagNumber);
    this.getCurrentDate();
    this.earTagForm = this.fb.group({
      tagEffectiveFrom: [this.dateToday, Validators.required],
      reasonForChange: ['', Validators.required],
      tagId: [
        ,
        [Validators.required, EartagValidation],
        [existingEarTagValidator(this.userService)],
      ],
      animalId: [this.data.animalId],
      animalPic: new FormControl('', {
        validators: [Validators.required],
      }),
    });
    this.dateFormatChange(this.data.taggingDate);
    this.getLastTransactiondate();
  }

  getCurrentDate() {
    this.isLoadingSpinner = true;
    this.animalMS.getCurrentDate().subscribe(
      (date) => {
        this.dateToday = new Date(date.value);
        this.earTagForm.patchValue({ tagEffectiveFrom: this.dateToday });
        this.earTagForm.updateValueAndValidity();
        this.isLoadingSpinner = false;
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  dateFormatChange(date: Date) {
    return moment(date).format('DD/MM/YYYY');
  }

  getLastTransactiondate() {
    this.isLoadingSpinner = true;
    this.animalMS.getLastTransactionDate([this.data.animalId]).subscribe(
      (date) => {
        this.isLoadingSpinner = false;
        if (date.value) {
          this.lastTranscDate = new Date(date.value);
        }
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  getPastDate(): string {
    var tempDate = new Date(this.dateToday);
    let daysLimit =
      +AnimalManagementConfig.earTagChangeDateLimit?.defaultValue || 30;
    tempDate.setDate(tempDate.getDate() - daysLimit);
    this.currentDate = (
      tempDate > this.lastTranscDate ? tempDate : this.lastTranscDate
    )
      .toLocaleString()
      .split(',')[0];
    let date = moment(Date.parse(this.currentDate)).format('YYYY-MM-DD');
    return date;
  }

  openSnackBar() {
    if (this.earTagForm.invalid || this.uploadedFileError) {
      this.earTagForm.markAllAsTouched();
    } else {
      let formValue = { ...this.earTagForm.value };
      var formData: any = new FormData();
      formValue.tagEffectiveFrom = moment(formValue.tagEffectiveFrom).format(
        'YYYY-MM-DD'
      );
      formData.append('animalId', formValue.animalId);
      formData.append('animalPic', formValue.animalPic);
      formData.append('reasonForChange', formValue.reasonForChange);
      formData.append('tagEffectiveFrom', formValue.tagEffectiveFrom);
      formData.append('tagId', formValue.tagId);
      // payload['locationInfo'] = AnimalManagementConfig.locationInfoObj;
      this.appService.getModulebyUrl('/animal/eartagchange');
      this.earTS.setNewTagNumber(this.earTagForm.value.newTagNo);
      this.isLoadingSpinner = true;
      this.earTS.earTagChange(formData).subscribe(
        (data) => {
          this.earTS.setEarFlagStatus(true);

          if (data['supervisorName']) {
            this.dialog.open(ConfirmationDialogComponent, {
              data: {
                title: this.translatePipe.transform('common.info_label'),
                icon: 'assets/images/info.svg',
                message:
                  this.translatePipe.transform(
                    'animalDetails.ear-tag-success-supervisor'
                  ) + String(data['supervisorName']),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
              },
              panelClass: 'common-info-dialog',
            });
          } else {
            this.dialog.open(ConfirmationDialogComponent, {
              data: {
                title: this.translatePipe.transform('common.info_label'),
                icon: 'assets/images/info.svg',
                message: this.translatePipe.transform(
                  'animalDetails.ear_tag_changed_successfully'
                ),
                primaryBtnText:
                  this.translatePipe.transform('common.ok_string'),
              },
              panelClass: 'common-info-dialog',
            });
          }

          this.isLoadingSpinner = false;
          this.dialogRef.close();
        },
        (err) => {
          this.isLoadingSpinner = false;
        }
      );
    }
  }
  checkTransactionForTagId(tagId: any) {
    this.ownerDS.getCommonData('reason_for_tag_change').subscribe((reason) => {
      this.earTagReasons = reason.filter(
        String(this.data.tagNumber).length === 11
          ? (crrObj) => +crrObj.cd != 4 && +crrObj.cd != 5
          : (crrObj) => +crrObj.cd < 4
      );
      this.earTS
        .checkAnyAnimalTransactionForTagId(tagId)
        .subscribe((data: any) => {
          this.istransactionHistory = data;
          if (data) {
            this.earTagReasons = this.earTagReasons.filter(
              (crrObj) => +crrObj.cd != 3
            );
          }
        });
    });
  }

  onFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    this.selectedFile = (event.target as HTMLInputElement)?.files![0];
    this.earTagForm.patchValue({ animalPic: this.selectedFile });
    this.earTagForm.patchValue({
      description: file.name.split('.')[0],
    });
    this.isLoadingSpinner = true;
    let data = getFileSize(file);
    if (!data) {
      this.uploadedFileError = this.translatePipe.transform(
        'common.image_size_exceed'
      );
      this.isLoadingSpinner = false;
      return;
    }
    this.animalMS.validateFile(this.selectedFile).subscribe(
      (isValid) => {
        this.isLoadingSpinner = false;
        this.uploadedFileError = isValid
          ? ''
          : this.translatePipe.transform('common.image_size');
      },
      (error) => {
        this.isLoadingSpinner = false;
      }
    );
    this.earTagForm.get('animalPic')?.updateValueAndValidity();
  }
}
