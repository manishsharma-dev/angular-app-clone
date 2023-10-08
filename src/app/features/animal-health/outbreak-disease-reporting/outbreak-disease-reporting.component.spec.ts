import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutbreakDiseaseReportingComponent } from './outbreak-disease-reporting.component';

describe('OutbreakDiseaseReportingComponent', () => {
  let component: OutbreakDiseaseReportingComponent;
  let fixture: ComponentFixture<OutbreakDiseaseReportingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OutbreakDiseaseReportingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OutbreakDiseaseReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
