import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatePickerPopupComponent } from './date-picker-popup.component';

describe('DatePickerPopupComponent', () => {
  let component: DatePickerPopupComponent;
  let fixture: ComponentFixture<DatePickerPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatePickerPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatePickerPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
