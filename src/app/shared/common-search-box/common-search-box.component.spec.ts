import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonSearchBoxComponent } from './common-search-box.component';

describe('CommonSearchBoxComponent', () => {
  let component: CommonSearchBoxComponent;
  let fixture: ComponentFixture<CommonSearchBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonSearchBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonSearchBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
