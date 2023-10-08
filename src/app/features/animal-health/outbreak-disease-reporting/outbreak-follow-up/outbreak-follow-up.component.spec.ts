import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutbreakFollowUpComponent } from './outbreak-follow-up.component';

describe('OutbreakFollowUpComponent', () => {
  let component: OutbreakFollowUpComponent;
  let fixture: ComponentFixture<OutbreakFollowUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OutbreakFollowUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OutbreakFollowUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
