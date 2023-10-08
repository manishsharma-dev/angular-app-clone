import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalReportDialogComponent } from './animal-report-dialog.component';

describe('AnimalReportDialogComponent', () => {
  let component: AnimalReportDialogComponent;
  let fixture: ComponentFixture<AnimalReportDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnimalReportDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimalReportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
