import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAllocDeallocComponent } from './user-alloc-dealloc.component';

describe('UserAllocDeallocComponent', () => {
  let component: UserAllocDeallocComponent;
  let fixture: ComponentFixture<UserAllocDeallocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserAllocDeallocComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAllocDeallocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
