import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectUserDetailsComponent } from './project-user-details.component';

describe('ProjectUserDetailsComponent', () => {
  let component: ProjectUserDetailsComponent;
  let fixture: ComponentFixture<ProjectUserDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectUserDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectUserDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
