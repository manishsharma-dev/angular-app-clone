import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewDetailDialogComponent } from './preview-detail-dialog.component';

describe('PreviewDetailDialogComponent', () => {
  let component: PreviewDetailDialogComponent;
  let fixture: ComponentFixture<PreviewDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewDetailDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
