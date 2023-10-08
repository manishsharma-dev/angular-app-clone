import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSynchronizationComponent } from './new-synchronization.component';

describe('NewSynchronizationComponent', () => {
  let component: NewSynchronizationComponent;
  let fixture: ComponentFixture<NewSynchronizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewSynchronizationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewSynchronizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
