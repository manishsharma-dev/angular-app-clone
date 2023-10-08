import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessPrivilegeDetailsComponent } from './access-privilege-details.component';

describe('AccessPrivilegeDetailsComponent', () => {
  let component: AccessPrivilegeDetailsComponent;
  let fixture: ComponentFixture<AccessPrivilegeDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessPrivilegeDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessPrivilegeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
