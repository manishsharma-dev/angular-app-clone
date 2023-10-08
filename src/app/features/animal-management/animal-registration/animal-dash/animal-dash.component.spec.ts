import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimalDashComponent } from './animal-dash.component';

describe('AnimalDashComponent', () => {
  let component: AnimalDashComponent;
  let fixture: ComponentFixture<AnimalDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnimalDashComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimalDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
