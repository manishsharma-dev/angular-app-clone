import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdleSessionDialogComponent } from './idle-session-dialog.component';

describe('IdleSessionDialogComponent', () => {
  let component: IdleSessionDialogComponent;
  let fixture: ComponentFixture<IdleSessionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdleSessionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdleSessionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
