import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyAnimalDetailsComponent } from './modify-animal-details.component';

describe('ModifyAnimalDetailsComponent', () => {
  let component: ModifyAnimalDetailsComponent;
  let fixture: ComponentFixture<ModifyAnimalDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModifyAnimalDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyAnimalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
