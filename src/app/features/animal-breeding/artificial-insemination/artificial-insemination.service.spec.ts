import { TestBed } from '@angular/core/testing';

import { ArtificialInseminationService } from './artificial-insemination.service';

describe('ArtificialInseminationService', () => {
  let service: ArtificialInseminationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArtificialInseminationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
