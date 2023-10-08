import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDiagnosticsComponent } from './add-diagnostics.component';

describe('AddDiagnosticsComponent', () => {
  let component: AddDiagnosticsComponent;
  let fixture: ComponentFixture<AddDiagnosticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDiagnosticsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDiagnosticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
