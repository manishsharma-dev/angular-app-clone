import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntimationReportListComponent } from './intimation-report-list.component';

describe('IntimationReportListComponent', () => {
  let component: IntimationReportListComponent;
  let fixture: ComponentFixture<IntimationReportListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntimationReportListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IntimationReportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
