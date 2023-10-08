import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftFirDialogComponent } from './draft-fir-dialog.component';

describe('DraftFirDialogComponent', () => {
  let component: DraftFirDialogComponent;
  let fixture: ComponentFixture<DraftFirDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DraftFirDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DraftFirDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
