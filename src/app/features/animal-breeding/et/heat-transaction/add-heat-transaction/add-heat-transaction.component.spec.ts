import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddHeatTransactionComponent } from './add-heat-transaction.component';

describe('AddHeatTransactionComponent', () => {
  let component: AddHeatTransactionComponent;
  let fixture: ComponentFixture<AddHeatTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddHeatTransactionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddHeatTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
