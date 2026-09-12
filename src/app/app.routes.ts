import { Routes } from '@angular/router';
import { Cartelera } from './componentes/cartelera/cartelera';
import { Candy } from './componentes/candy/candy';
import { ProximosEstrenos } from './componentes/proximos-estrenos/proximos-estrenos';
import { Contacto } from './componentes/contacto/contacto';
import { Pelicula } from './componentes/pelicula/pelicula';

export const routes: Routes = [
    {   path: '',
        redirectTo: 'cartelera',
        pathMatch: 'full' 
    },
    { 
        path: 'cartelera/pelicula/:id', 
        component: Pelicula 
    },

    {
        path: 'cartelera',
        component: Cartelera,
    },

    {
        path: 'candy',
        component: Candy,
    },

    {
        path: 'proximosEstrenos',
        component: ProximosEstrenos,
    },

    {
        path: 'contacto',
        component: Contacto,
    },


    // {
    //     path: 'error',
    //     component: Error
    // },

    // {
    //     path: '**',
    //     component: Error
    // }

];
