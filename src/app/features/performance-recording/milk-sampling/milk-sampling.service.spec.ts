import { TestBed } from '@angular/core/testing';

import { MilkSamplingService } from './milk-sampling.service';

describe('MilkSamplingService', () => {
  let service: MilkSamplingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MilkSamplingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
