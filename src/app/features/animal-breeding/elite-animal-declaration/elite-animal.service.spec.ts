import { TestBed } from '@angular/core/testing';

import { EliteAnimalService } from './elite-animal.service';

describe('EliteAnimalService', () => {
  let service: EliteAnimalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EliteAnimalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
