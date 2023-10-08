import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpforgotVerificationComponent } from './otpforgot-verification.component';

describe('OtpforgotVerificationComponent', () => {
  let component: OtpforgotVerificationComponent;
  let fixture: ComponentFixture<OtpforgotVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtpforgotVerificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtpforgotVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
