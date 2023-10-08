import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MilkSampleDetails } from '../models/sample-details.model';
import { PrService } from '../../pr.service';
import { CommonMaster } from 'src/app/features/animal-health/animal-treatment/models/common-master.model';

interface Tab {
  key: 'on_spot' | 'lab';
  label: 'On-Spot Testing' | 'Lab Testing';
}
@Component({
  selector: 'app-sample-report',
  templateUrl: './sample-report.component.html',
  styleUrls: ['./sample-report.component.css'],
})
export class SampleReportComponent implements OnInit {
  activeTab: 'on_spot' | 'lab' = 'on_spot';
  onSpotDetails: MilkSampleDetails['onspotTesting'][] = [];
  labTestingDetails: MilkSampleDetails['labTesting'][] = [];
  tabs: Tab[] = [];
  slots: CommonMaster[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data:
      | MilkSampleDetails[]
      | MilkSampleDetails['labTesting']
      | MilkSampleDetails['onspotTesting'],
    private prService: PrService
  ) {}

  ngOnInit(): void {
    this.prService
      .getCommonMaster('recording_period')
      .subscribe((res) => (this.slots = res));

    if (this.data instanceof Array) {
      this.onSpotDetails = this.data
        .filter((sample) => sample.onspotTesting)
        .map((sample) => sample.onspotTesting);
      this.labTestingDetails = this.data
        .filter((sample) => sample.labTesting)
        .map((sample) => sample.labTesting);

      if (this.onSpotDetails.length) {
        this.tabs.push({ key: 'on_spot', label: 'On-Spot Testing' });
      }

      if (this.labTestingDetails.length) {
        this.tabs.push({ key: 'lab', label: 'Lab Testing' });
      }

      this.activeTab = this.tabs[0]?.key;
      // this.tabs = [
      //   { key: 'on_spot', label: 'On-Spot Testing' },
      //   { key: 'lab', label: 'Lab Testing' },
      // ];
    } else if (this.checkType(this.data)) {
      this.labTestingDetails = [this.data];
      this.tabs = [{ key: 'lab', label: 'Lab Testing' }];
      this.activeTab = 'lab';
    } else {
      this.onSpotDetails = [this.data];
      this.tabs = [{ key: 'on_spot', label: 'On-Spot Testing' }];
      this.activeTab = 'on_spot';
    }
  }

  checkType(data): data is MilkSampleDetails['labTesting'] {
    return typeof data.labCd !== 'undefined';
  }

  getRecordingSlotName(recordingPeriod: number) {
    return this.slots.find((slot) => slot.cd == recordingPeriod)?.value;
  }
}
