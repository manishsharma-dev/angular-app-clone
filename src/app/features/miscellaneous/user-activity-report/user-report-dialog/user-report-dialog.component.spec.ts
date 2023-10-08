import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserReportDialogComponent } from './user-report-dialog.component';

describe('UserReportDialogComponent', () => {
  let component: UserReportDialogComponent;
  let fixture: ComponentFixture<UserReportDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserReportDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserReportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
