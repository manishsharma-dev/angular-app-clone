import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveDownloadDialogComponent } from './save-download-dialog.component';

describe('SaveDownloadDialogComponent', () => {
  let component: SaveDownloadDialogComponent;
  let fixture: ComponentFixture<SaveDownloadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveDownloadDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveDownloadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
