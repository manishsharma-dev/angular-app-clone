import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostMortemComponent } from './post-mortem.component';

describe('PostMortemComponent', () => {
  let component: PostMortemComponent;
  let fixture: ComponentFixture<PostMortemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostMortemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostMortemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
