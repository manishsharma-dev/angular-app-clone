import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GmHistoryComponent } from './gm-history.component';

describe('GmHistoryComponent', () => {
  let component: GmHistoryComponent;
  let fixture: ComponentFixture<GmHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GmHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GmHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
