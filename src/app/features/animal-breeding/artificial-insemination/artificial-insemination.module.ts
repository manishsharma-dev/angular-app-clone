import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ArtificialInseminationComponent } from './artificial-insemination.component';
import { NewAiComponent } from './new-ai/new-ai.component';
import { ArtificialInseminationRoutingModule } from './artificial-insemination-routing.module';
import { ViewHistoryComponent } from './view-history/view-history.component';
import { FilterPanelComponent } from './filter-panel/filter-panel.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { SubmitDialogComponent } from './submit-dialog/submit-dialog.component';
import { StatusDialogComponent } from './status-dialog/status-dialog.component';


@NgModule({
  declarations: [
    ArtificialInseminationComponent,
    NewAiComponent,
    ViewHistoryComponent,
    FilterPanelComponent,
    SubmitDialogComponent,
    StatusDialogComponent
  ],
  providers : [DatePipe,{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
  imports: [
    CommonModule,
    ArtificialInseminationRoutingModule,
    SharedModule 
  ]
  
})
export class ArtificialInseminationModule { }