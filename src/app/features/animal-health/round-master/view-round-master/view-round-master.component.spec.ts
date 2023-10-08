import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRoundMasterComponent } from './view-round-master.component';

describe('ViewRoundMasterComponent', () => {
  let component: ViewRoundMasterComponent;
  let fixture: ComponentFixture<ViewRoundMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewRoundMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewRoundMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
