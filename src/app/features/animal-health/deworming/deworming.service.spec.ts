import { TestBed } from '@angular/core/testing';

import { DewormingService } from './deworming.service';

describe('DewormingService', () => {
  let service: DewormingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DewormingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
