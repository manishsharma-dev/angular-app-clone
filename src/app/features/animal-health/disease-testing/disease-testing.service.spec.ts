import { TestBed } from '@angular/core/testing';

import { DiseaseTestingService } from './disease-testing.service';

describe('DiseaseTestingService', () => {
  let service: DiseaseTestingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiseaseTestingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
