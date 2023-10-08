import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ResetPasswordComponent } from "../auth/reset-password/reset-password";
import { DashboardComponent } from "./dashboard.component";




const routes: Routes = [
  { path: "", component: DashboardComponent },
 // { path: "addlab", component: AddLabComponent },
  { path: "reset", component: ResetPasswordComponent },

]

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})

export class DashbaordRoutingModule {}
