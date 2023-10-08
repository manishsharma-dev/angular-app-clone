import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUntaggedTransactionsComponent } from './view-untagged-transactions.component';

describe('ViewUntaggedTransactionsComponent', () => {
  let component: ViewUntaggedTransactionsComponent;
  let fixture: ComponentFixture<ViewUntaggedTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewUntaggedTransactionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewUntaggedTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
