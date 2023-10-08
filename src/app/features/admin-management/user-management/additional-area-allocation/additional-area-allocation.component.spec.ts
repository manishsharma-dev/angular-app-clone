import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalAreaAllocationComponent } from './additional-area-allocation.component';

describe('AdditionalAreaAllocationComponent', () => {
  let component: AdditionalAreaAllocationComponent;
  let fixture: ComponentFixture<AdditionalAreaAllocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdditionalAreaAllocationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionalAreaAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
