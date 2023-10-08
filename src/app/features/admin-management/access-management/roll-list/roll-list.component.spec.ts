import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RollListComponent } from './roll-list.component';

describe('RollListComponent', () => {
  let component: RollListComponent;
  let fixture: ComponentFixture<RollListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RollListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RollListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
