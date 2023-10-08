import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewTypingDialogComponent } from './preview-typing-dialog.component';

describe('PreviewTypingDialogComponent', () => {
  let component: PreviewTypingDialogComponent;
  let fixture: ComponentFixture<PreviewTypingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewTypingDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewTypingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
