import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { GenerateSampleIdsService } from '../generate-sample-ids.service';
import { SampleID } from '../models/sample-id.model';

@Component({
  selector: 'app-available-ids-list',
  templateUrl: './available-ids-list.component.html',
  styleUrls: ['./available-ids-list.component.css'],
})
export class AvailableIdsListComponent implements OnChanges {
  @Input() sampleIDs: SampleID[] = [];
  @Input() viewMode = false;
  @Output() export = new EventEmitter<SampleID[]>();
  tableDataSource = new MatTableDataSource<SampleID>([]);
  selectedSampleIDs: SampleID[] = [];

  displayedColumns = ['radio', '#', 'sampleId', 'generatedDate', 'status'];
  // viewDisplayedColumns = ['#', 'sampleId', 'generationDate', 'status'];

  @ViewChild(MatSort) set sort(s: MatSort) {
    this.tableDataSource.sort = s;
  }

  @ViewChild('paginatorRef') set paginator(p: MatPaginator) {
    this.tableDataSource.paginator = p;
  }

  constructor(
    private dialog: MatDialog,
    private generateSampleIdService: GenerateSampleIdsService
  ) {}

  ngOnChanges() {
    this.tableDataSource.data = this.sampleIDs.map((sample) => ({
      ...sample,
      generatedDate: moment(sample.generatedDate).format('DD/MM/YYYY'),
    }));
  }

  onSampleIDSelection(sampleId: any, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.selectedSampleIDs.push(sampleId);
    } else {
      const index = this.selectedSampleIDs.findIndex(
        (sample) => sample.sampleId === sampleId.sampleId
      );

      this.selectedSampleIDs.splice(index, 1);
    }
  }

  onSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.selectedSampleIDs.push(...this.tableDataSource.filteredData);
    } else {
      this.selectedSampleIDs.length = 0;
    }
  }

  isSampleIdSelected(sampleId: any) {
    return !!this.selectedSampleIDs.find(
      (sample) => sample.sampleId === sampleId.sampleId
    );
  }

  isAllSelected() {
    return (
      this.tableDataSource.filteredData.length &&
      this.tableDataSource.filteredData.length === this.selectedSampleIDs.length
    );
  }

  searchInTable(event: Event) {
    this.tableDataSource.filter = (event.target as HTMLInputElement).value;
  }

  onExport() {
    this.export.emit(this.selectedSampleIDs);
  }
}
