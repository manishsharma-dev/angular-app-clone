import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneticHistoryComponent } from './genetic-history.component';

describe('GeneticHistoryComponent', () => {
  let component: GeneticHistoryComponent;
  let fixture: ComponentFixture<GeneticHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneticHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneticHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
