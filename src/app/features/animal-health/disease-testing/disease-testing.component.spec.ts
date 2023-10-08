import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiseaseTestingComponent } from './disease-testing.component';

describe('DiseaseTestingComponent', () => {
  let component: DiseaseTestingComponent;
  let fixture: ComponentFixture<DiseaseTestingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiseaseTestingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiseaseTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
