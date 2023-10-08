import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocateDialogComponent } from './allocate-dialog.component';

describe('AllocateDialogComponent', () => {
  let component: AllocateDialogComponent;
  let fixture: ComponentFixture<AllocateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllocateDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllocateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
