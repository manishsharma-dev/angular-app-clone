import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostMortemReportComponent } from './post-mortem-report.component';

describe('PostMortemReportComponent', () => {
  let component: PostMortemReportComponent;
  let fixture: ComponentFixture<PostMortemReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostMortemReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostMortemReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
