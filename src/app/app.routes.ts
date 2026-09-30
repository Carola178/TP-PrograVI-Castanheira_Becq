import { Routes } from '@angular/router';
import { adminGuard } from './componentes/guards/admin-guard';

export const routes: Routes = [
    { 
        path: '', 
        redirectTo: 'login', 
        pathMatch: 'full' 
    },
    {
        path: 'cartelera',
        loadComponent: () => import('./componentes/cartelera/cartelera').then(m => m.Cartelera)
    },
    { 
        path: 'cartelera/pelicula/:id', 
        loadComponent: () => import('./componentes/pelicula/pelicula').then(m => m.Pelicula)
    },
    {
        path: 'candy',
        loadComponent: () => import('./componentes/candy/candy').then(m => m.Candy)
    },
    {
        path: 'proximosEstrenos',
        loadComponent: () => import('./componentes/proximos-estrenos/proximos-estrenos').then(m => m.ProximosEstrenos)
    },
    {
        path: 'contacto',
        loadComponent: () => import('./componentes/contacto/contacto').then(m => m.Contacto)
    },
    {
        path: 'login',
        loadComponent: () => import('./componentes/login/login').then(m => m.Login)
    },
    {
        path: 'registro',
        loadComponent: () => import('./componentes/registro/registro').then(m => m.Registro)
    },
    { 
        path: 'sala/:funcionId', 
        loadComponent: () => import('./componentes/sala/sala').then(m => m.Sala)
    },
    { 
        path: 'pago', 
        loadComponent: () => import('./componentes/pago/pago').then(m => m.Pago)
    },
    {
        path: 'admin', 
        loadComponent: () => import('./componentes/admin/admin').then(m => m.Admin), 
        canActivate: [adminGuard]
    },
    {
        path: '**',
        redirectTo: 'login' 
    }
];