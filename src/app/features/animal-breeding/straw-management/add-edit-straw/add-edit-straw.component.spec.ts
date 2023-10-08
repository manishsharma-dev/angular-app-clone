import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditStrawComponent } from './add-edit-straw.component';

describe('AddEditStrawComponent', () => {
  let component: AddEditStrawComponent;
  let fixture: ComponentFixture<AddEditStrawComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditStrawComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditStrawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
