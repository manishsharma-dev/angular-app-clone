import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyEliteStatusComponent } from './modify-elite-status.component';

describe('ModifyEliteStatusComponent', () => {
  let component: ModifyEliteStatusComponent;
  let fixture: ComponentFixture<ModifyEliteStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModifyEliteStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyEliteStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
