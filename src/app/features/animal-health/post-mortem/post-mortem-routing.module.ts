import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddPostMortemComponent } from './add-post-mortem/add-post-mortem.component';
import { PostMortemComponent } from './post-mortem.component';

const routes: Routes = [
  { path: '', component: PostMortemComponent },
  { path: 'add-post-mortem', component: AddPostMortemComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostMortemRoutingModule {}
