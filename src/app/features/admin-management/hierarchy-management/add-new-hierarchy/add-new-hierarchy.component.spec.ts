import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewHierarchyComponent } from './add-new-hierarchy.component';

describe('AddNewHierarchyComponent', () => {
  let component: AddNewHierarchyComponent;
  let fixture: ComponentFixture<AddNewHierarchyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddNewHierarchyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewHierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
