import { TestBed } from '@angular/core/testing';
import { OwnerTransferService } from './owner-transfer.service';

describe('OwnerTransferService', () => {
  let service: OwnerTransferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OwnerTransferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});