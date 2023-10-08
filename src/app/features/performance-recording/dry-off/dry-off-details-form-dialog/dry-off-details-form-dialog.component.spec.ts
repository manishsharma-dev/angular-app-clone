import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DryOffDetailsFormDialogComponent } from './dry-off-details-form-dialog.component';

describe('DryOffDetailsFormDialogComponent', () => {
  let component: DryOffDetailsFormDialogComponent;
  let fixture: ComponentFixture<DryOffDetailsFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DryOffDetailsFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DryOffDetailsFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
