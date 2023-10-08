import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonBreadcrumbComponent } from './common-breadcrumb.component';

describe('CommonBreadcrumbComponent', () => {
  let component: CommonBreadcrumbComponent;
  let fixture: ComponentFixture<CommonBreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonBreadcrumbComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
