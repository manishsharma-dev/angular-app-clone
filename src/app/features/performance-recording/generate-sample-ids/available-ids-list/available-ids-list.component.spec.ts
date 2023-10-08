import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableIdsListComponent } from './available-ids-list.component';

describe('AvailableIdsListComponent', () => {
  let component: AvailableIdsListComponent;
  let fixture: ComponentFixture<AvailableIdsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvailableIdsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailableIdsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
