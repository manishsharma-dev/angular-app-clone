import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliteAnimalDeclarationComponent } from './elite-animal-declaration.component';

describe('EliteAnimalDeclarationComponent', () => {
  let component: EliteAnimalDeclarationComponent;
  let fixture: ComponentFixture<EliteAnimalDeclarationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EliteAnimalDeclarationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EliteAnimalDeclarationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
