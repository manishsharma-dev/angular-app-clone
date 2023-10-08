import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CompleteOwnerDetails } from '../../owner-registration/models-owner-reg/get-ownerby-ownerID.model';

@Component({
  selector: 'app-view-organization',
  templateUrl: './view-organization.component.html',
  styleUrls: ['./view-organization.component.css'],
})
export class ViewOrganizationComponent implements OnInit {
  orgDetailsForm!: FormGroup;
  ownerInfo!: CompleteOwnerDetails;
  isLoadingSpinner: boolean = false;
  organizationDetails!: CompleteOwnerDetails;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      orgData: CompleteOwnerDetails;
    }
  ) {}

  ngOnInit(): void {
    this.organizationDetails = this.data.orgData;
    this.orgDetailsForm = this.fb.group({
      orgAddress: [this.organizationDetails.orgAddress],
      orgPin: [this.organizationDetails.orgPin],
      orgRegistrationNo: [this.organizationDetails.orgRegistrationNo],
      orgType: [this.organizationDetails.orgTypeDesc],
      stateCd: [this.organizationDetails.orgStateCd],
      districtCdAreaOperating: [
        this.organizationDetails.districtNameAreaOperating,
      ],
      mobileNo: [this.organizationDetails?.orgMobileNo],
    });
    this.orgDetailsForm.disable();
  }

  get orgDetails() {
    return this.orgDetailsForm.controls;
  }
}
