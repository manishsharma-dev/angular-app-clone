import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewIntimationReportComponent } from './view-intimation-report.component';

describe('ViewIntimationReportComponent', () => {
  let component: ViewIntimationReportComponent;
  let fixture: ComponentFixture<ViewIntimationReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewIntimationReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewIntimationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
