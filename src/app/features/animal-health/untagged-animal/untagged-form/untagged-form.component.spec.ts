import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UntaggedFormComponent } from './untagged-form.component';

describe('UntaggedFormComponent', () => {
  let component: UntaggedFormComponent;
  let fixture: ComponentFixture<UntaggedFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UntaggedFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UntaggedFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
