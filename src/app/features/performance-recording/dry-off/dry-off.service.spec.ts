import { TestBed } from '@angular/core/testing';

import { DryOffService } from './dry-off.service';

describe('DryOffService', () => {
  let service: DryOffService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DryOffService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
