import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMoreVaccinationComponent } from './view-more-vaccination.component';

describe('ViewMoreVaccinationComponent', () => {
  let component: ViewMoreVaccinationComponent;
  let fixture: ComponentFixture<ViewMoreVaccinationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewMoreVaccinationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewMoreVaccinationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
