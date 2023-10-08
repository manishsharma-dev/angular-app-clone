import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TestAIRoutingModule } from './test-ai-routing.module';
import { TestAIListComponent } from './test-ailist/test-ailist.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateTestPlanComponent } from './create-test-plan/create-test-plan.component';
import { ViewTestPlanDetailsComponent } from './view-test-plan-details/view-test-plan-details.component';

@NgModule({
  declarations: [TestAIListComponent, CreateTestPlanComponent, ViewTestPlanDetailsComponent],
  imports: [CommonModule, TestAIRoutingModule, SharedModule],
})
export class TestAIModule {}
