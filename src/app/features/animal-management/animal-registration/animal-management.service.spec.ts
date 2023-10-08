import { TestBed } from '@angular/core/testing';

import { AnimalManagementService } from './animal-management.service';

describe('AnimalManagementService', () => {
  let service: AnimalManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimalManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
