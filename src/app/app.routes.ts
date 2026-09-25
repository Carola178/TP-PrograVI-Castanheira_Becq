import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Registro } from './componentes/registro/registro';
import { Sala } from './componentes/sala/sala';

export const routes: Routes = [
    {   path: '',
        redirectTo: 'login',
        pathMatch: 'full' 
    },
    {
        path: 'cartelera',
        loadComponent: ()=>import('./componentes/cartelera/cartelera').then(m => m.Cartelera)
    },
    { 
        path: 'cartelera/pelicula/:id', 
        loadComponent: ()=>import('./componentes/pelicula/pelicula').then(m => m.Pelicula)
    },
    {
        path: 'candy',
        loadComponent: ()=>import('./componentes/candy/candy').then(m => m.Candy)
    },

    {
        path: 'proximosEstrenos',
        loadComponent: ()=>import('./componentes/proximos-estrenos/proximos-estrenos').then(m => m.ProximosEstrenos)
    },
    {
        path: 'contacto',
        loadComponent: ()=>import('./componentes/contacto/contacto').then(m => m.Contacto)
    },
    {
        path: 'login',
        loadComponent: ()=>import('./componentes/login/login').then(m=>m.Login)
    },
    {
        path: 'registro',
        loadComponent: ()=>import('./componentes/registro/registro').then(m=>m.Registro)
    },
    { 
    path: 'sala/:funcionId', 
    component: Sala 
    },
    {
        path: '**',
        component: Error
    }

];
