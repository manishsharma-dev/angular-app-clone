import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalByVillageComponent } from './animal-by-village.component';

describe('AnimalByVillageComponent', () => {
  let component: AnimalByVillageComponent;
  let fixture: ComponentFixture<AnimalByVillageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnimalByVillageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimalByVillageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
