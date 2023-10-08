import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubOrganizationRegistrationFormComponent } from './sub-organization-registration-form.component';

describe('SubOrganizationRegistrationFormComponent', () => {
  let component: SubOrganizationRegistrationFormComponent;
  let fixture: ComponentFixture<SubOrganizationRegistrationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubOrganizationRegistrationFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubOrganizationRegistrationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
