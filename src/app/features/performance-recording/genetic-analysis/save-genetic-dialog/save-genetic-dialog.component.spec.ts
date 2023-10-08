import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveGeneticDialogComponent } from './save-genetic-dialog.component';

describe('SaveGeneticDialogComponent', () => {
  let component: SaveGeneticDialogComponent;
  let fixture: ComponentFixture<SaveGeneticDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveGeneticDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveGeneticDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
