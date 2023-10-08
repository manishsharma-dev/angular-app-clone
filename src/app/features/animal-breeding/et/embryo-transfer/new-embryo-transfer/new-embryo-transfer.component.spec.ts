import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewEmbryoTransferComponent } from './new-embryo-transfer.component';

describe('NewEmbryoTransferComponent', () => {
  let component: NewEmbryoTransferComponent;
  let fixture: ComponentFixture<NewEmbryoTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewEmbryoTransferComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewEmbryoTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
