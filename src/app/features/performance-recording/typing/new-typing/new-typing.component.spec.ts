import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTypingComponent } from './new-typing.component';

describe('NewTypingComponent', () => {
  let component: NewTypingComponent;
  let fixture: ComponentFixture<NewTypingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewTypingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewTypingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
