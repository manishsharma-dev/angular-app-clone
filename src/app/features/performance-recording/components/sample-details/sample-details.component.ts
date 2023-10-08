import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TreatmentResponseDialogComponent } from 'src/app/features/animal-health/treatment-response-dialog/treatment-response-dialog.component';
import { MasterConfig } from 'src/app/shared/master.config';
import { BreedingUpdateSamplesComponent } from '../breeding-update-samples/breeding-update-samples.component';

type ParentComponent = 'milkSampling' | 'geneticAnalysis';

@Component({
  selector: 'app-sample-details',
  templateUrl: './sample-details.component.html',
  styleUrls: ['./sample-details.component.css'],
})
export class SampleDetailsComponent implements OnChanges, OnInit {
  masterConfig = MasterConfig;
  sampleDetails = new MatTableDataSource([]);
  sampleTableColumns = [
    'sampleId',
    'tagId',
    'testDate',
    'examinationType',
    'examinationSubType',
    'result',
  ];
  geneticTableColumns = [
    'sampleId',
    'tagId',
    'testDate',
    'examinationType',
    'examinationSubType',
    'testType',
    'geneticResult',
  ];

  @Input() sampleList = [];
  @Input() parentComponent: ParentComponent = 'milkSampling';
  @Input() isTestTypeRequired = true;
  @Output() viewReport = new EventEmitter<any>();
  @Output() sampleUpdated = new EventEmitter();

  constructor(private dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sampleList']) {
      this.sampleDetails.data = this.sampleList;
    }
    if (changes['parentComponent']) {
      if (this.parentComponent === 'geneticAnalysis') {
        this.sampleTableColumns.splice(5, 0, 'labName');
      }
    }
  }

  ngOnInit() {
    if (this.isTestTypeRequired) {
      this.sampleTableColumns.splice(3, 0, 'testType');
    }
  }

  onViewReport(sampleId: string) {
    this.viewReport.emit([{ id: sampleId }]);
  }

  updateSamples(element: any) {
    this.dialog
      .open(BreedingUpdateSamplesComponent, {
        position: {
          right: '0px',
          top: '0px',
        },
        data: [element],

        width: '600px',
        height: '100vh',
        panelClass: 'custom-dialog-container',
      })
      .afterClosed()
      .subscribe((res) => {
        if (!res) {
          return;
        }
        this.sampleUpdated.emit();
        this.dialog.open(TreatmentResponseDialogComponent, {
          data: {
            title: 'Info',

            icon: 'assets/images/info.svg',
            message: 'Lab results saved successfully',
            primaryBtnText: 'OK',
            secondaryBtnText: '',
          },
          panelClass: 'common-info-dialog',
        });
      });
  }
}
