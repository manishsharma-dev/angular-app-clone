import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocConfirmationComponent } from './alloc-confirmation.component';

describe('AllocConfirmationComponent', () => {
  let component: AllocConfirmationComponent;
  let fixture: ComponentFixture<AllocConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllocConfirmationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllocConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
