import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateLabComponent } from './update-lab.component';

describe('UpdateLabComponent', () => {
  let component: UpdateLabComponent;
  let fixture: ComponentFixture<UpdateLabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateLabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateLabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
