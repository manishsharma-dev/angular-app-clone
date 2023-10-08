import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditBullMasterComponent } from './add-edit-bull-master.component';

describe('AddEditBullMasterComponent', () => {
  let component: AddEditBullMasterComponent;
  let fixture: ComponentFixture<AddEditBullMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditBullMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditBullMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
