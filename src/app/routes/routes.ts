import {DashboardComponent} from './dashboard/dashboard.component';

export const routes = [

  {
    path: 'dashboard',
    loadChildren: './dashboard/dashboard.module#DashboardModule'
  },

  // Not found
  {path: '**', redirectTo: 'dashboard'}

];
