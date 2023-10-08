import { TestBed } from '@angular/core/testing';

import { GrowthMonitoringService } from './growth-monitoring.service';

describe('GrowthMonitoringService', () => {
  let service: GrowthMonitoringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GrowthMonitoringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
