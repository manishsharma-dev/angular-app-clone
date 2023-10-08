import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTestPlanDetailsComponent } from './view-test-plan-details.component';

describe('ViewTestPlanDetailsComponent', () => {
  let component: ViewTestPlanDetailsComponent;
  let fixture: ComponentFixture<ViewTestPlanDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewTestPlanDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTestPlanDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
