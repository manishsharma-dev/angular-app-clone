import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaAllocationListComponent } from './area-allocation-list.component';

describe('AreaAllocationListComponent', () => {
  let component: AreaAllocationListComponent;
  let fixture: ComponentFixture<AreaAllocationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AreaAllocationListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AreaAllocationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
