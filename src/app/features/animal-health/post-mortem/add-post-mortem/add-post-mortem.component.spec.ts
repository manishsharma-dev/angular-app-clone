import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPostMortemComponent } from './add-post-mortem.component';

describe('AddPostMortemComponent', () => {
  let component: AddPostMortemComponent;
  let fixture: ComponentFixture<AddPostMortemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPostMortemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPostMortemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
