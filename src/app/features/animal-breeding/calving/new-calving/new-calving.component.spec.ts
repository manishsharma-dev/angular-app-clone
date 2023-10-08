import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCalvingComponent } from './new-calving.component';

describe('NewCalvingComponent', () => {
  let component: NewCalvingComponent;
  let fixture: ComponentFixture<NewCalvingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewCalvingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewCalvingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
