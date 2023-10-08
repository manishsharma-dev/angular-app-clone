import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbryoTransferHistoryComponent } from './embryo-transfer-history.component';

describe('EmbryoTransferHistoryComponent', () => {
  let component: EmbryoTransferHistoryComponent;
  let fixture: ComponentFixture<EmbryoTransferHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmbryoTransferHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmbryoTransferHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
