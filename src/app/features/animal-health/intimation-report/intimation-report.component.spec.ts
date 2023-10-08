import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntimationReportComponent } from './intimation-report.component';

describe('IntimationReportComponent', () => {
  let component: IntimationReportComponent;
  let fixture: ComponentFixture<IntimationReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntimationReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IntimationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
