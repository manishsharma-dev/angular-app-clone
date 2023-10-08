import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VaccinationDialogComponent } from './vaccination-dialog.component';

describe('VaccinationDialogComponent', () => {
  let component: VaccinationDialogComponent;
  let fixture: ComponentFixture<VaccinationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VaccinationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VaccinationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
