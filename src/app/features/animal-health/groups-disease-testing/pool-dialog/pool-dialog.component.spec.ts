import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoolDialogComponent } from './pool-dialog.component';

describe('PoolDialogComponent', () => {
  let component: PoolDialogComponent;
  let fixture: ComponentFixture<PoolDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoolDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PoolDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
