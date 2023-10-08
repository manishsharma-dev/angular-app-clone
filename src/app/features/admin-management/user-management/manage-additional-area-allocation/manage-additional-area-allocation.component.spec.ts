import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAdditionalAreaAllocationComponent } from './manage-additional-area-allocation.component';

describe('ManageAdditionalAreaAllocationComponent', () => {
  let component: ManageAdditionalAreaAllocationComponent;
  let fixture: ComponentFixture<ManageAdditionalAreaAllocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageAdditionalAreaAllocationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageAdditionalAreaAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
