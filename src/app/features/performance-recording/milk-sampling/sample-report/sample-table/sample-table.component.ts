import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sample-table',
  templateUrl: './sample-table.component.html',
  styleUrls: ['./sample-table.component.css'],
})
export class SampleTableComponent {
  @Input() sample!: any;
}