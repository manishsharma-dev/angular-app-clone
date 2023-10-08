import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerResponseDialogComponent } from './owner-response-dialog.component';

describe('OwnerResponseDialogComponent', () => {
  let component: OwnerResponseDialogComponent;
  let fixture: ComponentFixture<OwnerResponseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OwnerResponseDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OwnerResponseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
