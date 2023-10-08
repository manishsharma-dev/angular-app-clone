import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavePostMortemDialogComponent } from './save-post-mortem-dialog.component';

describe('SavePostMortemDialogComponent', () => {
  let component: SavePostMortemDialogComponent;
  let fixture: ComponentFixture<SavePostMortemDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SavePostMortemDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SavePostMortemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
