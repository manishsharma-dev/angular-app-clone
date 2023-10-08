import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStrawDialogComponent } from './add-straw-dialog.component';

describe('AddStrawDialogComponent', () => {
  let component: AddStrawDialogComponent;
  let fixture: ComponentFixture<AddStrawDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddStrawDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddStrawDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
