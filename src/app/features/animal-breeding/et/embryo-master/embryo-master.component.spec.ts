import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbryoMasterComponent } from './embryo-master.component';

describe('EmbryoMasterComponent', () => {
  let component: EmbryoMasterComponent;
  let fixture: ComponentFixture<EmbryoMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmbryoMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmbryoMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
