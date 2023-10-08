import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GmSuccessDialogComponent } from './gm-success-dialog.component';

describe('GmSuccessDialogComponent', () => {
  let component: GmSuccessDialogComponent;
  let fixture: ComponentFixture<GmSuccessDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GmSuccessDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GmSuccessDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
