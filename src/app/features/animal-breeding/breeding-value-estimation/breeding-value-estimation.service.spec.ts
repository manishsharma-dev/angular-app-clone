import { TestBed } from '@angular/core/testing';

import { BreedingValueEstimationService } from './breeding-value-estimation.service';

describe('BreedingValueEstimationService', () => {
  let service: BreedingValueEstimationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BreedingValueEstimationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
