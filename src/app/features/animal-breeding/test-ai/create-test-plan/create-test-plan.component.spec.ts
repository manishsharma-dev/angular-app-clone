import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTestPlanComponent } from './create-test-plan.component';

describe('CreateTestPlanComponent', () => {
  let component: CreateTestPlanComponent;
  let fixture: ComponentFixture<CreateTestPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateTestPlanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTestPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
