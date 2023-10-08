import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-upload-file-dialog',
  templateUrl: './upload-file-dialog.component.html',
  styleUrls: ['./upload-file-dialog.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [TranslatePipe],
})
export class UploadFileDialogComponent implements OnInit {
  isLoading = false;
  fileForm = this.fb.group({
    file: this.fb.control(null, { validators: [Validators.required] }),
  });
  supportedMimeTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UploadFileDialogComponent>,
   
  ) {}

  ngOnInit(): void {
    this.dialogRef.updateSize('620px');
  }

  handleFile(files: FileList) {
    if (files.length === 0) {
      return;
    }

    this.addFile(files.item(0));
  }

  onFileInputChange(event: Event) {
    const element = event.target as HTMLInputElement;

    const file =
      element.files && element.files?.length ? element.files[0] : null;

    this.addFile(file);
    console.log(file);
  }

  addFile(file: File) {
    if (!file) {
      return;
    }

    if (!this.supportedMimeTypes.includes(file.type)) {
      this.fileForm
        .get('file')
        .setErrors({ invalidMimeType: 'performanceRecording.excel_file_req' });
      return;
    }

    this.fileForm.get('file').patchValue(file);
  }

  onFileAreaClick(element: HTMLInputElement) {
    element.click();
  }

  onSubmit() {
    const file: File = this.fileForm?.value?.file;

    if (this.fileForm.invalid) {
      this.fileForm.markAllAsTouched();
      return;
    }

    this.dialogRef.close(file);
  }

  
}
