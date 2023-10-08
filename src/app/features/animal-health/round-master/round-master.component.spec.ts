import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundMasterComponent } from './round-master.component';

describe('RoundMasterComponent', () => {
  let component: RoundMasterComponent;
  let fixture: ComponentFixture<RoundMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoundMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
