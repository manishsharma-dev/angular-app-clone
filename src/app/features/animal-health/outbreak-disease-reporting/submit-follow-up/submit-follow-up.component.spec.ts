import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitFollowUpComponent } from './submit-follow-up.component';

describe('SubmitFollowUpComponent', () => {
  let component: SubmitFollowUpComponent;
  let fixture: ComponentFixture<SubmitFollowUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubmitFollowUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitFollowUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
