import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalSearchDetailsComponent } from './animal-search-details.component';

describe('AnimalSearchDetailsComponent', () => {
  let component: AnimalSearchDetailsComponent;
  let fixture: ComponentFixture<AnimalSearchDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnimalSearchDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimalSearchDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
