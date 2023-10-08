import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirDetailsFormComponent } from './fir-details-form.component';

describe('FirDetailsFormComponent', () => {
  let component: FirDetailsFormComponent;
  let fixture: ComponentFixture<FirDetailsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FirDetailsFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FirDetailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
