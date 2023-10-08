import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { CommonMaster } from 'src/app/features/animal-health/animal-treatment/models/common-master.model';
import { HealthService } from 'src/app/features/animal-health/health.service';
import { AnimalHealthConfig } from 'src/app/shared/animal-health.config';
import { animalBreedingValidations } from 'src/app/shared/validatator';
import { GenerateSampleIdsService } from '../generate-sample-ids.service';
import fileSaver from 'file-saver';
import { SuccessDialogComponent } from 'src/app/features/animal-breeding/success-dialog/success-dialog.component';
import { SampleID } from '../models/sample-id.model';
import { HttpRequest } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { Subscription } from 'rxjs';
import { PrService } from '../../pr.service';

@Component({
  selector: 'app-previous-sample-ids',
  templateUrl: './previous-sample-ids.component.html',
  styleUrls: ['./previous-sample-ids.component.css'],
  providers: [TranslatePipe],
})
export class PreviousSampleIdsComponent implements OnInit {
  isLoadingSpinner = false;
  cmnValidations = animalBreedingValidations.common;
  sampleIdStatus: CommonMaster[] = [];
  userProjects = [];

  isTableVisible = false;

  searchForm = this.fb.group({
    projectId: [],
    fromDate: [
      moment(this.prService.currentDate).subtract(1, 'day'),
      { validators: [Validators.required], updateOn: 'blur' },
    ],
    toDate: [
      moment(this.prService.currentDate),
      { validators: [Validators.required], updateOn: 'blur' },
    ],
    sampleIdStatus: [null, [Validators.required]],
  });

  sampleIDs: any[] = [];
  projectSub: Subscription;

  constructor(
    private fb: FormBuilder,
    private healthService: HealthService,
    private generateSampleIdsService: GenerateSampleIdsService,
    private dialog: MatDialog,
    private location: Location,
    private translatePipe: TranslatePipe,
    private dataService: DataServiceService,
    private prService: PrService
  ) {}

  ngOnInit(): void {
    this.userProjects = JSON.parse(sessionStorage.getItem('user')).userProject;

    this.isLoadingSpinner = true;
    this.healthService
      .getCommonMaster(AnimalHealthConfig.commonMasterKeys.sampleIdStatus)
      .subscribe(
        (res) => {
          this.isLoadingSpinner = false;
          this.sampleIdStatus = res;
        },
        () => (this.isLoadingSpinner = false)
      );
    this.getprojectInformation();
  }

  getprojectInformation(): void {
    this.projectSub = this.dataService.fetchProjectInfo.subscribe(
      (projectID) => {
        if (projectID) {
          this.searchForm.get('projectId').patchValue(projectID);
        }
      }
    );
  }

  onReset() {
    this.isTableVisible = false;
  }

  onSubmit() {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    this.isLoadingSpinner = true;
    this.sampleIDs.length = 0;
    // this.isTableVisible = false;
    const reqObj = this.searchForm.value;
    reqObj.toDate = moment(reqObj.toDate).format('YYYY-MM-DD');
    reqObj.fromDate = moment(reqObj.fromDate).format('YYYY-MM-DD');

    this.generateSampleIdsService
      .getPreviousSampleIds(this.searchForm.value)
      .subscribe(
        (res) => {
          this.isLoadingSpinner = false;
          // if (!(res && res?.length)) {
          //   return;
          // }
          // const fromDate = moment(this.searchForm.value.from);
          // const toDate =moment( this.searchForm.value.to);

          this.sampleIDs = res ?? [];
          this.isTableVisible = true;
        },
        () => (this.isLoadingSpinner = false)
      );
  }

  onExport(selectedSampleIds: SampleID[]) {
    const status = ['1', '2', '3'];

    const sampleIds = selectedSampleIds.map((sample) => sample.sampleId);

    this.isLoadingSpinner = true;
    this.generateSampleIdsService
      .exportExcel({
        projectId: this.searchForm.value.projectId,
        sampleId: sampleIds,
        sampleIdStatus: status,
        isHistory: true,
      })
      .subscribe(
        (res: HttpRequest<any>) => {
          this.isLoadingSpinner = false;

          const fileName = res.headers
            .get('Content-Disposition')
            ?.split('; ')[1]
            ?.split('=')[1];

          let blob: any = new Blob([res.body], {
            type: 'application/octet-stream',
          });

          fileSaver.saveAs(blob, fileName);

          this.dialog
            .open(SuccessDialogComponent, {
              data: {
                title: `${this.translatePipe.transform(
                  'performanceRecording.sample_id'
                )} [${selectedSampleIds.length}] ${this.translatePipe.transform(
                  'performanceRecording.successfully_exported'
                )}`,
              },
            })
            .afterClosed()
            .subscribe(() => {
              this.location.back();
            });
        },
        () => (this.isLoadingSpinner = false)
      );
  }

  get today() {
    return moment(this.prService.currentDate).format('YYYY-MM-DD');
  }

  ngOnDestroy(): void {
    this.projectSub.unsubscribe();
  }
}
