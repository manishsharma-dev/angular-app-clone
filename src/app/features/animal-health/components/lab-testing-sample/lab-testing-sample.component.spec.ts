import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabTestingSampleComponent } from './lab-testing-sample.component';

describe('LabTestingSampleComponent', () => {
  let component: LabTestingSampleComponent;
  let fixture: ComponentFixture<LabTestingSampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTestingSampleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTestingSampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
