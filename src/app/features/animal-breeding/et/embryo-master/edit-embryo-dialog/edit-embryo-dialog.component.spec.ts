import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEmbryoDialogComponent } from './edit-embryo-dialog.component';

describe('EditEmbryoDialogComponent', () => {
  let component: EditEmbryoDialogComponent;
  let fixture: ComponentFixture<EditEmbryoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditEmbryoDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditEmbryoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
