import { TestBed } from '@angular/core/testing';

import { StatusReportService } from './status-report.service';

describe('StatusReportService', () => {
  let service: StatusReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatusReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
