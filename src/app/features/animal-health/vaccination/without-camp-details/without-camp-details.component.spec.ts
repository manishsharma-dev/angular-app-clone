import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithoutCampDetailsComponent } from './without-camp-details.component';

describe('WithoutCampDetailsComponent', () => {
  let component: WithoutCampDetailsComponent;
  let fixture: ComponentFixture<WithoutCampDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WithoutCampDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WithoutCampDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
