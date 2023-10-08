import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithoutCampaignDialogComponent } from './without-campaign-dialog.component';

describe('WithoutCampaignDialogComponent', () => {
  let component: WithoutCampaignDialogComponent;
  let fixture: ComponentFixture<WithoutCampaignDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WithoutCampaignDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WithoutCampaignDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
