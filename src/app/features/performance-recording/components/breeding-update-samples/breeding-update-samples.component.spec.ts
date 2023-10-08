import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreedingUpdateSamplesComponent } from './breeding-update-samples.component';

describe('BreedingUpdateSamplesComponent', () => {
  let component: BreedingUpdateSamplesComponent;
  let fixture: ComponentFixture<BreedingUpdateSamplesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BreedingUpdateSamplesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BreedingUpdateSamplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
