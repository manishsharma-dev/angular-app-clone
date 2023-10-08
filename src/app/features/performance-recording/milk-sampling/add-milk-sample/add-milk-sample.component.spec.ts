import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMilkSampleComponent } from './add-milk-sample.component';

describe('AddMilkSampleComponent', () => {
  let component: AddMilkSampleComponent;
  let fixture: ComponentFixture<AddMilkSampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMilkSampleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMilkSampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
