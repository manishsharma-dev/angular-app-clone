import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupTestSampleComponent } from './group-test-sample.component';

describe('GroupTestSampleComponent', () => {
  let component: GroupTestSampleComponent;
  let fixture: ComponentFixture<GroupTestSampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupTestSampleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupTestSampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
