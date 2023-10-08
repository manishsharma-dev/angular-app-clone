import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMRScheduleComponent } from './view-mrschedule.component';

describe('ViewMRScheduleComponent', () => {
  let component: ViewMRScheduleComponent;
  let fixture: ComponentFixture<ViewMRScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewMRScheduleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewMRScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
