/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LocationMappingViewComponent } from './location-mapping-view.component';

describe('LocationMappingViewComponent', () => {
  let component: LocationMappingViewComponent;
  let fixture: ComponentFixture<LocationMappingViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationMappingViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationMappingViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
