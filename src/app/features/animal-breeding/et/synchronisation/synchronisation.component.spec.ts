import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SynchronisationComponent } from './synchronisation.component';

describe('SynchronisationComponent', () => {
  let component: SynchronisationComponent;
  let fixture: ComponentFixture<SynchronisationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SynchronisationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SynchronisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
