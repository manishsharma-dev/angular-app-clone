import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIRComponent } from './fir.component';

describe('FIRComponent', () => {
  let component: FIRComponent;
  let fixture: ComponentFixture<FIRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FIRComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FIRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
