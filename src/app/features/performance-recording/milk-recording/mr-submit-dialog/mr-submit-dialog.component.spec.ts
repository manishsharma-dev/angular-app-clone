import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MrSubmitDialogComponent } from './mr-submit-dialog.component';

describe('MrSubmitDialogComponent', () => {
  let component: MrSubmitDialogComponent;
  let fixture: ComponentFixture<MrSubmitDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MrSubmitDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MrSubmitDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
