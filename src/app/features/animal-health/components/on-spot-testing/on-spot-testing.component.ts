import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { AnimalTreatmentService } from '../../animal-treatment/animal-treatment.service';

@Component({
  selector: 'app-on-spot-testing',
  templateUrl: './on-spot-testing.component.html',
  styleUrls: ['./on-spot-testing.component.css']
})
export class OnSpotTestingComponent implements OnInit {
  @Input() diagnosticsForm: FormGroup;
  dataSources = [new BehaviorSubject<FormGroup[]>([])];
  @Input() isSpotUpdate = false;
  constructor(private treatmentService : AnimalTreatmentService) { }

  ngOnInit() {
  }

  getMasterData() {
    const sampleTypeRequest = this.treatmentService.getSampleTypeMaster([
      'A',
      'B',
      'D',
      'O',
    ]);
  }

}
