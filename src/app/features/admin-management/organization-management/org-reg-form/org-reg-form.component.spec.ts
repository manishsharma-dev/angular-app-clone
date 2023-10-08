import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgRegFormComponent } from './org-reg-form.component';

describe('OrgRegFormComponent', () => {
  let component: OrgRegFormComponent;
  let fixture: ComponentFixture<OrgRegFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgRegFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgRegFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
