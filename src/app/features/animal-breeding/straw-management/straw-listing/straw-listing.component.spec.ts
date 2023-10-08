import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrawListingComponent } from './straw-listing.component';

describe('StrawListingComponent', () => {
  let component: StrawListingComponent;
  let fixture: ComponentFixture<StrawListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StrawListingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StrawListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
