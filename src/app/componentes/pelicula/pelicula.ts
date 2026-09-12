import { Component, input, effect } from '@angular/core';

@Component({
  selector: 'app-pelicula',
  standalone: true,
  imports: [],
  templateUrl: './pelicula.html',
  styleUrl: './pelicula.css'
})
export class Pelicula {
// Debe llamarse 'id' para capturar el parámetro :id de la URL /cartelera/pelicula/:id
  id = input<string>();

  constructor() {
    effect(() => {
      // Se ejecutará automáticamente cuando cambie el ID en la URL
      console.log('¡Signal detectó el clic en la película! ID recibido:', this.id());
    });
  }
}