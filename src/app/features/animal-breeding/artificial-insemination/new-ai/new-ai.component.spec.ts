import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAiComponent } from './new-ai.component';

describe('NewAiComponent', () => {
  let component: NewAiComponent;
  let fixture: ComponentFixture<NewAiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewAiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewAiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
