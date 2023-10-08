import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCalvingDateDialogComponent } from './update-calving-date-dialog.component';

describe('UpdateCalvingDateDialogComponent', () => {
  let component: UpdateCalvingDateDialogComponent;
  let fixture: ComponentFixture<UpdateCalvingDateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateCalvingDateDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateCalvingDateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
