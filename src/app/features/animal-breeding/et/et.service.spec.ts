import { TestBed } from '@angular/core/testing';

import { EtService } from './et.service';

describe('EtService', () => {
  let service: EtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
