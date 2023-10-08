import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubOrganizationDetailComponent } from './sub-organization-detail.component';

describe('SubOrganizationDetailComponent', () => {
  let component: SubOrganizationDetailComponent;
  let fixture: ComponentFixture<SubOrganizationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubOrganizationDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubOrganizationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
