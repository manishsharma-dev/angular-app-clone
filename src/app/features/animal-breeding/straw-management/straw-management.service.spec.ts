import { TestBed } from '@angular/core/testing';

import { StrawManagementService } from './straw-management.service';

describe('StrawManagementService', () => {
  let service: StrawManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StrawManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
