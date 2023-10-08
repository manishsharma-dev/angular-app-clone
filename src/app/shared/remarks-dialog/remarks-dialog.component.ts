import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorklistService } from '../worklist/worklist.service';

@Component({
  selector: 'app-remarks-dialog',
  templateUrl: './remarks-dialog.component.html',
  styleUrls: ['./remarks-dialog.component.css'],
})
export class RemarksDialogComponent implements OnInit {
  isLoadingSpinner: boolean = false;
  remarksForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      crrData: any;
      actionToPerform: number;
      // id: number;
      // subTitle?: string,
      // title: string;
      // message: string;
      // primaryBtnText: string;
      // secondaryBtnText: string;
      // colour: string;
    },
    private dialogRef: MatDialogRef<RemarksDialogComponent>,
    private ws: WorklistService,
    private _formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    console.log(this.data.crrData);
    this.remarksForm = this._formBuilder.group({
      remarks: ['', Validators.required],
    });
    // console.log('Data in Remarks Dialog', this.data);
    // console.log('Data in Remarks Dialog', this.remarksForm.value.remarks);
  }

  get remarksInfo() {
    return this.remarksForm.controls;
  }

  onSubmit() {
    if (this.remarksForm.valid) {
      this.isLoadingSpinner = true;
      this.ws
        .performAction(
          this.data.crrData,
          this.data.actionToPerform,
          this.remarksForm.value.remarks
        )
        .subscribe(
          (data: any) => {
            this.isLoadingSpinner = false;
            this.closeDialog();
          },
          (error) => {
            this.isLoadingSpinner = false;
          }
        );
    }
  }

  closeDialog() {
    this.dialogRef.close(true);
  }
}
