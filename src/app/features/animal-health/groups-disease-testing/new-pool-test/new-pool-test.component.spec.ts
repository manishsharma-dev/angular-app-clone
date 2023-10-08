import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPoolTestComponent } from './new-pool-test.component';

describe('NewPoolTestComponent', () => {
  let component: NewPoolTestComponent;
  let fixture: ComponentFixture<NewPoolTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewPoolTestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPoolTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
