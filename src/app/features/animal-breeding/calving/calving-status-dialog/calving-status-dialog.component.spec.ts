import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalvingStatusDialogComponent } from './calving-status-dialog.component';

describe('CalvingStatusDialogComponent', () => {
  let component: CalvingStatusDialogComponent;
  let fixture: ComponentFixture<CalvingStatusDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalvingStatusDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalvingStatusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
