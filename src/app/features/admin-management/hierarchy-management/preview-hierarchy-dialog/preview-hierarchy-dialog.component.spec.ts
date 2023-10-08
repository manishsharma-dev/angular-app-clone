import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewHierarchyDialogComponent } from './preview-hierarchy-dialog.component';

describe('PreviewHierarchyDialogComponent', () => {
  let component: PreviewHierarchyDialogComponent;
  let fixture: ComponentFixture<PreviewHierarchyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewHierarchyDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewHierarchyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
