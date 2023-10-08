import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { PageNotFoundComponent } from './core/page-not-found/page-not-found.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password';
import { DashboardLayoutComponent } from './shared/layout/dashboard-layout/dashboard-layout.component';
import { LayoutComponent } from './shared/layout/layout/layout.component';

const approutes: Routes = [
  //   { path: "", component:LayoutComponent,
  //   children:[
  //     { path: "", redirectTo:'auth/login',pathMatch:'full' },
  //     { path: "auth", loadChildren:()=>import("./features/auth/auth.module").then(m=>m.AuthModule)}
  //   ]
  // },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
      {
        path: 'auth',
        loadChildren: () =>
          import('./features/auth/auth.module').then((m) => m.AuthModule),
      },
    ],
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [{ path: 'auth/reset', component: ResetPasswordComponent }],
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
      },
      {
        path: 'adminmgnt',
        loadChildren: () =>
          import('./features/admin-management/admin-management.module').then(
            (m) => m.AdminManagementModule
          ),
      },

      // Animal Registration Routing
      {
        path: 'animal',
        loadChildren: () =>
          import(
            './features/animal-management/animal-registration/animal-registration.module'
          ).then((m) => m.AnimalModule),
      },

      //Owner Registration Routing
      {
        path: 'owner',
        loadChildren: () =>
          import(
            './features/animal-management/owner-registration/owner-registration.module'
          ).then((m) => m.OwnerModule),
        runGuardsAndResolvers: 'always',
      },

      {
        path: 'notification',
        loadChildren: () =>
          import('./shared/worklist/work-list.module').then(
            (m) => m.WorkListModule
          ),
      },

      //lazy loading for admin module

      {
        path: 'user-management',
        loadChildren: () =>
          import(
            './features/admin-management/user-management/user-management.module'
          ).then((m) => m.UserManagementModule),
      },
      {
        path: 'hierarchy-management',
        loadChildren: () =>
          import(
            './features/admin-management/hierarchy-management/hierarchy-management.module'
          ).then((m) => m.HierarchyManagementModule),
      },

      {
        path: 'organization-management',
        loadChildren: () =>
          import(
            './features/admin-management/organization-management/organization-management.module'
          ).then((m) => m.OrganizationManagement),
      },

      {
        path: 'access-management',
        loadChildren: () =>
          import(
            './features/admin-management/access-management/access-management.module'
          ).then((m) => m.AccessManagementModule),
      },
      {
        path: 'project-management',
        loadChildren: () =>
          import(
            './features/admin-management/project-management/project-management.module'
          ).then((m) => m.ProjectManagementModule),
      },
      {
        path: 'suborginazation',
        loadChildren: () =>
          import(
            './features/admin-management/sub-organization-management/sub-organization-management.module'
          ).then((m) => m.SubOrganizationManagement),
      },
      // Health Module Routing Starts //
      // Health Module Routing Starts //
      {
        path: '',
        loadChildren: () =>
          import('./features/animal-health/animal-health.module').then(
            (m) => m.AnimalHealthModule
          ),
      },
      {
        path: 'animal-treatment-surgery',
        loadChildren: () =>
          import(
            './features/animal-health/animal-treatment/animal-treatment.module'
          ).then((m) => m.AnimalTreatmentModule),
      },
      {
        path: 'vaccination',
        loadChildren: () =>
          import(
            './features/animal-health/vaccination/vaccination.module'
          ).then((m) => m.VaccinationModule),
      },
      {
        path: 'campaign-creation',
        loadChildren: () =>
          import(
            './features/animal-health/campaign-creation/campaign-creation.module'
          ).then((m) => m.CampaignCreationModule),
      },
      {
        path: 'deworming',
        loadChildren: () =>
          import('./features/animal-health/deworming/deworming.module').then(
            (m) => m.DewormingModule
          ),
      },
      {
        path: 'first-aid',
        loadChildren: () =>
          import('./features/animal-health/first-aid/first-aid.module').then(
            (m) => m.FirstAidModule
          ),
      },
      {
        path: 'post-mortem',
        loadChildren: () =>
          import(
            './features/animal-health/post-mortem/post-mortem.module'
          ).then((m) => m.PostMortemModule),
      },
      {
        path: 'intimation-report',
        loadChildren: () =>
          import(
            './features/animal-health/intimation-report/intimation-report.module'
          ).then((m) => m.IntimationReportModule),
      },
      {
        path: 'first-incidence-report',
        loadChildren: () =>
          import('./features/animal-health/fir/fir.module').then(
            (m) => m.FIRModule
          ),
      },
      {
        path: 'outbreak-disease-reporting',
        loadChildren: () =>
          import(
            './features/animal-health/outbreak-disease-reporting/outbreak-disease-reporting.module'
          ).then((m) => m.OutbreakDiseaseReportingModule),
      },
      {
        path: 'disease-testing',
        loadChildren: () =>
          import(
            './features/animal-health/disease-testing/disease-testing.module'
          ).then((m) => m.DiseaseTestingModule),
      },
      {
        path: 'round',
        loadChildren: () =>
          import(
            './features/animal-health/round-master/round-master.module'
          ).then((m) => m.RoundMasterModule),
      },
      // Animal Disease Routing Starts //
      {
        path: '',
        loadChildren: () =>
          import('./features/animal-disease/animal-disease.module').then(
            (m) => m.AnimalDiseaseModule
          ),
      },
      {
        path: 'health-worklist',
        loadChildren: () =>
          import('./features/animal-disease/worklist/worklist.module').then(
            (m) => m.WorklistModule
          ),
      },
      {
        path: 'group-disease-testing',
        loadChildren: () =>
          import(
            './features/animal-health/groups-disease-testing/groups-disease-testing.module'
          ).then((m) => m.GroupsDiseaseTestingModule),
      },
      {
        path: 'animal-breeding',
        loadChildren: () =>
          import('./features/animal-breeding/animal-breeding.module').then(
            (m) => m.AnimalBreedingModule
          ),
      },
      {
        path: 'performance-recording',
        loadChildren: () =>
          import(
            './features/performance-recording/performance-recording.module'
          ).then((m) => m.PerformanceRecordingModule),
      },
      {
        path: 'helpdesk',

        loadChildren: () =>
          import('./features/helpdesk/helpdesk.module').then(
            (m) => m.HelpdeskModule
          ),
      },
      {
        path: 'miscellaneous',
        loadChildren: () =>
          import('./features/miscellaneous/miscellaneous.module').then(
            (m) => m.MiscellaneousModule
          ),
      },
      {
        path: 'untagged',
        loadChildren: () =>
          import(
            './features/animal-health/untagged-animal/untagged-animal.module'
          ).then((m) => m.UntaggedAnimalModule),
      },
    ],
  },
  {
    path: 'not-found',
    component: PageNotFoundComponent,
    data: { message: 'PageNotFound' },
  },
  { path: '**', redirectTo: '/not-found' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(approutes, {
      useHash: false,
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule { }
