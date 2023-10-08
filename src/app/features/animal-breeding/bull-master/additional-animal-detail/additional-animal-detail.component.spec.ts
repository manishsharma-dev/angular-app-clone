import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalAnimalDetailComponent } from './additional-animal-detail.component';

describe('AdditionalAnimalDetailComponent', () => {
  let component: AdditionalAnimalDetailComponent;
  let fixture: ComponentFixture<AdditionalAnimalDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdditionalAnimalDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionalAnimalDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
