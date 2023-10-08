import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SireDetailsComponent } from './sire-details.component';

describe('SireDetailsComponent', () => {
  let component: SireDetailsComponent;
  let fixture: ComponentFixture<SireDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SireDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SireDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
