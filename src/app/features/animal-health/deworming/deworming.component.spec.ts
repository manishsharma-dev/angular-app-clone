import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DewormingComponent } from './deworming.component';

describe('DewormingComponent', () => {
  let component: DewormingComponent;
  let fixture: ComponentFixture<DewormingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DewormingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DewormingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
