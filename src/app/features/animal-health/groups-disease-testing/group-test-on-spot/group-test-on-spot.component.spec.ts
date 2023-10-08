import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupTestOnSpotComponent } from './group-test-on-spot.component';

describe('GroupTestOnSpotComponent', () => {
  let component: GroupTestOnSpotComponent;
  let fixture: ComponentFixture<GroupTestOnSpotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupTestOnSpotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupTestOnSpotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
