import { TestBed } from '@angular/core/testing';

import { AnimalTreatmentService } from './animal-treatment.service';

describe('AnimalTreatmentService', () => {
  let service: AnimalTreatmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimalTreatmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
