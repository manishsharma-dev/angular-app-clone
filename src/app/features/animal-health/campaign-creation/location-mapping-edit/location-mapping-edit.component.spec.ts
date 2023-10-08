/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LocationMappingEditComponent } from './location-mapping-edit.component';

describe('LocationMappingEditComponent', () => {
  let component: LocationMappingEditComponent;
  let fixture: ComponentFixture<LocationMappingEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationMappingEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationMappingEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
