import { TestBed } from '@angular/core/testing';

import { CalvingService } from './calving.service';

describe('CalvingService', () => {
  let service: CalvingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalvingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
