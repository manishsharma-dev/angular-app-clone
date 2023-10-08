import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMRComponent } from './add-mr.component';

describe('AddMRComponent', () => {
  let component: AddMRComponent;
  let fixture: ComponentFixture<AddMRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMRComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
