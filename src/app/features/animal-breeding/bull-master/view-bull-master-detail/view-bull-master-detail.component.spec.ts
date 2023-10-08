import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBullMasterDetailComponent } from './view-bull-master-detail.component';

describe('ViewBullMasterDetailComponent', () => {
  let component: ViewBullMasterDetailComponent;
  let fixture: ComponentFixture<ViewBullMasterDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewBullMasterDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewBullMasterDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
