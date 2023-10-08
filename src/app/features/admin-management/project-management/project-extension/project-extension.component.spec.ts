import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectExtensionComponent } from './project-extension.component';

describe('ProjectExtensionComponent', () => {
  let component: ProjectExtensionComponent;
  let fixture: ComponentFixture<ProjectExtensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectExtensionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectExtensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
