import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonSearchComponent } from './common-search.component';

describe('CommonSearchComponent', () => {
  let component: CommonSearchComponent;
  let fixture: ComponentFixture<CommonSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
