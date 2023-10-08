import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestAIListComponent } from './test-ailist.component';

describe('TestAIListComponent', () => {
  let component: TestAIListComponent;
  let fixture: ComponentFixture<TestAIListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestAIListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestAIListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
