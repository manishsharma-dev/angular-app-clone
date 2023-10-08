import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEmbryoComponent } from './create-embryo.component';

describe('CreateEmbryoComponent', () => {
  let component: CreateEmbryoComponent;
  let fixture: ComponentFixture<CreateEmbryoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateEmbryoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEmbryoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
