import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterimReportComponent } from './interim-report.component';

describe('InterimReportComponent', () => {
  let component: InterimReportComponent;
  let fixture: ComponentFixture<InterimReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterimReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InterimReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
