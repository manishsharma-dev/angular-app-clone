import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectRegFormComponent } from './project-reg-form.component';

describe('ProjectRegFormComponent', () => {
  let component: ProjectRegFormComponent;
  let fixture: ComponentFixture<ProjectRegFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectRegFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectRegFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
