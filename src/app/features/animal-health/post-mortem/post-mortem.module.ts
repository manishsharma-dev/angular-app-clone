import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { PostMortemRoutingModule } from './post-mortem-routing.module';
import { PostMortemComponent } from './post-mortem.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddPostMortemComponent } from './add-post-mortem/add-post-mortem.component';
import { SavePostMortemDialogComponent } from './save-post-mortem-dialog/save-post-mortem-dialog.component';
import { PostMortemReportComponent } from './post-mortem-report/post-mortem-report.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { AnimalHealthModule } from '../animal-health.module';

@NgModule({
  declarations: [
    PostMortemComponent,
    AddPostMortemComponent,
    SavePostMortemDialogComponent,
    PostMortemReportComponent,
  ],
  providers: [DatePipe, { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
  imports: [
    CommonModule,
    PostMortemRoutingModule,
    SharedModule,
    AnimalHealthModule,
  ],
})
export class PostMortemModule {}
