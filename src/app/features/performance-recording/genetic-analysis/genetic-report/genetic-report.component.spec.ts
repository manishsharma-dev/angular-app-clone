import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneticReportComponent } from './genetic-report.component';

describe('GeneticReportComponent', () => {
  let component: GeneticReportComponent;
  let fixture: ComponentFixture<GeneticReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneticReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneticReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
