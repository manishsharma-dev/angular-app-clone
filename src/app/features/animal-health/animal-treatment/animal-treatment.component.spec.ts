import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalTreatmentComponent } from './animal-treatment.component';

describe('AnimalTreatmentComponent', () => {
  let component: AnimalTreatmentComponent;
  let fixture: ComponentFixture<AnimalTreatmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnimalTreatmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimalTreatmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
