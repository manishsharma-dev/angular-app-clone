import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchyListComponent } from './hierarchy-list.component';

describe('HierarchyListComponent', () => {
  let component: HierarchyListComponent;
  let fixture: ComponentFixture<HierarchyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HierarchyListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HierarchyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
