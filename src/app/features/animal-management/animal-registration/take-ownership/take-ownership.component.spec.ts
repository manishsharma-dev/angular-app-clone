import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TakeOwnershipComponent } from './take-ownership.component';

describe('TakeOwnershipComponent', () => {
  let component: TakeOwnershipComponent;
  let fixture: ComponentFixture<TakeOwnershipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TakeOwnershipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TakeOwnershipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
