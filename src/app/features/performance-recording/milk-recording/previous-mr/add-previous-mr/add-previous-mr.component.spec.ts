import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPreviousMRComponent } from './add-previous-mr.component';

describe('AddPreviousMRComponent', () => {
  let component: AddPreviousMRComponent;
  let fixture: ComponentFixture<AddPreviousMRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPreviousMRComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPreviousMRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
