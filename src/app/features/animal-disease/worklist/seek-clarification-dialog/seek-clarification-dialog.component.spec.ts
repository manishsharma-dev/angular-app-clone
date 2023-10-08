import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeekClarificationDialogComponent } from './seek-clarification-dialog.component';

describe('SeekClarificationDialogComponent', () => {
  let component: SeekClarificationDialogComponent;
  let fixture: ComponentFixture<SeekClarificationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeekClarificationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeekClarificationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
