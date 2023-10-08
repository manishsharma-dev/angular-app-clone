import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundDialogComponent } from './round-dialog.component';

describe('RoundDialogComponent', () => {
  let component: RoundDialogComponent;
  let fixture: ComponentFixture<RoundDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoundDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
