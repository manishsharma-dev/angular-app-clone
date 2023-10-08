import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatTransactionComponent } from './heat-transaction.component';

describe('HeatTransactionComponent', () => {
  let component: HeatTransactionComponent;
  let fixture: ComponentFixture<HeatTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeatTransactionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
