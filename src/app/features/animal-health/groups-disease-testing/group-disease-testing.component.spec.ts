import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupDiseaseTestingComponent } from './group-disease-testing.component';

describe('GroupDiseaseTestingComponent', () => {
  let component: GroupDiseaseTestingComponent;
  let fixture: ComponentFixture<GroupDiseaseTestingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupDiseaseTestingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupDiseaseTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
