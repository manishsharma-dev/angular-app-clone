import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntimationSubmitDialogComponent } from './intimation-submit-dialog.component';

describe('IntimationSubmitDialogComponent', () => {
  let component: IntimationSubmitDialogComponent;
  let fixture: ComponentFixture<IntimationSubmitDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntimationSubmitDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IntimationSubmitDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
