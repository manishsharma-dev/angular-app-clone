import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewpdComponent } from './newpd.component';

describe('NewpdComponent', () => {
  let component: NewpdComponent;
  let fixture: ComponentFixture<NewpdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewpdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewpdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
