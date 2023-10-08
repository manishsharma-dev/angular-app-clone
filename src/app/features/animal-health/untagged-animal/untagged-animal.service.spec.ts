import { TestBed } from '@angular/core/testing';

import { UntaggedAnimalService } from './untagged-animal.service';

describe('UntaggedAnimalService', () => {
  let service: UntaggedAnimalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UntaggedAnimalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
