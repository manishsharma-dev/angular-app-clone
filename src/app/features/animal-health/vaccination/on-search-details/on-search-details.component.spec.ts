import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnSearchDetailsComponent } from './on-search-details.component';

describe('OnSearchDetailsComponent', () => {
  let component: OnSearchDetailsComponent;
  let fixture: ComponentFixture<OnSearchDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnSearchDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnSearchDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
