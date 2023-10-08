import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseIDDialogComponent } from './case-id-dialog.component';

describe('CaseIDDialogComponent', () => {
  let component: CaseIDDialogComponent;
  let fixture: ComponentFixture<CaseIDDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaseIDDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseIDDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
