import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousTestingResultsComponent } from './previous-testing-results.component';

describe('PreviousTestingResultsComponent', () => {
  let component: PreviousTestingResultsComponent;
  let fixture: ComponentFixture<PreviousTestingResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviousTestingResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviousTestingResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
