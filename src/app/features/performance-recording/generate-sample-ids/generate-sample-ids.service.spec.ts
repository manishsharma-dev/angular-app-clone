import { TestBed } from '@angular/core/testing';

import { GenerateSampleIdsService } from './generate-sample-ids.service';

describe('GenerateSampleIdsService', () => {
  let service: GenerateSampleIdsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenerateSampleIdsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
