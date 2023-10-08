import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgeDialogComponent } from './age-dialog.component';

describe('AgeDialogComponent', () => {
  let component: AgeDialogComponent;
  let fixture: ComponentFixture<AgeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
