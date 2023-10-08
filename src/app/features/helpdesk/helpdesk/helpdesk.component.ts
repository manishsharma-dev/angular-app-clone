import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { getSessionData } from 'src/app/shared/shareService/storageData';
import { animalHealthValidations } from 'src/app/shared/validatator';
import { HelpdeskService } from '../helpdesk.service';
import { UserManual } from '../models/user-manual.model';
import { HttpClient } from '@angular/common/http';
import FileSaver from 'file-saver';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  providers: [TranslatePipe],
  selector: 'app-helpdesk',
  templateUrl: './helpdesk.component.html',
  styleUrls: ['./helpdesk.component.css'],
})
export class HelpdeskComponent implements OnInit {
  validationMsg = animalHealthValidations.newCase;
  isLoadingSpinner: boolean = false;
  moduleList: any[] = [];
  subModuleList: any[] = [];
  helpdeskForm: FormGroup;
  videoList: UserManual['videoList'] = [];
  pdfList: UserManual['pdfList'] = [];
  constructor(
    private translatePipe: TranslatePipe,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private _helpdeskService: HelpdeskService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.createHelpdeskForm();
    this.getModuleList();

    this.helpdeskForm.get('moduleCd').valueChanges.subscribe((value: any) => {
      if (value) {
        this.getSubModuleList(value);
      } else {
        this.subModuleList = [];
      }
    });
  }

  createHelpdeskForm() {
    this.helpdeskForm = this.fb.group({
      moduleCd: [null, [Validators.required]],
      subModuleCd: [null, [Validators.required]],
    });
    this.helpdeskForm.get('moduleCd').valueChanges.subscribe(() => {
      this.helpdeskForm.get('subModuleCd').reset();
    });
  }

  getModuleList() {
    this._helpdeskService.getModuleList().subscribe((modules: any) => {
      this.moduleList = modules.sort((a, b) => a.seqNo - b.seqNo);
    });
  }

  getSubModuleList(moduleCd: number) {
    this._helpdeskService
      .getSubmoduleList(moduleCd)
      .subscribe((modules: any) => {
        this.subModuleList = modules.sort((a, b) => a.seqNo - b.seqNo);
      });
  }

  get formControls() {
    return this.helpdeskForm.controls;
  }

  searchVideos(helpdeskForm) {
    helpdeskForm.markAllAsTouched();
    if (helpdeskForm.invalid) return;
    this.videoList = [];
    this.pdfList = [];
    this.isLoadingSpinner = true;
    this._helpdeskService.getUserManualUrl(helpdeskForm.value).subscribe(
      (data) => {
        if (data?.videoList && data.videoList?.length) {
          this.videoList = data.videoList;
        }

        if (data?.pdfList && data.pdfList?.length) {
          this.pdfList = data.pdfList;
        }
        this.isLoadingSpinner = false;
      },
      () => (this.isLoadingSpinner = false)
    );
  }

  downloadFile(manual: UserManual['pdfList'][0]) {
    const requestOptions: Object = {
      observe: 'response',
      responseType: 'blob' as 'json',
    };
    this.http.get<any>(manual.manualUrl, requestOptions).subscribe((res) => {
      let blob: any = new Blob([res.body], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      FileSaver.saveAs(blob, manual.title);
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: this.translatePipe.transform('common.info_label'),
          icon: 'assets/images/info.svg',
          message: this.translatePipe.transform(
            'animalTreatmentSurgery.prescription_downloaded'
          ),
          primaryBtnText: this.translatePipe.transform('common.ok_string'),
        },
        panelClass: 'common-info-dialog',
      });
    });
  }

  OnPlay(element: HTMLVideoElement) {
    element.requestFullscreen();
  }
}
