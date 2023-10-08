import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateLabSampleComponent } from './update-lab-sample.component';

describe('UpdateLabSampleComponent', () => {
  let component: UpdateLabSampleComponent;
  let fixture: ComponentFixture<UpdateLabSampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateLabSampleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateLabSampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
