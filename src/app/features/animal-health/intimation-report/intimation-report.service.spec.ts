import { TestBed } from '@angular/core/testing';

import { IntimationReportService } from './intimation-report.service';

describe('IntimationReportService', () => {
  let service: IntimationReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IntimationReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
