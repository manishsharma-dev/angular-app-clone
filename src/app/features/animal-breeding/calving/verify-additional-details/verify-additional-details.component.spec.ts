import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyAdditionalDetailsComponent } from './verify-additional-details.component';

describe('VerifyAdditionalDetailsComponent', () => {
  let component: VerifyAdditionalDetailsComponent;
  let fixture: ComponentFixture<VerifyAdditionalDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyAdditionalDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyAdditionalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
