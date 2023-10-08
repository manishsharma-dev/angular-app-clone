import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmbryoTransferHistoryComponent } from './embryo-transfer/embryo-transfer-history/embryo-transfer-history.component';
import { EmbryoTransferComponent } from './embryo-transfer/embryo-transfer.component';
import { NewEmbryoTransferComponent } from './embryo-transfer/new-embryo-transfer/new-embryo-transfer.component';
import { AddHeatTransactionComponent } from './heat-transaction/add-heat-transaction/add-heat-transaction.component';
import { HeatTransactionComponent } from './heat-transaction/heat-transaction.component';
import { EmbryoMasterComponent } from './embryo-master/embryo-master.component';
import { CreateEmbryoComponent } from './embryo-master/create-embryo/create-embryo.component';
import { SynchronisationComponent } from './synchronisation/synchronisation.component';
import { NewSynchronizationComponent } from './synchronisation/new-synchronization/new-synchronization.component';
import { HistoryComponent } from './heat-transaction/history/history.component';
import { ViewDetailsComponent } from './embryo-master/view-details/view-details.component';
import { EditEmbryoDetailsComponent } from './embryo-master/edit-embryo-details/edit-embryo-details.component';

const routes: Routes = [
  {path:'heat-transaction',component:HeatTransactionComponent},
  {path:'add-heat-transaction',component:AddHeatTransactionComponent},
  {path:'embryo-transfer',component:EmbryoTransferComponent},
  {path:'new-embryo-transfer',component:NewEmbryoTransferComponent},
  {path:'embryo-master',component:EmbryoMasterComponent},
  {path:'new-embryo-master',component:CreateEmbryoComponent},
  {path:'syncronization',component:SynchronisationComponent},
  {path:'new-syncronization',component:NewSynchronizationComponent},
  {path:'embryo-transfer/view-history',component:EmbryoTransferHistoryComponent},
  {path:'ht-history',component:HistoryComponent},
  {path:'view-detail',component:ViewDetailsComponent},
  {path:'edit-embryo-detail',component:EditEmbryoDetailsComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EtRoutingModule { }
