import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtificialInseminationComponent } from './artificial-insemination.component';

describe('ArtificialInseminationComponent', () => {
  let component: ArtificialInseminationComponent;
  let fixture: ComponentFixture<ArtificialInseminationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArtificialInseminationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtificialInseminationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
