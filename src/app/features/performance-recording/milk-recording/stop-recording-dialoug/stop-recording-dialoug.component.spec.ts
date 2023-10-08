import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StopRecordingDialougComponent } from './stop-recording-dialoug.component';

describe('StopRecordingDialougComponent', () => {
  let component: StopRecordingDialougComponent;
  let fixture: ComponentFixture<StopRecordingDialougComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StopRecordingDialougComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StopRecordingDialougComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
