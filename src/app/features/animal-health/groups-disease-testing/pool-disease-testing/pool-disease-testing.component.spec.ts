import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoolDiseaseTestingComponent } from './pool-disease-testing.component';

describe('PoolDiseaseTestingComponent', () => {
  let component: PoolDiseaseTestingComponent;
  let fixture: ComponentFixture<PoolDiseaseTestingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoolDiseaseTestingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PoolDiseaseTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
