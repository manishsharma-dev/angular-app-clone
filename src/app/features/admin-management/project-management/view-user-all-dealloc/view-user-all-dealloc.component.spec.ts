import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUserAllDeallocComponent } from './view-user-all-dealloc.component';

describe('ViewUserAllDeallocComponent', () => {
  let component: ViewUserAllDeallocComponent;
  let fixture: ComponentFixture<ViewUserAllDeallocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewUserAllDeallocComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewUserAllDeallocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
