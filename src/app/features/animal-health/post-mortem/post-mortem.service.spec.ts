import { TestBed } from '@angular/core/testing';

import { PostMortemService } from './post-mortem.service';

describe('PostMortemService', () => {
  let service: PostMortemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostMortemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
