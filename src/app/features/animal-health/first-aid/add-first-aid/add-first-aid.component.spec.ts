import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFirstAidComponent } from './add-first-aid.component';

describe('AddFirstAidComponent', () => {
  let component: AddFirstAidComponent;
  let fixture: ComponentFixture<AddFirstAidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddFirstAidComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFirstAidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
