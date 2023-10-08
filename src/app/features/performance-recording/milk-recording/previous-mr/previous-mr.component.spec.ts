import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousMRComponent } from './previous-mr.component';

describe('PreviousMRComponent', () => {
  let component: PreviousMRComponent;
  let fixture: ComponentFixture<PreviousMRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviousMRComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviousMRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
