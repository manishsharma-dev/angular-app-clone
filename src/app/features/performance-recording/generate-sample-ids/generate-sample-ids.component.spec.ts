import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateSampleIdsComponent } from './generate-sample-ids.component';

describe('GenerateSampleIdsComponent', () => {
  let component: GenerateSampleIdsComponent;
  let fixture: ComponentFixture<GenerateSampleIdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateSampleIdsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateSampleIdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
