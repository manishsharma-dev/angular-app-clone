import { ownerDetails } from './../../owner-registration/models-owner-reg/owner-details.model';
import { ErrorMessage } from './../../owner-registration/models-owner-reg/error-message.model';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LatestEartagServiceValidation } from 'src/app/shared/utility/validation';
import { AnimalManagementService } from '../animal-management.service';
import { CompleteOwnerDetails } from '../../owner-registration/models-owner-reg/get-ownerby-ownerID.model';
import { LatestTags } from '../models-animal-reg/latest-tag.model';

@Component({
  selector: 'app-latest-animal-tag',
  templateUrl: './latest-animal-tag.component.html',
  styleUrls: ['./latest-animal-tag.component.css'],
})
export class LatestAnimalTagComponent implements OnInit {
  isLoadingSpinner = false;
  searchForm: FormGroup;
  newtagResp: LatestTags;
  ownerDetailsByID: CompleteOwnerDetails;
  isTagDetailsVisible = false;
  isOwnerActive = true;
  constructor(
    private _formBuilder: FormBuilder,
    private animalMS: AnimalManagementService
  ) {}

  ngOnInit(): void {
    this.searchForm = this._formBuilder.group({
      searchValue: ['', [Validators.required, LatestEartagServiceValidation]],
    });
  }

  get searchInfo() {
    return this.searchForm.controls;
  }

  searchResults(oldTag: string) {
    this.searchForm.markAllAsTouched();
    if (this.searchForm.valid) {
      this.isLoadingSpinner = true;
      this.animalMS.fetchLatestTagId(oldTag).subscribe(
        (result) => {
          this.newtagResp = result;
          if (this.newtagResp) {
            this.isTagDetailsVisible = true;
            this.ownerDetailsByID = this.newtagResp.ownerDetails;
            this.isOwnerActive =
              this.newtagResp?.ownerDetails?.registrationStatus == '2'
                ? false
                : true;
          }
          this.isLoadingSpinner = false;
        },
        (err) => {
          this.isTagDetailsVisible = false;
          this.isLoadingSpinner = false;
          this.newtagResp = {} as LatestTags;
          this.ownerDetailsByID = {} as CompleteOwnerDetails;
        }
      );
    }
  }

  resetValue() {
    this.searchForm.patchValue({ searchValue: '' });
    this.newtagResp = {} as LatestTags;
    this.ownerDetailsByID = {} as CompleteOwnerDetails;
    this.isTagDetailsVisible = false;
  }
}
