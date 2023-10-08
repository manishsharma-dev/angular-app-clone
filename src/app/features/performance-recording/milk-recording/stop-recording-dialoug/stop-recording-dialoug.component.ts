import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ArtificialInseminationService } from 'src/app/features/animal-breeding/artificial-insemination/artificial-insemination.service';

@Component({
  selector: 'app-stop-recording-dialoug',
  templateUrl: './stop-recording-dialoug.component.html',
  styleUrls: ['./stop-recording-dialoug.component.css']
})
export class StopRecordingDialougComponent implements OnInit {

  animalForm!: FormGroup;
  showStatusField: boolean = false
  isLoadingSpinner: boolean = false
  pregReason: any = []
  pregStatus: any = []
  milkingStatus: any = []
  isCalving: boolean = false
  isFormSubmit: boolean = false
  isLactationNoValid: boolean = false
  constructor(
    private fb: FormBuilder,
    private aiService: ArtificialInseminationService,
    private dialogRef: MatDialogRef<StopRecordingDialougComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      animal_id: string;
      isBreedingActivity: boolean;
      tagId: any
      lactationNo: any
    }
  ) { }
  ngOnInit(): void {
    this.animalForm = this.fb.group({
      animalId: [this.data.animal_id, [Validators.required]],
      reason: [null],
    });

    this.getPregnancyStatus()

  }

  markPregnancyStatus(event: Event): void {
    this.showStatusField = event.target['value'] == 'Y' ? true : false
  }
  submitStatus() {
    this.isFormSubmit = true
    if (this.animalForm.invalid || this.isLactationNoValid) {
      this.animalForm.markAllAsTouched();
      return;
    }

    this.isLoadingSpinner = true
    const formValue = {
      ...this.animalForm.value
    };
    formValue.pregnancyStatus = formValue.pregnancyStatus == 1 ? 'Y' : 'N'
    delete formValue.aiPregnancyReason
    this.aiService.updateAnimalDetails(formValue).subscribe(data => {
      this.dialogRef.close({ data: this.animalForm.value, isCalving: this.isCalving })
      this.isLoadingSpinner = false
      this.isFormSubmit = false
    },
      error => {
        this.isLoadingSpinner = false
      }
    )

  }


  getPregnancyStatus(): void {
    this.aiService.getCommonMaster('pd_result').subscribe(data => {
      this.pregStatus = data
    })
  }


  get searchInfo() {
    return this.animalForm.controls;
  }

}
