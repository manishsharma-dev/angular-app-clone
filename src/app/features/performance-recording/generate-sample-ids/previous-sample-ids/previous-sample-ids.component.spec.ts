import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousSampleIdsComponent } from './previous-sample-ids.component';

describe('PreviousSampleIdsComponent', () => {
  let component: PreviousSampleIdsComponent;
  let fixture: ComponentFixture<PreviousSampleIdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviousSampleIdsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviousSampleIdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
