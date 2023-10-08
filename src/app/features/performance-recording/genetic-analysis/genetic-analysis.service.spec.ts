import { TestBed } from '@angular/core/testing';

import { GeneticAnalysisService } from './genetic-analysis.service';

describe('GeneticAnalysisService', () => {
  let service: GeneticAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeneticAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
