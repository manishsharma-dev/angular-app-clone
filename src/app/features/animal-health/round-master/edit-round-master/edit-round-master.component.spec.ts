import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRoundMasterComponent } from './edit-round-master.component';

describe('EditRoundMasterComponent', () => {
  let component: EditRoundMasterComponent;
  let fixture: ComponentFixture<EditRoundMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditRoundMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRoundMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
