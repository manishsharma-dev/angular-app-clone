import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMoreDialogComponent } from './view-more-dialog.component';

describe('ViewMoreDialogComponent', () => {
  let component: ViewMoreDialogComponent;
  let fixture: ComponentFixture<ViewMoreDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewMoreDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewMoreDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
