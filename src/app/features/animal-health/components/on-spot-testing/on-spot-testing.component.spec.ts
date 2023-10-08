/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OnSpotTestingComponent } from './on-spot-testing.component';

describe('OnSpotTestingComponent', () => {
  let component: OnSpotTestingComponent;
  let fixture: ComponentFixture<OnSpotTestingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnSpotTestingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnSpotTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
