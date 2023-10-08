import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BullMasterListComponent } from './bull-master-list.component';

describe('BullMasterListComponent', () => {
  let component: BullMasterListComponent;
  let fixture: ComponentFixture<BullMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BullMasterListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BullMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
