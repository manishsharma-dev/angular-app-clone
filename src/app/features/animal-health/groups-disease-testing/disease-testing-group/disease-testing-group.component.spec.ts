import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiseaseTestingGroupComponent } from './disease-testing-group.component';

describe('DiseaseTestingGroupComponent', () => {
  let component: DiseaseTestingGroupComponent;
  let fixture: ComponentFixture<DiseaseTestingGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiseaseTestingGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiseaseTestingGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
