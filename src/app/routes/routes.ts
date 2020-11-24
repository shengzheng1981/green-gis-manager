export const routes = [

    {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
    },
    // Not found
    {path: '**', redirectTo: 'dashboard'}

];
