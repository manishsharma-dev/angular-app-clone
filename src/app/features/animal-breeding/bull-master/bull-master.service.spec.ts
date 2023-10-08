import { TestBed } from '@angular/core/testing';

import { BullMasterService } from './bull-master.service';

describe('BullMasterService', () => {
  let service: BullMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BullMasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
