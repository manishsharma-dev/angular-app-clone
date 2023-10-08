import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEmbryoDetailsComponent } from './edit-embryo-details.component';

describe('EditEmbryoDetailsComponent', () => {
  let component: EditEmbryoDetailsComponent;
  let fixture: ComponentFixture<EditEmbryoDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditEmbryoDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditEmbryoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
