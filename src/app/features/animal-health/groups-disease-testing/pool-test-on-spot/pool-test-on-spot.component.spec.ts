import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoolTestOnSpotComponent } from './pool-test-on-spot.component';

describe('PoolTestOnSpotComponent', () => {
  let component: PoolTestOnSpotComponent;
  let fixture: ComponentFixture<PoolTestOnSpotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoolTestOnSpotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PoolTestOnSpotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
