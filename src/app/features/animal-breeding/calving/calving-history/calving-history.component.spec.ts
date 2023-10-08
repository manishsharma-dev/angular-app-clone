import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalvingHistoryComponent } from './calving-history.component';

describe('CalvingHistoryComponent', () => {
  let component: CalvingHistoryComponent;
  let fixture: ComponentFixture<CalvingHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalvingHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalvingHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
