import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectAllocDeallocComponent } from './project-alloc-dealloc.component';

describe('ProjectAllocDeallocComponent', () => {
  let component: ProjectAllocDeallocComponent;
  let fixture: ComponentFixture<ProjectAllocDeallocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectAllocDeallocComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectAllocDeallocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
