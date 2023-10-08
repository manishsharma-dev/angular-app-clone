import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirDiseaseTestingComponent } from './fir-disease-testing.component';

describe('FirDiseaseTestingComponent', () => {
  let component: FirDiseaseTestingComponent;
  let fixture: ComponentFixture<FirDiseaseTestingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FirDiseaseTestingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FirDiseaseTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
