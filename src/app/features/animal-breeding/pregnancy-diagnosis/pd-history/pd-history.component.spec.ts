import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdHistoryComponent } from './pd-history.component';

describe('PdHistoryComponent', () => {
  let component: PdHistoryComponent;
  let fixture: ComponentFixture<PdHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PdHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
