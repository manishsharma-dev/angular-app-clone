import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DewormingDetailsComponent } from './deworming-details.component';

describe('DewormingDetailsComponent', () => {
  let component: DewormingDetailsComponent;
  let fixture: ComponentFixture<DewormingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DewormingDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DewormingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
