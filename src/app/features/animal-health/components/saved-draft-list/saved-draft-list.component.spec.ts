import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedDraftListComponent } from './saved-draft-list.component';

describe('SavedDraftListComponent', () => {
  let component: SavedDraftListComponent;
  let fixture: ComponentFixture<SavedDraftListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SavedDraftListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SavedDraftListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
