import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-update-result',
  templateUrl: './update-result.component.html',
  styleUrls: ['./update-result.component.css']
})
export class UpdateResultComponent implements OnInit {
  labTestingForm: FormGroup;
  constructor(private _fb: FormBuilder,private dialogRef: MatDialogRef<UpdateResultComponent>,) { }

  ngOnInit(): void {
    this.labTestingForm = this._fb.group({
      resultFile: [null],
      remarks: [""]
    })
  }

  resetForm() {
    this.labTestingForm.reset();
  }

  saveLabResults() {
    this.dialogRef.close();
  }

}
