import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnSpotResultDialogComponent } from './on-spot-result-dialog.component';

describe('OnSpotResultDialogComponent', () => {
  let component: OnSpotResultDialogComponent;
  let fixture: ComponentFixture<OnSpotResultDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnSpotResultDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnSpotResultDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
