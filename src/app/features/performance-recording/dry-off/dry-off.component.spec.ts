import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DryOffComponent } from './dry-off.component';

describe('DryOffComponent', () => {
  let component: DryOffComponent;
  let fixture: ComponentFixture<DryOffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DryOffComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DryOffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
