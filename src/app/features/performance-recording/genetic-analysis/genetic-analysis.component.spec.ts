import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneticAnalysisComponent } from './genetic-analysis.component';

describe('GeneticAnalysisComponent', () => {
  let component: GeneticAnalysisComponent;
  let fixture: ComponentFixture<GeneticAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneticAnalysisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneticAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
