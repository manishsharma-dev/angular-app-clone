import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewGroupTestComponent } from './new-group-test.component';

describe('NewGroupTestComponent', () => {
  let component: NewGroupTestComponent;
  let fixture: ComponentFixture<NewGroupTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewGroupTestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewGroupTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
