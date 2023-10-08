import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NumericValidation } from 'src/app/shared/utility/validation';
import { animalBreedingValidations } from 'src/app/shared/validatator';
import { SuccessDialogComponent } from '../../animal-breeding/success-dialog/success-dialog.component';
import { GenerateSampleIdsService } from './generate-sample-ids.service';
import { SampleID } from './models/sample-id.model';
import fileSaver from 'file-saver';
import { HttpRequest } from '@angular/common/http';
import { MasterConfig } from 'src/app/shared/master.config';
import { TranslatePipe } from '@ngx-translate/core';
import { DataServiceService } from 'src/app/shared/shareService/data-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-generate-sample-ids',
  templateUrl: './generate-sample-ids.component.html',
  styleUrls: ['./generate-sample-ids.component.css'],
  providers: [TranslatePipe],
})
export class GenerateSampleIdsComponent implements OnInit, OnDestroy {
  masterConfig = MasterConfig;
  cmnValidations = animalBreedingValidations.common;
  validationMsg = animalBreedingValidations.typing;
  isLoadingSpinner = false;
  searchForm: FormGroup;
  sampleIDs: SampleID[] = [];
  exported = false;
  userProjects = [];
  projectSub: Subscription;

  constructor(
    private fb: FormBuilder,
    private generateSampleIdService: GenerateSampleIdsService,
    private dialog: MatDialog,
    private translatePipe: TranslatePipe,
    private dataService: DataServiceService
  ) {}

  ngOnInit(): void {
    this.userProjects = JSON.parse(sessionStorage.getItem('user')).userProject;
    this.searchForm = this.fb.group({
      projectId: [],
      noOfIds: [
        null,
        [
          Validators.required,
          NumericValidation,
          Validators.max(1000),
          Validators.min(1),
        ],
      ],
    });
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

  onSubmit() {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    this.isLoadingSpinner = true;
    this.generateSampleIdService
      .generateSampleId(this.searchForm.value)
      .subscribe(
        (res) => {
          this.isLoadingSpinner = false;
          this.sampleIDs = [...this.sampleIDs, ...res];
        },
        () => (this.isLoadingSpinner = false)
      );
  }

  onExport(selectedSampleIds: SampleID[]) {
    const status = ['1'];

    const sampleIds = selectedSampleIds.map((sample) => sample.sampleId);

    this.isLoadingSpinner = true;
    this.generateSampleIdService
      .exportExcel({
        projectId: this.searchForm.value.projectId,
        sampleId: sampleIds,
        sampleIdStatus: status,
        modifiedBy: JSON.parse(sessionStorage.getItem('user'))?.userId,
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
              this.sampleIDs.length = 0;
              this.searchForm.reset();
            });
        },
        () => (this.isLoadingSpinner = false)
      );
  }

  ngOnDestroy(): void {
    this.projectSub.unsubscribe();
  }
}
