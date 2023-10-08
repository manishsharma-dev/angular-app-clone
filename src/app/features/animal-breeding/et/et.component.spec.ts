import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtComponent } from './et.component';

describe('EtComponent', () => {
  let component: EtComponent;
  let fixture: ComponentFixture<EtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
