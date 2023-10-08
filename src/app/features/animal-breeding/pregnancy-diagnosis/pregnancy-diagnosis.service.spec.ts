import { TestBed } from '@angular/core/testing';

import { PregnancyDiagnosisService } from './pregnancy-diagnosis.service';

describe('PregnancyDiagnosisService', () => {
  let service: PregnancyDiagnosisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PregnancyDiagnosisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
