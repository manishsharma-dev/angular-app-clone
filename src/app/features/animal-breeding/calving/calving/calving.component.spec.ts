import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalvingComponent } from './calving.component';

describe('CalvingComponent', () => {
  let component: CalvingComponent;
  let fixture: ComponentFixture<CalvingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalvingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalvingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
