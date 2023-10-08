import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstAidComponent } from './first-aid.component';

describe('FirstAidComponent', () => {
  let component: FirstAidComponent;
  let fixture: ComponentFixture<FirstAidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FirstAidComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstAidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
