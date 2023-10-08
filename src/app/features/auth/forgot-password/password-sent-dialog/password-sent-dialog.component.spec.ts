import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordSentDialogComponent } from './password-sent-dialog.component';

describe('PasswordSentDialogComponent', () => {
  let component: PasswordSentDialogComponent;
  let fixture: ComponentFixture<PasswordSentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PasswordSentDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordSentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
