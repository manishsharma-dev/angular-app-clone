import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentResponseDialogComponent } from './treatment-response-dialog.component';

describe('TreatmentResponseDialogComponent', () => {
  let component: TreatmentResponseDialogComponent;
  let fixture: ComponentFixture<TreatmentResponseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreatmentResponseDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreatmentResponseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
