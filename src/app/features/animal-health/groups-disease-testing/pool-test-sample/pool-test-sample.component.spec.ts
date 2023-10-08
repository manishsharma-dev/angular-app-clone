import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoolTestSampleComponent } from './pool-test-sample.component';

describe('PoolTestSampleComponent', () => {
  let component: PoolTestSampleComponent;
  let fixture: ComponentFixture<PoolTestSampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoolTestSampleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PoolTestSampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
