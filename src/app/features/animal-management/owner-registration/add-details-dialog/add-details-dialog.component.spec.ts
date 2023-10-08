import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDetailsDialogComponent } from './add-details-dialog.component';

describe('AddDetailsDialogComponent', () => {
  let component: AddDetailsDialogComponent;
  let fixture: ComponentFixture<AddDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDetailsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
