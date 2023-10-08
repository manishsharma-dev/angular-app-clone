import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { EtRoutingModule } from './et-routing.module';
import { EtComponent } from './et.component';
import { HeatTransactionComponent } from './heat-transaction/heat-transaction.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmbryoTransferComponent } from './embryo-transfer/embryo-transfer.component';
import { AddHeatTransactionComponent } from './heat-transaction/add-heat-transaction/add-heat-transaction.component';
import { NewEmbryoTransferComponent } from './embryo-transfer/new-embryo-transfer/new-embryo-transfer.component';
import { EmbryoTransferHistoryComponent } from './embryo-transfer/embryo-transfer-history/embryo-transfer-history.component';
import { EmbryoMasterComponent } from './embryo-master/embryo-master.component';
import { CreateEmbryoComponent } from './embryo-master/create-embryo/create-embryo.component';
import { SynchronisationComponent } from './synchronisation/synchronisation.component';
import { NewSynchronizationComponent } from './synchronisation/new-synchronization/new-synchronization.component';
import { HistoryComponent } from './heat-transaction/history/history.component';
import { AllocateDialogComponent } from './embryo-master/allocate-dialog/allocate-dialog.component';
import { ViewDetailsComponent } from './embryo-master/view-details/view-details.component';
import { EditEmbryoDialogComponent } from './embryo-master/edit-embryo-dialog/edit-embryo-dialog.component';
import { EditEmbryoDetailsComponent } from './embryo-master/edit-embryo-details/edit-embryo-details.component';



@NgModule({
  declarations: [
    EtComponent,
    HeatTransactionComponent,
    EmbryoTransferComponent,
    AddHeatTransactionComponent,
    NewEmbryoTransferComponent,
    EmbryoTransferHistoryComponent,
    EmbryoMasterComponent,
    CreateEmbryoComponent,
    SynchronisationComponent,
    NewSynchronizationComponent,
    HistoryComponent,
    AllocateDialogComponent,
    ViewDetailsComponent,
    EditEmbryoDialogComponent,
    EditEmbryoDetailsComponent
  ],
  imports: [
    CommonModule,
    EtRoutingModule,
    SharedModule,
 
    
  ],
  providers : [DatePipe,{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class EtModule { }
