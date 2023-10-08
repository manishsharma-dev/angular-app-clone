import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMilkRecordingComponent } from './add-milk-recording.component';

describe('AddMilkRecordingComponent', () => {
  let component: AddMilkRecordingComponent;
  let fixture: ComponentFixture<AddMilkRecordingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMilkRecordingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMilkRecordingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
