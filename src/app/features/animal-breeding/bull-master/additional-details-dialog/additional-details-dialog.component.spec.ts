import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalDetailsDialogComponent } from './additional-details-dialog.component';

describe('AdditionalDetailsDialogComponent', () => {
  let component: AdditionalDetailsDialogComponent;
  let fixture: ComponentFixture<AdditionalDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdditionalDetailsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionalDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
