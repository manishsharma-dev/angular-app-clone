import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAreaAllocationComponent } from './new-area-allocation.component';

describe('NewAreaAllocationComponent', () => {
  let component: NewAreaAllocationComponent;
  let fixture: ComponentFixture<NewAreaAllocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewAreaAllocationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewAreaAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
