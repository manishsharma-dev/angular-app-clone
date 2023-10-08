import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateResultsComponent } from './update-results.component';

describe('UpdateResultsComponent', () => {
  let component: UpdateResultsComponent;
  let fixture: ComponentFixture<UpdateResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
