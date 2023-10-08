import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaAllocationFormDialogComponent } from './area-allocation-form-dialog.component';

describe('AreaAllocationFormDialogComponent', () => {
  let component: AreaAllocationFormDialogComponent;
  let fixture: ComponentFixture<AreaAllocationFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AreaAllocationFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AreaAllocationFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
