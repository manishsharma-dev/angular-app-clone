import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { SaveUntagged } from '../models/SaveUntagged.model';
import { SaveDownloadDialogComponent } from '../save-download-dialog/save-download-dialog.component';
import { UntaggedAnimalService } from '../untagged-animal.service';
import { CurrentRoute } from '../untagged-form/untagged-form.component';
import moment from 'moment';
@Component({
  selector: 'app-preview-detail-dialog',
  templateUrl: './preview-detail-dialog.component.html',
  styleUrls: ['./preview-detail-dialog.component.css'],
  providers: [TranslatePipe],
})
export class PreviewDetailDialogComponent implements OnInit {
  requestorName: SaveUntagged[] = [];
  mobileNumber: SaveUntagged[] = [];
  prescription: SaveUntagged[] = [];
  ailmentCd: SaveUntagged[] = [];
  speciesCd: SaveUntagged[] = [];
  diseaseCd: SaveUntagged[] = [];
  villageCd: SaveUntagged[] = [];
  villageNames: SaveUntagged[] = [];
  Successmessage: SaveUntagged[] = [];
  transactionId: SaveUntagged[] = [];
  noTagReason: SaveUntagged[] = [];
  isLoadingSpinner: boolean = false;
  currentRoute: CurrentRoute;
  constructor(
    public dialog: MatDialog,
    private untaggedService: UntaggedAnimalService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      formData: any;
      currentRoute: CurrentRoute;
    }
  ) { }

  ngOnInit(): void {
    this.requestorName = this.data.formData.requestorName;
    this.mobileNumber = this.data.formData.requestorMobNo;
    this.prescription = this.data.formData.prescription;
    this.mobileNumber = this.data.formData.requestorMobNo;
    this.ailmentCd = this.data.formData.ailmentCd?.value;
    this.speciesCd = this.data.formData.speciesCd?.value;
    this.diseaseCd = this.data.formData.diseaseCd?.diseaseDesc;
    this.prescription = this.data.formData.prescription;
    this.villageNames = this.data.formData.villages.villageName;
    this.villageCd = this.data.formData.villages.villageCd;

    this.noTagReason =
      this.data.formData.noTagReason?.cd === 0
        ? this.data.formData.specifyReason
        : this.data.formData.noTagReason.value;
  }
  get today() {
    return moment(sessionStorage.getItem('serverCurrentDateTime')).format('YYYY-MM-DD');
  }
  onSubmit(): void {
    let request = this.data.formData;
    request = {
      ...this.data.formData,
      treatmentRecordDate: moment(this.today).format('YYYY-MM-DD'),
      diseaseCd: request['diseaseCd']?.diseaseCd ?? '',
      minorAilmentCd: request['ailmentCd']?.cd,
      prescriptionRemarks: request['prescription'],
      noTagReasonRemarks: request['specifyReason'],
      noTagReason: request['noTagReason']?.cd,
      villageCd: this.villageCd,
      speciesCd: request['speciesCd']?.cd,
    };
    delete request.villages;
    delete request.ailmentCd;
    delete request.prescription;
    delete request.specifyReason;
    this.isLoadingSpinner = true;
    this.untaggedService.saveUntaggedAnimal(request).subscribe(
      (res: any) => {
        this.Successmessage = res.msg.msgDesc;
        this.transactionId = res.data.transactionId;
        this.isLoadingSpinner = false;
        this.openDialog();
      },
      (err) => (this.isLoadingSpinner = false)
    );
  }

  openDialog() {
    this.dialog.open(SaveDownloadDialogComponent, {
      disableClose: true,
      data: {
        title: this.Successmessage,
        transactionId: this.transactionId,
      },
      width: '500px',
    });
  }
}
