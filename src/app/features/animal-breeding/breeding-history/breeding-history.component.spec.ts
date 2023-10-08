import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreedingHistoryComponent } from './breeding-history.component';

describe('BreedingHistoryComponent', () => {
  let component: BreedingHistoryComponent;
  let fixture: ComponentFixture<BreedingHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BreedingHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BreedingHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
