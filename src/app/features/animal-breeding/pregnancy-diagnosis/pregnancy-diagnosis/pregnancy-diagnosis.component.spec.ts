import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PregnancyDiagnosisComponent } from './pregnancy-diagnosis.component';

describe('PregnancyDiagnosisComponent', () => {
  let component: PregnancyDiagnosisComponent;
  let fixture: ComponentFixture<PregnancyDiagnosisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PregnancyDiagnosisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PregnancyDiagnosisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
