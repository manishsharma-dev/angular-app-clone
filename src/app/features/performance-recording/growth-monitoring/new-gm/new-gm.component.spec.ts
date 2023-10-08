import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewGmComponent } from './new-gm.component';

describe('NewGmComponent', () => {
  let component: NewGmComponent;
  let fixture: ComponentFixture<NewGmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewGmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewGmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
