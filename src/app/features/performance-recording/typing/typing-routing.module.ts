import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewTypingComponent } from './new-typing/new-typing.component';
import { TypingComponent } from './typing.component';

const routes: Routes = [
  { path: '', component: TypingComponent },
  { path: 'new-typing', component: NewTypingComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TypingRoutingModule {}
