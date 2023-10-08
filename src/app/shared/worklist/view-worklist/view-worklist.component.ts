import { AnimalDetailService } from './../../../features/animal-management/animal-registration/animal-details/animal-detail.service';
import { WorklistService } from './../worklist.service';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';
import { AnimalDetails } from 'src/app/features/animal-management/animal-registration/models-animal-reg/animal-details.model';

@Component({
  selector: 'app-view-worklist-details',
  templateUrl: './view-worklist.component.html',
  styleUrls: ['./view-worklist.component.css'],
  // encapsulation: ViewEncapsulation.None,
})
export class ViewWorkListComponent implements OnInit {
  isLoadingSpinner: boolean = false;
  viewWorkListForm: FormGroup;
  workListFilterData: any = [];
  completeAnimalDetails!: AnimalDetails;
  isOwnerActive = true;
  timeOfDeath = '';

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      crrData: any;
      selectedUserTab: boolean;
    },
    private dialogRef: MatDialogRef<ViewWorkListComponent>,
    private _formBuilder: FormBuilder,
    private ws: WorklistService,
    private animalDS: AnimalDetailService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.viewWorkListForm = this._formBuilder.group({
      remarks: [
        {
          value: this.data.crrData[0].rejectionRemarks,
          disabled: this.data.crrData[0].rejectionRemarks,
        },
        Validators.required,
      ],
    });
    if (this.data.crrData[0].animalId) {
      this.getAnimalDetails(this.data.crrData[0].animalId);
    }
  }

  get worklistInfo() {
    return this.viewWorkListForm.controls;
  }

  isDataArray(valueToBeChecked: String | Array<string>) {
    if (Array.isArray(valueToBeChecked)) {
      return true;
    } else {
      return false;
    }
  }

  formatDate(value: string) {
    let dateAndTime = value?.split(' ');
    let date = new Date(dateAndTime[0]);
    if (!this.timeOfDeath) {
      this.timeOfDeath = moment(new Date(value)).format('HH:mm');
      this.cdRef.detectChanges();
    }
    return moment(date).format('DD/MM/YYYY');
  }

  isDataObject(valueToBeChecked) {
    if (typeof valueToBeChecked === 'object' && valueToBeChecked !== null) {
      return true;
    } else {
      return false;
    }
  }

  dateFormatChange(date: Date) {
    return moment(date).format('DD/MM/YYYY');
  }

  performActionOnWorklist(actionToPerform: number) {
    if (this.viewWorkListForm.invalid) {
      this.viewWorkListForm.markAllAsTouched();
      return;
    } else {
      this.isLoadingSpinner = true;
      this.ws
        .performAction(
          [this.data.crrData[0].requestId],
          actionToPerform,
          this.viewWorkListForm.value.remarks
        )
        .subscribe(
          (data) => {
            this.workListFilterData = data;
            this.isLoadingSpinner = false;
            this.dialogRef.close('statusUpdated');
          },
          (error) => {
            this.isLoadingSpinner = false;
          }
        );
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  // dateFormatChange(date: String) {
  //   date = date.substring(0, 10);
  //   return date.split('-').reverse().join('/');
  // }

  getAnimalDetails(animalId: string) {
    this.isLoadingSpinner = true;
    this.animalDS.getAnimalDetails(animalId).subscribe(
      (animalDetails: AnimalDetails) => {
        this.completeAnimalDetails = animalDetails;
        this.isOwnerActive =
          this.completeAnimalDetails.ownerDetails.registrationStatus == '2'
            ? false
            : true;
        this.isLoadingSpinner = false;
      },
      (err) => {
        this.isLoadingSpinner = false;
      }
    );
  }

  calculateAge(months: number) {
    const year = Math.floor(months / 12);
    const month = months % 12;
    return String(year) + 'Y' + ' ' + String(month) + 'M';
  }
}
