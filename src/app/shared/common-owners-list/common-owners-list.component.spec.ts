import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonOwnersListComponent } from './common-owners-list.component';

describe('CommonOwnersListComponent', () => {
  let component: CommonOwnersListComponent;
  let fixture: ComponentFixture<CommonOwnersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonOwnersListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonOwnersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
