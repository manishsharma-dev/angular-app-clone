import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreedingValueEstimationComponent } from './breeding-value-estimation.component';

describe('BreedingValueEstimationComponent', () => {
  let component: BreedingValueEstimationComponent;
  let fixture: ComponentFixture<BreedingValueEstimationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BreedingValueEstimationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BreedingValueEstimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
