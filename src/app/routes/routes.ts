export const routes = [

    {
        path: 'data',
        loadChildren: () => import('./data/data.module').then(m => m.DataModule)
    },
    {
        path: 'display',
        loadChildren: () => import('./display/display.module').then(m => m.DisplayModule)
    },
    // Not found
    {path: '**', redirectTo: 'data'}

];
