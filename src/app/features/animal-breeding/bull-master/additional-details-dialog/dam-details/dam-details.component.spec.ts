import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DamDetailsComponent } from './dam-details.component';

describe('DamDetailsComponent', () => {
  let component: DamDetailsComponent;
  let fixture: ComponentFixture<DamDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DamDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DamDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
