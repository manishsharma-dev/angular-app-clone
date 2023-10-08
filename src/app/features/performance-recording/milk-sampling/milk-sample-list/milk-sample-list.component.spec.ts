import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MilkSampleListComponent } from './milk-sample-list.component';

describe('MilkSampleListComponent', () => {
  let component: MilkSampleListComponent;
  let fixture: ComponentFixture<MilkSampleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MilkSampleListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MilkSampleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
