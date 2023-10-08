import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousTestingDetailsComponent } from './previous-testing-details.component';

describe('PreviousTestingDetailsComponent', () => {
  let component: PreviousTestingDetailsComponent;
  let fixture: ComponentFixture<PreviousTestingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviousTestingDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviousTestingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
