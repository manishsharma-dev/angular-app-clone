import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGeneticSampleComponent } from './add-genetic-sample.component';

describe('AddGeneticSampleComponent', () => {
  let component: AddGeneticSampleComponent;
  let fixture: ComponentFixture<AddGeneticSampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddGeneticSampleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGeneticSampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
