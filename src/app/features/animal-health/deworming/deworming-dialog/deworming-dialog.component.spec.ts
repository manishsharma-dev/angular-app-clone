import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DewormingDialogComponent } from './deworming-dialog.component';

describe('DewormingDialogComponent', () => {
  let component: DewormingDialogComponent;
  let fixture: ComponentFixture<DewormingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DewormingDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DewormingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
