import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CompleteOwnerDetails } from '../models-owner-reg/get-ownerby-ownerID.model';

@Component({
  selector: 'app-registration-preview',
  templateUrl: './registration-preview.component.html',
  styleUrls: ['./registration-preview.component.css'],
})
export class RegistrationPreviewComponent implements OnInit {
  ownerDetails: CompleteOwnerDetails;
  affiliationStatus = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public ownerData: any,
    private dialogRef: MatDialogRef<RegistrationPreviewComponent>
  ) {}

  ngOnInit(): void {
    this.ownerDetails = this.ownerData['ownerData'];
    this.affiliationStatus = String(
      this.ownerDetails.affiliatedAgencyUnionOrPc
    );
  }

  dateFormatChange(date: String) {
    date = date.substring(0, 10);
    return date.split('-').reverse().join('/');
  }

  onClose(isReg: boolean) {
    this.dialogRef.close(isReg);
  }
}
